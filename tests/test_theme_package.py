"""Validation of the @echelon-foundry/echelon-theme package (EDS-ADR-002).

Tests that need a Forma checkout read it from FORMA_SRC (with FORMA_REF and
FORMA_BRAND_ATTRIBUTE, defaulting to forma-pin.json). Without FORMA_SRC they
skip, unless REQUIRE_FORMA=1, which turns the skip into a failure (CI sets it).
The build also fetches the pinned font packages with npm.

FORMA_ALL_CSS, when set, names a Forma release's forma-all.css; the hook test
then checks tools/forma-hooks.json against it (CI's render job sets it).
"""
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import build_theme  # noqa: E402
import fonts  # noqa: E402
import theme_validator  # noqa: E402

FIXTURES = ROOT / "tests/fixtures/theme-adversarial"
CASES = json.loads((FIXTURES / "cases.json").read_text())["cases"]
PIN = json.loads((ROOT / "forma-pin.json").read_text())
FORMA = os.environ.get("FORMA_SRC")
REQUIRE_FORMA = os.environ.get("REQUIRE_FORMA") == "1"
FORMA_REF = os.environ.get("FORMA_REF", PIN["ref"])
ATTRIBUTE = os.environ.get("FORMA_BRAND_ATTRIBUTE", PIN["brandAttribute"])
PACKAGE_DIRS = ("dist", "logos", "theme")
MANIFEST_SECTIONS = ("assets", "stylesheets", "fonts", "licenses")
FORMA_ALL_CSS = os.environ.get("FORMA_ALL_CSS")


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def copy_package(target: pathlib.Path) -> pathlib.Path:
    for name in PACKAGE_DIRS:
        shutil.copytree(ROOT / name, target / name)
    shutil.copyfile(ROOT / "package.json", target / "package.json")
    return target


def refresh_digest(root: pathlib.Path, path: str) -> None:
    data = (root / path).read_bytes()
    manifest_path = root / "dist/asset-manifest.json"
    manifest = json.loads(manifest_path.read_text())
    for entry in (e for section in MANIFEST_SECTIONS for e in manifest.get(section, [])):
        if entry["path"] == path:
            entry["sha256"], entry["bytes"] = sha256(data), len(data)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    lines = []
    for line in (root / "dist/checksums.txt").read_text().splitlines():
        digest, _, listed = line.partition("  ")
        if listed == path:
            digest = sha256(data)
        elif listed == "dist/asset-manifest.json":
            digest = sha256(manifest_path.read_bytes())
        lines.append(f"{digest}  {listed}\n")
    (root / "dist/checksums.txt").write_text("".join(lines))


def apply_case(root: pathlib.Path, case: dict) -> None:
    manifest_path = root / "dist/asset-manifest.json"
    manifest = json.loads(manifest_path.read_text())
    if "assetPatch" in case:
        patch = case["assetPatch"]
        entry = next(a for a in manifest["assets"] if a["role"] == patch["role"])
        entry.update(patch["set"])
    if "removeRole" in case:
        manifest["assets"] = [a for a in manifest["assets"] if a["role"] != case["removeRole"]]
    if "manifestPatch" in case:
        patch = case["manifestPatch"]
        section = manifest[patch["section"]]
        if patch.get("remove"):
            manifest[patch["section"]] = [e for e in section if e["path"] != patch["path"]]
        else:
            next(e for e in section if e["path"] == patch["path"]).update(patch["set"])
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    if "deleteFile" in case:
        (root / case["deleteFile"]).unlink()
    if "addFile" in case:
        spec = case["addFile"]
        shutil.copyfile(FIXTURES / spec["with"], root / spec["path"])
        if spec.get("checksum"):
            with (root / "dist/checksums.txt").open("a") as listing:
                listing.write(f"{sha256((root / spec['path']).read_bytes())}  {spec['path']}\n")
    if "dropChecksum" in case:
        listing = root / "dist/checksums.txt"
        listing.write_text("".join(line + "\n" for line in listing.read_text().splitlines()
                                   if line.partition("  ")[2] != case["dropChecksum"]))
    if "brandAssetsPatch" in case:
        brand_path = root / "theme/echelon.brand.json"
        brand = json.loads(brand_path.read_text())
        brand["identity"]["assets"].update(case["brandAssetsPatch"])
        brand_path.write_text(json.dumps(brand, indent=2) + "\n")
    if "replaceFile" in case:
        spec = case["replaceFile"]
        shutil.copyfile(FIXTURES / spec["with"], root / spec["path"])
        if spec.get("refreshDigest"):
            refresh_digest(root, spec["path"])


