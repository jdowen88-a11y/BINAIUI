# BINAIUI verification

Verified on 2026-10-05. The delivered static application passed:

- 48 Playwright browser cases: 24 in Chromium and 24 in WebKit.
- All 6 existing Python core tests with pytest.
- No failed or flaky browser cases in the successful run.

Execution evidence:
https://github.com/jdowen88-a11y/BINAIUI/actions/runs/37264912316

Tested application commit: ea277ba33bec381304d2338fc68b12494417945f.
The final documentation update does not change app.js, sw.js, HTML, CSS, icons,
artwork, or content. Later GitHub Actions runs test and package that exact final
source as well.

## What was executed

The CI server ran the actual docs/ website, with no application build step,
at both / and /BINAIUI/. Tests used iPhone-sized browser viewports, including
320px and 390px widths.

Checks passed for:
- All four public sections, direct hash URLs, navigation and refresh.
- No horizontal overflow on the narrow mobile layouts.
- No browser console or page errors in public navigation.
- Archive search, category filters, native image dialog, Escape and focus return.
- Research filters and expanded notes.
- Relative manifest, standalone metadata, service-worker scopes and start URLs.
- Actual PNG dimensions, browser image decoding, PNG chunk CRCs and pixel decoding.
- Cached shell reload, all public sections and all six artwork detail views
  with the network unavailable.
- Local Studio save/reload, explicit draft preview, export and restore.
- Valid content backup import; rejection of malformed JSON, wrong versions,
  duplicate IDs, missing local artwork and unsafe contact links.
- Entered markup displayed as text rather than executed.
- A real PNG upload converted to an embedded JPEG, with alt text preserved and
  the sample flag removed.
- Contact email/https-link export and actions.
- Recovery from a simulated full browser storage quota: honest Save failure,
  successful content export and session preview, without claiming persistence.
- Whole-site ZIP export: flat layout, all 19 files, ZIP CRCs, current draft content,
  genuine icons, all referenced local artwork and an empty .nojekyll.

## Offline test method and limits

Chromium used Playwright's offline network mode.
WebKit used a context-specific server socket outage, first proving that a direct
network content request failed, then requiring reload/navigation/images to work
from the installed service worker cache. This avoids a reproduced internal error
in Playwright's WebKit offline toggle while still making actual HTTP requests fail.

These automated engines run on Linux. They are not a physical iPhone Safari test.
Safari's Photos/Files picker, Share → Add to Home Screen, installed standalone
launch, and Airplane Mode relaunch must still be checked on your iPhone after
GitHub Pages has deployed the site over HTTPS. External source links need a
connection. The worker update notification is implemented; its full version-to-
version installation flow has not been separately automated.

## Deliverables

The successful run includes binaiui-website (the clean static BINAIUI.zip) and
binaiui-browser-results (reports, screenshots and verification attachments).
The website package contains published starter content, not the synthetic drafts
created inside browser tests.

All changes are confined to docs/, qa/ and .github/workflows/pwa-check.yml.
The original root canon, Python package and original tests are preserved.
No production deployment has been performed.
