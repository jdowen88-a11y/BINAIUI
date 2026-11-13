# BINAIUI Unified GENESIS Studio — integration release

**Current code status (November 13, 2026): merged into `main` through [PR #5](https://github.com/jdowen88-a11y/BINAIUI/pull/5); not deployed through GitHub Pages and not an authenticated CMS. Original artwork binaries and physical iPhone acceptance remain outstanding in [issue #6](https://github.com/jdowen88-a11y/BINAIUI/issues/6).**

This integration retains the mobile-first website and existing local content editor from PR #1, preserves the separate draft batch importer and original-file backups from PR #2, and adapts the procedural field, AirX reference systems, and UNKEY concepts described in PR #3 into a single `#studio` route.

## GitHub branch lineage (historical snapshot: 2026-11-04)

The table records the unmerged state on November 4. PRs #1–#5 have since merged through their documented dependency branches, culminating in `main` commit `de747007d275d0c63c5bfa0a008326139a7c726d`. The source branches and original commits were retained.

| Work | Source | Relationship | State at snapshot |
| --- | --- | --- | --- |
| Mobile-first public website / local editor | [PR #1](https://github.com/jdowen88-a11y/BINAIUI/pull/1) | `binaiui-mobile-pwa` → `main` | Open, unmerged |
| Multi-image import and original backups | [PR #2](https://github.com/jdowen88-a11y/BINAIUI/pull/2) | `feature/mobile-batch-artwork-import` → `binaiui-mobile-pwa` | **Draft**, open, unmerged; owner approval required |
| GENESIS, AirX, SEED-000 and Python modules | [PR #3](https://github.com/jdowen88-a11y/BINAIUI/pull/3) | `archive/airx-seed000-genesis-20261103` → `main` | Open, unmerged |
| Unified Studio shell and integration | `feature/unified-genesis-studio` | Branched from PR #2 head; adapted select frontend ideas from PR #3 | Review-only proposal |

**Historical note:** This was originally a review-only proposal. PR #3's source modules were subsequently integrated through PR #5 and verified by the expanded Python suite; the original archive and development history remain available.

## One mobile workspace

- **Home** shows a working dashboard, the archived public site's original sections, quick links, reference-system counts, and a timestamped state summary.
- **#studio → Field** renders an open-edge, full-bleed procedural glyph-and-filament field, powered by a reproducible numeric seed. It can download a **new** PNG. That PNG is a generated interpretation, **not** an original reference binary.
- **#studio → References** displays ten catalog entries, using exact filenames, dimensions and available SHA-256 or **partial** SHA-256 prefix metadata from PR #3. Search, filter, and select any system to generate its interpretation. No fake images or thumbnails.
- **#studio → AirX** shows the six named material/flow design studies and clearly separates engineering assumptions from measured performance. It is not connected to hardware.
- **#studio → UNKEY** produces deterministic nine-stage symbol sequences and allows copying them.
- **#studio → Art / backups** separates GitHub repository originals (currently 0 of 10) from local device backups, provides **optional verification only** against reference filenames and SHA-256 information, and links to the preserved batch importer. Selecting a file for verification does **not** upload, retain or publish it.
- **#studio → Archive editor · draft batch importer · original ZIP backups** is the complete existing PR #2 editor kept intact inside an expandable section. It retains metadata editing, Photos/Files multi-select, local drafts, individual original downloads and the separate originals ZIP. Display copies and originals remain different assets.
- **#roadmap** presents all three independent PRs and their dependencies, planned integration, draft protections, missing artwork, and iPhone/publishing gaps. The **Check GitHub statuses** action queries GitHub publicly; if offline or rate limited, dated snapshot labels remain visible.

## Files

| File | Purpose |
| --- | --- |
| `docs/index.html` | Mobile navigation to Studio and Roadmap |
| `docs/genesis-studio.js` | Procedural field, references, UNKEY, AirX, roadmap and local checks |
| `docs/genesis-studio.css` | Dark violet/cyan/electric-blue/gold interface; canvas stays unframed |
| `docs/genesis-reference-manifest.json` | Exact catalog metadata copied from PR #3 |
| `docs/app.js` | Existing website, local editor, ZIP generation and batch importer, with small integration hooks |
| `docs/sw.js` | Versioned offline cache includes the new modules |
| `qa/unified-genesis.spec.cjs` | Browser coverage for the new Studio, built alongside existing tests |

## Artwork integrity and provenance

`docs/genesis-reference-manifest.json` is a **metadata catalog**, not a bundle of images. All ten entries have `stored_in_github: false` at the source snapshot. One entry has a complete SHA-256 value; the other nine have known prefixes only. A prefix match is **not equivalent** to proving the full original file is preserved; that status is labeled accordingly.

Do **not** replace missing originals with screenshot crops, low-resolution stand-ins, generated interpretations, or invented files. The nine screenshot-derived previews described in PR #3 remain distinct from unrecovered full-resolution sources.

Use the separate recovery archive or the user's own Photos/Files to restore source binaries deliberately when available; retain filenames and hashes and review a new change before committing real assets.

## Original file backup workflow (PR #2 kept)

1. Open `#studio`, expand **Archive editor · draft batch importer · original ZIP backups**.
2. Choose **Add multiple artworks from Photos or Files** to add PNG/JPEG/WebP entries (12 MB per file, up to 60 total archive entries). The importer downsizes *display* images to 1200px for `content.json`.
3. The importer attempts to preserve each *original* separately in IndexedDB, with limited local fallback. Browser storage can be evicted; a display copy is not the original.
4. Use **Download originals backup ZIP** (120 MB ZIP safety limit), and independently keep your original Photos/Files. The website ZIP and `content.json` do **not** contain original binaries.
5. Export `content.json` and, if desired, **Download website ZIP**. The revised website ZIP now carries the unified Studio JavaScript/CSS and reference manifest.
6. Only a deliberate GitHub commit publishes public site content. No automatic GitHub writes occur in the browser.

## Updates and validation

To edit the ten canonical reference records, update `docs/genesis-reference-manifest.json` **and** its matched view registry in `docs/genesis-studio.js` together; any new binary must be tracked separately with actual provenance. To add new AirX design notes, update the source archive and the front-end presentation and review its engineering caveats.

Review the UI on a physical iPhone: Safari Photos/Files multi-select, device backup eviction, Save PNG behavior, add to Home Screen, offline reinstall/refresh and the separate ZIP backup. Browser emulation alone does not establish device compatibility.

Run the browser tests under `qa/` and the Python tests. A successful build does not merge PRs or deploy Pages; production publication still requires owner-approved merge(s) and GitHub Pages configuration.

**Creative constraint:** ultraviolet/violet/magenta/electric-blue/cyan/gold glyphs and filaments should form the space itself. The field should expand past every edge. Avoid central orbs, bounding lines, frames, labels or collage grids *inside the creative canvas*.