class CommittedPackage(unittest.TestCase):
    def test_committed_package_is_valid(self):
        self.assertEqual(theme_validator.validate(ROOT, PIN["brandAttribute"]), [])

    def test_manifest_records_the_forma_pin_and_palette_label(self):
        manifest = json.loads((ROOT / "dist/asset-manifest.json").read_text())
        self.assertEqual(manifest["forma"]["ref"], PIN["ref"])
        self.assertEqual(manifest["forma"]["commit"], PIN["commit"])
        self.assertEqual(manifest["brandAttribute"], PIN["brandAttribute"])
        self.assertEqual(manifest["palette"], "carried from Forma 0.14.0, not a frozen v1 palette")
        package = json.loads((ROOT / "package.json").read_text())
        self.assertEqual((manifest["package"], manifest["version"]), (package["name"], package["version"]))
        self.assertEqual(package["name"], "@echelon-foundry/echelon-theme")
        self.assertEqual(package["files"], ["dist", "theme", "logos"])

    def test_light_dark_favicon_and_startup_roles_use_approved_marks(self):
        manifest = json.loads((ROOT / "dist/asset-manifest.json").read_text())
        catalog = json.loads((ROOT / "brand/logos/catalog.json").read_text())
        approved = next(m for m in catalog["marks"] if m["id"] == "echelon-foundry")
        self.assertTrue(approved["approved"])
        roles = {a["role"]: a for a in manifest["assets"]}
        self.assertEqual(set(roles), set(theme_validator.REQUIRED_ROLES))
        self.assertNotEqual(roles["mark"]["path"], roles["markDark"]["path"])
        for role, asset in roles.items():
            with self.subTest(role=role):
                self.assertIn(asset["source"], approved["assets"].values())
                # Packaged bytes are the approved bytes, unaltered.
                self.assertEqual((ROOT / asset["path"]).read_bytes(), (ROOT / asset["source"]).read_bytes())
        for role in ("favicon", "startup"):
            self.assertEqual(roles[role]["path"], roles["mark"]["path"])
            self.assertEqual(roles[role]["sameFileAs"], "mark")

    def test_brand_manifest_uses_schema_1_0_asset_fields_and_packaged_files(self):
        brand = json.loads((ROOT / "theme/echelon.brand.json").read_text())
        self.assertEqual(brand["schemaVersion"], "1.0")
        assets = brand["identity"]["assets"]
        self.assertLessEqual(set(assets), {"logo", "logoDark", "mark", "favicon"})
        for key, path in assets.items():
            with self.subTest(key=key):
                self.assertTrue((ROOT / path).is_file())
                self.assertEqual(theme_validator.path_problems(path), [])

    def test_packaged_logos_are_exactly_the_manifest_assets(self):
        manifest = json.loads((ROOT / "dist/asset-manifest.json").read_text())
        packaged = {p.relative_to(ROOT).as_posix() for p in (ROOT / "logos").rglob("*") if p.is_file()}
        self.assertEqual(packaged, {a["path"] for a in manifest["assets"]})


