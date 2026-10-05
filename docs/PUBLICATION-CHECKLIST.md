# Before BINAIUI is public

Required deployment steps:
- Review pull request #1 and its passed browser checks; merge when ready.
- GitHub Settings → Pages → Deploy from a branch → main → /docs → Save.
- Wait for a successful Pages deployment and use the URL GitHub displays.
- On the published HTTPS address, test on your physical iPhone:
  Safari navigation, image search/details, Studio image selection/downloads/import,
  Share → Add to Home Screen, standalone launch, and offline relaunch after initial loading.

Content review:
- Keep or replace the six clearly marked sample visual studies.
- Check the homepage/about copy and linked canon/prototype notes.
- Add a public contact email/link if visitors should be able to reach you.
  Before first publication, edit the email/contactUrl fields in docs/content.json
  through GitHub's pencil editor in Safari; after publication, use Studio.
  Without one, the honest "No public contact address" state remains.
- Export a draft backup to Files before publishing or removing variants.

Ready in the project:
- Four public sections, responsive layouts, archive search/categories/details,
  research filters/notes, local mobile Studio, JSON and whole-site ZIP exports.
- Relative manifest/scope, actual PNG icons, Apple Home Screen metadata, service worker,
  offline local assets, and user-controlled worker update notification.
- Static docs/ directory, no build or paid backend, automated browser QA.
- Existing root canon, Python core, and tests preserved.

Optional: a custom domain, your own imagery, a separate message-delivery service.
The built-in contact uses email/link actions; it is not a message-submission service.
