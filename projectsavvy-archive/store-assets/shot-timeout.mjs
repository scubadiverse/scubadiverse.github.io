import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport:{width:1080,height:1920}, deviceScaleFactor:1, colorScheme:'dark' });
const page = await ctx.newPage();
await page.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await page.waitForTimeout(600);

// Show the whole-screen time-out overlay + the emergency (phone) icon, exactly as it appears in use.
await page.evaluate(()=>{
  var t=document.getElementById('timeout'); if(t){ t.classList.add('show'); }
  var c=document.getElementById('toClock'); if(c){ c.textContent='1:47'; }
  var s=document.getElementById('sosBtn'); if(s){ s.style.display='block'; }
});
await page.waitForTimeout(400);
await page.screenshot({ path:'store-assets/shot-03-timeout.png' });
await browser.close();
console.log('timeout screenshot done');
