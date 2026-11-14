# Remaining 0 → 9 migration work (draft branch, 2026-11-13)

**Branch:** `design/zero-nine-open-ocean-20261113`; **PR:** #9 (draft). Preserve previous material in Git history and the original artwork archives. Do not merge, deploy, modify other repositories, or delete anything automatically.

## Completed in this draft

- Unified Python, SVG, mobile Studio and standalone Studio on the same 0→9 open-field geometry.
- Numeric/symbol-only field glyphs and near-contact without connection.
- Active UNKEY generator and artwork-view ornament migrated to the new glyph vocabulary.
- Published starter content changed to describe the open field; earlier versions remain in Git history.
- Browser and Python tests updated; check workflow conclusions on the final commit.

## Still pending review and migration

1. `binaiui/core.py`: old infinity cycle and canonical strings remain for existing API consumers and their tests.
2. `binaiui/mesh.py`: five-zone modulo return remains, separately from the active field.
3. `CORE.md`, `CANON.json`, `MATH.md`, `ARCHITECTURE.md`, `GENERATORS.md`, `LEXICON.md` and `README.md`: original canon and old equations need a versioned revision, not a bulk find/replace.
4. Existing static sample SVGs and historical archive documents are earlier variants, not proof that the active generator implements them.
5. Full OPAL 27 manifest and previous local export package have not yet been integrated into this GitHub branch; the new rendering does not encode all of their data.
6. The other 22 GitHub repositories have not been rewritten. The workspace inventory includes 13 private repositories; their contents must not be copied into a public repository.
7. Physical iPhone testing, original image recovery, GitHub Pages publication and end-to-end system verification remain outstanding.

## Acceptance sequence

- Inspect current source and archive. Run reproducible Python and browser tests against this exact commit.
- Review proposed changes to core relations and dependent packages separately.
- Audit data provenance and compare all original artwork hashes before publishing or deleting anything.
- Move into `main` only after project-level approval and successful CI.
