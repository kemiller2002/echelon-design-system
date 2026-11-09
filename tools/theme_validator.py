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

Exit status 0 when the package is valid, 1 otherwise; each problem is printed.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

REQUIRED_ROLES = ("mark", "markDark", "monochrome", "lockup", "favicon", "startup")
# Same pattern as tests/test_logos.py.
UNSAFE_SVG = re.compile(r"(?i)<script|\son\w+=|javascript:|<foreignObject|xlink:href|\shref=|url\(|<image")
MOVING_REF = re.compile(r"(?i)(^|[/@?=:#])(main|master|HEAD)([/?#]|$)|refs/heads/")
SVG_NS = "{http://www.w3.org/2000/svg}"


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
    for asset in assets + manifest.get("stylesheets", []):
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

    try:
        for line in (root / "dist/checksums.txt").read_text().splitlines():
            digest, _, path = line.partition("  ")
            target = root / path
            if path_problems(path) or not target.is_file():
                errors.append(f"checksums.txt: '{path}' is not a packaged file")
            elif sha256(target.read_bytes()) != digest:
                errors.append(f"checksums.txt: sha256 mismatch for '{path}'")
    except OSError as error:
        errors.append(f"dist/checksums.txt unreadable: {error}")
    return errors


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("root", nargs="?", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument("--brand-attribute", help="expected brand attribute (default: the manifest's)")
    args = parser.parse_args(argv)
    errors = validate(args.root, args.brand_attribute)
    for error in errors:
        print(f"FAIL: {error}")
    if not errors:
        print(f"PASS: theme package at {args.root} is valid")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
