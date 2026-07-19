# ProjectSavvy - background reminders & time-out (HARD REQUIREMENT)

Owner requirement. Do not weaken or remove any of this without the owner's
explicit consent.

## Must work in the BACKGROUND - not only while the app is open
- Reminders (water, eye-rest, stand) and the whole-screen time-out MUST run in
  the background. The user does NOT have to press Start or keep the app open.
- They are driven by a foreground service (`ScreenGuardService`). It is started
  when the user turns on "Enable phone alerts" (or the whole-screen break lock),
  via `AndroidBridge.syncAlerts` in `MainActivity`.
- The service is `START_STICKY` and stores its counters in SharedPreferences, so
  it survives the app being swiped away and is restarted by Android if killed.

## Swiping the notification away must NOT stop the time-out
- The full-screen lock is service-driven, not notification-driven. If the user
  swipes the ongoing service notification away, the time-out MUST still fire and
  MUST still cover the whole screen.
- The lock overlay uses the `SYSTEM_ALERT_WINDOW` ("display over other apps")
  permission. Keep that permission and the overlay.

## Other rules
- Tapping any reminder / time-out notification MUST reopen the app
  (PendingIntent -> `MainActivity`).
- `POST_NOTIFICATIONS` is requested when the user enables phone alerts (Android
  13+). Without it, no notifications appear at all.
- Reminders are time-based (water ~45 min, eye ~20, stand ~30). The first one
  only fires after that interval - it is not instant.

## Phone-maker battery killers (tell testers)
- On Xiaomi/MIUI, Samsung, and similar, the OS kills background services to save
  battery. For reminders and the lock to survive, the tester must:
  - allow **Autostart** for ProjectSavvy, and
  - set **Battery -> No restrictions** (do not optimise).
- This is a device setting, not an app bug. Document it for testers.

## Never do
- Never remove or weaken the background service, `START_STICKY`, the foreground
  notification, the overlay lock, or the reopen-on-tap intent without the owner's
  explicit, per-change consent.