class AdversarialFixtures(unittest.TestCase):
    def test_every_adversarial_package_fails_validation(self):
        for case in CASES:
            with self.subTest(case=case["name"]), tempfile.TemporaryDirectory() as tmp:
                root = copy_package(pathlib.Path(tmp))
                self.assertEqual(theme_validator.validate(root), [], "unmutated copy must pass")
                apply_case(root, case)
                errors = theme_validator.validate(root)
                self.assertTrue(any(case["expect"] in e for e in errors), errors)
                cli = subprocess.run([sys.executable, str(ROOT / "tools/theme_validator.py"), str(root)],
                                     capture_output=True, text=True)
                self.assertEqual(cli.returncode, 1, cli.stdout)

    def test_required_adversarial_cases_are_present(self):
        names = {c["name"] for c in CASES}
        self.assertLessEqual({"manifest-missing-logo", "manifest-sha-mismatch", "svg-with-script",
                              "unscoped-theme-rule", "asset-on-raw-githubusercontent", "asset-on-main-ref"}, names)
        # 1.1.0: application layer and fonts.
        self.assertLessEqual({"file-not-in-manifest", "file-not-in-checksums", "stylesheet-not-in-manifest",
                              "font-not-woff2", "font-sha-mismatch", "font-licence-missing",
                              "app-unscoped-rule", "app-scope-hidden-in-is", "app-scope-sibling-escape",
                              "app-rule-outside-layer", "fonts-unscoped-rule",
                              "app-declares-forma-property", "app-defines-forma-class", "app-defines-forma-attribute",
                              "fonts-declares-forma-property", "app-uses-ef-namespace",
                              "fonts-absolute-url", "fonts-url-leaves-package", "fonts-remote-url",
                              "app-infinite-animation-without-reduced-motion",
                              "app-brand-colour-under-forced-colors"}, names)

    def test_validator_rejects_a_package_checked_against_another_brand_attribute(self):
        other = "data-forma-brand" if PIN["brandAttribute"] == "data-ef-brand" else "data-ef-brand"
        errors = theme_validator.validate(ROOT, other)
        self.assertTrue(any("brand attribute" in e for e in errors), errors)
        self.assertTrue(any("not scoped" in e for e in errors), errors)


class ScopeCheckIsParametric(unittest.TestCase):
    CSS = """@layer forma.brand {
  [data-forma-brand="echelon"] { --forma-color-text-primary: #171a18; }
  [data-forma-theme="dark"] [data-forma-brand="echelon"], [data-forma-brand="echelon"][data-forma-theme="dark"] { --x: 1; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-forma-theme]) [data-forma-brand="echelon"]:not([data-forma-theme]) { --x: 2; }
  }
}
"""

    def test_forma_1_attribute_is_accepted_and_ef_attribute_is_not(self):
        self.assertEqual(theme_validator.unscoped_selectors(self.CSS, "data-forma-brand", "echelon"), [])
        self.assertEqual(len(theme_validator.unscoped_selectors(self.CSS, "data-ef-brand", "echelon")), 4)

    def test_stray_declarations_and_imports_are_unscoped(self):
        self.assertTrue(theme_validator.unscoped_selectors('@layer a { --x: 1; }', "data-ef-brand", "echelon"))
        self.assertTrue(theme_validator.unscoped_selectors('@import "x.css";', "data-ef-brand", "echelon"))

    def test_namespace_comes_from_the_brand_attribute(self):
        self.assertEqual(build_theme.namespace_of("data-ef-brand"), "ef")
        self.assertEqual(build_theme.namespace_of("data-forma-brand"), "forma")
        with self.assertRaises(build_theme.BuildError):
            build_theme.namespace_of("data-brand")


APP_SCOPE = '[data-forma-brand="echelon"]'
# The interface contract's token table (light, dark); None = Forma's value in light.
CONTRACT_TOKENS = {
    "--echelon-elevation-1": ("0 1px 2px rgb(23 26 24 / 0.06), 0 6px 18px -8px rgb(23 26 24 / 0.16)",
                              "0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px -10px rgb(0 0 0 / 0.6)"),
    "--echelon-elevation-2": ("0 2px 4px rgb(23 26 24 / 0.06), 0 16px 32px -12px rgb(23 26 24 / 0.22)",
                              "0 2px 6px rgb(0 0 0 / 0.45), 0 18px 40px -12px rgb(0 0 0 / 0.7)"),
    "--echelon-surface-canvas": ("#f2efe7", "#171a18"),
    "--echelon-surface-raised": ("#f8f6f1", "#202421"),
    "--echelon-surface-sunken": ("#ebe7dd", "#121412"),
    "--echelon-surface-accent": ("#efe5da", "#2a2520"),
    "--echelon-surface-chrome": ("#202421", "#0f110f"),
    "--echelon-text-on-chrome": ("#f2efe7", "#f2efe7"),
    "--echelon-accent-rule": ("#905831", "#a87e5e"),
    "--echelon-text-on-accent": ("#f8f6f1", "#171a18"),
    "--echelon-action-primary": ("#905831", "#c9a07f"),
    "--echelon-chip-settled-bg": ("#dde7e3", "#23332f"),
    "--echelon-chip-settled-text": ("#2f544b", "#a8c7bf"),
    "--echelon-border-subtle": ("var(--forma-color-border-subtle)", "#33392f"),
}
CONTRACT_CONSTANTS = {
    "--echelon-radius-control": "4px", "--echelon-radius-container": "10px",
    "--echelon-weight-heading": "500", "--echelon-weight-label": "650",
    "--echelon-tracking-display": "-0.02em", "--echelon-tracking-label": "0.08em",
}
CONTRACT_CLASSES = {
    "echelon-app-bar", "echelon-app-bar__context", "echelon-app-bar__end", "echelon-nav-tabs",
    "echelon-panel", "echelon-panel__header", "echelon-panel__body", "echelon-panel__footer",
    "echelon-display", "echelon-heading", "echelon-eyebrow", "echelon-lead", "echelon-figure",
    "echelon-chip", "echelon-loading", "echelon-skeleton", "echelon-skeleton-line",
}
CONTRACT_ATTRIBUTES = {
    ("data-echelon-surface", "sunken"), ("data-echelon-surface", "accent"), ("data-echelon-attention", "true"),
    ("data-echelon-emphasis", "primary"), ("data-echelon-emphasis", "tertiary"), ("data-echelon-emphasis", "danger"),
    *(("data-echelon-tone", t) for t in ("draft", "review", "published", "ready", "progress", "complete", "sealed", "closed")),
}


