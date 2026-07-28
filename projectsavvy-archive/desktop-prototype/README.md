# ProjectSavvy desktop prototype (whole-screen break lock)

A tiny desktop app that opens your ProjectSavvy web app (so sign-in and cross-device
sync work) and adds a real **whole-screen break lock** at the system level.

Prototype behaviour:
- The lock fires **2 minutes** after you start (so you can see it quickly).
- The break lasts **2 minutes**, then the screen unlocks by itself.
- **Esc** ends the break early, so you are never stuck while testing.
- Menu -> **Test lock now** (or Ctrl+L) triggers the lock immediately.

## Run it on a Chromebook (Linux / "penguin")

1. Turn on Linux if it is not on yet: Settings -> Advanced -> Developers ->
   **Linux development environment** -> Turn on.
2. Put this folder in your Linux files (drag it into the **Linux files** area in the
   Files app).
3. Open the **Terminal** app (penguin) and run these, one line at a time:

   ```
   sudo apt update
   sudo apt install -y nodejs npm
   cd projectsavvy-desktop-prototype
   npm install
   npm start
   ```

   The first `npm install` downloads the desktop engine and takes a few minutes.

4. The app window opens. Sign in at the bottom of the page. After 2 minutes the
   whole-screen lock appears. Try switching to another app before it fires to see
   whether it covers that too.

## Run it on Windows or Mac

1. Install Node.js from https://nodejs.org (the big LTS button).
2. Open Terminal (Mac) or Command Prompt (Windows) in this folder.
3. Run: `npm install` then `npm start`.

## Change the timings

Open `main.js` and edit the two lines near the top:
`MINUTES_UNTIL_LOCK` (how long before the lock) and `BREAK_MINUTES` (how long it lasts).
