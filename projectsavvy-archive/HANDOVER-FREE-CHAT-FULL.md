# Full handover — free-version chat (everything I did/stored)

Branch: `claude/time-management-focus-app-wi2uaa` (divescannerv2.0) + pushes to
`scubadiverse.github.io` main. For the premium branch to take over.

## THE BUG I INTRODUCED (root cause of the broken sign-in)
- In `focus-app/paid/index.html` the Firebase SDK `<script>` tags (lines ~421–426)
  are **inside an HTML comment** `<!-- ... -->`, but I set **`ACCOUNTS_ENABLED = true`**.
- Result: `window.firebase` never loads, so sign-in silently can't start even though
  it's switched on. This is why the account form never rendered anywhere.
- Fix = uncomment those three SDK lines (the premium branch found this and is fixing it).
- The same commented-SDK + accounts-on state is in what I deployed to Firebase Hosting
  and to `focus-flow-premium/`.

## The Firebase service-account key
- I did **NOT** store the key in any repo (verified: 0 matches in working trees and
  full git history of both repos). The owner set it as a GitHub **secret**
  `FIREBASE_SERVICE_ACCOUNT` (in scubadiverse.github.io) yesterday. The key the owner
  pasted into chat should still be **rotated** (it was exposed in chat).

## What I created in `scubadiverse.github.io` (deploy repo)
- **Workflows** (`.github/workflows/`):
  - `android-premium.yml` — builds a premium **release AAB**, applicationId
    `app.ainative.focusflow`, versionCode **1024**, WebView URL patched to
    `scubadiverse.github.io/focus-flow-premium/`. Release tag `android-premium`.
  - `android-premium-firebase.yml` — same but versionCode **1025**, WebView URL
    `project-savvy-914a1.web.app`. Release tag `android-premium-firebase`.
  - `firebase-deploy.yml` — deploys `focus-flow-premium/` to Firebase Hosting (live)
    using secret `FIREBASE_SERVICE_ACCOUNT` + `FirebaseExtended/action-hosting-deploy`.
  - (`android.yml`, `android-personal.yml` pre-existed — not mine.)
- **`firebase.json`** (public: `focus-flow-premium`) + **`.firebaserc`** (project
  `project-savvy-914a1`) at repo root.
- **`focus-flow-premium/`** folder — a copy of `focus-app/paid/` (premium web).
- **`focus-flow/`** updates — the public free app (latest SW `focusflow-v83`).
- **Releases/tags I created:** `android-premium` (AAB v1024, loads github.io),
  `android-premium-firebase` (AAB v1025, loads Firebase).

## Premium web features I added to `focus-app/paid/index.html`
Built on the latest free app + the premium branch's sync/Unplanned:
- Unplanned tab (from premium branch), **resting zone**, **✨ PREMIUM badge**,
  **sign-in gate** (`isPremium()` = signed in; premium locks when logged out),
  disabled **Buy Premium** button (payment off during testing), white **Create
  account** button, emergency call button only during time-out, timer 25/45 chips +
  Reset, project reorder arrows, bottom Done, em dashes → en dashes.
- **3-device cap:** written in a scratchpad mockup only — **NOT deployed**.
- Set `ACCOUNTS_ENABLED = true` (but left the SDK commented — see THE BUG above).

## Free app changes (also on this branch, deployed to focus-flow, SW v83)
Timer chips/Reset, reorder arrows + Edit "Done" + header, wind-down banner 30s +
tap-close, em dashes → en dashes, resetting the online counter on app open
(overnight-gap time-out fix, commit `a762dec`), plus all earlier work (sounds,
alerts toggle, per-project timers, curfew, SVG SOS icon, breathing countdown, etc.).

## Deploy/version state (as I left it)
- Free app: `scubadiverse.github.io/focus-flow/`, SW `focusflow-v83`.
- Premium web: `scubadiverse.github.io/focus-flow-premium/`, SW `focusflow-paid-v10`.
- Firebase Hosting `project-savvy-914a1.web.app`: last deploy was my build (badge +
  resting zone + the SDK-commented bug). Being fixed by the premium branch.
- Closed-testing AABs available: v1024 (github.io) and v1025 (Firebase address).

## The CONFLICT with the premium branch (`claude/premium-sync`)
- Both branches edit `focus-app/paid/` and both deploy to the **same** Firebase
  project + the same repos, so deploys **overwrite each other**.
- There are **two** Firebase-deploy workflows: mine in `scubadiverse.github.io`
  (`firebase-deploy.yml`) and one in `divescannerv2.0` (the premium branch's,
  "Deploy premium build to Firebase Hosting"). My push of `a762dec` triggered the
  premium branch's divescannerv2.0 workflow, which **failed**.
- Recommendation: pick ONE branch as the premium source of truth, ONE Firebase-deploy
  workflow, and merge through git — do not have both chats deploying.

## My full commit list on this branch
See `git log origin/main..claude/time-management-focus-app-wi2uaa` — 60+ commits,
newest = `a762dec` (timeout-on-wake fix).
