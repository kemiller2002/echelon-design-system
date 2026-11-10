#!/usr/bin/env python3
"""Builds the @echelon-foundry/echelon-theme package (EDS-ADR-002).

The build is parametric on the Forma source. It compiles this repository's
theme sources with Forma's own F# compilers, taken from a Forma git checkout
given on the command line, so the output follows whatever Forma version is
pinned (data-ef-brand / --ef-* today, data-forma-brand / --forma-* after
Forma 1.0.0).

    python tools/build_theme.py --forma /path/to/forma --forma-ref v0.14.0 \\
        --brand-attribute data-ef-brand [--out DIR] [--check]

Outputs (under --out, default: the repository root):

    dist/echelon.css             BrandCompiler output for theme/echelon.brand.json
    dist/echelon-marketing.css   TokenCompiler output for the marketing tokens + theme CSS
    dist/echelon-fonts.css       @font-face rules for the self-hosted fonts (Forma 1.x only)
    dist/echelon-app.css         theme/echelon-app.css, the application layer (Forma 1.x only)
    dist/fonts/*.woff2           latin WOFF2 subsets from the npm packages pinned in
                                 theme/echelon-fonts.json (fetched by tools/fonts.py)
    dist/fonts/licenses/*.txt    each font package's SIL OFL 1.1 text
    dist/asset-manifest.json     role, path, media type, bytes and sha256 per asset,
                                 stylesheet, font and licence; the font packages'
                                 versions and integrity; the Forma ref/commit and
                                 brand attribute used
    dist/checksums.txt           sha256sum format, package-relative paths
    logos/echelon-foundry/*.svg  approved marks copied from brand/logos

The application layer and fonts use Forma 1.x's data-forma-brand and Forma
1.x hooks, so a build with another brand attribute (the Forma 0.14.0 parity
build) leaves them out. Fonts are fetched from npm on every build and must
match the integrity and sha256 recorded in theme/echelon-fonts.json.

Nothing time- or machine-dependent is written, so two builds from the same
inputs are byte-identical. --check builds into a temporary directory and fails
if the committed outputs differ.

The compiler sources are copied out of the Forma checkout into a temporary
directory before `dotnet run`, so the checkout is only read, never written.
"""
import argparse
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
BRAND_ID = "echelon"
PALETTE_LABEL = "carried from Forma 0.14.0, not a frozen v1 palette"
APP_BRAND_ATTRIBUTE = "data-forma-brand"


class BuildError(Exception):
    pass


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        raise BuildError(f"command failed ({result.returncode}): {' '.join(map(str, cmd))}\n{result.stdout}{result.stderr}")
    return result.stdout


def namespace_of(brand_attribute: str) -> str:
    match = re.fullmatch(r"data-([a-z][a-z0-9]*)-brand", brand_attribute)
    if not match:
        raise BuildError(f"brand attribute '{brand_attribute}' must look like data-<namespace>-brand")
    return match.group(1)


def forma_source(forma: pathlib.Path, ref: str) -> dict:
    """Resolves the pinned Forma checkout: the ref must be HEAD and the tree clean."""
    if not (forma / ".git").exists():
        raise BuildError(f"{forma} is not a git checkout; pass a Forma source checkout")
    head = run(["git", "-C", forma, "rev-parse", "HEAD"]).strip()
    try:
        pinned = run(["git", "-C", forma, "rev-parse", f"{ref}^{{commit}}"]).strip()
    except BuildError as error:
        raise BuildError(f"Forma ref '{ref}' does not resolve in {forma}") from error
    if pinned != head:
        raise BuildError(f"Forma checkout HEAD {head} is not {ref} ({pinned})")
    dirty = run(["git", "-C", forma, "status", "--porcelain"]).strip()
    if dirty:
        raise BuildError(f"Forma checkout has local changes; refusing to build:\n{dirty}")
    return {"repository": "https://github.com/kemiller2002/forma", "ref": ref, "commit": head}


def stage_compiler(forma: pathlib.Path, name: str, work: pathlib.Path) -> tuple[pathlib.Path, dict]:
    """Copies one compiler's .fsproj and compiled sources out of the Forma checkout."""
    source = forma / "tools" / name
    project = source / f"{name}.fsproj"
    if not project.exists():
        raise BuildError(f"Forma checkout has no tools/{name}/{name}.fsproj")
    includes = re.findall(r'<Compile\s+Include="([^"]+)"', project.read_text())
    if not includes or any("/" in i or "\\" in i or ".." in i for i in includes):
        raise BuildError(f"unexpected Compile items in {project}: {includes}")
    target = work / "compilers" / name
    target.mkdir(parents=True)
    digests = {}
    for relative in [project.name, *includes]:
        data = (source / relative).read_bytes()
        (target / relative).write_bytes(data)
        digests[f"tools/{name}/{relative}"] = sha256(data)
    if (forma / "global.json").exists():
        shutil.copyfile(forma / "global.json", work / "compilers" / "global.json")
    return target / project.name, digests


