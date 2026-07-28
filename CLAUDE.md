# ProjectSavvy - how to work on this repo (read first, every time)

This repo is **ProjectSavvy** (an ADHD focus app). It is a SEPARATE project from
DiveScanner - never mix the two. Everything ProjectSavvy lives here.

## One repo, one branch
- All ProjectSavvy work happens **in this repo (scubadiverse.github.io)**, on the
  **`main`** branch. Commit and push to `main`. Do NOT spin up feature branches -
  no branch sprawl. The live sites deploy from `main`.

## Where things live
- `focus-flow/` - the FREE / production web app. Deploys to GitHub Pages at
  **scubadiverse.github.io/focus-flow**. No sign-in, no premium, no Unplanned tab.
- `focus-flow-premium/` - the PREMIUM web app (sign-in, Unplanned, cloud sync,
  device limit, payment, Calendar, Toggl). Deploys to Firebase Hosting at
  **project-savvy-914a1.web.app**.
- `focus-flow-android/` - the Android WebView wrapper (Kotlin). Builds the `.aab`
  the owner uploads to Google Play. Loads the premium web.app in the premium build.
- `projectsavvy-archive/` - old snapshot, Play Store assets, handover notes. Reference only.

## How to deploy (verify live every time)
- **Free app:** commit to `main` -> GitHub Pages serves `focus-flow/` automatically.
- **Premium app:** commit to `main`, then run the **`firebase-deploy.yml`** workflow
  (Actions tab) -> deploys `focus-flow-premium/` to web.app.
- **Android bundle:** run **`android-premium-firebase.yml`** (closed testing) or
  **`android.yml`** (production). Each seds a `versionCode` - bump it every build so
  Play accepts it (never reuse a code).
- **ALWAYS bump the service-worker `CACHE` var** in the app's `sw.js` on every web
  change, or the update will not reach installed apps.
- A change is not "done" until verified live: load the real URL / read the deployed
  source and confirm the change is there.

## How to TALK to the owner (the owner pays per token)
- **Short replies. A few lines max. Short sentences. One thing at a time.**
- **Only send: a mockup/preview to approve, a question I must ask, or the finished
  result.** NO background play-by-play ("now editing X", "ran a command", "let me
  verify"). Do the work quietly.
- **Frontend is the owner's call.** Any visual change needs a rendered PREVIEW
  (picture) and the owner's explicit yes for that specific change. "Change the text"
  means text only - never touch layout/colour/behaviour.
- **Never guess, never lie, never make things up.** Verify reality before saying done.
- No em dashes (use en dash). No filler words (honestly, frankly, straight, etc.).

## Hard rules
- **Never overwrite real user data on update.** save() refuses to write a blank state
  over real data, keeps a `.bak`, and mirrors to a durable native backup
  (AndroidBridge.saveBackup / readBackup). load() recovers main -> bak -> native.
  Never weaken this.
- **Do not break a working feature** to add a new one. Keep the free vs premium split
  exactly as it is unless the owner says otherwise.
- **Prices/values come from real sources only** - no invented numbers.
- The billing robot / reminders are always-on; no hidden off switches.

## Android bundle notes
- Play Billing must be **v8+** (`com.android.billingclient:billing-ktx:8.0.0`) with
  **Kotlin 2.0.21** (root `build.gradle`). Older Billing is rejected by Play.
- `versionCode` is bumped by the workflow's `sed` - raise the target number for each
  new upload; a reused code is rejected.
