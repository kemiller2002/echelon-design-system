#!/usr/bin/env python3
"""Zero-dependency structural validation of provisional theme tokens."""
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]
data = json.loads((root / 'tokens/candidates.json').read_text())
assert data['status'] == 'provisional'
assert data['version'] == '0.0.0-draft'
keys = {'background', 'surface', 'text', 'muted', 'border', 'accent'}
for mode in ('light', 'dark'):
    assert set(data[mode]) == keys, f'{mode}: missing or unexpected tokens'
    for name, value in data[mode].items():
        assert re.fullmatch(r'#[0-9a-fA-F]{6}', value), (mode, name, value)
print('PASS: provisional theme token structure; accessibility and brand audit NOT verified')
