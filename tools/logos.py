"""Generates the proposed Echelon Foundry and application marks in brand/logos/.

Pure functions return SVG text; only the __main__ block touches the filesystem.

    python tools/logos.py brand/logos           # write the SVGs
    python tools/logos.py brand/logos --check   # fail if a committed SVG differs
"""
import pathlib

CHARCOAL, PARCHMENT, BRONZE_LIGHT, OXIDE_BRONZE = "#202421", "#f2efe7", "#c9a07f", "#905831"

# Echelon: an ascending, tiered outline (from the website's existing raster
# concept, assets/images/echelonfoundrylogo.jpeg), redrawn as vector geometry.
ECHELON = ("M14 50V31L46 14V50Z", "M14 41L37 28.5V50", "M14 50L25 44V50")

def svg(title, body, view=64, desc=None):
    d = f'\n  <desc>{desc}</desc>' if desc else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view} {view}" role="img" aria-label="{title}">\n'
            f'  <title>{title}</title>{d}\n{body}\n</svg>\n')

def strokes(paths, color, width):
    return "\n".join(f'  <path d="{p}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>' for p in paths)

def tile(color):
    return f'  <rect width="64" height="64" rx="12" fill="{color}"/>'

def ef(tile_c, mark_c):
    return svg("Echelon Foundry", tile(tile_c) + "\n" + strokes(ECHELON, mark_c, 4.5))

def ef_mono():
    return svg("Echelon Foundry", strokes(ECHELON, "currentColor", 4.5))

# Application grammar: the shared tile, a small echelon step in the
# top-left corner (the family signature), and the application's own glyph.
SIGNATURE = "M10 22V15L20 10V22Z"
SIGNAL_GLYPH = "M10 40H20L25 28L33 50L39 34L42 40H54"

def app(tile_c, sig_c, glyph_c, glyph, title):
    body = (tile(tile_c) + "\n" +
            f'  <path d="{SIGNATURE}" fill="{sig_c}"/>\n' +
            strokes([glyph], glyph_c, 5))
    return svg(title, body)

def app_mono(glyph, title):
    return svg(title, f'  <path d="{SIGNATURE}" fill="currentColor"/>\n' + strokes([glyph], "currentColor", 5))

def lockup():
    mark = "\n".join(f'    <path d="{p}" fill="none" stroke="{OXIDE_BRONZE}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>' for p in ECHELON)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" role="img" aria-label="Echelon Foundry">\n'
            '  <title>Echelon Foundry</title>\n'
            f'  <g>\n{mark}\n  </g>\n'
            f'  <text x="62" y="30" font-family="Manrope, system-ui, sans-serif" font-weight="700" font-size="20" letter-spacing="1.5" fill="{CHARCOAL}">ECHELON</text>\n'
            f'  <text x="62" y="52" font-family="Manrope, system-ui, sans-serif" font-weight="700" font-size="20" letter-spacing="1.5" fill="{CHARCOAL}">FOUNDRY</text>\n'
            '</svg>\n')

FILES = {
    "echelon-foundry/mark.svg": ef(CHARCOAL, BRONZE_LIGHT),
    "echelon-foundry/mark-dark.svg": ef(PARCHMENT, OXIDE_BRONZE),
    "echelon-foundry/mark-mono.svg": ef_mono(),
    "echelon-foundry/lockup.svg": lockup(),
    "signal/mark.svg": app(CHARCOAL, BRONZE_LIGHT, PARCHMENT, SIGNAL_GLYPH, "Signal"),
    "signal/mark-dark.svg": app(PARCHMENT, OXIDE_BRONZE, CHARCOAL, SIGNAL_GLYPH, "Signal"),
    "signal/mark-mono.svg": app_mono(SIGNAL_GLYPH, "Signal"),
}

def stale(out):
    return [name for name, text in FILES.items()
            if not (out / name).exists() or (out / name).read_text() != text]


if __name__ == "__main__":
    import sys
    out = pathlib.Path(sys.argv[1])
    if "--check" in sys.argv:
        bad = stale(out)
        print("FAIL: regenerate " + ", ".join(bad) if bad else "PASS: brand/logos matches tools/logos.py")
        sys.exit(1 if bad else 0)
    for name, text in FILES.items():
        (out / name).parent.mkdir(parents=True, exist_ok=True)
        (out / name).write_text(text)
    print("\n".join(FILES))