def declarations_for(css: str, selector_start: str, media: str | None = None, exact: bool = False) -> dict:
    nodes, _ = theme_validator.parse_css(css)
    return {prop: value for node in nodes if node.kind == "style"
            and (node.prelude == selector_start if exact else node.prelude.startswith(selector_start))
            and (media is None) == (not any(c.startswith("@media") for c in node.context))
            and (media is None or any(media in c for c in node.context))
            for prop, value in node.declarations}


class ApplicationLayer(unittest.TestCase):
    css = (ROOT / "dist/echelon-app.css").read_text()
    source = (ROOT / "theme/echelon-app.css").read_text()
    hooks = theme_validator.load_hooks()

    def test_dist_is_the_source_under_a_release_banner(self):
        package = json.loads((ROOT / "package.json").read_text())
        self.assertTrue(self.css.startswith(f"/*! {package['name']} {package['version']} | echelon-app.css"))
        self.assertTrue(self.css.endswith(build_theme.normalize(self.source)))

    def test_every_contract_token_has_its_light_and_dark_value(self):
        light = declarations_for(self.css, APP_SCOPE, exact=True)
        explicit_light = declarations_for(self.css, '[data-forma-theme="light"] ' + APP_SCOPE)
        dark = declarations_for(self.css, '[data-forma-theme="dark"] ' + APP_SCOPE)
        preferred_dark = declarations_for(self.css, ":root:not([data-forma-theme]) " + APP_SCOPE, "prefers-color-scheme: dark")
        for token, (light_value, dark_value) in CONTRACT_TOKENS.items():
            with self.subTest(token=token):
                self.assertEqual(light.get(token), light_value)
                self.assertEqual(explicit_light.get(token), light_value)
                self.assertEqual(dark.get(token), dark_value)
                self.assertEqual(preferred_dark.get(token), dark_value)
        for token, value in CONTRACT_CONSTANTS.items():
            with self.subTest(token=token):
                self.assertEqual(light.get(token), value)
        self.assertEqual(light.get("background"), "var(--echelon-surface-canvas)")

    def test_dark_selectors_match_the_compiled_brand_css(self):
        brand = (ROOT / "dist/echelon.css").read_text()
        for selector in ('[data-forma-theme="light"] [data-forma-brand="echelon"], [data-forma-brand="echelon"][data-forma-theme="light"]',
                         '[data-forma-theme="dark"] [data-forma-brand="echelon"], [data-forma-brand="echelon"][data-forma-theme="dark"]',
                         ':root:not([data-forma-theme]) [data-forma-brand="echelon"]:not([data-forma-theme]), :root[data-forma-brand="echelon"]:not([data-forma-theme])'):
            with self.subTest(selector=selector):
                self.assertIn(selector, brand)
                self.assertIn(selector, self.css)

    def test_every_contract_class_and_attribute_is_styled(self):
        nodes, _ = theme_validator.parse_css(self.css)
        selectors = " ".join(n.prelude for n in nodes if n.kind == "style")
        for cls in CONTRACT_CLASSES:
            with self.subTest(cls=cls):
                self.assertRegex(selectors, r"\." + cls + r"(?![\w-])")
        for attribute, value in CONTRACT_ATTRIBUTES:
            with self.subTest(attribute=attribute, value=value):
                self.assertIn(f'[{attribute}="{value}"]', selectors)

    def test_every_rule_is_brand_scoped_in_the_echelon_app_layer(self):
        nodes, problems = theme_validator.parse_css(self.css)
        self.assertEqual(problems, [])
        self.assertGreater(len(nodes), 50)
        for node in nodes:
            with self.subTest(rule=node.prelude):
                self.assertEqual(node.context[0], "@layer echelon.app")
                if node.kind == "style":
                    for selector in theme_validator._split_top(node.prelude, ","):
                        self.assertTrue(theme_validator.strictly_scoped(selector, "data-forma-brand", "echelon"), selector)
        self.assertEqual(theme_validator.app_css_problems(self.css, "data-forma-brand", "echelon", self.hooks), [])

    def test_reduced_motion_stops_the_shimmer_and_forced_colors_use_system_colours(self):
        reduced = declarations_for(self.css, APP_SCOPE + " :is([aria-busy", "prefers-reduced-motion: reduce")
        self.assertEqual((reduced.get("animation"), reduced.get("background-image")), ("none", "none"))
        nodes, _ = theme_validator.parse_css(self.css)
        forced = [v for n in nodes if any("forced-colors" in c for c in n.context) for _, v in n.declarations]
        self.assertTrue(forced)
        self.assertFalse([v for v in forced if theme_validator.BRAND_COLOUR.search(v)])

    def test_forma_hooks_are_used_not_defined(self):
        ok = ('@layer echelon.app { [data-forma-brand="echelon"] .forma-button[data-echelon-emphasis="primary"] '
              '{ background: var(--echelon-action-primary); color: var(--forma-color-text-primary); --echelon-x: 1px; } }')
        self.assertEqual(theme_validator.app_css_problems(ok, "data-forma-brand", "echelon", self.hooks), [])
        bad = ('@layer echelon.app { [data-forma-brand="echelon"] .forma-button { --forma-color-accent-primary: red; '
               'color: var(--forma-made-up); --other: 1; } }')
        problems = theme_validator.app_css_problems(bad, "data-forma-brand", "echelon", self.hooks)
        self.assertTrue(any("declares Forma custom property --forma-color-accent-primary" in p for p in problems), problems)
        self.assertTrue(any("uses Forma custom property --forma-made-up" in p for p in problems), problems)
        self.assertTrue(any("declares custom property --other outside --echelon-*" in p for p in problems), problems)

    def test_scope_check_rejects_hidden_and_sibling_scopes(self):
        cases = {
            '[data-forma-brand="echelon"] .echelon-chip': True,
            '[data-forma-brand="echelon"].echelon-app-bar': True,
            ':root:not([data-forma-theme]) [data-forma-brand="echelon"]:not([data-forma-theme]) .x': True,
            '[data-forma-brand="echelon"] a[title~="x"]': True,
            ':is([data-forma-brand="echelon"], main) .x': False,
            ':where([data-forma-brand="echelon"]) .x': False,
            'main:has([data-forma-brand="echelon"]) .x': False,
            '[data-forma-brand="echelon"] + .x': False,
            '[data-forma-brand="echelon"] ~ .x': False,
            '[data-forma-brand="other"] .x': False,
        }
        for selector, expected in cases.items():
            with self.subTest(selector=selector):
                self.assertEqual(theme_validator.strictly_scoped(selector, "data-forma-brand", "echelon"), expected)

    def test_parser_reports_unbalanced_and_nested_rules(self):
        self.assertTrue(theme_validator.parse_css("a { color: red; ")[1])
        self.assertTrue(theme_validator.parse_css("a { b { color: red; } }")[1])
        nodes, problems = theme_validator.parse_css('a { content: "}{;"; } @keyframes x { from { a: 1 } }')
        self.assertEqual(problems, [])
        self.assertEqual([n.kind for n in nodes], ["style", "keyframes"])

    @unittest.skipUnless(FORMA_ALL_CSS, "set FORMA_ALL_CSS to a Forma release's forma-all.css")
    def test_forma_hooks_exist_in_the_forma_release(self):
        data = pathlib.Path(FORMA_ALL_CSS).read_bytes()
        self.assertEqual(sha256(data), self.hooks["forma"]["sha256"])
        self.assertEqual(theme_validator.forma_hook_problems(self.hooks, data.decode()), [])
        self.assertTrue(theme_validator.forma_hook_problems({**self.hooks, "classes": ["forma-panel"]}, data.decode()))


