#!/usr/bin/env python3
"""Proves the theme reproduces Forma v0.14.0's Echelon output (EDS-ADR-002).

    python tools/forma_parity.py --forma /path/to/forma-v0.14.0 --release DIR

--forma   a clean Forma checkout at v0.14.0 (read only)
--release a directory holding the Forma v0.14.0 release assets named in
          tests/fixtures/forma-v0.14.0-release.json (hashes are checked first)

The script builds the theme against the v0.14.0 checkout into a temporary
directory (independent of the committed pin) and checks:

1. theme sources: echelon.brand.json, the marketing tokens, every carried
   primitive and the rendered theme CSS equal Forma 0.14.0's sources, apart
   from identity.assets and the token file's $description;
2. dist/echelon.css is byte-identical to dist/brands/echelon.css in the
   release tarball and to BrandCompiler's output for Forma's own manifest;
3. marketing: dist/echelon-marketing.css differs from the release's
   forma-marketing-theme-echelon.css only in comment lines, and
   forma-marketing.css followed by dist/echelon-marketing.css has exactly the
   CSS of forma-echelon-marketing.css (identical after removing comments and
   blank lines).
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys
import tarfile
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_theme  # noqa: E402

REFERENCE = json.loads((ROOT / "tests/fixtures/forma-v0.14.0-release.json").read_text())


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def css_only(text: str) -> list[str]:
    """Non-blank lines after removing comments: the CSS a browser parses."""
    stripped = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return [line for line in stripped.split("\n") if line.strip()]


def after_header(text: str) -> str:
    """Body of a bundler-style artifact: everything after the '/*! ... */' header and its blank line."""
    if not text.startswith("/*!"):
        raise ValueError("artifact does not start with a '/*!' header")
    end = text.index("*/\n") + 3
    assert text[end] == "\n", "header must be followed by one blank line"
    return text[end + 1:]


def get(obj, path):
    for key in path:
        obj = obj[key]
    return obj


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--forma", required=True, type=pathlib.Path)
    parser.add_argument("--release", required=True, type=pathlib.Path)
    args = parser.parse_args(argv)
    forma, release = args.forma.resolve(), args.release.resolve()
    failures: list[str] = []

    def check(ok: bool, message: str):
        print(("PASS: " if ok else "FAIL: ") + message)
        if not ok:
            failures.append(message)

    for name, digest in REFERENCE["files"].items():
        data = (release / name).read_bytes()
        if sha256(data) != digest:
            print(f"FAIL: {name} is not the Forma v0.14.0 release asset (sha256 {sha256(data)})")
            return 1
    with tarfile.open(release / "echelon-foundry-design-system-0.14.0.tgz") as tgz:
        member = tgz.extractfile(REFERENCE["brandCss"]["tarballMember"])
        reference_css = member.read()
    check(sha256(reference_css) == REFERENCE["brandCss"]["sha256"], "release tarball dist/brands/echelon.css has the recorded sha256")

    # 1. Sources moved unchanged.
    theirs = json.loads((forma / "brands/echelon.brand.json").read_text())
    ours = json.loads((ROOT / "theme/echelon.brand.json").read_text())
    theirs["identity"].pop("assets"), ours["identity"].pop("assets")
    check(theirs == ours, "theme/echelon.brand.json equals Forma's brands/echelon.brand.json apart from identity.assets")
    theirs = json.loads((forma / "themes/echelon/marketing.tokens.json").read_text())
    ours = json.loads((ROOT / "theme/echelon-marketing.tokens.json").read_text())
    theirs.pop("$description"), ours.pop("$description")
    check(theirs == ours, "theme/echelon-marketing.tokens.json equals Forma's themes/echelon/marketing.tokens.json apart from $description")
    core = json.loads((forma / "tokens/echelon.tokens.json").read_text())["primitive"]
    carried = json.loads((ROOT / "theme/echelon-primitives.tokens.json").read_text())["primitive"]
    differing = [f"{g}.{k}" for g, group in carried.items() for k, v in group.items() if core[g].get(k) != v]
    check(not differing, f"all {sum(len(g) for g in carried.values())} carried primitive entries equal Forma's tokens/echelon.tokens.json {differing or ''}")
    rendered = build_theme.render_template((ROOT / "theme/echelon-marketing.template.css").read_text(), "ef", "echelon")
    check(rendered == (forma / "themes/echelon/marketing.css").read_text(),
          "rendered theme/echelon-marketing.template.css is byte-identical to Forma's themes/echelon/marketing.css")

    with tempfile.TemporaryDirectory(prefix="echelon-parity-") as tmp:
        out = pathlib.Path(tmp)
        try:
            build_theme.build(forma, REFERENCE["ref"], REFERENCE["brandAttribute"], out)
        except build_theme.BuildError as error:
            print(f"FAIL: build against Forma {REFERENCE['ref']}: {error}")
            return 1
        built_css = (out / "dist/echelon.css").read_bytes()
        marketing = (out / "dist/echelon-marketing.css").read_text()

        # 2. Brand CSS. Also compile Forma's own manifest with the same staged compiler.
        check(built_css == reference_css,
              f"dist/echelon.css is byte-identical to Forma v0.14.0 release dist/brands/echelon.css (sha256 {sha256(built_css)})")
        with tempfile.TemporaryDirectory(prefix="forma-own-") as tmp2:
            work = pathlib.Path(tmp2)
            project, _ = build_theme.stage_compiler(forma, "BrandCompiler", work)
            (work / "in").mkdir()
            (work / "in/echelon.brand.json").write_bytes((forma / "brands/echelon.brand.json").read_bytes())
            build_theme.dotnet_run(project, work / "in", work / "out")
            check((work / "out/echelon.css").read_bytes() == built_css,
                  "dist/echelon.css is byte-identical to BrandCompiler output for Forma's own brands/echelon.brand.json")

    # 3. Marketing.
    theme_release = (release / "forma-marketing-theme-echelon.css").read_text()
    ours_body, theirs_body = after_header(marketing).split("\n"), after_header(theme_release).split("\n")
    changed = [(a, b) for a, b in zip(theirs_body, ours_body) if a != b]
    only_comments = len(ours_body) == len(theirs_body) and all(
        re.fullmatch(r"/\*.*\*/", a) and re.fullmatch(r"/\*.*\*/", b) for a, b in changed)
    check(only_comments, f"dist/echelon-marketing.css body equals forma-marketing-theme-echelon.css except {len(changed)} comment lines")
    for theirs_line, ours_line in changed:
        print(f"      Forma: {theirs_line}\n      theme: {ours_line}")
    neutral = (release / "forma-marketing.css").read_text()
    combined = (release / "forma-echelon-marketing.css").read_text()
    reconstructed = css_only(after_header(neutral)) + css_only(after_header(marketing))
    expected = css_only(combined)
    check(reconstructed == expected,
          f"forma-marketing.css + dist/echelon-marketing.css = forma-echelon-marketing.css ({len(expected)} CSS lines, comments and blank lines removed)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
