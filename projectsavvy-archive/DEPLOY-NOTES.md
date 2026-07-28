# Deploy notes — ProjectSavvy / Focus app (READ before every deploy)

## ALWAYS bump the service-worker cache on every deploy (or users won't see the update)
- The app is a PWA/WebView with a **service worker** (`sw.js`) that uses
  **stale-while-revalidate**: it serves the *cached* app instantly and only
  refreshes in the background. **Installed users do NOT hard-refresh.** So if the
  cache name is unchanged, they can keep seeing the OLD version.
- **Rule: every time I change the app and deploy, I bump the `CACHE` version in the
  matching `sw.js`** (e.g. `focusflow-paid-v2` -> `focusflow-paid-v3`,
  `focusflow-v63` -> `focusflow-v64`). Bumping the name makes the new worker delete
  the old caches on activate and re-fetch, so installed phones/laptops pick up the
  change on next open — no hard refresh needed by the user.
- This applies to **every** copy that has its own `sw.js`:
  - `focus-app/paid/sw.js`   (private premium build — deployed to Firebase Hosting
    `project-savvy-914a1.web.app`, loaded by the personal APK)
  - `focus-app/sw.js` and `focus-app/github-pages/sw.js` (divescanner copies)
  - `focus-flow/sw.js` in `scubadiverse.github.io` (the public store app the Play
    APK loads)
- Bump the cache **in the same commit** as the app change so a deploy never ships a
  code change without a cache bump.

## Deploy commands (reference)
- Private premium build -> Firebase Hosting:
  `firebase deploy --only hosting --project project-savvy-914a1` (public dir is
  `focus-app/paid`, set in repo-root `firebase.json`).
- Public store web app lives in `scubadiverse.github.io/focus-flow/` (GitHub Pages);
  the Android APK/AAB is built by that repo's Actions and loads that URL.
