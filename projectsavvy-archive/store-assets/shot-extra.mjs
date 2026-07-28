import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const now = 1752060000000;
const S = {
  day:"2026-7-11", block:50, lastProj:'p1',
  projects:[
    {id:'p1', name:'Project One', target:180, color:'#3aa0ff'},
    {id:'p2', name:'Project Two', target:120, color:'#a06bff'}
  ],
  mins:{p1:145,p2:92}, blocks:4, targetNotified:{}, tiredPoints:[38,42,35,44],
  hourMins:{'9':40,'10':55,'11':60}, waterEvery:45, lastWaterTs:now, onlineLimit:60,
  contStart:0, timer:null, guard:false, lastDrankTs:now, eyeRest:true, lastEyeTs:now,
  stand:true, lastStandTs:now, emergency:{official:'112', contacts:[]},
  history:[], wins:[], moods:[]
};

const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport:{width:1080,height:1920}, deviceScaleFactor:1, colorScheme:'dark' });
const page = await ctx.newPage();
await page.addInitScript((state)=>{ try{ localStorage.setItem('focusflow.v1', JSON.stringify(state)); }catch(e){} }, S);
await page.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await page.waitForTimeout(700);

// 4) Colour picker – open Edit projects to reveal the colour swatches
await page.evaluate(()=>{ try{ toggleEditProj(); }catch(e){} });
await page.waitForTimeout(400);
await page.screenshot({ path:'store-assets/shot-04-colours.png' });

// 5) Calm / breathing screen
await page.evaluate(()=>{ try{ document.getElementById('breathe').classList.add('show'); }catch(e){} });
await page.waitForTimeout(400);
await page.screenshot({ path:'store-assets/shot-05-calm.png' });

await browser.close();
console.log('extra screenshots done');