class Fonts(unittest.TestCase):
    manifest = json.loads((ROOT / "dist/asset-manifest.json").read_text())
    spec = fonts.load_spec()

    def test_packages_versions_and_hashes_are_recorded(self):
        names = [p["name"] for p in self.spec["packages"]]
        self.assertEqual(names, ["@fontsource-variable/manrope", "@fontsource-variable/newsreader", "@fontsource/ibm-plex-mono"])
        self.assertEqual(self.manifest["fontPackages"], fonts.manifest_packages(self.spec))
        for package in self.spec["packages"]:
            with self.subTest(package=package["name"]):
                self.assertRegex(package["version"], r"^\d+\.\d+\.\d+$")
                self.assertTrue(package["integrity"].startswith("sha512-"))
                for face in package["faces"]:
                    entry = next(f for f in self.manifest["fonts"] if f["path"] == fonts.face_path(face["member"]))
                    self.assertEqual(entry["sha256"], face["sha256"])
                    self.assertEqual((entry["package"], entry["version"]), (package["name"], package["version"]))
                    data = (ROOT / entry["path"]).read_bytes()
                    self.assertTrue(data.startswith(b"wOF2"))
                    self.assertEqual(sha256(data), face["sha256"])
                licence = (ROOT / package["license"]["path"]).read_bytes()
                self.assertEqual(sha256(licence), package["license"]["sha256"])
                self.assertIn("SIL OPEN FONT LICENSE VERSION 1.1", licence.decode().upper())

    def test_contract_faces(self):
        faces = {(f["family"], f["style"], f["weight"]) for f in self.manifest["fonts"]}
        self.assertEqual(faces, {("Newsreader", "normal", "200 800"), ("Newsreader", "italic", "200 800"),
                                 ("Manrope", "normal", "200 800"), ("IBM Plex Mono", "normal", "400"),
                                 ("IBM Plex Mono", "normal", "500")})
        self.assertTrue(all("-latin-" in f["path"] for f in self.manifest["fonts"]))

    def test_font_css_uses_relative_package_urls_and_swap(self):
        css = (ROOT / "dist/echelon-fonts.css").read_text()
        paths = {f["path"] for f in self.manifest["fonts"]}
        self.assertEqual(theme_validator.fonts_css_problems(css, "data-forma-brand", "echelon",
                                                            theme_validator.load_hooks(), paths), [])
        nodes, _ = theme_validator.parse_css(css)
        faces = [dict(n.declarations) for n in nodes if n.kind == "font-face"]
        self.assertEqual(len(faces), 5)
        self.assertTrue(all(f["font-display"] == "swap" and f["src"].startswith('url("fonts/') for f in faces))

    def test_font_url_rules(self):
        packaged = {"dist/fonts/a.woff2"}
        self.assertEqual(theme_validator.font_url_problems("fonts/a.woff2", packaged), [])
        self.assertEqual(theme_validator.font_url_problems("./fonts/a.woff2", packaged), [])
        for url, message in (("/fonts/a.woff2", "absolute"), ("https://x.example/a.woff2", "not relative"),
                             ("//cdn.example/a.woff2", "not relative"), ("../fonts/a.woff2", "leaves the package"),
                             ("fonts/../../a.woff2", "leaves the package"), ("fonts/b.woff2", "not a packaged font")):
            with self.subTest(url=url):
                self.assertTrue(any(message in p for p in theme_validator.font_url_problems(url, packaged)))

    def test_resolve_rejects_changed_bytes_and_unrecorded_hashes(self):
        import io, tarfile
        def tarball(files):
            buffer = io.BytesIO()
            with tarfile.open(fileobj=buffer, mode="w:gz") as archive:
                for name, data in files.items():
                    info = tarfile.TarInfo(f"package/{name}")
                    info.size = len(data)
                    archive.addfile(info, io.BytesIO(data))
            return buffer.getvalue()
        font = b"wOF2" + b"\0" * 32
        css = b"/* x-latin-400-normal */\n@font-face {\n  unicode-range: U+0000-00FF;\n}\n"
        files = {"package.json": json.dumps({"name": "x", "version": "1.0.0", "license": "OFL-1.1"}).encode(),
                 "LICENSE": b"SIL Open Font License, Version 1.1", "files/x-latin-400-normal.woff2": font, "400.css": css}
        spec = {"license": "OFL-1.1", "packages": [{
            "name": "x", "version": "1.0.0", "integrity": "",
            "license": {"member": "LICENSE", "path": "dist/fonts/licenses/x-OFL.txt", "sha256": ""},
            "faces": [{"family": "Manrope", "style": "normal", "weight": "400",
                       "member": "files/x-latin-400-normal.woff2", "css": "400.css", "sha256": ""}]}]}
        good = {"x": tarball(files)}
        with self.assertRaisesRegex(fonts.FontError, "nothing recorded"):
            fonts.resolve(spec, good)
        recorded = fonts.record(spec, good)
        resolved = fonts.resolve(recorded, good)
        self.assertEqual(resolved.faces[0].unicode_range, "U+0000-00FF")
        self.assertIn('src: url("fonts/x-latin-400-normal.woff2") format("woff2");', fonts.render_css(resolved.faces, "/* h */\n"))
        changed = {"x": tarball({**files, "files/x-latin-400-normal.woff2": b"wOF2" + b"\1" * 32})}
        with self.assertRaisesRegex(fonts.FontError, "integrity"):
            fonts.resolve(recorded, changed)
        with self.assertRaisesRegex(fonts.FontError, "is not WOFF2"):
            fonts.resolve(fonts.record(spec, {"x": tarball({**files, "files/x-latin-400-normal.woff2": b"OTTO"})}),
                          {"x": tarball({**files, "files/x-latin-400-normal.woff2": b"OTTO"})})


