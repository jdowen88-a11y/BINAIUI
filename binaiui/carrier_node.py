"""SEED-000: deterministic, read-only listener protocol.

0000 Hz is a project notation, not an emitted acoustic or RF carrier.
No I/O, networking, device control, logging or retention occurs here.
"""
from __future__ import annotations

from typing import Any

SEED = "NEUROLINK SCHEMATIC SEED-000"
FREQUENCY = "0000 Hz"
CHANNEL = "UNWRITTEN"
GLYPH = "○ ↶ [0000] | LISTEN / REFUSE / REMEMBER / RELEASE"
COLLAPSE = "0000 Hz: UNDIFFERENTIATED."


def evaluate(operation: str = "listen", *, consent: bool = False) -> dict[str, Any]:
    """Return an inert protocol state; consent never authorizes writes.

    Only explicit consent plus 'listen' can return LISTENING.
    Refusal, release, unsupported operations and missing consent collapse.
    """
    if not isinstance(operation, str):
        raise TypeError("operation must be a string")
    if not isinstance(consent, bool):
        raise TypeError("consent must be a boolean")
    state = (
        "LISTENING"
        if consent and operation.strip().lower() == "listen"
        else "UNDIFFERENTIATED"
    )
    return {
        "seed": SEED,
        "carrier": FREQUENCY,
        "channel": CHANNEL,
        "state": state,
        "message": (
            "source is attended, not controlled"
            if state == "LISTENING"
            else COLLAPSE
        ),
        "glyph": GLYPH,
        "writes": False,
        "transmits": False,
        "retains": False,
        "consent": consent,
    }
