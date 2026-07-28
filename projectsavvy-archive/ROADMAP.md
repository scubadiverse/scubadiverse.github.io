# ProjectSavvy – Growth Roadmap (post-launch)

Status: FUTURE work. Do not build any of this during the current closed-testing
phase. Start it in a fresh chat once the app is live and has roughly
**800–1000 downloads**. This file is the shared plan so a new session can pick it
up ("read the roadmap").

## Foundation (everything below depends on this)
- **Accounts:** Sign in with Google + Sign in with email.
- **Cloud sync:** progress saved to the account, so laptop, phone and tablet all
  show the same data with no re-entering. Track on the laptop, see it on the phone.

Note: this needs a **backend server** (accounts, database, secure logins) – a real
build with small monthly running costs. Nothing works cross-device without it, so
it comes first.

## Consumer features (after the foundation)
- **Health connectors:** Garmin first, then Google Health / Samsung Health
  (whatever health app is on the Android). Once connected, show *which project*
  the user was on when their stress level was highest, and at what time.
- **Stress points:** the user's most stressful hours and when they tend to tire.
- **Calendar sync:** Google Calendar, Outlook calendar, and the built-in Android
  calendar. Reads the user's calendar to help plan project time, plus reminders
  like "switch to Project 1 in 30 min".

## Enterprise (separate paid tier – one company license)
- One big license so a corporation buys it for its employees to use on their
  computers and track progress.
- **Microsoft / Outlook login** (company sign-in).
- **Zendesk sync.**
- **Corporate calendar sync** → priority-based in-app reminders
  ("switch to Project 2 in 5 min", depending on priority).
- **Per-employee stress points** (most stressful hours, when the user was most tired).
- **Share project progress** with other users / the team.

## Premium features (consumer, after sign-in)
- **Full eye-rest customization** (tester idea): the free app lets users pick the
  eye-rest *interval* (e.g. 20 / 30 / 45 min). Premium adds deeper control – custom
  look-away *duration*, smart adaptive timing that learns when the user's eyes tire,
  and reminder styles. (Free keeps a basic interval choice so a health reminder is
  never fully paywalled.)
- **Resting zone** (tester idea): let the user *unclick* a project they won't work
  on for a while. Instead of deleting it and losing its progress, the project moves
  to a "resting zone" – parked but fully preserved, ready to bring back later.
  Keeps all its time/history. Good candidate for the premium tier.
- **Unplanned tasks** (tester idea): during the day, surprise tasks pop up that were
  not in the plan. The user does them, then feels their in-app schedule is "broken."
  This feature lets the user quickly log an unplanned task (what came up + minutes,
  or a quick start/stop timer). It goes into an "Unplanned" bucket that still counts
  toward the day, so the plan does not look ruined, with a calm note like "Unplanned
  work today: 40 min – life happens, your plan still counts." The smart part is the
  app then **rebalances** the rest of the day ("you lost 40 min, here is your adjusted
  split") and a **weekly view** of how much of the week was unplanned, so the user
  learns their real rhythm. OWNER DECISION: this is **premium from the start** (not
  free-then-paid) – the whole unplanned-tasks feature lives in the paid tier.

## Money model (proposal – owner decides the split)
- **Free:** the app as it is today.
- **Paid consumer:** sync + health + calendar (+ resting zone).
- **Enterprise:** per-seat or flat company license.

### Owner free-premium (so the owner never pays for their own app)
No fake/duplicate accounts needed. When premium is built, include a clean way for
the owner to unlock paid features for free:
- an **owner/comp allow-list** in the app (specific account emails always get
  premium), and/or
- Google Play **license testers** (added in Play Console → they can make test
  purchases and unlock paid features without ever being charged).
This gives the owner (and anyone they choose) free premium legitimately.

## Suggested build order
1. Accounts + cloud sync (foundation).
2. Health connectors (Garmin → Google/Samsung Health) + stress points.
3. Calendar sync (Google, Outlook, Android) + reminders.
4. Enterprise (Microsoft/Outlook SSO, Zendesk, corporate calendar, team sharing).
