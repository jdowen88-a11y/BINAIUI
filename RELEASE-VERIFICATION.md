# GENESIS / BINAIUI release verification register

**Audit date:** 2026-11-13 (America/Chicago)  
**Scope:** source-code integration and offline CI only. Not a hardware, financial, privacy, or physical iPhone certification.  
**Source preservation rule:** keep source branch history, record changes explicitly, never invent original image binaries or complete SHA-256 values.

## Main integration and verified checks

The original BINAIUI source was preserved, and the archive, phone-first PWA, artwork importer, unified GENESIS Studio, and Python AirX / Carrier / UNKEY modules were integrated into `main` by [PR #5](https://github.com/jdowen88-a11y/BINAIUI/pull/5), merge SHA `de747007d275d0c63c5bfa0a008326139a7c726d`. The final integration branch's tracked tree had all 65 file paths from the preintegration `main` plus 11 net-new file paths, with zero missing old file paths; 58 existing files were byte-identical and seven were intentional, reviewed updates. Both the original PR #3 archival README and the unified Studio documentation were retained.

Passing checks on the final integration branch:
- [BINAIUI PWA Chromium/WebKit browser checks, run 43522224140](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522224140): **success**.
- [Expanded Python systems, run 43522223708](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522223708): **success**.
- [Integrated offline checks, run 43522223962](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522223962): **success**.

`main` checks for the merge commit (separate double-check):
- [Expanded systems, run 43522986119](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522986119): **success**.
- [Integrated offline checks, run 43522984948](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522984948): **success**.
- [PWA browser checks, run 43522985004](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522985004): verify final conclusion in GitHub Actions. This register must not assert success until the run has completed.
- The older `main` PWA failure [43522088607](https://github.com/jdowen88-a11y/BINAIUI/actions/runs/43522088607) failed at Chromium installation because `ubuntu-latest` selected unsupported Ubuntu 26.04, not because app tests failed. The merged corrected workflow pins Ubuntu 24.04.

## Standalone repository repairs

- [DID PR #1](https://github.com/jdowen88-a11y/DID/pull/1): merged to `main`; legacy neural weights no longer propagate NaN for additional vocabulary features. [Post-merge CI](https://github.com/jdowen88-a11y/DID/actions/runs/43522539490): success.
- [Project Unknown PR #3](https://github.com/jdowen88-a11y/project-unknown/pull/3): merged to `main`; reference-before-initialization in probe fixed. [Post-merge CI](https://github.com/jdowen88-a11y/project-unknown/actions/runs/43522544778): success.
- [Pump PR #1](https://github.com/jdowen88-a11y/pump/pull/1): merged to `main`; malformed TypeScript repaired, authentication defaults restricted, live swap executor explicitly disabled/HTTP 503. [Post-merge offline typecheck](https://github.com/jdowen88-a11y/pump/actions/runs/43522547362): success. Not a live-trading release.
- [Nova PR #2](https://github.com/jdowen88-a11y/nova/pull/2): merged to `main`; malformed PBKDF2 hash validation hardened. [Post-merge validation](https://github.com/jdowen88-a11y/nova/actions/runs/43523061844): success. Not a full application security audit.

## Unresolved release gates — do not silently mark done

1. **Missing artwork originals.** Ten original GENESIS JPEGs are catalogued; zero of ten complete original binaries were stored in the public GitHub repo at the audited snapshot. Neither original file identity nor complete hashes for all ten can be verified without the actual source binaries. No replacement, recreation, crop, or fabricated full checksum is acceptable.
2. **Physical device acceptance.** iPhone Safari Photos/Files picker, original-file recovery, local ZIP backups, PNG export, service-worker update, and Add to Home Screen / offline reopen have not been personally verified on physical hardware.
3. **Public deployment.** GitHub Pages `main/docs` has not been confirmed configured or live. Source in a public GitHub repository is already readable/cloneable by third parties; a source-code merge is not an access-control mechanism. Review public copy and contact before enabling Pages.
4. **Archive capacity.** Current importer supports up to 60 entries, 12 MB per image, with a 120 MB originals ZIP cap. It is not a full large-scale media preservation system.
5. **Legacy Project Unknown refactor.** [PR #1](https://github.com/jdowen88-a11y/project-unknown/pull/1) remains draft and is not automatically mergeable with modern `main`. Its preserved legacy branch now passes [30 offline tests](https://github.com/jdowen88-a11y/project-unknown/actions/runs/43523356759), but it is 32 commits behind `main` and cannot safely replace the newer engine without a separately reviewed forward-port. The review branch is preserved and should not be force-merged. See its PR comments.
6. **Coverage scope.** The workspace inventory counts 23 repositories, but the public integration runs only a selected set of pinned, offline tests. It neither accesses the thirteen private repositories nor establishes all projects, services, or dependencies as bug-free. No external trades, deployments or devices are exercised.

[Release acceptance and original-artwork recovery issue #6](https://github.com/jdowen88-a11y/BINAIUI/issues/6) is the authoritative checklist for unresolved material.

## Maintained CI and machine-readable release status

The final verification PR upgrades GitHub Actions dependencies and keeps Ubuntu 24.04 for reproducible browser tests. `WORKSPACE.json` now records the manual code merge separately from historical review-only policy flags; its validator enforces explicit outstanding statuses instead of silently claiming publication. The ten-file canonical artwork catalog is mirrored byte-for-byte and protected by an asset-integrity test that requires an actual file and SHA-256 before any `stored_in_github: true` record is accepted.

## Verification principle

**Tests passed** means that particular automated suite passed against the specified commit and environment. It does not mean all conceivable failure modes have been excluded. Keep the old source and new source traceable, rerun checks on the actual default-branch commit after every merge, and record any unsupported checks as outstanding rather than declaring universal success.

**WE DON'T FABRICATE. WE ELEVATE.**
