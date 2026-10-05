# BINAIUI browser verification

These tools test the static website; they are not website runtime dependencies.

GitHub Actions runs Chromium and WebKit checks on pushes to the mobile PWA branch and on pull requests. Open the workflow run from your iPhone to view its result. The run's artifacts include an HTML report, mobile homepage screenshots, and diagnostic traces/videos for failures.

The test server serves the same docs/ files at both / and /BINAIUI/ to check GitHub Pages repository hosting. Checks cover refresh and navigation, 320px/390px layouts, archive interactions, project details, manifest/icon integrity, offline public navigation and artwork, and local draft persistence/export.

For a local development environment or GitHub Codespaces:

1. Run npm install --prefix qa.
2. Run cd qa, then npx playwright install --with-deps chromium webkit.
3. Run npm test.
4. Run npm run test:report to view the report.

WebKit browser automation is useful compatibility evidence. A physical iPhone Safari check remains necessary for Share → Add to Home Screen, standalone launch, safe-area appearance and an offline relaunch after visiting online. CI does not simulate Apple's installation UI.
