#!/usr/bin/env python3
"""Validates a built @echelon-foundry/echelon-theme package (EDS-ADR-002).

    python tools/theme_validator.py [PACKAGE_ROOT] [--brand-attribute data-ef-brand]

The brand attribute defaults to the one recorded in dist/asset-manifest.json,
so the same validator works for data-ef-brand (Forma 0.x) and
data-forma-brand (Forma 1.x). Checks:

- every asset in dist/asset-manifest.json exists and matches its bytes and sha256;
- the roles mark, markDark, monochrome, lockup, favicon and startup are present;
- asset paths are package-relative files, never URLs, absolute paths, `..`,
  raw.githubusercontent.com or a moving `main` reference;
- theme/echelon.brand.json identity.assets name packaged manifest assets;
- every SVG is safe (no script, event handler, external reference) and named;
- every selector in dist/echelon.css is scoped to [<attribute>="<brand>"];
- dist/checksums.txt matches the files it lists.

Application layer and fonts (1.1.0):

- every file under dist/ is in the asset manifest and in checksums.txt;
- every font is WOFF2 under dist/fonts/ with matching bytes and sha256, its
  npm package and version are recorded, and each package's OFL licence text is
  packaged under dist/fonts/licenses/;
- every style rule in dist/echelon-app.css and dist/echelon-fonts.css is
  scoped to [<attribute>="<brand>"] (same element or descendant; a scope that
  only appears inside :is/:not/:has, or behind a sibling combinator, does not
  count); dist/echelon-app.css keeps every rule in @layer echelon.app;
- nothing in Forma's namespace is defined: no --forma-* declaration, and every
  .forma-* class, data-forma-* attribute and var(--forma-*) used is one that
  Forma has (tools/forma-hooks.json; --forma-css checks that list against a
  Forma build); only --echelon-* properties are declared; no --ef-* at all;
- every font URL is relative and resolves to a packaged font under dist/fonts/;
- every infinite animation stops under prefers-reduced-motion: reduce, and
  forced-colors rules use system colours, never brand colours.

Exit status 0 when the package is valid, 1 otherwise; each problem is printed.
"""
import argparse
import hashlib
import json
import pathlib
import posixpath
import re
import sys
import xml.etree.ElementTree as ET
from typing import NamedTuple

REQUIRED_ROLES = ("mark", "markDark", "monochrome", "lockup", "favicon", "startup")
# Same pattern as tests/test_logos.py.
UNSAFE_SVG = re.compile(r"(?i)<script|\son\w+=|javascript:|<foreignObject|xlink:href|\shref=|url\(|<image")
MOVING_REF = re.compile(r"(?i)(^|[/@?=:#])(main|master|HEAD)([/?#]|$)|refs/heads/")
SVG_NS = "{http://www.w3.org/2000/svg}"

HOOKS_PATH = pathlib.Path(__file__).resolve().parent / "forma-hooks.json"
APP_CSS = "dist/echelon-app.css"
FONTS_CSS = "dist/echelon-fonts.css"
APP_LAYER = "echelon.app"
REQUIRED_STYLESHEETS = ("dist/echelon.css", "dist/echelon-marketing.css", FONTS_CSS, APP_CSS)
GENERATED_INDEXES = ("dist/asset-manifest.json", "dist/checksums.txt")
FONT_FAMILIES = frozenset({"Manrope", "Newsreader", "IBM Plex Mono"})
FONT_DIR = "dist/fonts/"
LICENSE_PATH = re.compile(r"dist/fonts/licenses/[a-z0-9-]*OFL[a-z0-9-]*\.txt")
OFL_TITLE = "SIL OPEN FONT LICENSE"
# Colour values that are not system colours (forced-colors rules may not use them).
BRAND_COLOUR = re.compile(r"(?i)#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(|var\(\s*--echelon-")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def path_problems(path: str) -> list[str]:
    """Problems with an asset path that must be a package-relative file."""
    problems = []
    lower = path.lower()
    if "raw.githubusercontent.com" in lower or "github.com" in lower:
        problems.append(f"'{path}' points at GitHub, not a packaged file")
    if MOVING_REF.search(path):
        problems.append(f"'{path}' references a moving branch (main/master/HEAD)")
    if re.match(r"^[a-z][a-z0-9+.-]*:", lower) or path.startswith("//"):
        problems.append(f"'{path}' is a URL, not a package-relative path")
    if path.startswith("/") or "\\" in path:
        problems.append(f"'{path}' is not package-relative")
    if any(part in ("..", ".", "") for part in path.split("/")):
        problems.append(f"'{path}' has empty, '.' or '..' segments")
    return problems


