"""GENESIS 0->9 OPEN OCEAN: deterministic SVG output of the shared geometry.

Numeric/symbol-only art, no returned endpoint, no closed curve, no central gate.
"""
from __future__ import annotations
from hashlib import sha256
import random
from xml.sax.saxutils import escape

from .zero_nine_ocean import PALETTE, SYMBOLS, ocean_field


def generate_svg(seed: int = 9, width: int = 1280, height: int = 720,
                 streams: int = 78, symbols: int = 520) -> str:
    for value, low, high, name in ((width, 320, 4096, "width"),
                                   (height, 240, 4096, "height"),
                                   (streams, 1, 250, "streams"),
                                   (symbols, 0, 5000, "symbols")):
        if type(value) is not int or not low <= value <= high:
            raise ValueError(f"{name} must be integer in {low}..{high}")
    if type(seed) is not int:
        raise TypeError("seed must be an integer")
    rng = random.Random(seed)
    ocean = ocean_field(seed, pairs=(streams + 1)//2)
    chunks = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
              '<defs><linearGradient id="space"><stop stop-color="#07051b"/><stop offset="1" stop-color="#020817"/></linearGradient>',
              '<filter id="aurora" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.3"/></filter></defs>',
              f'<rect width="{width}" height="{height}" fill="url(#space)"/>']
    for _ in range(max(150, streams * 5)):
        x, y = rng.uniform(0, width), rng.uniform(0, height)
        radius = rng.uniform(.25, 1.2)
        color = rng.choice(PALETTE)
        chunks.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{radius:.2f}" fill="{color}" opacity=".61"/>')
    for strand in ocean["strands"]:
        coords = strand["points"]
        path = "M " + " L ".join(f"{p[0]*width:.2f},{p[1]*height:.2f}" for p in coords)
        color = strand["color"]
        chunks.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="5" opacity=".12" filter="url(#aurora)"/>')
        chunks.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width=".75" opacity=".7"/>')
    strands = ocean["strands"]
    for _ in range(symbols):
        strand = rng.choice(strands)
        p = rng.choice(strand["points"])
        x, y = p[0]*width, p[1]*height
        if -20 <= x <= width+20 and -20 <= y <= height+20:
            glyph = escape(rng.choice(SYMBOLS))
            size = rng.uniform(9,20)
            chunks.append(f'<text x="{x:.2f}" y="{y:.2f}" fill="{strand["color"]}" opacity=".85" font-family="monospace" font-size="{size:.1f}">{glyph}</text>')
    chunks.append('</svg>')
    return "\n".join(chunks)


def fingerprint(svg: str) -> str:
    return sha256(svg.encode("utf-8")).hexdigest()
