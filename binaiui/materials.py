"""AirX visual materials, with engineering-review flags."""
from dataclasses import dataclass

@dataclass(frozen=True)
class Material:
    name: str
    visual_role: str
    review: tuple[str, ...]
    approved_for_process_contact: bool = False

MATERIALS = {
    "nacre": Material("Mother-of-pearl / nacre", "iridescent layered casing",
                     ("erosion", "contamination", "bond strength", "cleanability")),
    "abalone": Material("Abalone shell", "spectral teal-violet panel",
                       ("bio-source traceability", "temperature cycles", "surface hygiene")),
    "aerogel": Material("Aerogel", "protected insulation",
                        ("dust exposure", "manufacturer temperature limits", "encapsulation")),
    "opal": Material("Opal", "translucent flow accents",
                     ("fracture", "temperature cycles", "water resistance")),
    "sapphire": Material("Sapphire", "window/lens accent",
                        ("impact", "mounting", "thermal expansion")),
    "ruby": Material("Ruby", "red flow status lighting",
                     ("mounting", "thermal expansion", "optical safety")),
    "gold": Material("Gold", "conductive-colored edging",
                     ("cost", "bonding", "galvanic compatibility")),
    "obsidian": Material("Obsidian", "dark glass geometry",
                        ("brittleness", "sharp-fragment risk", "mounting")),
    "coral_geometry": Material("Coral-inspired pattern", "porous geometry",
                               ("pressure loss", "cleanability", "microbial accumulation")),
    "nautilus_geometry": Material("Nautilus-inspired spiral", "manifold geometry",
                                 ("pressure loss", "CFD", "flow distribution")),
}

def lookup(name: str) -> dict:
    if name not in MATERIALS:
        raise ValueError("Unknown material")
    m = MATERIALS[name]
    return {
        "name": m.name, "visual_role": m.visual_role,
        "engineering_review": list(m.review),
        "approved_for_process_contact": m.approved_for_process_contact,
        "heals_air": False,
    }
