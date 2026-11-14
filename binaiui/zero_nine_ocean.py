"""0 -> 9 open-ocean geometry. No return to origin."""
from __future__ import annotations
from hashlib import sha256
from math import sin, pi
import json

SYMBOLS = "0099•∴⋅↗⇝⟡"
PALETTE = ("#df4dff", "#8f58f2", "#19aeff", "#36f3ff", "#f6b54f", "#ec49ac")

class Random32:
    def __init__(self, seed: int):
        self.state = seed & 0xFFFFFFFF or 9
    def take(self) -> float:
        self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
        return self.state / 4294967296

def ocean_field(seed: int = 9, *, pairs: int = 36, samples: int = 97) -> dict:
    if type(seed) is not int:
        raise TypeError("seed must be an integer")
    if type(pairs) is not int or pairs < 1:
        raise ValueError("pairs must be positive")
    if type(samples) is not int or samples < 3:
        raise ValueError("samples must be at least 3")
    rng = Random32(seed)
    strands = []
    for pair in range(pairs):
        center = -.12 + 1.24 * rng.take()
        amplitude = .011 + .037 * rng.take()
        phase = 2 * pi * rng.take()
        gap = .007 + .014 * rng.take()
        flare = .045 + .095 * rng.take()
        lean = (rng.take() - .5) * .31
        for side in (-1, 1):
            points = []
            for index in range(samples):
                t = index / (samples - 1)
                approach = abs(2 * t - 1)
                separation = gap + flare * approach ** 1.45
                wave = amplitude * sin(2 * pi * t * 1.35 + phase) * (.3 + .7 * approach)
                points.append([round(-.24 + 1.48 * t, 7),
                               round(center + side * separation + wave + lean * (t - .5), 7)])
            strands.append({"pair": pair, "side": side,
                "color": PALETTE[(pair * 2 + (side + 1) // 2) % len(PALETTE)],
                "origin": "0", "release": "9", "points": points})
    return {"version":"09.1", "seed":seed, "symbol_set":SYMBOLS,
            "flow":"0→⇝→∴→ 9 ↗", "strands":strands}

def verify_field(field: dict) -> dict:
    strands = field["strands"]
    pairs = sorted({s["pair"] for s in strands})
    checks = {
        "paired_currents": len(strands) == 2 * len(pairs),
        "all_open_edges": all(s["points"][0][0] < 0 and s["points"][-1][0] > 1 for s in strands),
        "all_forward": all(all(b[0] > a[0] for a,b in zip(s["points"], s["points"][1:])) for s in strands),
        "no_endpoint_closures": all(s["points"][0] != s["points"][-1] for s in strands),
        "numeric_symbol_field": not any(c.isalpha() or c in "8∞" or ord(c)<32 for c in field["symbol_set"]),
        "start_zero_release_nine": all(s["origin"] == "0" and s["release"] == "9" for s in strands),
        "encounter_gap_not_joined": all(abs(strands[2*i]["points"][len(strands[2*i]["points"])//2][1] -
            strands[2*i+1]["points"][len(strands[2*i+1]["points"])//2][1]) > .001 for i in range(len(pairs)))
    }
    payload = json.dumps(field, ensure_ascii=False, sort_keys=True, separators=(",",":"))
    return {"passed":all(checks.values()), "checks":checks,
            "sha256":sha256(payload.encode("utf-8")).hexdigest(),"strands":len(strands)}
