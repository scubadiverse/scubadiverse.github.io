# Calendar / Toggl integration — implementation notes (premium features #6, #7)

Log focus time on a project to a user-chosen destination. Summary of research;
build AFTER payment.

## Destinations

### 1. Phone's own calendar (easiest first win — no backend, no OAuth)
- Android: fire `Intent(ACTION_INSERT)` with `CalendarContract.Events` extras
  (TITLE, EXTRA_EVENT_BEGIN_TIME, EXTRA_EVENT_END_TIME, DESCRIPTION). Opens the
  device calendar pre-filled, user taps Save. **No WRITE_CALENDAR permission.**
- iOS wrapper: EventKit `EKEventEditViewController` (write-only access,
  Info.plist `NSCalendarsWriteOnlyAccessUsageDescription`).
- Plain browser fallback: generate an `.ics` / `data:text/calendar` VEVENT download.
- Silent auto-insert needs `WRITE_CALENDAR` — only if "auto-log" is wanted.

### 2. Google Calendar
- Calendar API v3 `events.insert` on `calendars/primary`.
- Scope `https://www.googleapis.com/auth/calendar.events` (sensitive → consent
  screen must be Google-verified in production; ~100 test users until then).
- Web: Google Identity Services token model; Calendar API supports CORS →
  **no backend** for write-on-finish. Reuse Firebase Google sign-in with
  `GoogleAuthProvider.addScope('.../calendar.events')` and use the returned
  access token immediately (Firebase token ~1h, no refresh token).
- WebView: do OAuth natively / Chrome Custom Tab, not raw webview.
- Backend only needed for offline/background auto-send (needs refresh token).

### 3. Toggl Track (needs a small backend proxy)
- API v9 `POST /workspaces/{workspace_id}/time_entries`; positive `duration`
  (seconds) for a finished session, set `created_with:"ProjectSavvy"`.
- Auth HTTP Basic: `base64("<API_TOKEN>:api_token")`. Fetch workspace/project via
  `GET /me`.
- **Not client-side safe**: no browser CORS + token must not sit in JS →
  thin backend proxy required.

## UX (connect once, then one tap)
- Settings → "Log working hours to…": three connect cards (Google Calendar,
  Phone calendar, Toggl), each with a default-destination radio + optional
  "Auto-send when I finish a session" toggle (default OFF).
- When a session ends: single-tap prompt "Log 52 min on 'Thesis'?" → [Add] with a
  small destination chip (tap to switch among connected ones) · [Not now].
- Auto-send ON → fire silently to default + undo toast. One destination → button
  goes straight there. Never re-auth, never a multi-step chooser in the moment.
