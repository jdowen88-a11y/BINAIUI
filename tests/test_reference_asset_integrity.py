"""Fail-closed audit of original GENESIS artwork provenance.

Metadata alone is never an image backup. A record may declare a binary
stored in GitHub only if the original bytes actually exist and match its
full SHA-256. Generated previews cannot silently substitute for originals.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "archive/2026-11-03/full-resolution-references.json"
VIEW = ROOT / "docs/genesis-reference-manifest.json"
FULL_HASH = re.compile(r"[0-9a-f]{64}", re.I)
HASH_PREFIX = re.compile(r"[0-9a-f]{12,64}", re.I)


def _references():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    view = json.loads(VIEW.read_text(encoding="utf-8"))
    assert source == view, "The archived and displayed provenance catalogs differ"
    records = source["artworks"]
    assert len(records) == 10, "The canonical ten-source catalog is incomplete"
    return records


def test_reference_lineage_has_unique_complete_metadata():
    records = _references()
    assert len({r["id"] for r in records}) == len(records)
    assert len({r["filename"] for r in records}) == len(records)
    for record in records:
        assert record["id"] and record["title"] and record["engine"]
        assert record["filename"].lower().endswith((".jpeg", ".jpg", ".png", ".webp"))
        assert record["width"] > 0 and record["height"] > 0
        full_hash = record.get("sha256")
        short_hash = record.get("sha256_prefix")
        if full_hash is not None:
            assert FULL_HASH.fullmatch(full_hash), "Invalid complete SHA-256"
        if short_hash is not None:
            assert HASH_PREFIX.fullmatch(short_hash), "Invalid SHA-256 prefix"
            if full_hash:
                assert full_hash.lower().startswith(short_hash.lower()), "Prefix and digest disagree"


def test_no_original_binary_is_claimed_without_bytes_and_full_hash():
    for record in _references():
        assert type(record["stored_in_github"]) is bool
        if not record["stored_in_github"]:
            continue  # A missing asset is explicitly missing; do not invent it.
        source_path = record.get("github_path")
        assert source_path and not Path(source_path).is_absolute(), "Missing safe source location"
        candidate = (ROOT / source_path).resolve()
        assert candidate.is_relative_to(ROOT), "Original cannot point outside the repository"
        assert candidate.is_file(), "Declared original image does not exist"
        assert candidate.name == record["filename"], "Original filename does not match provenance"
        digest = record.get("sha256")
        assert digest is not None and FULL_HASH.fullmatch(digest), "Original requires complete SHA-256"
        assert hashlib.sha256(candidate.read_bytes()).hexdigest() == digest.lower(), "Original SHA-256 mismatch"
