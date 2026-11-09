"""Validation of the @echelon-foundry/echelon-theme package (EDS-ADR-002).

Tests that need a Forma checkout read it from FORMA_SRC (with FORMA_REF and
FORMA_BRAND_ATTRIBUTE, defaulting to forma-pin.json). Without FORMA_SRC they
skip, unless REQUIRE_FORMA=1, which turns the skip into a failure (CI sets it).
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
import theme_validator  # noqa: E402

FIXTURES = ROOT / "tests/fixtures/theme-adversarial"
CASES = json.loads((FIXTURES / "cases.json").read_text())["cases"]
PIN = json.loads((ROOT / "forma-pin.json").read_text())
FORMA = os.environ.get("FORMA_SRC")
REQUIRE_FORMA = os.environ.get("REQUIRE_FORMA") == "1"
FORMA_REF = os.environ.get("FORMA_REF", PIN["ref"])
ATTRIBUTE = os.environ.get("FORMA_BRAND_ATTRIBUTE", PIN["brandAttribute"])
PACKAGE_DIRS = ("dist", "logos", "theme")


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
    for entry in manifest["assets"] + manifest["stylesheets"]:
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
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
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