def dotnet_run(project: pathlib.Path, *args):
    return run(["dotnet", "run", "--project", project, "-c", "Release", "--", *args], cwd=project.parent)


def normalize(text: str) -> str:
    return text.replace("\r\n", "\n").rstrip("\n") + "\n"


def check_scoped(css: str, attribute: str, brand_id: str) -> None:
    from theme_validator import unscoped_selectors  # local import keeps the module standalone
    bad = unscoped_selectors(css, attribute, brand_id)
    if bad:
        raise BuildError(f"compiled brand CSS has selectors outside [{attribute}=\"{brand_id}\"]: {bad}")


def render_template(template: str, ns: str, layer: str) -> str:
    if not template.startswith("/*"):
        raise BuildError("theme/echelon-marketing.template.css must start with its template comment")
    body = template[template.index("*/\n") + 3:]
    rendered = body.replace("{{ns}}", ns).replace("{{layer}}", layer)
    if "{{" in rendered or "}}" in rendered:
        raise BuildError("unreplaced placeholder in theme/echelon-marketing.template.css")
    return rendered


def self_contained(name: str, css: str, allowed_urls: frozenset = frozenset()) -> None:
    lower = css.lower()
    for needle in ("@import", "<script", "javascript:", "expression("):
        if needle in lower:
            raise BuildError(f"{name} contains '{needle}'; release CSS must be self-contained")
    urls = [u for u in re.findall(r"url\(\s*['\"]?([^'\")\s]+)", css)
            if not u.lower().startswith("data:") and u not in allowed_urls]
    if urls:
        raise BuildError(f"{name} references external files: {urls}")


def banner(package: dict, name: str, lines: list[str]) -> str:
    body = "".join(f"    {line}\n" for line in lines)
    return f"/*! {package['name']} {package['version']} | {name}\n{body.rstrip()} */\n"


def app_layer(package: dict, ref: str, commit: str, attribute: str) -> str:
    """dist/echelon-app.css: the source under a release banner, validated."""
    from theme_validator import app_css_problems, load_hooks
    source = (ROOT / "theme/echelon-app.css").read_text()
    css = banner(package, "echelon-app.css", [
        "Echelon application layer (owner-approved 2026-11-09): tokens, app bar, nav tabs,",
        "panels, type roles, button emphasis, chips and loading, in @layer echelon.app.",
        "Load after Forma's all.css, dist/echelon.css and dist/echelon-fonts.css.",
        f"Source theme/echelon-app.css; built with Forma {ref} ({commit}). Do not edit; pin by version and sha256.",
    ]) + "\n" + normalize(source)
    problems = app_css_problems(css, attribute, BRAND_ID, load_hooks())
    if problems:
        raise BuildError("theme/echelon-app.css is not a valid application layer:\n  " + "\n  ".join(problems))
    self_contained("dist/echelon-app.css", css)
    return css


def font_layer(package: dict) -> tuple[str, dict, dict]:
    """dist/echelon-fonts.css, the font and licence files, and their manifest entries."""
    import fonts
    from theme_validator import fonts_css_problems, load_hooks
    try:
        spec = fonts.load_spec()
        resolved = fonts.resolve(spec, fonts.fetch_tarballs(spec))
    except fonts.FontError as error:
        raise BuildError(str(error)) from error
    sources = ", ".join(f"{p['name']} {p['version']}" for p in spec["packages"])
    css = fonts.render_css(resolved.faces, banner(package, "echelon-fonts.css", [
        "Self-hosted Echelon fonts: Newsreader, Manrope and IBM Plex Mono, latin WOFF2 subsets",
        "under fonts/, SIL Open Font License 1.1 (texts in fonts/licenses/).",
        "Load after dist/echelon.css and before dist/echelon-app.css.",
        f"From {sources} via theme/echelon-fonts.json. Do not edit; pin by version and sha256.",
    ]))
    paths = {f.path for f in resolved.faces}
    problems = fonts_css_problems(css, APP_BRAND_ATTRIBUTE, BRAND_ID, load_hooks(), paths)
    if problems:
        raise BuildError("dist/echelon-fonts.css is not valid:\n  " + "\n  ".join(problems))
    self_contained("dist/echelon-fonts.css", css, frozenset(p.removeprefix("dist/") for p in paths))
    entries = {"fontPackages": fonts.manifest_packages(spec), "fonts": fonts.manifest_fonts(resolved),
               "licenses": fonts.manifest_licenses(resolved)}
    return css, resolved.files, entries