def svg_problems(name: str, data: bytes) -> list[str]:
    text = data.decode("utf-8", errors="replace")
    problems = []
    if UNSAFE_SVG.search(text):
        problems.append(f"{name}: unsafe SVG content (script, event handler or external reference)")
    try:
        root = ET.fromstring(data)
    except ET.ParseError as error:
        return problems + [f"{name}: not well-formed XML ({error})"]
    if root.tag != f"{SVG_NS}svg":
        problems.append(f"{name}: root element is not an SVG <svg>")
    if any(el.tag.split("}")[-1].lower() in {"script", "foreignobject", "image"} for el in root.iter()):
        problems.append(f"{name}: contains a script, foreignObject or image element")
    if root.get("role") != "img" or not root.get("aria-label") or root.find(f"{SVG_NS}title") is None:
        problems.append(f"{name}: needs role=\"img\", an aria-label and a <title>")
    return problems


def _strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def _split_top(text: str, sep: str) -> list[str]:
    parts, depth, current = [], 0, ""
    for ch in text:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == sep and depth == 0:
            parts.append(current)
            current = ""
        else:
            current += ch
    return parts + [current]


def _without_negations(selector: str) -> str:
    out, i = "", 0
    while i < len(selector):
        if selector.startswith(":not(", i):
            depth, i = 1, i + 5
            while i < len(selector) and depth:
                depth += {"(": 1, ")": -1}.get(selector[i], 0)
                i += 1
        else:
            out += selector[i]
            i += 1
    return out


def style_rules(css: str) -> tuple[list[str], list[str]]:
    """Returns (selector preludes of style rules, stray statements outside any rule)."""
    text = _strip_comments(css)
    selectors, stray = [], []
    depth_kinds: list[str] = []
    buffer = ""
    for ch in text:
        if ch == "{":
            prelude = buffer.strip()
            buffer = ""
            if prelude.startswith("@"):
                depth_kinds.append("at")
            elif depth_kinds and depth_kinds[-1] == "style":
                stray.append(f"nested rule '{prelude}'")
                depth_kinds.append("style")
            else:
                selectors.append(prelude)
                depth_kinds.append("style")
        elif ch == "}":
            if not depth_kinds:
                stray.append("unbalanced '}'")
            else:
                kind = depth_kinds.pop()
                if kind == "at" and buffer.strip():
                    stray.append(f"declarations outside a style rule: '{buffer.strip()}'")
            buffer = ""
        elif ch == ";" and (not depth_kinds or depth_kinds[-1] == "at"):
            stray.append(f"statement outside a style rule: '{(buffer + ch).strip()}'")
            buffer = ""
        elif depth_kinds and depth_kinds[-1] == "style":
            continue  # declarations inside a style rule
        else:
            buffer += ch
    if buffer.strip():
        stray.append(f"trailing text '{buffer.strip()}'")
    if depth_kinds:
        stray.append("unbalanced '{'")
    return selectors, stray


def unscoped_selectors(css: str, attribute: str, brand_id: str) -> list[str]:
    """Selectors that are not limited to [attribute="brand"] or its descendants."""
    scope = f'[{attribute}="{brand_id}"]'
    selectors, stray = style_rules(css)
    bad = list(stray)
    for prelude in selectors:
        for selector in _split_top(prelude, ","):
            selector = " ".join(selector.split())
            positive = _without_negations(selector)
            sibling = re.search(r"[~+]", re.sub(r"\[[^\]]*\]|\([^)]*\)", "", positive))
            if scope not in positive or sibling:
                bad.append(selector)
    return bad


def foreign_properties(css: str, attribute: str) -> list[str]:
    """Custom properties declared or read outside the Forma namespace that the
    brand attribute implies (data-forma-brand -> --forma-*, data-ef-brand -> --ef-*)."""
    namespace = attribute.removeprefix("data-").removesuffix("-brand")
    names = re.findall(r"(?<![\w-])--([a-z][a-z0-9]*)-[a-z0-9-]+", css)
    return sorted({f"--{prefix}-*" for prefix in names if prefix != namespace})


