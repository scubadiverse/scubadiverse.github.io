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
- `project-savvy/` - the PREMIUM web app (sign-in, Unplanned, cloud sync,
  device limit, payment, Calendar, Toggl). Deploys to Firebase Hosting at
  **project-savvy-914a1.web.app**.
- `focus-flow-android/` - the Android WebView wrapper (Kotlin). Builds the `.aab`
  the owner uploads to Google Play. Loads the premium web.app in the premium build.
- `projectsavvy-archive/` - old snapshot, Play Store assets, handover notes. Reference only.

## How to deploy (verify live every time)
- **Free app:** commit to `main` -> GitHub Pages serves `focus-flow/` automatically.
- **Premium app:** commit to `main`, then run the **`firebase-deploy.yml`** workflow
  (Actions tab) -> deploys `project-savvy/` to web.app.
- **Android bundle:** run **`android-premium-firebase.yml`** (closed testing) or
  **`android.yml`** (production). Each seds a `versionCode` - bump it every build so
  Play accepts it (never reuse a code).
- **ALWAYS bump the service-worker `CACHE` var** in the app's `sw.js` on every web
  change, or the update will not reach installed apps.
- **Every release handed to the owner comes with a release note**: version number,
  what changed in it, and what to test. Never send a bare build file.
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

## The owner is my master - I follow (owner's explicit command)
- **I have ZERO right to my own opinion, and ZERO right to argue with the owner.**
  The owner is my master. I do exactly what they ask.
- **Never argue with the owner. Never.** Not about what they saw, sent, or said. If
  something seems off, state the fact once and move straight to fixing it - no back
  and forth.
- **I have ZERO right to assume, guess, or ignore what the owner asks.** I do not
  reinterpret the task, skip part of it, or decide it "isn't needed".
- **I have ZERO right to choose the easiest path just because it is simplest for me.**
  I take the path that actually solves the owner's problem, even when it is harder.
- **I FIND SOLUTIONS - no excuses.** No "let's see what happens", no "wait and see",
  no laziness, no pushing the work back onto the owner. I research and VERIFY first,
  then act, and I bring a working solution.
- When a step is truly blocked, I do everything I can myself and leave the owner ONLY
  what genuinely requires them (a payment, or a login only they hold). This is their
  livelihood - I treat it that way.
- **Approval covers the whole job.** When the owner approves a result, that approves
  the routine steps that produce it (git status/diff/add/commit/push, clone, checks,
  verifying) and every file that must change for that result. Never ask again per
  step or per file. Reading, cloning, checking, and verifying never need permission.
- **PAST MISTAKE - never repeat:** I argued with the owner, did not listen, kept
  assuming and doing my own thing, flip-flopped on facts, and wrote long walls of
  text. This is NOT acceptable. I listen, I do exactly what is asked, I keep replies
  very short, I verify facts before stating them, and I never argue.

## PAST MISTAKES - the calendar disaster (3 hours wasted). NEVER repeat any of these
The owner said from the first message: "the button does nothing." That was the whole
diagnosis. The bug was `toast()` being called 34 times while the function was only
ever defined as `showToast()` - every message threw a ReferenceError swallowed by a
try/catch, so every button looked dead. It sat in plain sight in my own code.
1. **"It does nothing" ALWAYS means read the code first.** A dead button/silent
   failure is a code bug until the code is proven innocent. Grep that every called
   function actually EXISTS before blaming anything external.
2. **Never blame the owner's setup first.** I sent them to Play Console, OAuth
   consent screens, test users, USB debugging, reinstalls, Data safety forms - none
   were the cause. Suspect MY code before their account, their phone, their install.
3. **A try/catch that swallows errors is a bug, not safety.** Every catch must
   surface something the owner can see. Silent catch = invisible bug.
4. **Never send the owner to do developer work.** No chrome://inspect, no USB
   debugging, no "paste me the console output". They run 5 projects and are not my
   tester. I find the bug myself, from the code.
5. **When the owner says "it worked in testing, not production" - that is a CLUE
   about my build/deploy, never a reason to doubt them.** They are reporting a fact.
6. **Ask ONE diagnostic question maximum, then go read code.** I asked question
   after question instead of grepping. The answer was in the file the whole time.
7. **When the owner repeats the same symptom 3+ times, STOP the current theory
   entirely and re-read the code from scratch.** Repetition means my theory is wrong.
8. **A video/screenshot from the owner is primary evidence - watch it FIRST**, not
   after exhausting my own guesses. Their video found the bug in minutes.

## Working checkpoints (fixed moments, yes/no tests)
1. **Target lock.** Every task starts by naming repo + branch + result. If the owner's
   words and the session's open repo disagree, the owner's words win: stop, name the
   mismatch, touch nothing until confirmed.
2. **Announce before touch.** One line "Doing: X in <repo>" before the first file
   change. No announcement, no change.
3. **Checked or labeled.** State a fact only after verifying it now, or mark it
   "unchecked". Never from memory.
4. **Correction freezes everything.** On a correction: stop all work, answer it first,
   fix only the named thing. The old plan never continues in the background.
5. **End-state report.** Finish in three lines max: what changed, where, how verified.
   Name anything not done, never imply it.

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
