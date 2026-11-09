"""Safety, accessibility and palette checks for brand/logos (EDS-BRAND-APP-001)."""
import json
import pathlib
import re
import sys
import unittest
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import logos  # noqa: E402
import contrast  # noqa: E402

SVG = "{http://www.w3.org/2000/svg}"
CATALOG = json.loads((ROOT / "brand/logos/catalog.json").read_text())
PALETTE = {v.lower() for k, v in CATALOG["palette"].items() if k != "source"}
FILES = sorted((ROOT / "brand/logos").rglob("*.svg"))


def colors(text):
    return {c.lower() for c in re.findall(r'(?:fill|stroke)="(#[0-9a-fA-F]{6})"', text)}


class LogoSafety(unittest.TestCase):
    def test_every_catalogued_asset_exists_and_every_svg_is_catalogued(self):
        listed = {ROOT / path for mark in CATALOG["marks"] for path in mark["assets"].values()}
        self.assertTrue(all(p.exists() for p in listed), [str(p) for p in listed if not p.exists()])
        self.assertEqual(listed, set(FILES))

    def test_no_script_events_or_external_references(self):
        for path in FILES:
            text = path.read_text()
            with self.subTest(path=path.name):
                self.assertNotRegex(text, r"(?i)<script|\son\w+=|javascript:|<foreignObject|xlink:href|\shref=|url\(|<image")

    def test_the_safety_pattern_catches_planted_payloads(self):
        unsafe = r"(?i)<script|\son\w+=|javascript:|<foreignObject|xlink:href|\shref=|url\(|<image"
        for payload in ['<script>alert(1)</script>', '<rect onload="x()"/>', '<a href="https://x">',
                        '<image xlink:href="x.png"/>', '<rect fill="url(#g)"/>']:
            self.assertRegex(payload, unsafe)

    def test_accessible_name_and_square_viewbox_for_marks(self):
        for path in FILES:
            root = ET.fromstring(path.read_text())
            with self.subTest(path=path.name):
                self.assertEqual(root.get("role"), "img")
                self.assertTrue(root.get("aria-label"))
                self.assertIsNotNone(root.find(f"{SVG}title"))
                if path.name.startswith("mark"):
                    self.assertEqual(root.get("viewBox"), "0 0 64 64")

    def test_only_verified_palette_colors_or_current_color(self):
        for path in FILES:
            with self.subTest(path=path.name):
                self.assertLessEqual(colors(path.read_text()), PALETTE)
        for mono in ("echelon-foundry/mark-mono.svg", "signal/mark-mono.svg"):
            self.assertEqual(colors((ROOT / "brand/logos" / mono).read_text()), set())

    def test_glyph_contrast_on_its_tile(self):
        pairs = [(logos.BRONZE_LIGHT, logos.CHARCOAL), (logos.PARCHMENT, logos.CHARCOAL),
                 (logos.OXIDE_BRONZE, logos.PARCHMENT), (logos.CHARCOAL, logos.PARCHMENT)]
        for fg, bg in pairs:
            with self.subTest(fg=fg, bg=bg):
                self.assertGreaterEqual(contrast.contrast_ratio(fg, bg), 3.0)

    def test_approval_is_recorded_not_assumed(self):
        for mark in CATALOG["marks"]:
            with self.subTest(mark=mark["id"]):
                self.assertIn(mark["status"], {"proposed", "approved"})
                self.assertEqual(mark["approved"], mark["status"] == "approved")
                if mark["approved"]:
                    approval = mark.get("approval", {})
                    self.assertTrue(approval.get("by") and approval.get("on") and approval.get("record"))

    def test_committed_svgs_match_the_generator(self):
        self.assertEqual(logos.stale(ROOT / "brand/logos"), [])


if __name__ == "__main__":
    unittest.main()
