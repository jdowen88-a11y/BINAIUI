#!/usr/bin/env python3
"""Validate local inventory without fetching private repositories or deploying anything."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_VISIBILITIES = {"private", "public"}
EXPECTED_INTEGRATIONS = {"host-local-tests", "offline-reference-check", "catalogue-only"}

def validate() -> dict:
    doc = json.loads((ROOT / "WORKSPACE.json").read_text(encoding="utf-8"))
    if doc.get("updated") != "2026-11-13":
        raise ValueError("Missing audited catalogue date")
    records = doc["repositories"]
    if len(records) != 23:
        raise ValueError(f"Expected 23 original repositories, got {len(records)}")
    names = [r["name"] for r in records]
    if len(set(names)) != len(names):
        raise ValueError("Duplicate repositories")
    if not all(r.get("full_name") == f"jdowen88-a11y/{r['name']}" for r in records if r["visibility"] == "public"):
        raise ValueError("Unexpected public owner/repo")
    if not all("full_name" not in r and r["name"].startswith("private-") for r in records if r["visibility"] == "private"):
        raise ValueError("Private repository metadata must remain redacted")
    if not all(r["visibility"] in EXPECTED_VISIBILITIES for r in records):
        raise ValueError("Unrecognized visibility")
    if not all(r["integration"] in EXPECTED_INTEGRATIONS for r in records):
        raise ValueError("Unrecognized integration mode")
    if any(r["visibility"] == "private" and r["integration"] != "catalogue-only" for r in records):
        raise ValueError("Private repositories cannot be copied into a public CI integration")
    for repo in records:
        if repo["integration"] == "offline-reference-check":
            v = repo.get("validation")
            if not v or len(v["ref"]) != 40 or not v.get("command"):
                raise ValueError(f"Missing pinned revision or check: {repo['name']}")
    p = doc.get("policy", {})
    for required in ("preserve_sources", "private_repo_contents_excluded"):
        if p.get(required) is not True:
            raise ValueError(f"Policy must preserve {required}")
    for required in ("deploy", "merge_main", "live_trading"):
        if p.get(required) is not False:
            raise ValueError(f"Historical review policy must disable {required}")
    release = doc.get("release_status")
    if release is not None:
        if release.get("code_integrated_to_main") is not True:
            raise ValueError("Code release flag must be explicit")
        if not isinstance(release.get("merge_commit"), str) or len(release["merge_commit"]) != 40:
            raise ValueError("Missing 40-character merged commit SHA")
        if release.get("publish_status") not in ("not_verified", "verified"):
            raise ValueError("Invalid publication verification status")
        if not isinstance(release.get("physical_iphone_verified"), bool):
            raise ValueError("Physical device status must be explicit")
        if release.get("original_images_catalogued") != 10:
            raise ValueError("Original catalog count must be explicit")
        preserved = release.get("original_images_in_github")
        if not isinstance(preserved, int) or not 0 <= preserved <= 10:
            raise ValueError("Invalid count of preserved originals")
        if release.get("open_acceptance_issue") != 6:
            raise ValueError("Missing release acceptance issue #6")
    return {"count": len(records), "offline_checks": sum(r["integration"] == "offline-reference-check" for r in records)}

if __name__ == "__main__":
    print(json.dumps(validate(), sort_keys=True))
