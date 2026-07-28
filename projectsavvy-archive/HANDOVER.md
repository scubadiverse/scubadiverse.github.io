# ProjectSavvy — Handover (roadmap + ideas + where everything lives)

A single place to pick the project back up. ProjectSavvy is an ADHD-friendly
focus / project / time manager (focus blocks, breaks, calm, project split). The
free app is in **Google Play closed testing**. Premium (cloud sync + extra
features) is being built **privately, for the owner only**, not visible to anyone
yet.

## Where everything lives (important)
- **Public store app (free):** `scubadiverse.github.io` repo, folder `focus-flow/`
  (served at `https://scubadiverse.github.io/focus-flow/`). The Android app is a
  WebView that loads that URL. Its APK + Play AAB are built by that repo's Actions
  workflow `android.yml` (release tag `android-latest`). Sign-in is **hidden**
  here (`ACCOUNTS_ENABLED = false`). **Do not expose premium in this copy.**
- **Private premium build (owner only):** `divescannerv2.0` repo, folder
  `focus-app/paid/`, deployed to **Firebase Hosting** at
  `https://project-savvy-914a1.web.app`. Sign-in is ON here.
  - **Personal Android APK** that loads the private build: built by
    `scubadiverse.github.io` workflow `android-personal.yml` → release tag
    `android-personal` (app name "ProjectSavvy Sign-in", installs alongside the
    public app). Loads `project-savvy-914a1.web.app`.
  - On a **Chromebook/laptop**: install the web build as a PWA (open the web.app
    link in Chrome → Install). The APK is for phones.
- **Other divescanner copies:** `focus-app/index.html` and
  `focus-app/github-pages/index.html` (kept roughly in sync; sign-in hidden).
- **Branch for premium work:** `claude/premium-sync` in `divescannerv2.0` (kept
  separate from the free-version work on `claude/time-management-focus-app-wi2uaa`
  so the two chats never overwrite each other). Coordinate via GitHub.

## Firebase (project `project-savvy-914a1`, free Spark plan)
- **Auth:** Email/Password + Google, both enabled.
  - Note: **Google sign-in works only in a real browser**, NOT inside the Android
    WebView (Google blocks embedded web-views). **Inside the app use email
    sign-in.** Google works on the web/Chromebook.
- **Firestore:** database created (Europe `eur3`), rule published so each user can
  read/write only their own doc (`users/{uid}`). Sync saves the whole app state.
- **Hosting:** serves the private premium build (`focus-app/paid`).
- **Deploy config:** repo-root `firebase.json` (public dir `focus-app/paid`) +
  `.firebaserc` (default project). Deploy with a service-account key +
  `firebase deploy --only hosting`.

## Standing deploy rule (see `focus-app/DEPLOY-NOTES.md`)
- **Bump the `sw.js` `CACHE` version on EVERY deploy**, in the same commit. The
  service worker serves the cached app first; installed users never hard-refresh,
  so without a cache bump they keep seeing the old version.

## What is BUILT so far (premium, private)
- **Accounts + cloud sync** (the roadmap "foundation"): email/Google sign-in,
  progress synced across devices via Firestore.
- **Unplanned Tasks tab** (premium feature): a new "Unplanned" tab to log surprise
  tasks + minutes, set priority (High/Medium/Low, tap to cycle), reorder with
  arrows, remove, and a daily "Unplanned today: X min" summary. Data persists and
  syncs.

## Roadmap (from `focus-app/ROADMAP.md`)
Status note in that file: officially post-launch work; the owner has chosen to
build premium privately now.
1. **Foundation — accounts + cloud sync.** ✅ built (private).
2. **Consumer features:** Health connectors (Garmin → Google/Samsung Health) +
   stress points; Calendar sync (Google/Outlook/Android) + reminders. (See
   `focus-app/native-app-plan.html` — health via a service like Terra, needs a
   native app.)
3. **Premium consumer features:**
   - **Unplanned Tasks** — premium from the start. ✅ v1 built. Still to add:
     **auto-rebalance percentages** ("lost 40 min → adjusted split 55/45") and a
     **weekly view** of how much of the week was unplanned.
   - **Resting zone** — "unclick" a project to park it without losing its
     progress/history; bring it back later. (Not built yet.)
   - **Full eye-rest customization** — custom look-away duration, adaptive timing,
     reminder styles (free keeps a basic interval so a health reminder is never
     fully paywalled). (Not built yet.)
4. **Enterprise (separate paid tier):** one company license; Microsoft/Outlook
   SSO; Zendesk sync; corporate calendar → priority reminders; per-employee stress
   points; share progress with the team.
   - Reference: **Workleap / Officevibe API** (`api.workleap.com`, key in a
     `workleap-subscription-key` header) exposes team **engagement + wellness
     (stress) metrics by team**, feedback, and provisioning — fits the enterprise
     stress/team layer. Data is per-team, not per-individual (anonymity), so
     personal stress still needs Garmin/health.

## Money model + owner free-premium
- **Free:** the app as today. **Paid consumer:** sync + health + calendar (+
  resting zone). **Enterprise:** per-seat or company license.
- **Owner never pays:** unlock premium for the owner via an **owner/comp
  allow-list** (specific account emails always premium) and/or **Google Play
  license testers**.
- **Payment (Google Play Billing)** can only be switched on/tested once the app is
  published through Play — a sideloaded private build can't run real Play
  payments. So: build + test premium features privately now, wire the **payment at
  publish time**. Decision pending: **one-time unlock vs subscription** (owner
  leaning to keep it simple to start).

## Suggested next steps
1. Unplanned Tasks: add **auto-rebalance %** + **weekly view**.
2. **Resting zone** (small, testers asked for it).
3. **Eye-rest customization.**
4. At launch: **Google Play Billing** unlock + owner allow-list / license testers.
5. Later / bigger: health connectors (native app + Terra), calendar sync,
   enterprise tier.

## How to keep the two chats from clashing
- Free version is built in another chat on
  `claude/time-management-focus-app-wi2uaa`. Premium is built here on
  `claude/premium-sync`. Both push to GitHub; premium is rebased on the latest
  free version before merging. **Never copy one app folder over another** (it would
  wipe the other's work) — merge through git.
