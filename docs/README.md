# BINAIUI public app

A mobile-first static progressive web app. Plain HTML, CSS, JavaScript, and JSON.
No framework, build step, database, API key, account system, or paid host is needed.
The original canon and Python core remain at the repository root.

## Publish from an iPhone

1. Review the mobile PWA pull request in Safari. Review its browser check results.
2. Merge the app branch when you are ready.
3. Open BINAIUI's repository → Settings → Pages.
4. Choose Deploy from a branch → main → /docs → Save.
5. Wait for GitHub's Pages deployment and open the URL shown there.
   The expected address is https://jdowen88-a11y.github.io/BINAIUI/ .
   This document does not claim the URL is already live.
6. In Safari, Share → Add to Home Screen → Add.
7. Launch the Home Screen app online once. Wait for "Ready offline" in its footer.
8. Enable Airplane Mode and reopen it. Check all four sections and image details.

Use Safari's aA → Request Desktop Website if GitHub hides a Settings/upload control.

## Before the first publication

You can review the site through the test screenshots and download the finished
website artifact from the successful GitHub Actions run. The artifact contains
BINAIUI.zip; save it in Files and uncompress it.

To add contact details before the site is live, open docs/content.json on the
app branch in Safari, tap GitHub's pencil editor, change the email/contactUrl
strings, and commit. Use only contact details you want public. After publication,
Studio provides the easier form-based workflow below.

## Edit from your phone

Open the footer's Studio link. Edit the introduction, about/contact, images, or
research. Images can be chosen from Photos/Files. JPEG, PNG and WebP up to 12 MB
are resized to a maximum 1200px edge and embedded in content.json. Convert HEIC
to JPEG using Photos if needed.

Save draft keeps changes in this browser on this phone. If phone storage is full,
Export content and Download website ZIP still back up valid edits to Files.
Preview draft runs in memory for this session and clearly
labels them. There is no authenticated admin and no automatic remote publishing.
Browser data can be deleted or evicted: always export a backup to Files.

Export content downloads content.json. In Safari, open the GitHub repository's
docs folder → Add file → Upload files → choose content.json → commit the replacement.
Keep the name exactly content.json. That commit updates GitHub Pages after deployment.

Contact links must use https://. Email is optional. No messages are submitted to
a backend. About shows an honest empty state until a contact address is supplied.
The GitHub source link and existing canon are available publicly.

Import content restores an exported backup as a local draft. Restore published
reverts the phone's draft only. Removing an archive item does not delete previously
exported backups or Git history. Keep your originals and variants separately.

## Download the whole website

Studio → Download website ZIP. Save draft also keeps a copy on this phone. Save BINAIUI.zip in Files and tap it
to uncompress. It contains your current valid draft and complete static website in a flat folder.
For a new public GitHub repository, upload the extracted files, with index.html
at the repository root, and enable Pages from main → / (root).
Do not upload the ZIP itself as the website.

GitHub hides dotfiles in some mobile upload selectors; .nojekyll is helpful but
this site has no underscore-named files and also works without it.

## Offline and updates

A relative service worker caches the shell, content, all six sample SVG studies,
icons and these guides. Only same-origin app assets are handled. The versioned shell and its assets load from cache first, keeping them consistent
until you choose Update now. Content is refreshed online, with a two-second
network timeout and cached fallback when the connection stalls.
External GitHub research links need a connection. Service workers require HTTPS
(or localhost for development); opening index.html directly in Files is not a PWA.

When changing the app shell, increment the version suffix in sw.js. A waiting
worker exposes Update now. Only that app's scope-specific caches are removed.
Changing content.json alone refreshes online without a worker-version change.
A changed draft is not published until its content.json has been committed.

## Development and checks

Optional development tooling is isolated in qa/ and is not shipped at runtime.
See ../qa/README.md for serving and browser-test instructions.
GitHub Actions serves this exact docs directory and checks Chromium and WebKit
at the domain root and /BINAIUI/ with phone-sized viewports.
See TEST-REPORT.md and PUBLICATION-CHECKLIST.md.

## Initial content and artwork

The six procedural SVG artworks were authored as starter samples, inspired by
VISUAL_LANGUAGE.md. They are marked as samples. Research links introduce actual
concepts/prototypes from the existing canon: Zero Slate, Infinity Geometry, Five Zones.
The app makes no empirical proof, AI generation service, or finished-project claims.
No private profile email is copied into the public app.

All fonts and assets are local/system-provided. A custom domain is optional.