def build(forma: pathlib.Path, ref: str, attribute: str, out: pathlib.Path) -> None:
    ns = namespace_of(attribute)
    pin = forma_source(forma, ref)
    package = json.loads((ROOT / "package.json").read_text())
    brand = json.loads((ROOT / "theme/echelon.brand.json").read_text())
    if brand["id"] != BRAND_ID:
        raise BuildError(f"theme/echelon.brand.json id must be '{BRAND_ID}'")

    with tempfile.TemporaryDirectory(prefix="echelon-theme-") as tmp:
        work = pathlib.Path(tmp)
        brand_project, brand_digests = stage_compiler(forma, "BrandCompiler", work)
        token_project, token_digests = stage_compiler(forma, "TokenCompiler", work)

        # Brand CSS: BrandCompiler compiles every *.brand.json in a directory and
        # clears *.css from its output directory, so both are private temp dirs.
        brands, brand_out = work / "brands", work / "brand-out"
        brands.mkdir()
        shutil.copyfile(ROOT / "theme/echelon.brand.json", brands / "echelon.brand.json")
        dotnet_run(brand_project, brands, brand_out)
        echelon_css = (brand_out / f"{BRAND_ID}.css").read_text()
        if f'[{attribute}="{BRAND_ID}"]' not in echelon_css:
            raise BuildError(f"Forma {ref} does not emit {attribute}; pass the brand attribute this Forma version uses")
        check_scoped(echelon_css, attribute, BRAND_ID)
        layer_match = re.search(r"@layer ([a-z][a-z0-9-]*)\.brand \{", echelon_css)
        if not layer_match:
            raise BuildError("cannot find the brand layer in the compiled brand CSS")
        layer = layer_match.group(1)

        # Marketing theme: compiled tokens followed by the non-scalar theme hooks.
        tokens_css_path = work / "echelon-marketing.tokens.css"
        dotnet_run(token_project, ROOT / "theme/echelon-marketing.tokens.json", tokens_css_path,
                   "--reference", ROOT / "theme/echelon-primitives.tokens.json")
        tokens_css = tokens_css_path.read_text()
        if f"@layer {layer}.tokens {{" not in tokens_css or f"--{ns}-" not in tokens_css:
            raise BuildError(f"TokenCompiler output does not use layer '{layer}.tokens' and namespace '--{ns}-'")
        hooks = render_template((ROOT / "theme/echelon-marketing.template.css").read_text(), ns, layer)
        header = (f"/*! {package['name']} {package['version']} | echelon-marketing.css\n"
                  f"    Echelon marketing theme. Load after Forma's forma-marketing.css.\n"
                  f"    Built by tools/build_theme.py with Forma {ref} ({pin['commit']}), brand attribute {attribute}.\n"
                  f"    Palette {PALETTE_LABEL}. Do not edit; pin by version and sha256. */\n")
        marketing_css = (header + "\n"
                         + "/* --- source: theme/echelon-marketing.tokens.json (Forma TokenCompiler) --- */\n"
                         + normalize(tokens_css) + "\n"
                         + "/* --- source: theme/echelon-marketing.template.css --- */\n"
                         + normalize(hooks))
        self_contained("dist/echelon-marketing.css", marketing_css)
        self_contained("dist/echelon.css", echelon_css)

    # Application layer and self-hosted fonts (Forma 1.x only).
    application = attribute == APP_BRAND_ATTRIBUTE
    app_css = app_layer(package, ref, pin["commit"], attribute) if application else None
    fonts_css, font_files, font_entries = font_layer(package) if application else (None, {}, {})

    # Approved marks, copied unchanged into the package path the manifest names.
    roles = json.loads((ROOT / "theme/asset-roles.json").read_text())
    catalog = json.loads((ROOT / "brand/logos/catalog.json").read_text())
    entry = next((m for m in catalog["marks"] if m["id"] == roles["catalogMark"]), None)
    if entry is None or entry.get("status") != "approved" or entry.get("approved") is not True:
        raise BuildError(f"catalog mark '{roles['catalogMark']}' is not owner-approved")

    files: dict[str, bytes] = {}
    assets = []
    for role in roles["roles"]:
        source = entry["assets"].get(role["catalogAsset"])
        if source is None:
            raise BuildError(f"catalog has no '{role['catalogAsset']}' asset for role {role['role']}")
        data = (ROOT / source).read_bytes()
        ET.fromstring(data)  # must at least be well-formed XML
        if role["path"] in files and files[role["path"]] != data:
            raise BuildError(f"two roles map different files to {role['path']}")
        files[role["path"]] = data
        item = {"role": role["role"], "path": role["path"], "mediaType": "image/svg+xml",
                "bytes": len(data), "sha256": sha256(data), "source": source}
        if "sameFileAs" in role:
            item["sameFileAs"] = role["sameFileAs"]
        if "note" in role:
            item["note"] = role["note"]
        assets.append(item)

    declared = brand["identity"].get("assets", {})
    for key, path in declared.items():
        if path not in files:
            raise BuildError(f"theme/echelon.brand.json identity.assets.{key} '{path}' is not a packaged asset")

    files["dist/echelon.css"] = echelon_css.encode()
    files["dist/echelon-marketing.css"] = marketing_css.encode()
    stylesheets = ["dist/echelon.css", "dist/echelon-marketing.css"]
    if application:
        files["dist/echelon-fonts.css"] = fonts_css.encode()
        files["dist/echelon-app.css"] = app_css.encode()
        files.update(font_files)
        stylesheets += ["dist/echelon-fonts.css", "dist/echelon-app.css"]
    manifest = {
        "schemaVersion": "1.0",
        "package": package["name"],
        "version": package["version"],
        "brand": BRAND_ID,
        "brandAttribute": attribute,
        "namespace": ns,
        "palette": PALETTE_LABEL,
        "forma": {**pin, "compilerSources": {**brand_digests, **token_digests}},
        "approval": {"catalog": "brand/logos/catalog.json", "mark": entry["id"], **entry["approval"]},
        "brandManifest": {"path": "theme/echelon.brand.json", "identityAssets": declared},
        "assets": assets,
        "stylesheets": [
            {"path": p, "mediaType": "text/css", "bytes": len(files[p]), "sha256": sha256(files[p])}
            for p in stylesheets
        ],
        **font_entries,
    }
    files["dist/asset-manifest.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
    theme_files = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / "theme").iterdir() if p.is_file())
    listed = sorted(set(files) | set(theme_files))
    checksums = "".join(
        f"{sha256(files[p] if p in files else (ROOT / p).read_bytes())}  {p}\n" for p in listed)
    files["dist/checksums.txt"] = checksums.encode()

    for directory in ("logos", "dist/fonts"):
        for stale in (out / directory).rglob("*") if (out / directory).exists() else []:
            if stale.is_file() and stale.relative_to(out).as_posix() not in files:
                stale.unlink()
    for path, data in files.items():
        target = out / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)


