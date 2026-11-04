"""GENESIS OPEN FIELD deterministic SVG generator.

The symbols make the paths; no central enclosure, orb or added labels.
Standalone, dependency-free and never writes unless the caller explicitly saves.
"""
from __future__ import annotations
from hashlib import sha256
from math import cos, sin, pi, atan2, degrees
import random
from xml.sax.saxutils import escape

PALETTE = ("#ef4fff", "#8d57ff", "#0cbeff", "#00e8f2", "#ffca73", "#bc2aff")
GLYPHS = "01689∞{}[]<>∑λπφ∴∇ΩXCVAI+*/="
def _bezier(p0, p1, p2, p3, t):
    u = 1.0 - t
    return (u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
            u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1])

def generate_svg(seed: int = 8, width: int = 1280, height: int = 720,
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
    chunks = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
              '<defs><radialGradient id="space"><stop stop-color="#13052f"/><stop offset="1" stop-color="#02020e"/></radialGradient>',
              '<filter id="aurora" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs>',
              f'<rect width="{width}" height="{height}" fill="url(#space)"/>']
    # Distributed star seed, not an imposed focal point.
    for _ in range(max(150, streams * 5)):
        x, y = rng.uniform(0, width), rng.uniform(0, height)
        r = rng.choice((0.25, 0.35, 0.65, 0.85))
        color = rng.choice(PALETTE)
        chunks.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}" opacity=".67"/>')
    filaments = []
    for index in range(streams):
        # The wide endpoints travel outside the viewport on purpose.
        y0 = rng.uniform(-0.4*height, 1.4*height)
        y3 = rng.uniform(-0.3*height, 1.3*height)
        x0 = rng.uniform(-0.8*width, 0.2*width)
        x3 = rng.uniform(0.8*width, 1.8*width)
        p0, p3 = (x0, y0), (x3, y3)
        p1 = (rng.uniform(0, width), rng.uniform(-0.3*height, 1.3*height))
        p2 = (rng.uniform(0, width), rng.uniform(-0.3*height, 1.3*height))
        color = PALETTE[index % len(PALETTE)]
        path = f'M {x0:.1f} {y0:.1f} C {p1[0]:.1f} {p1[1]:.1f} {p2[0]:.1f} {p2[1]:.1f} {x3:.1f} {y3:.1f}'
        chunks.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="5" opacity=".16" filter="url(#aurora)"/>')
        chunks.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="{rng.uniform(.5,1.4):.2f}" opacity=".8"/>')
        filaments.append((p0, p1, p2, p3, color))
    for _ in range(symbols):
        p0, p1, p2, p3, color = rng.choice(filaments)
        t = rng.random()
        x, y = _bezier(p0, p1, p2, p3, t)
        if not (-20 <= x <= width+20 and -20 <= y <= height+20):
            continue
        delta = 0.001
        before = _bezier(p0, p1, p2, p3, max(t-delta,0))
        after = _bezier(p0, p1, p2, p3, min(t+delta,1))
        angle = degrees(atan2(after[1]-before[1], after[0]-before[0]))
        char = escape(rng.choice(GLYPHS))
        size = rng.uniform(9, 22)
        chunks.append(f'<text x="{x:.2f}" y="{y:.2f}" transform="rotate({angle:.1f} {x:.2f} {y:.2f})" '
                      f'fill="{color}" opacity="{rng.uniform(.48,.96):.2f}" '
                      f'font-family="monospace" font-size="{size:.1f}">{char}</text>')
    # Noncentral spiral star clusters: distributed variation, not a central orb.
    for _ in range(4):
        cx, cy = rng.uniform(.05*width,.95*width), rng.uniform(.06*height,.94*height)
        radius = rng.uniform(15,45)
        for i in range(44):
            t = i*0.37
            rr = radius*(i/44)
            x, y = cx+rr*cos(t), cy+rr*.62*sin(t)
            chunks.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rng.uniform(.3,1.2):.1f}" fill="{rng.choice(PALETTE)}" opacity=".78"/>')
    chunks.append("</svg>")
    return "\n".join(chunks)

def fingerprint(svg: str) -> str:
    return sha256(svg.encode("utf-8")).hexdigest()
