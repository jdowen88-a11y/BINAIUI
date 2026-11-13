"""BINAIUI five-zone, consent-first symbolic mesh.

Deterministic graph logic: no network packets, radio interfaces or surveillance.
"""
from __future__ import annotations
from dataclasses import dataclass
from hashlib import sha256
import json

ZONES = ("VISION", "MEMORY", "CORE", "FLOW", "CREATE")
CANON = ("BI", "AI", "V", "X", "C", "∞")

@dataclass(frozen=True)
class Node:
    ident: str
    kind: str

def five_zone_walk(steps: int, *, start: str = "VISION") -> tuple[str, ...]:
    if type(steps) is not int or not 0 <= steps <= 10000:
        raise ValueError("steps must be an integer in 0..10000")
    if start not in ZONES:
        raise ValueError("Unknown starting zone")
    offset = ZONES.index(start)
    return tuple(ZONES[(offset + i) % len(ZONES)] for i in range(steps))

def canonical_mesh() -> dict:
    nodes = [{"id": node, "kind": "symbolic"} for node in CANON]
    edges = [{"from": CANON[i], "to": CANON[i + 1]} for i in range(len(CANON) - 1)]
    return {"nodes": nodes, "edges": edges, "policy": "consent; no forced links"}

def mesh_digest(graph: dict | None = None) -> str:
    graph = canonical_mesh() if graph is None else graph
    data = json.dumps(graph, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return sha256(data.encode("utf-8")).hexdigest()

def connect(nodes: list[str], edges: list[tuple[str, str]],
            *, consent: bool = False) -> dict:
    if not consent:
        return {"state": "REFUSED", "edges": [], "retained": False}
    if len(nodes) != len(set(nodes)) or any(not n or len(n) > 100 for n in nodes):
        raise ValueError("Node identifiers must be unique and nonblank")
    if any(a not in nodes or b not in nodes for a, b in edges):
        raise ValueError("Edges must join existing nodes")
    return {"state": "CONNECTED", "nodes": list(nodes),
            "edges": [{"from": a, "to": b} for a, b in edges],
            "retained": False}
