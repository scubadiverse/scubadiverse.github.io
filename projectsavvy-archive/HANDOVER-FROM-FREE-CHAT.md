# Handover — free-version chat → premium chat (2026-07)

Written by the free-version chat (branch `claude/time-management-focus-app-wi2uaa`)
for the premium chat (`claude/premium-sync`). Read together with `HANDOVER.md`
and `TECHHANDOVER.md`. The premium agent's sign-in/sync setup was NOT changed —
only added on top. Verified: same `firebaseConfig`, `cloudSave`/`cloudLoad` intact.

## 1. What this chat added to the premium build (`focus-app/paid/index.html`)

**Free-app UI improvements brought into paid/ (also live in the public free app):**
- Timer: quick-pick 25 / 45 chips, a Reset button, change block length any time.
- Projects: reorder with ▲ / ▼ arrows (+ hint); "Editing projects" header + a
  bottom "✓ Done" button in the Edit panel.
- Wind-down banner: auto-hide at 30s + tap-to-dismiss.
- All em dashes converted to en dashes.
- Emergency call button: FIXED so it shows ONLY during the time-out (it had a
  duplicate `display:` in its inline style — `display:flex` overrode `display:none`
  so it was always visible). Icon is SVG.

**New premium features added to paid/ (gated to premium):**
- **Resting zone**: in Edit, tap 💤 to park a project → it moves to a "Resting zone"
  card (keeps its time/history), with ↩ Bring back. `resting:true` flag on the
  project; `activeProjects()` filters it out of the active list.
- **Premium badge** "✨ PREMIUM" in the header.
- **Sign-in gate**: `isPremium()` = signed in. When logged out, the Unplanned tab
  and resting-zone 💤 are hidden and a "🔒 Premium — Sign in to unlock" card shows;
  when signed in, "✨ Premium active" + a disabled "Buy Premium" button (payment off
  during testing). `applyPremiumGate()` runs on load and on auth change.
- **3-device cap — BUILT BUT NOT DEPLOYED** (only in a scratchpad mockup). Design:
  a per-install `ps_device_id` in localStorage (kept OUT of synced state); on sign
  in, read `devices[]` from the user's Firestore doc; if this id is present → OK; if
  `< 3` → add it → OK; else `deviceBlocked=true` and premium locks with a "device
  limit reached" message. `cloudSave` is guarded to not write from a blocked device.
  It is a SOFT cap (a technical user could clear the `devices` field, since the rule
  lets a user write their own doc) — bulletproof needs a Cloud Function (Blaze plan).

Only change to the account code: `ACCOUNTS_ENABLED` flipped `false → true`.

## 2. Closed-testing distribution (NEW — not in the premium agent's setup)
The owner wanted premium in Google Play **closed testing** so testers can test it.
- Premium web deployed to a NEW path: `scubadiverse.github.io/focus-flow-premium/`
  (a copy of `focus-app/paid/` + `sounds/`).
- New workflow `scubadiverse.github.io/.github/workflows/android-premium.yml`:
  builds a **release AAB**, SAME `applicationId` `app.ainative.focusflow`,
  `versionCode 1024` (production is 24, so testers get premium), WebView URL patched
  to `focus-flow-premium`. Published to release tag `android-premium`. Owner uploaded
  it to the closed-testing track.

## 3. OPEN ISSUE (needs Firebase access — for the premium agent)
**Sign-in does nothing in the closed-testing app.** Most likely cause: the premium
app now loads `scubadiverse.github.io/focus-flow-premium/`, but Firebase Auth was set
up/tested on `project-savvy-914a1.web.app`. `scubadiverse.github.io` is probably NOT
in Firebase **Authorized domains**, and/or the web API key has HTTP-referrer
restrictions → auth requests fail silently ("nothing happens"). Two fixes:
- **(A) Quick:** Firebase Console → Authentication → Settings → **Authorized domains**
  → add `scubadiverse.github.io`; make sure the API key isn't referrer-restricted to
  the firebase domain only.
- **(B) Cleaner, matches TECHHANDOVER:** deploy `focus-app/paid/` to **Firebase
  Hosting** (`project-savvy-914a1.web.app`, an already-authorised domain where auth
  works) and point `android-premium.yml` at that URL instead of github.io. Needs
  `firebase deploy` with a service-account key (this chat had no Firebase CLI/key).

## 4. Google sign-in in the app
NOT built. The Android app has **no** native Google sign-in (no `play-services-auth`,
no Credential Manager, no Custom Tabs). Firebase has the Google provider enabled, but
Google blocks its web popup inside a raw WebView, so the Google button does nothing in
the app. Owner chose to **skip Google for now**; testers use **email**. To add Google
in-app later: native Google sign-in code + the app's SHA-1 registered in Firebase +
the Web client ID + a new AAB.

## 5. Deploy state / cache versions
- Public free app: `scubadiverse.github.io/focus-flow/`, SW `focusflow-v82`.
- Premium web: `scubadiverse.github.io/focus-flow-premium/`, SW `focusflow-paid-v7`
  (badge + gate live; 3-device cap NOT deployed).
- Firebase Hosting `project-savvy-914a1.web.app`: still the premium agent's OLDER
  build — NOT updated by this chat.
