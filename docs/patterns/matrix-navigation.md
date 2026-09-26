# Matrix navigation contract

Two-dimensional matrices preserve row-column relationships that can be destroyed by ordinary responsive stacking.

Forma owns presentation and navigation semantics, not the domain meaning of a cell.

Requirements:

- Use a semantic table when row/column intersections are tabular.
- Keep row and column headers programmatically associated with cells.
- A contained horizontal viewport is permitted when reflow would destroy comparison.
- Keyboard and assistive-technology reading order must remain understandable.
- Sticky headers or columns may assist orientation but must not obscure focused content.
- At narrow widths, a linear alternative is valid only when each relationship repeats both row and column scope.
- Do not encode cell meaning by color alone.
- Do not convert a two-dimensional relationship into an unexplained card collection merely to eliminate horizontal scrolling.
