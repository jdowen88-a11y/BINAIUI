# GENESIS workspace integration — 2026-11-13

**Current status:** [BINAIUI PR #5](https://github.com/jdowen88-a11y/BINAIUI/pull/5) was merged into `main` at commit `de747007d275d0c63c5bfa0a008326139a7c726d` after the tested integration branch was reconciled with the earlier archive and PWA merges. This is a **code integration**, not a GitHub Pages deployment, a physical-device certification, a complete artwork recovery, or permission for live external actions. Outstanding acceptance work is tracked in [release issue #6](https://github.com/jdowen88-a11y/BINAIUI/issues/6).

## What was combined

The original **review-only** integration branch was based on BINAIUI PR #4's tested mobile GENESIS Studio / batch importer code, then incorporated PR #3's *non-overlapping* AirX, SEED-000, Carrier Node, UNKEY, mesh and archival system files into one tree. The original PRs and branches remain intact. No files are removed; divergent README versions are preserved by keeping Studio's existing README and leaving the prior PR untouched.

Entry points:
- **Phone-first UI:** `docs/index.html` (unified Studio and import/backup experience), as built by PR #4.
- **Original archival Studio:** `studio/index.html` (retained reference implementation from PR #3; not a replacement for mobile Studio).
- **Python module:** `binaiui/` (core + AirX / materials / carrier / GENESIS / UNKEY).
- **Archive:** `archive/2026-11-03/`.
- **Inventory:** `WORKSPACE.json` records all 23 repositories, private/public classification and verifiable tests.

## Offline verification

The existing PWA workflow tests Chromium and WebKit for the unified mobile Studio. The expanded-systems workflow tests archive modules. The new integrated workflow validates the registry and tests Python systems plus pinned, public revisions of DID, project-unknown, and dual-cognition-agent. It does **not** run external APIs, Microsoft services, deploy code, access private repository contents, or perform financial transactions.

The `pump` project is intentionally **not** run as a trading engine. Its separate repair branch `fix/trade-route-validation-20261113` has an offline compile check and a fail-closed stub preventing swaps. Any possible live trading integration requires a separately reviewed, opt-in design.

Swift/iOS builds, GPU ML model training, private project integration, security testing, load testing and production deployment remain **out of scope**. A successful CI result means the configured tests passed, not that the entire workspace is universally error-free.

## Why code was malformed

At the time of discovery, `pump/src/routes/trades.ts` contained Markdown code fences inside TypeScript, missing backticks around template strings, and a reference to an absent executor. These issues are visible in a May 21, 2026 commit. The audit on November 13 is when these exact defects were found in the inspected code; the GitHub record does not show who typed every line or explain their cause.

## Release discipline

Nothing on this branch is a production release. Keep all sources untouched, validate under CI, review separately, merge only by explicit project-level decision, and enable any external side effects only after opt-in tests.

## Live audit findings on 2026-11-13

- Before repairs, DID full Node tests had 8/10 passing: neural hidden rows stored 56 coefficients for 60 vocabulary features; missing coefficients caused nonfinite distributions. Repair proposed in DID PR #1 (`bec0ab6d1fce`), subsequently tested in its own CI.
- Project-unknown CLI tests stopped with `ReferenceError: Cannot access 'finding' before initialization`. Repair in project-unknown PR #3 (`95f8ce7f56fc`), subsequently tested in its own CI.
- Initial Studio integration browser check failed because `ubuntu-latest` selected Ubuntu 26.04, which the pinned Playwright build did not support. The integration branch now targets `ubuntu-24.04`; it does not change the app code.
- The public `pump` TypeScript project is checked separately; a missing npm package version and another malformed TypeScript key were identified and repaired. Live swaps stay disabled. No claim of a passing full typecheck is made until the logs confirm it.

- Update: the repaired `pump` TypeScript sources passed `npx tsc --noEmit` on GitHub Actions [run 43469657943](https://github.com/jdowen88-a11y/pump/actions/runs/43469657943) at commit `e8b9ddb13ccd29ba3f8ab0880fe0a2709e1eaaf5`. Its trade executor remains fail-closed; this does not establish live trading readiness.

## Public inventory privacy

Because this repository is public, the 13 private repositories are listed only as `private-01` through `private-13` in `WORKSPACE.json`. Their real names, paths, contents and code are deliberately excluded. Public projects retain pinned check references; the owner's private repositories remain untouched.
