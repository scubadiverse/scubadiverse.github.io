# ProjectSavvy — Technical handover (what was built, how, and the variables)

Everything a new session needs to continue the premium build. Read together with
`HANDOVER.md` (overview) and `DEPLOY-NOTES.md` (cache rule).

> SECURITY: this file holds only values that are **safe to store** (Firebase web
> config is public by design — it ships inside the app). It deliberately does
> **NOT** contain the deploy **service-account private key** — that is a master
> password and must never live in a repo. See "Secrets (not stored here)" below
> for how to generate it in ~30 seconds when you need to deploy.

---

## 1. What was built
- **Accounts + cloud sync** (premium foundation): email + Google sign-in via
  Firebase Auth; the whole app state saved per user in Firestore and synced across
  devices.
- **Private premium web build**: `focus-app/paid/` deployed to Firebase Hosting at
  `https://project-savvy-914a1.web.app` (sign-in ON). Owner-only.
- **Personal Android APK** ("ProjectSavvy Sign-in"): a WebView build that loads the
  private web build; installs alongside the public app. Built by a separate CI
  workflow; released at tag `android-personal`.
- **Unplanned Tasks tab** (premium feature): log surprise tasks + minutes, priority
  (High/Med/Low), reorder, daily total. Stored in app state → syncs.

## 2. How it was built (step by step)
1. **Firebase project** `project-savvy-914a1` (free Spark plan). Enabled Auth
   (Email/Password + Google), created Firestore (Europe `eur3`), published a
   per-user security rule.
2. **Sign-in wired into the web app** (`focus-app/paid/index.html`): Firebase
   compat SDK (`10.12.5`) script tags + an account card + `firebaseConfig` +
   Google/email handlers + Firestore save/load of the whole state object `S`.
3. **Deploy to Firebase Hosting**: repo-root `firebase.json`
   (`hosting.public = focus-app/paid`) + `.firebaserc` (default project). Deploy
   with the Firebase CLI authenticated by a service-account key (below).
4. **Personal APK**: the Android project lives in the **`scubadiverse.github.io`**
   repo at `focus-flow-android/` (WebView + `AndroidBridge` + `ScreenGuardService`
   for the native screen lock). A dedicated workflow `.github/workflows/
   android-personal.yml` patches the WebView URL to the private build, uses a
   separate `applicationId`, builds a debug APK, and publishes it to release tag
   `android-personal`. Run it from the Actions tab (workflow_dispatch).
5. **Unplanned tab**: added a tab bar + `#paneUnplanned`, an `unplanned:[]` array on
   the state, and add/priority/reorder/remove/summary functions. Cache-bumped +
   redeployed.

## 3. Config variables (SAFE — Firebase web config, ships in the client)
```js
const firebaseConfig = {
  apiKey: "AIzaSyDmmju7xZzKIVo9B1ijjfypPYjFrOe6Zlw",
  authDomain: "project-savvy-914a1.firebaseapp.com",
  projectId: "project-savvy-914a1",
  storageBucket: "project-savvy-914a1.firebasestorage.app",
  messagingSenderId: "692487500416",
  appId: "1:692487500416:web:80bafb6fe1ae9da4cfac65",
  measurementId: "G-EMXRGBL771"   // optional, analytics only
};
```
- **Hosting URL / site:** `project-savvy-914a1.web.app` (also `.firebaseapp.com`).
  Both are auto-authorised for Google sign-in.
- **Firestore:** location `eur3`; collection `users`, doc id = the user's `uid`.
- **Security rule (published):**
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
  ```

## 4. Android build values
- **Public app** `applicationId`: `app.ainative.focusflow` (namespace
  `net.scubadiverse.focusflow`). WebView loads
  `https://scubadiverse.github.io/focus-flow/`.
- **Personal sign-in app** `applicationId`: `app.ainative.focusflow.signin`,
  label "ProjectSavvy Sign-in", WebView loads `https://project-savvy-914a1.web.app`.
- **Signing:** `focus-flow-android/app/focusflow.keystore` (upload/debug key).
  Its passwords are already in `app/build.gradle` in that repo (debug + upload key,
  alias `focusflow`). Play App Signing re-signs releases with Google's own key.
- **Release tags:** `android-latest` (public APK + Play AAB), `android-personal`
  (owner's sign-in APK).
- **In-app note:** Google sign-in is blocked inside Android WebViews by Google —
  **use email sign-in in the app**; Google works in a normal browser.

## 5. Secrets (NOT stored here — how to get them)
- **Firebase deploy service-account key** (needed to run `firebase deploy` from a
  headless session):
  1. Firebase Console → gear → **Project settings → Service accounts**.
  2. **Generate new private key** → downloads a JSON (contains a real private key).
  3. Point the CLI at it: `export GOOGLE_APPLICATION_CREDENTIALS=/path/key.json`
     then `firebase deploy --only hosting --project project-savvy-914a1`.
  4. Delete the JSON after use / rotate it in the same screen. **Never commit it.**
- **No other server secrets** exist (free tier, no custom backend, no API tokens).

## 6. Deploy checklist (every time)
1. Edit the app in `focus-app/paid/`.
2. **Bump the `CACHE` version in `focus-app/paid/sw.js`** (see `DEPLOY-NOTES.md`).
3. `firebase deploy --only hosting --project project-savvy-914a1` (with the key).
4. Verify at `https://project-savvy-914a1.web.app`.
5. Commit on branch `claude/premium-sync`; the personal APK loads the live URL so it
   updates automatically (rebuild the APK only if the Android wrapper itself changed).
