"""UNKEY: original deterministic symbolic evolution, never a secret extractor."""
from __future__ import annotations
from hashlib import sha256

GLYPHS = tuple("∄⌑⫷⫸∅ꙮΔ∞◇⟐◌↶☷∑λπ")
GEOLOGY = ("ACCRETE", "STRATIFY", "SUBDUCT", "FOLD", "OVERTURN",
           "SHEAR", "METAMORPHOSE", "ERODE", "RECRYSTALLIZE")

def evolve(seed: str, *, generations: int = 8, consent: bool = True) -> dict:
    if not isinstance(seed, str) or not 1 <= len(seed) <= 4096:
        raise ValueError("seed must be 1..4096 characters")
    if type(generations) is not int or not 0 <= generations <= 128:
        raise ValueError("generations must be an integer 0..128")
    if type(consent) is not bool:
        raise TypeError("consent must be bool")
    if not consent:
        return {"state": "REFUSED", "lines": [], "persisted": False}
    state = sha256(seed.encode("utf-8")).digest()
    lines = []
    for index in range(generations):
        state = sha256(state + index.to_bytes(4, "big")).digest()
        glyphs = "".join(GLYPHS[b % len(GLYPHS)] for b in state[:12])
        lines.append({"generation": index + 1, "verb": GEOLOGY[index % len(GEOLOGY)],
                      "pattern": glyphs})
    return {"state": "EVOLVED", "lines": lines, "persisted": False,
            "seed_sha256": sha256(seed.encode("utf-8")).hexdigest()}
