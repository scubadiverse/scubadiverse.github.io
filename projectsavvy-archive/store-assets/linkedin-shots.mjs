import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const now = 1752660000000;
const day = "2026-7-16";
const S = {
  day, block:50, lastProj:'p1', onboarded:true,
  projects:[
    {id:'p1', name:'Website redesign', target:180, color:'#3aa0ff'},
    {id:'p2', name:'Marketing plan', target:120, color:'#a06bff'}
  ],
  mins:{p1:145, p2:92}, blocks:4, targetNotified:{},
  tiredPoints:[38,42,35,44],
  hourMins:{'9':40,'10':55,'11':60,'14':35,'15':50,'16':30,'20':25},
  waterEvery:45, lastWaterTs:now, onlineLimit:60, contStart:0, timer:null,
  guard:false, lastDrankTs:now, eyeRest:true, eyeEvery:20, lastEyeTs:now,
  stand:true, lastStandTs:now, alertsOn:true,
  emergency:{official:'112', contacts:[]},
  history:[
    {day:'2026-7-8', min:120, blocks:3, wins:2, mins:{p1:80,p2:40}},
    {day:'2026-7-9', min:95,  blocks:2, wins:1, mins:{p1:55,p2:40}},
    {day:'2026-7-10', min:160, blocks:4, wins:3, mins:{p1:100,p2:60}},
    {day:'2026-7-11', min:70,  blocks:2, wins:1, mins:{p1:40,p2:30}},
    {day:'2026-7-12', min:180, blocks:4, wins:2, mins:{p1:110,p2:70}},
    {day:'2026-7-13', min:210, blocks:5, wins:4, mins:{p1:130,p2:80}}
  ],
  wins:[{t:'Finished a tricky task', ts:now, k:'win'},{t:'Shipped something I am proud of', ts:now, k:'win'}],
  moods:[{e:'motivated', ts:now, h:9, act:'', water:1},{e:'calm', ts:now, h:11, act:'', water:1}]
};

const vw=412, vh=915;
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport:{width:vw,height:vh}, deviceScaleFactor:3, colorScheme:'dark' });
const page = await ctx.newPage();
await page.addInitScript((state)=>{ try{ localStorage.setItem('focusflow.v1', JSON.stringify(state)); }catch(e){} }, S);
await page.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await page.waitForTimeout(1000);
// Hide the floating emergency button so it doesn't overlap the clean card shots.
await page.evaluate(()=>{ var b=document.getElementById('sosBtn'); if(b) b.style.display='none'; });

async function shotCard(name, idx){
  const card = page.locator('.card').nth(idx);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await card.screenshot({ path:`store-assets/li-${name}.png` });
  console.log('li-'+name+' done');
}

await shotCard('01-projects', 0);
await shotCard('02-focus', 1);
await shotCard('03-wins', 3);
await shotCard('04-feelings', 4);
await shotCard('05-today', 6);
await shotCard('06-productivity', 7);

// Breathing overlay – full screen
await page.evaluate(()=>{
  var el=document.getElementById('breathe'); if(el){ el.style.display='flex'; }
  var c=document.getElementById('bcue'); if(c) c.textContent='Breathe in for 4 seconds';
  var circ=document.getElementById('bcircle'); if(circ) circ.textContent='4';
  var r=document.getElementById('bround'); if(r) r.textContent='Follow the circle. In as it grows, out as it shrinks.';
});
await page.waitForTimeout(400);
await page.screenshot({ path:'store-assets/li-07-breathe.png' });
console.log('li-07-breathe done');

await browser.close();
console.log('done');
