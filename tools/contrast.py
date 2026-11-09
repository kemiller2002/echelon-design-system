#!/usr/bin/env python3
"""Deterministic WCAG 2.2 contrast and nearest-colour report for the brand audit.

Pure functions compute everything; only ``main`` touches the filesystem.

    python tools/contrast.py           # print the generated audit block
    python tools/contrast.py --check   # fail if brand/AUDIT.md's block is stale

Ratios use the WCAG 2.x relative-luminance formula (sRGB, 0.04045 threshold).
Displayed ratios are truncated, never rounded up, to two decimals; pass/fail
uses the exact value. Colour distance is CIE76 Delta E*ab (D65).
"""
from __future__ import annotations

import json
import math
import pathlib
import sys
from typing import Iterable, Mapping, NamedTuple, Optional, Sequence, Tuple

ROOT = pathlib.Path(__file__).resolve().parents[1]
CANDIDATES_PATH = ROOT / 'tokens' / 'candidates.json'
EVIDENCE_PATH = ROOT / 'brand' / 'audit-evidence.json'
AUDIT_PATH = ROOT / 'brand' / 'AUDIT.md'
BEGIN_MARKER = '<!-- generated:contrast:begin (python tools/contrast.py) -->'
END_MARKER = '<!-- generated:contrast:end -->'

# Minimum ratios by use (WCAG 2.2 SC 1.4.3 and 1.4.11). Decorative has none.
REQUIRED = {'text': 4.5, 'large-text': 3.0, 'non-text': 3.0, 'decorative': None}

Rgb = Tuple[float, float, float]


class Pair(NamedTuple):
    foreground: str
    background: str
    use: str


class Result(NamedTuple):
    mode: str
    foreground: str
    fg_hex: str
    background: str
    bg_hex: str
    use: str
    ratio: float


# Role pairs for tokens/candidates.json (flat role -> hex per mode).
CANDIDATE_PAIRS: Tuple[Pair, ...] = (
    Pair('text', 'background', 'text'),
    Pair('text', 'surface', 'text'),
    Pair('muted', 'background', 'text'),
    Pair('muted', 'surface', 'text'),
    Pair('accent', 'background', 'text'),
    Pair('accent', 'surface', 'text'),
    Pair('surface', 'accent', 'text'),
    Pair('text', 'accent', 'text'),
    Pair('accent', 'background', 'non-text'),
    Pair('border', 'background', 'non-text'),
    Pair('border', 'surface', 'non-text'),
)

# Role pairs for Forma's shipping Echelon semantic maps (group.role paths).
FORMA_PAIRS: Tuple[Pair, ...] = (
    Pair('text.primary', 'surface.primary', 'text'),
    Pair('text.heading', 'surface.primary', 'text'),
    Pair('text.secondary', 'surface.primary', 'text'),
    Pair('text.secondary', 'surface.secondary', 'text'),
    Pair('text.on-secondary-surface', 'surface.secondary', 'text'),
    Pair('text.inverse', 'surface.inverse', 'text'),
    Pair('accent.primary', 'surface.primary', 'text'),
    Pair('accent.primary', 'surface.secondary', 'text'),
    Pair('accent.secondary', 'surface.primary', 'text'),
    Pair('accent.secondary', 'surface.secondary', 'text'),
    Pair('text.inverse', 'accent.primary', 'text'),
    Pair('status.success', 'surface.primary', 'text'),
    Pair('status.warning', 'surface.primary', 'text'),
    Pair('status.danger', 'surface.primary', 'text'),
    Pair('status.info', 'surface.primary', 'text'),
    Pair('border.functional', 'surface.primary', 'non-text'),
    Pair('border.subtle', 'surface.primary', 'decorative'),
    Pair('focus.ring', 'focus.gap', 'non-text'),
    Pair('control.track', 'surface.primary', 'non-text'),
    Pair('control.active', 'surface.primary', 'non-text'),
)

MODES = ('light', 'dark')


# --- colour science -------------------------------------------------------

def parse_hex(value: str) -> Rgb:
    text = value.strip().lstrip('#')
    if len(text) != 6 or any(c not in '0123456789abcdefABCDEF' for c in text):
        raise ValueError(f'expected #RRGGBB, got {value!r}')
    return tuple(int(text[i:i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]


def linearize(channel: float) -> float:
    return channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4


def relative_luminance(value: str) -> float:
    r, g, b = (linearize(c) for c in parse_hex(value))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(foreground: str, background: str) -> float:
    lighter, darker = sorted((relative_luminance(foreground), relative_luminance(background)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def truncate(value: float, places: int = 2) -> str:
    factor = 10 ** places
    return f'{math.floor(value * factor + 1e-9) / factor:.{places}f}'


def to_lab(value: str) -> Rgb:
    r, g, b = (linearize(c) for c in parse_hex(value))
    xyz = (
        (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047,
        (0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / 1.00000,
        (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883,
    )
    fx, fy, fz = (t ** (1 / 3) if t > (6 / 29) ** 3 else t / (3 * (6 / 29) ** 2) + 4 / 29 for t in xyz)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def delta_e76(a: str, b: str) -> float:
    return math.dist(to_lab(a), to_lab(b))


# --- evaluation -----------------------------------------------------------

def lookup(palette: Mapping, path: str) -> str:
    node = palette
    for key in path.split('.'):
        node = node[key]
    return node


def evaluate(mode: str, palette: Mapping, pairs: Iterable[Pair]) -> Tuple[Result, ...]:
    def one(pair: Pair) -> Result:
        fg, bg = lookup(palette, pair.foreground), lookup(palette, pair.background)
        return Result(mode, pair.foreground, fg.lower(), pair.background, bg.lower(), pair.use, contrast_ratio(fg, bg))
    return tuple(one(p) for p in pairs)


def verdict(result: Result) -> str:
    required = REQUIRED[result.use]
    if required is None:
        return 'n/a (decorative)'
    return 'PASS' if result.ratio >= required else 'FAIL'


def failures(results: Iterable[Result]) -> Tuple[Result, ...]:
    return tuple(r for r in results if verdict(r) == 'FAIL')


class Match(NamedTuple):
    source: str
    name: str
    hex: str
    distance: float


def verified_colours(evidence: Mapping) -> Tuple[Match, ...]:
    return tuple(
        Match(src['id'], name, hex_.lower(), 0.0)
        for src in evidence['sources']
        for name, hex_ in src['colors'].items()
    )


def exact_matches(value: str, verified: Sequence[Match]) -> Tuple[Match, ...]:
    return tuple(m for m in verified if m.hex == value.lower())


def nearest(value: str, verified: Sequence[Match]) -> Optional[Match]:
    ranked = sorted(
        (m._replace(distance=delta_e76(value, m.hex)) for m in verified),
        key=lambda m: (m.distance, m.source, m.name),
    )
    return ranked[0] if ranked else None


# --- rendering ------------------------------------------------------------

def render_contrast_table(results: Sequence[Result]) -> str:
    head = ('| Mode | Foreground | Background | Use | Ratio | Required | Verdict |\n'
            '| --- | --- | --- | --- | --- | --- | --- |')
    rows = (
        f'| {r.mode} | {r.foreground} `{r.fg_hex}` | {r.background} `{r.bg_hex}` | {r.use} | '
        f'{truncate(r.ratio)}:1 | {"-" if REQUIRED[r.use] is None else f"{REQUIRED[r.use]}:1"} | {verdict(r)} |'
        for r in results
    )
    return '\n'.join((head, *rows))


def render_nearest_table(candidates: Mapping, verified: Sequence[Match]) -> str:
    head = ('| Mode | Candidate role | Candidate | Used by a verified source? | Nearest verified value | Delta E76 |\n'
            '| --- | --- | --- | --- | --- | --- |')

    def row(mode: str, role: str, value: str) -> str:
        exact = exact_matches(value, verified)
        near = nearest(value, verified)
        used = '; '.join(f'{m.source}: {m.name}' for m in exact) if exact else 'No'
        near_text = f'`{near.hex}` ({near.source}: {near.name})' if near else '-'
        return f'| {mode} | {role} | `{value.lower()}` | {used} | {near_text} | {truncate(near.distance, 1) if near else "-"} |'

    rows = (row(mode, role, value) for mode in MODES for role, value in candidates[mode].items())
    return '\n'.join((head, *rows))


def render_report(candidates: Mapping, evidence: Mapping) -> str:
    verified = verified_colours(evidence)
    candidate_results = tuple(r for mode in MODES for r in evaluate(mode, candidates[mode], CANDIDATE_PAIRS))
    forma_results = tuple(r for mode in MODES for r in evaluate(mode, evidence['formaSemantic'][mode], FORMA_PAIRS))
    summary = (
        f'Candidate pairs failing their requirement: {len(failures(candidate_results))} of {len(candidate_results)}. '
        f'Forma pairs failing their requirement: {len(failures(forma_results))} of {len(forma_results)}.'
    )
    return '\n\n'.join((
        BEGIN_MARKER,
        '### Candidate versus verified values',
        render_nearest_table(candidates, verified),
        '### Contrast: tokens/candidates.json',
        render_contrast_table(candidate_results),
        '### Contrast: Forma shipping Echelon palette (755df9a)',
        render_contrast_table(forma_results),
        summary,
        END_MARKER,
    ))


def extract_block(markdown: str) -> Optional[str]:
    start, end = markdown.find(BEGIN_MARKER), markdown.find(END_MARKER)
    if start < 0 or end < start:
        return None
    return markdown[start:end + len(END_MARKER)]


# --- I/O edge -------------------------------------------------------------

def load_json(path: pathlib.Path) -> Mapping:
    return json.loads(path.read_text(encoding='utf-8'))


def main(argv: Sequence[str]) -> int:
    report = render_report(load_json(CANDIDATES_PATH), load_json(EVIDENCE_PATH))
    if '--check' in argv:
        committed = extract_block(AUDIT_PATH.read_text(encoding='utf-8'))
        if committed != report:
            print('FAIL: brand/AUDIT.md generated contrast block is missing or stale; '
                  'run python tools/contrast.py and paste the output.')
            return 1
        print('PASS: brand/AUDIT.md contrast block matches tools/contrast.py output')
        return 0
    print(report)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
