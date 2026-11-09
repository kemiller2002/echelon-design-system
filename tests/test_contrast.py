#!/usr/bin/env python3
"""Unit tests for tools/contrast.py (stdlib unittest, no dependencies)."""
import json
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

import contrast  # noqa: E402


class LuminanceAndRatio(unittest.TestCase):
    def test_black_white_extremes(self):
        self.assertAlmostEqual(contrast.relative_luminance('#000000'), 0.0)
        self.assertAlmostEqual(contrast.relative_luminance('#FFFFFF'), 1.0)
        self.assertAlmostEqual(contrast.contrast_ratio('#000000', '#ffffff'), 21.0)

    def test_ratio_is_symmetric_and_identity_is_one(self):
        self.assertAlmostEqual(contrast.contrast_ratio('#905831', '#f2efe7'),
                               contrast.contrast_ratio('#f2efe7', '#905831'))
        self.assertAlmostEqual(contrast.contrast_ratio('#b7844b', '#b7844b'), 1.0)

    def test_known_reference_values(self):
        # #767676 on white is the widely cited minimum grey for 4.5:1 (4.54:1).
        self.assertEqual(contrast.truncate(contrast.contrast_ratio('#767676', '#ffffff')), '4.54')
        # #777777 on white falls just short (4.47:1).
        self.assertLess(contrast.contrast_ratio('#777777', '#ffffff'), 4.5)

    def test_matches_website_contrast_suite_expectations(self):
        # Mirrors kemiller2002/echelon-foundry test/color-contrast.test.js @ 8c6b453.
        passes = [('#171a18', '#f2efe7'), ('#202421', '#f2efe7'), ('#3a403c', '#f2efe7'),
                  ('#686d68', '#f2efe7'), ('#905831', '#f2efe7'), ('#47756b', '#f2efe7'),
                  ('#f2efe7', '#202421'), ('#f2efe7', '#3a403c')]
        fails = [('#905831', '#e3e0d7'), ('#47756b', '#e3e0d7'),
                 ('#905831', '#202421'), ('#47756b', '#202421')]
        for fg, bg in passes:
            self.assertGreaterEqual(contrast.contrast_ratio(fg, bg), 4.5, (fg, bg))
        for fg, bg in fails:
            self.assertLess(contrast.contrast_ratio(fg, bg), 4.5, (fg, bg))

    def test_truncation_never_rounds_up(self):
        self.assertEqual(contrast.truncate(4.4999), '4.49')
        self.assertEqual(contrast.truncate(4.5), '4.50')

    def test_rejects_malformed_hex(self):
        for bad in ('#fff', 'b7844b0', '#gggggg', ''):
            with self.assertRaises(ValueError):
                contrast.parse_hex(bad)


class Verdicts(unittest.TestCase):
    def result(self, use, ratio):
        return contrast.Result('light', 'a', '#000000', 'b', '#ffffff', use, ratio)

    def test_thresholds(self):
        self.assertEqual(contrast.verdict(self.result('text', 4.5)), 'PASS')
        self.assertEqual(contrast.verdict(self.result('text', 4.4999)), 'FAIL')
        self.assertEqual(contrast.verdict(self.result('non-text', 3.0)), 'PASS')
        self.assertEqual(contrast.verdict(self.result('non-text', 2.99)), 'FAIL')
        self.assertEqual(contrast.verdict(self.result('decorative', 1.0)), 'n/a (decorative)')

    def test_candidate_bronze_text_on_white_fails(self):
        # accessibility/requirements.md: do not assume bronze text on white passes.
        self.assertLess(contrast.contrast_ratio('#B7844B', '#FFFFFF'), 4.5)


class Distance(unittest.TestCase):
    def test_delta_e_identity_and_order(self):
        self.assertAlmostEqual(contrast.delta_e76('#905831', '#905831'), 0.0)
        self.assertLess(contrast.delta_e76('#b7844b', '#b8734a'), contrast.delta_e76('#b7844b', '#905831'))

    def test_nearest_prefers_exact(self):
        verified = (contrast.Match('s', 'x', '#ffffff', 0.0), contrast.Match('s', 'y', '#000000', 0.0))
        self.assertEqual(contrast.nearest('#FFFFFF', verified).name, 'x')
        self.assertEqual(contrast.exact_matches('#ffffff', verified)[0].name, 'x')
        self.assertIsNone(contrast.nearest('#ffffff', ()))


class Report(unittest.TestCase):
    def load(self):
        return contrast.load_json(contrast.CANDIDATES_PATH), contrast.load_json(contrast.EVIDENCE_PATH)

    def test_report_is_deterministic(self):
        candidates, evidence = self.load()
        self.assertEqual(contrast.render_report(candidates, evidence), contrast.render_report(candidates, evidence))

    def test_audit_markdown_block_is_current(self):
        candidates, evidence = self.load()
        committed = contrast.extract_block((ROOT / 'brand' / 'AUDIT.md').read_text(encoding='utf-8'))
        self.assertEqual(committed, contrast.render_report(candidates, evidence),
                         'brand/AUDIT.md is stale; regenerate with python tools/contrast.py')

    def test_every_pair_resolves_in_both_modes(self):
        candidates, evidence = self.load()
        for mode in contrast.MODES:
            self.assertEqual(len(contrast.evaluate(mode, candidates[mode], contrast.CANDIDATE_PAIRS)),
                             len(contrast.CANDIDATE_PAIRS))
            self.assertEqual(len(contrast.evaluate(mode, evidence['formaSemantic'][mode], contrast.FORMA_PAIRS)),
                             len(contrast.FORMA_PAIRS))

    def test_evidence_is_not_a_token_release(self):
        _, evidence = self.load()
        self.assertEqual(evidence['status'], 'audit-evidence-not-tokens')
        for source in evidence['sources']:
            self.assertRegex(source['commit'], r'^[0-9a-f]{40}$', source['id'])
            for value in source['colors'].values():
                contrast.parse_hex(value)

    def test_candidates_remain_provisional(self):
        candidates, _ = self.load()
        self.assertEqual(candidates['status'], 'provisional')
        self.assertEqual(candidates['version'], '0.0.0-draft')

    def test_no_frozen_token_files(self):
        stray = sorted(p.name for p in (ROOT / 'tokens').iterdir() if p.name != 'candidates.json')
        self.assertEqual(stray, [], 'v1 tokens must not be frozen before owner approval')


if __name__ == '__main__':
    unittest.main()