def generated_paths(out: pathlib.Path) -> list[str]:
    found = [p.relative_to(out).as_posix() for d in ("dist", "logos") if (out / d).exists()
             for p in (out / d).rglob("*") if p.is_file()]
    return sorted(found)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--forma", required=True, type=pathlib.Path, help="Forma source checkout (git), read only")
    parser.add_argument("--forma-ref", required=True, help="tag or commit the checkout must be at, e.g. v0.14.0")
    parser.add_argument("--brand-attribute", required=True, help="data-ef-brand (Forma 0.x) or data-forma-brand (Forma 1.x)")
    parser.add_argument("--out", type=pathlib.Path, default=ROOT, help="output root (default: repository root)")
    parser.add_argument("--check", action="store_true", help="build to a temp dir and compare with --out")
    args = parser.parse_args(argv)
    sys.path.insert(0, str(ROOT / "tools"))
    try:
        if args.check:
            with tempfile.TemporaryDirectory(prefix="echelon-theme-check-") as tmp:
                fresh = pathlib.Path(tmp)
                build(args.forma.resolve(), args.forma_ref, args.brand_attribute, fresh)
                expected, actual = generated_paths(fresh), generated_paths(args.out)
                differ = [p for p in expected if p not in actual
                          or (fresh / p).read_bytes() != (args.out / p).read_bytes()]
                extra = [p for p in actual if p not in expected]
                if differ or extra:
                    print("FAIL: committed theme outputs are stale: " + ", ".join(differ + extra))
                    return 1
                print(f"PASS: dist/ and logos/ match a fresh build against Forma {args.forma_ref}")
                return 0
        build(args.forma.resolve(), args.forma_ref, args.brand_attribute, args.out.resolve())
        print(f"built theme against Forma {args.forma_ref} with {args.brand_attribute} -> {args.out}")
        return 0
    except BuildError as error:
        print(f"ERROR {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