# ---- CSS structure for the application layer and fonts -----------------------

class Node(NamedTuple):
    """A rule: kind is style, font-face, keyframes, at-block or at-statement.
    context holds the enclosing at-rule preludes, outermost first."""
    kind: str
    prelude: str
    context: tuple
    declarations: tuple


def _string_end(text: str, i: int) -> int:
    quote, i = text[i], i + 1
    while i < len(text) and text[i] != quote:
        i += 2 if text[i] == "\\" else 1
    return i + 1


def strip_css_comments(css: str) -> str:
    out, i = [], 0
    while i < len(css):
        if css[i] in "\"'":
            end = _string_end(css, i)
            out.append(css[i:end])
            i = end
        elif css.startswith("/*", i):
            end = css.find("*/", i + 2)
            i = len(css) if end < 0 else end + 2
            out.append(" ")
        else:
            out.append(css[i])
            i += 1
    return "".join(out)


def _top_level_items(text: str) -> tuple[list[tuple], list[str]]:
    """Splits a rule list into ("stmt", prelude) and ("block", prelude, body)."""
    items, problems = [], []
    start, i, parens = 0, 0, 0
    while i < len(text):
        ch = text[i]
        if ch in "\"'":
            i = _string_end(text, i)
            continue
        if ch == "(":
            parens += 1
        elif ch == ")":
            parens -= 1
        elif ch == ";" and parens == 0:
            items.append(("stmt", text[start:i].strip()))
            start = i + 1
        elif ch == "{" and parens == 0:
            depth, j = 1, i + 1
            while j < len(text) and depth:
                if text[j] in "\"'":
                    j = _string_end(text, j)
                    continue
                depth += {"{": 1, "}": -1}.get(text[j], 0)
                j += 1
            if depth:
                problems.append("unbalanced '{'")
                return items, problems
            items.append(("block", text[start:i].strip(), text[i + 1:j - 1]))
            i = start = j
            continue
        elif ch == "}":
            problems.append("unbalanced '}'")
            start = i + 1
        i += 1
    if text[start:].strip():
        problems.append(f"trailing text '{text[start:].strip()}'")
    return items, problems


def _declarations(body: str) -> tuple[tuple, list[str]]:
    """Splits a declaration block on top-level ';'. A '{' means a nested rule."""
    parts, start, i, parens = [], 0, 0, 0
    nested = False
    while i < len(body):
        ch = body[i]
        if ch in "\"'":
            i = _string_end(body, i)
            continue
        parens += {"(": 1, ")": -1}.get(ch, 0)
        if ch == ";" and parens == 0:
            parts.append(body[start:i])
            start = i + 1
        elif ch in "{}" and parens == 0:
            nested = True
        i += 1
    parts.append(body[start:])
    decls = tuple(
        (prop.strip() if prop.strip().startswith("--") else prop.strip().lower(), value.strip())
        for prop, _, value in (p.partition(":") for p in parts if p.strip()))
    return decls, (["nested rule inside a style rule"] if nested else [])


GROUPING_AT_RULES = ("media", "supports", "layer", "container")


def parse_css(css: str) -> tuple[list[Node], list[str]]:
    """Flattens a stylesheet into Nodes. Pure; never raises on bad input."""
    def walk(text: str, context: tuple) -> tuple[list[Node], list[str]]:
        items, problems = _top_level_items(text)
        nodes: list[Node] = []
        for item in items:
            prelude = " ".join(item[1].split())
            if item[0] == "stmt":
                if prelude.startswith("@"):
                    nodes.append(Node("at-statement", prelude, context, ()))
                elif prelude:
                    problems.append(f"declarations outside a style rule: '{prelude}'")
                continue
            body = item[2]
            name = re.match(r"@(-?[\w-]+)", prelude)
            if name and name.group(1).lower() in GROUPING_AT_RULES:
                inner, inner_problems = walk(body, context + (prelude,))
                nodes += inner
                problems += inner_problems
            elif name and name.group(1).lower().endswith("keyframes"):
                nodes.append(Node("keyframes", prelude, context, ()))
            elif name and name.group(1).lower() == "font-face":
                decls, decl_problems = _declarations(body)
                nodes.append(Node("font-face", prelude, context, decls))
                problems += decl_problems
            elif name:
                nodes.append(Node("at-block", prelude, context, ()))
            else:
                decls, decl_problems = _declarations(body)
                nodes.append(Node("style", prelude, context, decls))
                problems += [f"{p}: '{prelude}'" for p in decl_problems]
        return nodes, problems
    return walk(strip_css_comments(css), ())


