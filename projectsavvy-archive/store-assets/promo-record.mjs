import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import fs from 'fs';

const now = 1752060000000;
const S = {
  day:"2026-7-10", block:50, lastProj:'p1',
  projects:[
    {id:'p1', name:'Project One', target:180, color:'#3aa0ff'},
    {id:'p2', name:'Project Two', target:120, color:'#a06bff'}
  ],
  mins:{p1:145,p2:92}, blocks:4, targetNotified:{}, tiredPoints:[38,42,35,44],
  hourMins:{'9':40,'10':55,'11':60,'14':35,'15':50,'16':30,'20':25},
  waterEvery:45, lastWaterTs:now, onlineLimit:60, contStart:0, timer:null, guard:false,
  lastDrankTs:now, eyeRest:true, lastEyeTs:now, stand:true, lastStandTs:now,
  emergency:{official:'112', contacts:[]},
  history:[
    {day:'2026-7-3',min:120,blocks:3,wins:2,mins:{p1:80,p2:40}},
    {day:'2026-7-4',min:95,blocks:2,wins:1,mins:{p1:55,p2:40}},
    {day:'2026-7-5',min:160,blocks:4,wins:3,mins:{p1:100,p2:60}},
    {day:'2026-7-6',min:70,blocks:2,wins:1,mins:{p1:40,p2:30}},
    {day:'2026-7-7',min:180,blocks:4,wins:2,mins:{p1:110,p2:70}},
    {day:'2026-7-8',min:210,blocks:5,wins:4,mins:{p1:130,p2:80}}
  ],
  wins:[{t:'Finished a tricky task',ts:now,k:'win'},{t:'Shipped something I am proud of',ts:now,k:'win'}],
  moods:[{e:'motivated',ts:now,h:9,act:'',water:1},{e:'calm',ts:now,h:11,act:'',water:1}]
};

const dir = 'store-assets/_rec';
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({
  viewport:{width:1080,height:1920}, deviceScaleFactor:1, colorScheme:'dark',
  recordVideo:{ dir, size:{width:1080,height:1920} }
});
const page = await ctx.newPage();
await page.addInitScript((state)=>{ try{ localStorage.setItem('focusflow.v1', JSON.stringify(state)); }catch(e){} }, S);
await page.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await page.waitForTimeout(1400);

// smooth scroll top -> bottom over ~9s
await page.evaluate(()=> new Promise(res=>{
  const end=document.body.scrollHeight-window.innerHeight; let y=0;
  const step=()=>{ y+=end/300; window.scrollTo(0,Math.min(y,end)); if(y<end) setTimeout(step,30); else res(); };
  step();
}));
await page.waitForTimeout(600);
// back to top
await page.evaluate(()=>window.scrollTo({top:0,behavior:'smooth'}));
await page.waitForTimeout(1200);

// show colour picker
await page.evaluate(()=>{ try{ toggleEditProj(); }catch(e){} });
await page.waitForTimeout(2600);
await page.evaluate(()=>{ try{ toggleEditProj(); }catch(e){} });
await page.waitForTimeout(500);

// breathing screen
await page.evaluate(()=>{ try{ document.getElementById('breathe').classList.add('show'); }catch(e){} });
await page.waitForTimeout(3200);
await page.evaluate(()=>{ try{ document.getElementById('breathe').classList.remove('show'); }catch(e){} });
await page.waitForTimeout(400);

// time-out screen
await page.evaluate(()=>{
  var t=document.getElementById('timeout'); if(t) t.classList.add('show');
  var c=document.getElementById('toClock'); if(c) c.textContent='1:47';
  var s=document.getElementById('sosBtn'); if(s) s.style.display='block';
});
await page.waitForTimeout(3200);

await page.close();
await ctx.close();
await browser.close();

// find the produced webm and rename it
const f = fs.readdirSync(dir).find(x=>x.endsWith('.webm'));
fs.renameSync(dir+'/'+f, 'store-assets/Focus-Flow-promo.webm');
console.log('recorded ->', 'store-assets/Focus-Flow-promo.webm');
