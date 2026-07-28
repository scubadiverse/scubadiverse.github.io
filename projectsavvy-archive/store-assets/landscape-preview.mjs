import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const now = 1752060000000;
const S = {
  day:"2026-7-11", block:50, lastProj:'p1',
  projects:[{id:'p1',name:'Project One',target:180,color:'#3aa0ff'},{id:'p2',name:'Project Two',target:120,color:'#a06bff'}],
  mins:{p1:145,p2:92}, blocks:4, targetNotified:{}, tiredPoints:[38,42,35,44],
  hourMins:{'9':40,'10':55,'11':60,'14':35,'15':50,'16':30,'20':25},
  waterEvery:45, lastWaterTs:now, onlineLimit:60, contStart:0, timer:null, guard:false,
  lastDrankTs:now, eyeRest:true, lastEyeTs:now, stand:true, lastStandTs:now,
  emergency:{official:'112',contacts:[]},
  history:[{day:'2026-7-5',min:160,blocks:4,wins:3,mins:{p1:100,p2:60}},{day:'2026-7-7',min:180,blocks:4,wins:2,mins:{p1:110,p2:70}},{day:'2026-7-8',min:210,blocks:5,wins:4,mins:{p1:130,p2:80}}],
  wins:[{t:'Finished a tricky task',ts:now,k:'win'},{t:'Shipped something I am proud of',ts:now,k:'win'}],
  moods:[{e:'motivated',ts:now,h:9,act:'',water:1},{e:'calm',ts:now,h:11,act:'',water:1}]
};

const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// WIDE (tablet/desktop) – the real CSS media query should give 2 columns
const ctx = await browser.newContext({ viewport:{width:1920,height:1080}, deviceScaleFactor:1, colorScheme:'dark' });
const page = await ctx.newPage();
await page.addInitScript((state)=>{ try{ localStorage.setItem('focusflow.v1', JSON.stringify(state)); }catch(e){} }, S);
await page.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await page.waitForTimeout(700);
await page.evaluate(()=>{ document.querySelectorAll('.overlay').forEach(function(o){ o.classList.remove('show'); o.style.display='none'; }); });
await page.screenshot({ path:'store-assets/landscape-preview.png' });

// PHONE (narrow) – must stay single column
const pctx = await browser.newContext({ viewport:{width:432,height:820}, deviceScaleFactor:2.5, colorScheme:'dark' });
const pp = await pctx.newPage();
await pp.addInitScript((state)=>{ try{ localStorage.setItem('focusflow.v1', JSON.stringify(state)); }catch(e){} }, S);
await pp.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await pp.waitForTimeout(600);
await pp.evaluate(()=>{ document.querySelectorAll('.overlay').forEach(function(o){ o.classList.remove('show'); o.style.display='none'; }); });
await pp.screenshot({ path:'store-assets/_phone-check.png' });

await browser.close();
console.log('landscape preview done');