def _strip_functional_arguments(selector: str) -> str:
    """Removes the arguments of every functional pseudo-class, e.g. :is(...)."""
    out, depth = [], 0
    for ch in selector:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        elif depth == 0:
            out.append(ch)
    return "".join(out)


def strictly_scoped(selector: str, attribute: str, brand_id: str) -> bool:
    """True when the selector only matches the brand element or its descendants:
    the scope is a top-level compound (not inside :is/:not/:where/:has) and no
    sibling combinator follows it."""
    scope = f'[{attribute}="{brand_id}"]'
    top = _strip_functional_arguments(" ".join(selector.split()))
    if scope not in top:
        return False
    without_attributes = re.sub(r"\[[^\]]*\]", "", top)
    return not re.search(r"[~+]", without_attributes)


def load_hooks(path: pathlib.Path = HOOKS_PATH) -> dict:
    return json.loads(path.read_text())


def namespace_problems(name: str, css: str, nodes: list[Node], hooks: dict) -> list[str]:
    """Nothing in Forma's namespace is defined; only --echelon-* is declared; no --ef-*."""
    problems = []
    classes, attributes, properties = set(hooks["classes"]), set(hooks["attributes"]), set(hooks["properties"])
    text = strip_css_comments(css)
    if re.search(r"--ef-[\w-]", text):
        problems.append(f"{name}: uses the retired --ef-* namespace")
    if re.search(r"\bdata-ef-[\w-]|\.ef-[\w-]", text):
        problems.append(f"{name}: uses the retired ef- class or data-ef-* attribute namespace")
    for node in nodes:
        selector_text = node.prelude if node.kind == "style" else ""
        for cls in sorted(set(re.findall(r"\.(forma-[\w-]+)", selector_text)) - classes):
            problems.append(f"{name}: defines Forma class .{cls}, which Forma does not have")
        for attr in sorted(set(re.findall(r"\[\s*(data-forma-[\w-]+)", selector_text)) - attributes):
            problems.append(f"{name}: defines Forma attribute {attr}, which Forma does not have")
        for prop, value in node.declarations:
            if prop.startswith("--forma-"):
                problems.append(f"{name}: declares Forma custom property {prop}")
            elif prop.startswith("--") and not prop.startswith("--echelon-"):
                problems.append(f"{name}: declares custom property {prop} outside --echelon-*")
            for used in sorted(set(re.findall(r"var\(\s*(--forma-[\w-]+)", value)) - properties):
                problems.append(f"{name}: uses Forma custom property {used}, which Forma does not have")
        if node.kind == "keyframes":
            keyframes = node.prelude.split(None, 1)[1] if " " in node.prelude else ""
            if not keyframes.startswith("echelon-"):
                problems.append(f"{name}: keyframes '{keyframes}' outside the echelon- namespace")
    return problems


def motion_problems(name: str, nodes: list[Node]) -> list[str]:
    """Every selector with an infinite animation has a reduced-motion rule that stops it."""
    def reduced(node: Node) -> bool:
        return any("prefers-reduced-motion" in c and "reduce" in c for c in node.context)

    def selectors(node: Node) -> set:
        return {" ".join(s.split()) for s in _split_top(node.prelude, ",")}

    stopped = set()
    for node in nodes:
        if node.kind == "style" and reduced(node):
            values = {prop: value for prop, value in node.declarations}
            if values.get("animation", "").strip() == "none" or values.get("animation-name", "").strip() == "none":
                stopped |= selectors(node)
    problems = []
    for node in nodes:
        if node.kind != "style" or reduced(node):
            continue
        infinite = any(prop in ("animation", "animation-iteration-count") and "infinite" in value
                       for prop, value in node.declarations)
        for selector in sorted(selectors(node) - stopped) if infinite else []:
            problems.append(f"{name}: infinite animation not stopped under prefers-reduced-motion: reduce: {selector}")
    return problems


def forced_colour_problems(name: str, nodes: list[Node]) -> list[str]:
    problems = []
    for node in nodes:
        if node.kind == "style" and any("forced-colors" in c for c in node.context):
            for prop, value in node.declarations:
                if BRAND_COLOUR.search(value):
                    problems.append(f"{name}: brand colour under forced-colors ({prop}: {value}) in {node.prelude}")
    return problems


