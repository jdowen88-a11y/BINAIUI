# BINAIUI browser verification

These tools test the static website; they are not website runtime dependencies.

GitHub Actions runs Chromium and WebKit checks on pushes to main and the mobile PWA branch and on pull requests. Open the workflow run from your iPhone to view its result. The run's artifacts include an HTML report, mobile homepage screenshots, and diagnostic traces/videos for failures. A successful run also provides a separate binaiui-website artifact containing BINAIUI.zip, built from the unmodified docs/ files. Browser-test ZIPs contain verification content and are not the finished website package.

The test server serves the same docs/ files at both / and /BINAIUI/ to check GitHub Pages repository hosting. Checks cover refresh and navigation, 320px/390px layouts, archive interactions, project details, manifest/icon integrity, offline public navigation and artwork, local draft persistence/export, content import validation, safe contact links, real PNG uploads, downloaded whole-site ZIP checksums/completeness/current content, and Files export/session preview when browser storage is full. ZIP icons also undergo PNG chunk and compressed-pixel validation, while manifest icons are decoded by each browser.

Chromium offline tests use Playwright's network-offline mode. That mode produced a reproducible internal WebKit error during service-worker reload. WebKit therefore uses a test-context cookie that makes this test server destroy every HTTP request socket; an independent API request must fail before checking cached reload, navigation and all artwork. This tests a genuinely unavailable server without relying on WebKit's broken offline-toggle behavior.

For a local development environment or GitHub Codespaces:

1. Run npm install --prefix qa.
2. Run cd qa, then npx playwright install --with-deps chromium webkit.
3. Run npm test.
4. Run npm run test:report to view the report.

WebKit browser automation is useful compatibility evidence. A physical iPhone Safari check remains necessary for Share → Add to Home Screen, standalone launch, safe-area appearance and an offline relaunch after visiting online. CI does not simulate Apple's installation UI.
