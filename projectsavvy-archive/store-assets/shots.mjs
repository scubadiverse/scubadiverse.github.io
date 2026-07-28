import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;

const now = 1752060000000; // fixed demo timestamp
const day = "2026-7-11"; // must match the app's "today" so the Today stats show populated
// Example usage state (demo only — the real app starts empty and learns from you).
const S = {
  day, block:50, lastProj:'p1',
  projects:[
    {id:'p1', name:'Project Name 1', target:180, color:'#3aa0ff'},
    {id:'p2', name:'Project Name 2', target:120, color:'#a06bff'}
  ],
  mins:{p1:145, p2:92}, blocks:4, targetNotified:{},
  tiredPoints:[38,42,35,44],
  hourMins:{'9':40,'10':55,'11':60,'14':35,'15':50,'16':30,'20':25},
  waterEvery:45, lastWaterTs:now, onlineLimit:60, contStart:0, timer:null,
  guard:false, lastDrankTs:now, eyeRest:true, lastEyeTs:now, stand:true, lastStandTs:now,
  emergency:{official:'112', contacts:[]},
  history:[
    {day:'2026-7-3', min:120, blocks:3, wins:2, mins:{p1:80,p2:40}},
    {day:'2026-7-4', min:95,  blocks:2, wins:1, mins:{p1:55,p2:40}},
    {day:'2026-7-5', min:160, blocks:4, wins:3, mins:{p1:100,p2:60}},
    {day:'2026-7-6', min:70,  blocks:2, wins:1, mins:{p1:40,p2:30}},
    {day:'2026-7-7', min:180, blocks:4, wins:2, mins:{p1:110,p2:70}},
    {day:'2026-7-8', min:210, blocks:5, wins:4, mins:{p1:130,p2:80}}
  ],
  wins:[{t:'Finished a tricky task', ts:now, k:'win'},{t:'Shipped something I am proud of', ts:now, k:'win'}],
  moods:[{e:'motivated', ts:now, h:9, act:'', water:1},{e:'calm', ts:now, h:11, act:'', water:1}]
};

const shots = [
  { name:'01-focus',   sel:null, scrollTo:0 },
  { name:'02-projects',sel:'#projEdit' },
];

const vw=1080, vh=1920;
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport:{width:vw,height:vh}, deviceScaleFactor:1, colorScheme:'dark' });
const page = await ctx.newPage();
await page.addInitScript((state)=>{ try{ localStorage.setItem('focusflow.v1', JSON.stringify(state)); }catch(e){} }, S);
await page.goto('file://' + process.cwd() + '/index.html', { waitUntil:'load' });
await page.waitForTimeout(900);

// full-page-ish shots of key screens
await page.screenshot({ path:'store-assets/shot-01-focus.png' });

// scroll to productivity charts area and shoot
await page.evaluate(()=>{ document.documentElement.scrollTop = document.body.scrollHeight; });
await page.waitForTimeout(500);
await page.screenshot({ path:'store-assets/shot-02-productivity.png' });

await browser.close();
console.log('screenshots done');