def app_css_problems(css: str, attribute: str, brand_id: str, hooks: dict) -> list[str]:
    nodes, parse = parse_css(css)
    problems = [f"{APP_CSS}: {p}" for p in parse]
    layer = f"@layer {APP_LAYER}"
    for node in nodes:
        if node.kind in ("at-statement", "at-block", "font-face"):
            problems.append(f"{APP_CSS}: unexpected {node.prelude.split()[0]} rule")
            continue
        if not node.context or node.context[0] != layer or any(c.startswith("@layer") for c in node.context[1:]):
            problems.append(f"{APP_CSS}: rule outside @layer {APP_LAYER}: {node.prelude}")
        if node.kind == "style":
            for selector in _split_top(node.prelude, ","):
                if not strictly_scoped(selector, attribute, brand_id):
                    problems.append(f"{APP_CSS}: rule not scoped to [{attribute}=\"{brand_id}\"]: {' '.join(selector.split())}")
    if re.search(r"(?i)url\(|@import", strip_css_comments(css)):
        problems.append(f"{APP_CSS}: references another file; the application layer must be self-contained")
    return (problems + namespace_problems(APP_CSS, css, nodes, hooks)
            + motion_problems(APP_CSS, nodes) + forced_colour_problems(APP_CSS, nodes))


def font_url_problems(url: str, fonts: set) -> list[str]:
    """A font URL in dist/echelon-fonts.css: relative, inside the package, a packaged font."""
    if re.match(r"(?i)^[a-z][a-z0-9+.-]*:", url) or url.startswith("//"):
        return [f"{FONTS_CSS}: font URL '{url}' is not relative"]
    if url.startswith("/"):
        return [f"{FONTS_CSS}: font URL '{url}' is absolute, not relative"]
    resolved = posixpath.normpath(posixpath.join("dist", url.split("?")[0].split("#")[0]))
    if not resolved.startswith(FONT_DIR):
        return [f"{FONTS_CSS}: font URL '{url}' leaves the package's dist/fonts/"]
    if resolved not in fonts:
        return [f"{FONTS_CSS}: font URL '{url}' is not a packaged font in the asset manifest"]
    return []


def fonts_css_problems(css: str, attribute: str, brand_id: str, hooks: dict, fonts: set) -> list[str]:
    nodes, parse = parse_css(css)
    problems = [f"{FONTS_CSS}: {p}" for p in parse]
    for node in nodes:
        if node.kind == "style":
            for selector in _split_top(node.prelude, ","):
                if not strictly_scoped(selector, attribute, brand_id):
                    problems.append(f"{FONTS_CSS}: rule not scoped to [{attribute}=\"{brand_id}\"]: {' '.join(selector.split())}")
        elif node.kind == "font-face":
            values = dict(node.declarations)
            family = values.get("font-family", "").strip().strip("\"'")
            if family not in FONT_FAMILIES:
                problems.append(f"{FONTS_CSS}: @font-face family '{family}' is not an Echelon family")
            if values.get("font-display") != "swap":
                problems.append(f"{FONTS_CSS}: @font-face for '{family}' needs font-display: swap")
            urls = re.findall(r"url\(\s*['\"]?([^'\")]+?)['\"]?\s*\)", values.get("src", ""))
            if not urls:
                problems.append(f"{FONTS_CSS}: @font-face for '{family}' has no src url")
            for url in urls:
                problems += font_url_problems(url, fonts)
        else:
            problems.append(f"{FONTS_CSS}: unexpected {node.prelude.split()[0]} rule")
    other_urls = re.findall(r"url\(\s*['\"]?([^'\")]+?)['\"]?\s*\)", strip_css_comments(css))
    font_face_urls = {u for n in nodes if n.kind == "font-face"
                      for u in re.findall(r"url\(\s*['\"]?([^'\")]+?)['\"]?\s*\)", dict(n.declarations).get("src", ""))}
    for url in sorted(set(other_urls) - font_face_urls):
        problems += font_url_problems(url, fonts) or [f"{FONTS_CSS}: URL '{url}' outside an @font-face src"]
    return problems + namespace_problems(FONTS_CSS, css, nodes, hooks)


