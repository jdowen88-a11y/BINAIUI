"""GENESIS OPEN FIELD deterministic hyperbolic SVG renderer.

The authored language is docs/genesis.codex and uses the inverse pair )(.
This Python module is a separate runtime adapter, not the canonical syntax.
Geometry is the hyperbolic plane in Fermi coordinates:
    ds squared = du squared + cosh(sqrt(k) * u) squared * dv squared
with constant Gaussian curvature -k for strictly positive k.
Filaments follow numerically integrated geodesics, not flat Bezier splines.
No triangles, connecting rungs or central enclosing structures are generated.
"""
from __future__ import annotations

from hashlib import sha256
from math import cosh, sinh, sqrt, tanh
from xml.sax.saxutils import escape
import random

PALETTE = ("#CC00FF", "#885CFF", "#FF27DC", "#246BFF", "#00E8FF", "#FFD75A", "#19FF33")
GLYPHS = ("0", "1", "8", "∞", ")(", "ψ", "λ", "Σ", "🔺", "🔻", "⚡", "🐉")


def _derivative(curvature: float, state: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
    u, _v, du, dv = state
    q = sqrt(curvature)
    w = q * u
    return (du, dv, q * sinh(w) * cosh(w) * dv * dv, -2 * q * tanh(w) * du * dv)


def _step(curvature: float, state: tuple[float, float, float, float], size: float) -> tuple[float, float, float, float]:
    def shift(values: tuple[float, ...], change: tuple[float, ...], amount: float) -> tuple[float, ...]:
        return tuple(a + amount * b for a, b in zip(values, change))
    a = _derivative(curvature, state)
    b = _derivative(curvature, shift(state, a, size / 2))
    c = _derivative(curvature, shift(state, b, size / 2))
    d = _derivative(curvature, shift(state, c, size))
    return tuple(s + size * (p + 2 * q + 2 * r + t) / 6 for s, p, q, r, t in zip(state, a, b, c, d))


def metric(curvature: float, u: float) -> dict[str, float]:
    """Positive-definite hyperbolic Fermi metric, with curvature -k."""
    if not 0 < curvature <= 12:
        raise ValueError("Curvature magnitude must be positive and at most 12")
    if not -5 < u < 5:
        raise ValueError("Coordinate out of supported range")
    return {"g_uu": 1.0, "g_vv": cosh(sqrt(curvature) * u) ** 2, "gaussian_curvature": -curvature}


def _trace(curvature: float, u: float, du: float, dv: float, max_steps: int = 345) -> list[tuple[float, float]]:
    state = (u, -2.65, du, dv / cosh(sqrt(curvature) * u))
    points: list[tuple[float, float]] = []
    for _ in range(max_steps):
        if abs(state[0]) > 3.6 or abs(state[1]) > 5:
            break
        points.append((state[0], state[1]))
        if state[1] > 2.65:
            break
        state = _step(curvature, state, 0.0155)
    return points


def generate_svg(seed: int = 8, width: int = 1280, height: int = 720,
                 streams: int = 78, symbols: int = 520,
                 curvature: float = 1.0) -> str:
    """Generate an open-field SVG from geodesic currents and glyph filaments."""
    for value, low, high, name in ((width, 320, 4096, "width"),
                                   (height, 240, 4096, "height"),
                                   (streams, 1, 250, "streams"),
                                   (symbols, 0, 5000, "symbols")):
        if type(value) is not int or not low <= value <= high:
            raise ValueError(f"{name} must be integer in {low}..{high}")
    if type(seed) is not int:
        raise TypeError("seed must be an integer")
    if not isinstance(curvature, (int, float)) or isinstance(curvature, bool):
        raise TypeError("Curvature magnitude must be numeric")
    metric(float(curvature), 0)
    rng = random.Random(seed)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" data-geometry="hyperbolicFermiGeodesics" '
        f'data-gaussian-curvature="-{float(curvature):g}" data-inverse=")(">',
        '<defs><linearGradient id="space" x2="1" y2="1"><stop stop-color="#110724"/>'
        '<stop offset=".55" stop-color="#0b1134"/><stop offset="1" stop-color="#02020d"/>'
        '</linearGradient><filter id="glow" x="-45%" y="-45%" width="190%" height="190%">'
        '<feGaussianBlur stdDeviation="4"/></filter></defs>',
        f'<rect width="{width}" height="{height}" fill="url(#space)"/>'
    ]
    for index in range(max(160, streams * 4)):
        x, y = rng.uniform(0, width), rng.uniform(0, height)
        parts.append(
            f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rng.uniform(.2,1.1):.2f}" '
            f'fill="{PALETTE[index % len(PALETTE)]}" opacity=".6"/>'
        )
    visible_paths = []
    for index in range(streams):
        group = index % 2
        initial_u = (-.35 if group == 0 else .35) + rng.uniform(-.23, .23)
        initial_du = rng.uniform(-.08, .08)
        initial_dv = rng.uniform(.82, 1.03)
        points = _trace(float(curvature), initial_u, initial_du, initial_dv)
        if len(points) < 2:
            continue
        # Fermi coordinate projection is simply a viewport crop of curved space.
        # The metric is used in the geodesic calculation above, not claimed
        # to be an isometric projection onto a flat image.
        def projection(p: tuple[float, float]) -> tuple[float, float]:
            u, v = p
            return ((v + 2.65) / 5.3 * width, (1.25 - u) / 2.5 * height)
        projected = [projection(p) for p in points]
        d = "M " + " L ".join(f"{x:.2f} {y:.2f}" for x, y in projected)
        color = PALETTE[index % len(PALETTE)]
        parts.append(f'<path d="{d}" fill="none" stroke="{color}" '
                     'stroke-width="5" opacity=".24" filter="url(#glow)"/>')
        parts.append(f'<path d="{d}" fill="none" stroke="{color}" '
                     'stroke-width=".9" opacity=".8"/>')
        visible_paths.append((projected, color))
    for _ in range(symbols):
        if not visible_paths:
            break
        path, color = rng.choice(visible_paths)
        x, y = rng.choice(path)
        if not (-22 <= x <= width + 22 and -22 <= y <= height + 22):
            continue
        token = escape(rng.choice(GLYPHS))
        size = rng.uniform(9, 22)
        parts.append(f'<text x="{x:.2f}" y="{y:.2f}" fill="{color}" '
                     f'opacity="{rng.uniform(.4, .98):.2f}" font-size="{size:.1f}" '
                     f'font-family="system-ui,sans-serif">{token}</text>')
    parts.append("</svg>")
    return "\n".join(parts)


def fingerprint(svg: str) -> str:
    return sha256(svg.encode("utf-8")).hexdigest()
