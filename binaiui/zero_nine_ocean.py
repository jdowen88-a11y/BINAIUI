"""BINAIUI 0 -> 9 open ocean: strictly forward current, no return path."""
from __future__ import annotations

from hashlib import sha256
from decimal import Decimal, ROUND_HALF_UP
import json

SYMBOLS = "09"
PALETTE = ("#df4dff", "#8f58f2", "#19aeff", "#36f3ff", "#f6b54f", "#ec49ac")

_DECIMAL_STEP = Decimal("0.0000001")


def _fixed7(value: float) -> float:
    """Match JavaScript's toFixed(7) for exact IEEE-754 values, including half ties."""
    return float(Decimal.from_float(value).quantize(_DECIMAL_STEP, rounding=ROUND_HALF_UP))


class Random32:
    def __init__(self, seed: int):
        self.state = seed & 0xFFFFFFFF or 9

    def take(self) -> float:
        self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
        return self.state / 4294967296


def ocean_field(seed: int = 9, *, pairs: int = 36, samples: int = 97) -> dict:
    """Every coordinate advances in x: 0, 9, 0, 9... without reversing."""
    if type(seed) is not int:
        raise TypeError("seed must be an integer")
    if type(pairs) is not int or pairs < 1:
        raise ValueError("pairs must be positive")
    if type(samples) is not int or samples < 3:
        raise ValueError("samples must be at least 3")

    rng = Random32(seed)
    strands = []
    for pair in range(pairs):
        center = .08 + .84 * rng.take()
        gap = .006 + .015 * rng.take()
        flare = .055 + .09 * rng.take()
        bend = (rng.take() - .5) * .17
        lean = (rng.take() - .5) * .27
        for side in (-1, 1):
            points = []
            for index in range(samples):
                t = index / (samples - 1)
                approach = abs(2 * t - 1)
                separation = gap + flare * approach * approach
                lateral = bend * t * (1 - t) * (2 * t - 1) * 8
                x = _fixed7(1.25 * t)
                y = _fixed7(center + side * separation + lateral + lean * t)
                points.append([x, y])
            strands.append({
                "pair": pair,
                "side": side,
                "color": PALETTE[(pair * 2 + (side + 1) // 2) % len(PALETTE)],
                "origin": "0", "release": "9",
                "pattern": "09",
                "points": points,
            })
    return {
        "version": "09.2",
        "seed": seed,
        "symbol_set": SYMBOLS,
        "sequence": "09",
        "flow": "090909090909→",
        "strands": strands,
    }


def verify_field(field: dict) -> dict:
    """Fail on ANY zero or negative forward step, in ANY strand."""
    strands = field["strands"]
    pairs = sorted({s["pair"] for s in strands})
    checks = {
        "paired_currents": len(strands) == 2 * len(pairs),
        "open_edges": all(s["points"][0][0] == 0 and s["points"][-1][0] > 1 for s in strands),
        "strictly_forward_every_step": all(
            all(b[0] > a[0] for a, b in zip(s["points"], s["points"][1:]))
            for s in strands
        ),
        "not_closed": all(s["points"][0] != s["points"][-1] for s in strands),
        "zero_nine_only": field.get("symbol_set") == "09" and field.get("sequence") == "09"
            and all(s["pattern"] == "09" for s in strands),
        "zero_origin_nine_release": all(s["origin"] == "0" and s["release"] == "9" for s in strands),
        "brief_near_contact_no_join": all(
            abs(
                strands[2 * i]["points"][len(strands[2 * i]["points"]) // 2][1]
                - strands[2 * i + 1]["points"][len(strands[2 * i + 1]["points"]) // 2][1]
            ) > .001
            for i in range(len(pairs))
        ),
    }
    payload = json.dumps(field, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return {
        "passed": all(checks.values()), "checks": checks,
        "sha256": sha256(payload.encode("utf-8")).hexdigest(),
        "strands": len(strands),
    }