def font_problems(root: pathlib.Path, manifest: dict) -> list[str]:
    """Fonts are WOFF2 under dist/fonts/ with a recorded package, and every
    package's OFL licence text is packaged. (Bytes and sha256 are checked with
    the other manifest entries.)"""
    problems = []
    fonts, licenses = manifest.get("fonts", []), manifest.get("licenses", [])
    packages = {p.get("name"): p for p in manifest.get("fontPackages", [])}
    if not fonts:
        problems.append("asset manifest lists no fonts")
    for font in fonts:
        path = font.get("path", "")
        if not path.startswith(FONT_DIR) or not path.endswith(".woff2") or "/licenses/" in path:
            problems.append(f"font '{path}' is not a .woff2 file under {FONT_DIR}")
        if font.get("mediaType") != "font/woff2":
            problems.append(f"font '{path}' must have mediaType font/woff2")
        file = root / path
        if file.is_file() and not file.read_bytes().startswith(b"wOF2"):
            problems.append(f"font '{path}' is not WOFF2")
        package = packages.get(font.get("package"))
        if not package or package.get("version") != font.get("version") or not str(package.get("integrity", "")).startswith("sha512-"):
            problems.append(f"font '{path}': its npm package, version and integrity are not recorded")
        if not any(l.get("package") == font.get("package") for l in licenses):
            problems.append(f"font '{path}': no OFL licence packaged for {font.get('package')}")
    for licence in licenses:
        path = licence.get("path", "")
        if not LICENSE_PATH.fullmatch(path):
            problems.append(f"licence '{path}' must be dist/fonts/licenses/*OFL*.txt")
        file = root / path
        if file.is_file() and OFL_TITLE not in file.read_text(errors="replace").upper():
            problems.append(f"licence '{path}' is not the SIL Open Font License text")
    return problems


def coverage_problems(root: pathlib.Path, manifest: dict, checksummed: set) -> list[str]:
    """Every dist/ file is in the asset manifest, and every packaged file is in checksums.txt."""
    listed = {e.get("path") for key in ("assets", "stylesheets", "fonts", "licenses") for e in manifest.get(key, [])}
    on_disk = {p.relative_to(root).as_posix() for p in (root / "dist").rglob("*") if p.is_file()}
    problems = [f"'{path}' is not in the asset manifest" for path in sorted(on_disk - listed - set(GENERATED_INDEXES))]
    problems += [f"stylesheet '{path}' is missing from the asset manifest"
                 for path in REQUIRED_STYLESHEETS if path not in {s.get("path") for s in manifest.get("stylesheets", [])}]
    needs_checksum = (listed | on_disk) - {"dist/checksums.txt"}
    problems += [f"'{path}' is not listed in checksums.txt" for path in sorted(needs_checksum - checksummed)]
    return problems


def forma_hook_problems(hooks: dict, forma_css: str) -> list[str]:
    """Every hook the Echelon layer may use exists in Forma's own CSS."""
    text = strip_css_comments(forma_css)
    missing = [f".{c}" for c in hooks["classes"] if not re.search(r"\." + re.escape(c) + r"(?![\w-])", text)]
    missing += [a for a in hooks["attributes"] if not re.search(r"\[\s*" + re.escape(a) + r"(?![\w-])", text)]
    missing += [p for p in hooks["properties"] if not re.search(re.escape(p) + r"\s*:", text)]
    return [f"tools/forma-hooks.json: {m} is not defined by Forma's CSS" for m in missing]


