# BINAIUI verification

The authoritative, current execution evidence is the GitHub Actions "BINAIUI checks"
run for the mobile app branch/PR:
https://github.com/jdowen88-a11y/BINAIUI/actions

Checks cover the exact static docs/ website, not the cloud preview scaffold:
- Existing Python core tests with pytest.
- Chromium and WebKit browser interactions at / and /BINAIUI/.
- Phone-sized overflow checks, all public routes and refreshes.
- Archive search, categories, native image dialog and focus return.
- Research filtering/expandable notes.
- Studio local save, explicit draft preview, JSON export/restore.
- Manifest/icon dimensions, service-worker scope, offline reload and local artwork.
- Browser console/page error collection. Reports, screenshots, and failure traces are artifacts.

Before app files were added, the original Python core passed all 6 tests on
2026-10-05 (run 37260115710). Browser execution in that initial run was blocked
because docs/index.html did not yet exist. That initial run is not evidence of
app browser success. Consult the later completed run for the delivered app.

Source syntax of app.js and sw.js was checked using the JavaScript runtime.
A physical iPhone, Home Screen installation, and Safari Photos/Files interactions
have not been tested in this environment. They must be checked on the published
HTTPS GitHub Pages address. WebKit automation is not a physical iPhone test.

No production deployment has been performed by this change.