@unittest.skipUnless(FORMA or REQUIRE_FORMA, "set FORMA_SRC to a Forma checkout to run build tests")
class BuildAgainstForma(unittest.TestCase):
    def setUp(self):
        if not FORMA:
            self.fail("REQUIRE_FORMA=1 but FORMA_SRC is not set")
        self.forma = pathlib.Path(FORMA).resolve()

    def test_build_is_reproducible_and_matches_the_committed_outputs(self):
        with tempfile.TemporaryDirectory() as a, tempfile.TemporaryDirectory() as b:
            first, second = pathlib.Path(a), pathlib.Path(b)
            build_theme.build(self.forma, FORMA_REF, ATTRIBUTE, first)
            build_theme.build(self.forma, FORMA_REF, ATTRIBUTE, second)
            paths = build_theme.generated_paths(first)
            self.assertEqual(paths, build_theme.generated_paths(second))
            self.assertIn("dist/echelon.css", paths)
            for path in paths:
                with self.subTest(path=path):
                    self.assertEqual((first / path).read_bytes(), (second / path).read_bytes())
                    self.assertEqual((first / path).read_bytes(), (ROOT / path).read_bytes(),
                                     "committed output is stale; rerun tools/build_theme.py")
            shutil.copytree(ROOT / "theme", first / "theme")
            self.assertEqual(theme_validator.validate(first, ATTRIBUTE), [])

    def test_wrong_brand_attribute_for_the_forma_version_fails(self):
        other = "data-forma-brand" if ATTRIBUTE == "data-ef-brand" else "data-ef-brand"
        with tempfile.TemporaryDirectory() as tmp, self.assertRaises(build_theme.BuildError):
            build_theme.build(self.forma, FORMA_REF, other, pathlib.Path(tmp))

    def test_ref_that_is_not_the_checkout_head_fails(self):
        with tempfile.TemporaryDirectory() as tmp, self.assertRaises(build_theme.BuildError):
            build_theme.build(self.forma, "no-such-ref-xyz", ATTRIBUTE, pathlib.Path(tmp))


@unittest.skipUnless(shutil.which("npm") or REQUIRE_FORMA, "npm not installed")
class NpmLayout(unittest.TestCase):
    def test_pack_contains_only_dist_theme_logos(self):
        result = subprocess.run(["npm", "pack", "--dry-run", "--json", "--ignore-scripts"], cwd=ROOT,
                                capture_output=True, text=True, check=True)
        files = {f["path"] for f in json.loads(result.stdout)[0]["files"]}
        expected = {p.relative_to(ROOT).as_posix() for d in PACKAGE_DIRS for p in (ROOT / d).rglob("*") if p.is_file()}
        self.assertEqual(files - {"package.json", "README.md"}, expected)


if __name__ == "__main__":
    unittest.main()