def validate(root: pathlib.Path, attribute: str | None = None) -> list[str]:
    errors: list[str] = []
    manifest_path = root / "dist/asset-manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text())
    except (OSError, ValueError) as error:
        return [f"dist/asset-manifest.json unreadable: {error}"]
    attribute = attribute or manifest.get("brandAttribute", "")
    brand_id = manifest.get("brand", "")
    if manifest.get("brandAttribute") != attribute:
        errors.append(f"asset manifest records brand attribute '{manifest.get('brandAttribute')}', expected '{attribute}'")
    forma = manifest.get("forma", {})
    if not re.fullmatch(r"[0-9a-f]{40}", forma.get("commit", "")) or not forma.get("ref"):
        errors.append("asset manifest must record the Forma ref and full commit")

    assets = manifest.get("assets", [])
    roles = [a.get("role") for a in assets]
    for role in REQUIRED_ROLES:
        if role not in roles:
            errors.append(f"asset manifest is missing role '{role}'")
    if len(set(roles)) != len(roles):
        errors.append("asset manifest repeats a role")
    packaged = set()
    for asset in assets + manifest.get("stylesheets", []) + manifest.get("fonts", []) + manifest.get("licenses", []):
        path = asset.get("path", "")
        label = asset.get("role", path)
        problems = path_problems(path)
        errors += [f"{label}: {p}" for p in problems]
        if problems:
            continue
        file = root / path
        if not file.is_file():
            errors.append(f"{label}: '{path}' does not exist in the package")
            continue
        data = file.read_bytes()
        packaged.add(path)
        if asset.get("sha256") != sha256(data):
            errors.append(f"{label}: sha256 mismatch for '{path}'")
        if asset.get("bytes") != len(data):
            errors.append(f"{label}: byte count mismatch for '{path}'")
        if path.endswith(".svg"):
            if asset.get("mediaType") != "image/svg+xml":
                errors.append(f"{label}: '{path}' must have mediaType image/svg+xml")
            errors += svg_problems(path, data)

    variants = {a.get("role"): a.get("path") for a in assets}
    if variants.get("mark") and variants.get("mark") == variants.get("markDark"):
        errors.append("mark and markDark must be distinct light and dark variants")

    brand_file = root / "theme/echelon.brand.json"
    try:
        brand = json.loads(brand_file.read_text())
    except (OSError, ValueError) as error:
        errors.append(f"theme/echelon.brand.json unreadable: {error}")
        brand = {}
    if brand and brand.get("id") != brand_id:
        errors.append(f"brand id '{brand.get('id')}' does not match manifest brand '{brand_id}'")
    for key, path in brand.get("identity", {}).get("assets", {}).items():
        problems = path_problems(path)
        errors += [f"identity.assets.{key}: {p}" for p in problems]
        if not problems and path not in packaged:
            errors.append(f"identity.assets.{key}: '{path}' is not a packaged manifest asset")

    try:
        css = (root / "dist/echelon.css").read_text()
        bad = unscoped_selectors(css, attribute, brand_id)
        errors += [f"dist/echelon.css: rule not scoped to [{attribute}=\"{brand_id}\"]: {s}" for s in bad]
    except OSError as error:
        errors.append(f"dist/echelon.css unreadable: {error}")

    for name in ("dist/echelon.css", "dist/echelon-marketing.css"):
        try:
            errors += [f"{name}: custom properties outside the {attribute} namespace: {p}"
                       for p in foreign_properties((root / name).read_text(), attribute)]
        except OSError as error:
            errors.append(f"{name} unreadable: {error}")

    checksummed = set()
    try:
        for line in (root / "dist/checksums.txt").read_text().splitlines():
            digest, _, path = line.partition("  ")
            checksummed.add(path)
            target = root / path
            if path_problems(path) or not target.is_file():
                errors.append(f"checksums.txt: '{path}' is not a packaged file")
            elif sha256(target.read_bytes()) != digest:
                errors.append(f"checksums.txt: sha256 mismatch for '{path}'")
    except OSError as error:
        errors.append(f"dist/checksums.txt unreadable: {error}")

    # Application layer and fonts (1.1.0).
    errors += coverage_problems(root, manifest, checksummed)
    errors += font_problems(root, manifest)
    hooks = load_hooks()
    fonts = {f.get("path") for f in manifest.get("fonts", [])}
    for name, check in ((APP_CSS, lambda css: app_css_problems(css, attribute, brand_id, hooks)),
                        (FONTS_CSS, lambda css: fonts_css_problems(css, attribute, brand_id, hooks, fonts))):
        try:
            errors += check((root / name).read_text())
        except OSError as error:
            errors.append(f"{name} unreadable: {error}")
    return errors


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("root", nargs="?", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument("--brand-attribute", help="expected brand attribute (default: the manifest's)")
    parser.add_argument("--forma-css", type=pathlib.Path,
                        help="a Forma build (e.g. the release's forma-all.css): check tools/forma-hooks.json against it")
    args = parser.parse_args(argv)
    errors = validate(args.root, args.brand_attribute)
    if args.forma_css:
        errors += forma_hook_problems(load_hooks(), args.forma_css.read_text())
    for error in errors:
        print(f"FAIL: {error}")
    if not errors:
        print(f"PASS: theme package at {args.root} is valid")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
