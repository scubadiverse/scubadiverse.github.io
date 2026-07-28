# Monica's personal copy of the app (instructions for a new session)

Monica (the owner) wants her **own private copy** of the time-management app –
the one built for her, originally **Focus & Flow**, now **ProjectSavvy** on the
Play Store. This is the SAME app, given to her as a personal file, not the store
listing.

## Where the app lives
- File: `focus-app/index.html`
- Branch: `claude/time-management-focus-app-wi2uaa`
- Repo: `scubadiverse/divescannerv2.0`

Check out that branch first (`git checkout claude/time-management-focus-app-wi2uaa`),
then work with `focus-app/index.html`.

## How to give it to her (private, just for her)
She wants the **installable phone app** (the direct-install APK she used before the
Play Store), NOT the raw HTML file.

**Preferred – the installable APK:**
- The Android build (GitHub Actions `android.yml` in `scubadiverse/scubadiverse.github.io`,
  folder `focus-flow-android/`) publishes `app-debug.apk` to the `android-latest`
  release: `https://github.com/scubadiverse/scubadiverse.github.io/releases/download/android-latest/app-debug.apk`
- Download that APK and send it to her. She taps it on the phone, allows
  "install from unknown sources", and installs – no Play Store, no account.
- It's a WebView wrapper that loads the live app, so it always has the latest
  features. Data stays on her device.

**Fallback – the standalone HTML:** `focus-app/index.html` is self-contained; she
can open it in any browser. Data is saved locally (localStorage `focusflow.v1`).

## If she wants it always available (optional)
- She can keep the file and open it anytime (works offline).
- Or host a private copy just for her (e.g. a private URL) – ask her first.
- The public Play Store version stays separate and is unaffected.

## Note
Do NOT enable the hidden sign-in/cloud sync for this personal copy unless she
asks – it is gated off behind `ACCOUNTS_ENABLED = false` and reserved for the
future premium tier (see `focus-app/ROADMAP.md`).
