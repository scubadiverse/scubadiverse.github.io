// ProjectSavvy desktop prototype
// - Loads the live web app (so Google/email sign-in and cloud sync work).
// - Adds a real whole-screen break LOCK at the OS level: after a set number of
//   minutes it opens a full-screen, always-on-top window that covers the screen,
//   even if you have switched to another program. This is the part a web page
//   cannot do on its own.
//
// Prototype settings (easy to change): the lock fires 2 minutes after start so
// you can see it quickly, the break lasts 2 minutes, and Esc closes the lock
// early so you are never stuck while testing.

const { app, BrowserWindow, Menu, globalShortcut } = require('electron');

const APP_URL = 'https://project-savvy-914a1.web.app';
const MINUTES_UNTIL_LOCK = 2;   // how long "working" before the lock fires
const BREAK_MINUTES = 2;        // how long the lock stays up

let mainWin = null;
let lockWin = null;
let lockTimer = null;

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'ProjectSavvy (Prototype)',
    webPreferences: { contextIsolation: true }
  });
  mainWin.loadURL(APP_URL);
  mainWin.on('closed', () => { mainWin = null; });
}

// Build the break/lock screen as a self-contained HTML page (no external files).
function lockHtml(totalSeconds) {
  return `data:text/html,` + encodeURIComponent(`
    <!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;height:100%;background:#0b1119;color:#eaf2f8;
        font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
        display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
        -webkit-user-select:none;user-select:none;cursor:none}
      .t{font-size:34px;font-weight:800;letter-spacing:2px}
      #c{font-size:96px;font-weight:800;color:#6ee7ff;font-variant-numeric:tabular-nums;margin:8px 0}
      .h{color:#aebdcb;font-size:18px;max-width:24em;padding:0 20px}
      .e{color:#5d7183;font-size:13px;margin-top:26px}
    </style></head><body>
      <div class="t">&#9208;&#65039; TIME OUT</div>
      <div id="c">2:00</div>
      <div class="h">You've been at the screen a long time. Stand up, look away, stretch and breathe.
        The screen is locked until the timer ends &ndash; rest is not optional right now. &#128153;</div>
      <div class="e">(prototype: press Esc to end the break early)</div>
      <script>
        var left = ${totalSeconds};
        var c = document.getElementById('c');
        function paint(){ var m=Math.floor(left/60), s=left%60; c.textContent = m+':'+(s<10?'0':'')+s; }
        paint();
        setInterval(function(){ left--; if(left<0) left=0; paint(); }, 1000);
      </script>
    </body></html>`);
}

function showLock() {
  if (lockWin) return;
  const totalSeconds = BREAK_MINUTES * 60;

  lockWin = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreenable: true,
    webPreferences: { contextIsolation: true }
  });
  // Raise above normal windows (screen-saver level covers most desktops).
  lockWin.setAlwaysOnTop(true, 'screen-saver');
  lockWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  lockWin.loadURL(lockHtml(totalSeconds));
  lockWin.focus();

  // Keep it covering: if it loses focus, pull it back to the front.
  const keepFront = () => { if (lockWin) { lockWin.setAlwaysOnTop(true, 'screen-saver'); lockWin.focus(); } };
  lockWin.on('blur', keepFront);

  // Auto-end the break.
  const endAt = setTimeout(() => { closeLock(); }, totalSeconds * 1000);

  lockWin.on('closed', () => {
    clearTimeout(endAt);
    lockWin = null;
    scheduleLock(); // start counting down to the next break
  });
}

function closeLock() {
  if (lockWin) { lockWin.destroy(); lockWin = null; }
}

function scheduleLock() {
  clearTimeout(lockTimer);
  lockTimer = setTimeout(showLock, MINUTES_UNTIL_LOCK * 60 * 1000);
}

function buildMenu() {
  const template = [
    {
      label: 'ProjectSavvy',
      submenu: [
        { label: 'Test lock now', accelerator: 'CmdOrCtrl+L', click: () => showLock() },
        { label: 'Reload app', accelerator: 'CmdOrCtrl+R', click: () => mainWin && mainWin.reload() },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createMainWindow();
  buildMenu();
  scheduleLock();
  // Esc ends the break early (prototype convenience so you are never stuck).
  globalShortcut.register('Escape', () => { if (lockWin) closeLock(); });
});

app.on('window-all-closed', () => { app.quit(); });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });
