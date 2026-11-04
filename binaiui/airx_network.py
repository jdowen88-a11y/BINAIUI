"""AirX configurations as reproducible *concept-study* networks.

No certified performance, CFD, flow rating, or as-built geometry is implied.
"""
from __future__ import annotations
from dataclasses import dataclass
from math import isfinite
from typing import Iterable

@dataclass(frozen=True)
class Profile:
    code: str
    title: str
    topology: str
    modules: int
    notes: str

PROFILES = {
    "airx_spiral": Profile("airx_spiral", "Nautilus Multicassette", "spiral-manifold", 8,
                          "Spiral forms do not imply golden-ratio flow efficiency."),
    "airx_twin": Profile("airx_twin", "Dual Nacre Arrays", "two-parallel-banks", 8,
                        "Two banks of four conceptual modules."),
    "airx_wall": Profile("airx_wall", "Tri-Fan Exchange Wall", "three-banks", 6,
                        "Schematic bank configuration; fan curves not supplied."),
    "airx_cascade": Profile("airx_cascade", "Stepped Cascade", "five-stages", 5,
                           "Sequential visual stages are not proven thermal stages."),
    "airx_tower": Profile("airx_tower", "Vertical Tower", "four-levels", 4,
                         "Requires structural, recirculation and plume study."),
    "airx_radial": Profile("airx_radial", "Radial Eight-Node", "eight-way-ring", 8,
                          "Eight radial cassettes, one assumed nominal study duty."),
}

def evaluate(profile: str = "airx_radial", requested_kw: float = 20.0,
             offline: Iterable[int] = ()) -> dict:
    """Allocate nominal 20 kW equally across online modules.

    Fan/input and airflow figures are illustrative fixed-case assumptions,
    NOT measured performance or a motor sizing calculator.
    """
    if profile not in PROFILES:
        raise ValueError("Unknown AirX profile")
    if isinstance(requested_kw, bool) or not isinstance(requested_kw, (int, float)):
        raise TypeError("requested_kw must be numeric")
    if not isfinite(requested_kw) or requested_kw < 0:
        raise ValueError("requested_kw must be finite and nonnegative")
    spec = PROFILES[profile]
    selected = list(offline)
    if any(type(index) is not int or index < 1 or index > spec.modules for index in selected):
        raise ValueError("offline indices must be 1..modules")
    if len(set(selected)) != len(selected):
        raise ValueError("offline indices must be unique")
    down = set(selected)
    nameplate = 20.0 / spec.modules
    online = [i for i in range(1, spec.modules + 1) if i not in down]
    available = len(online) * nameplate
    delivered = min(float(requested_kw), available)
    per_module = delivered / len(online) if online else 0.0
    return {
        "status": "CONCEPT_ONLY_UNVERIFIED",
        "profile": profile,
        "title": spec.title,
        "topology": spec.topology,
        "nominal_total_kw": 20.0,
        "per_module_assumed_kw": round(nameplate, 5),
        "online_modules": online,
        "offline_modules": sorted(down),
        "assumed_available_kw": round(available, 5),
        "requested_kw": float(requested_kw),
        "allocated_kw": round(delivered, 5),
        "unmet_kw": round(float(requested_kw) - delivered, 5),
        "allocations": {str(i): round(per_module, 5) for i in online},
        "assumed_fan_input_w": round(881.0 * len(online) / spec.modules, 4),
        "reference_air_flow_m3_s": 3.52,
        "reference_liquid_flow_lpm": 19.14,
        "verified": False,
        "note": spec.notes,
    }
