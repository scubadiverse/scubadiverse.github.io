import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({viewport:{width:432,height:720},deviceScaleFactor:2.5,colorScheme:'dark'});
const p=await c.newPage();
await p.goto('file://'+process.cwd()+'/index.html',{waitUntil:'load'});   // fresh: onboarding auto-shows
await p.waitForTimeout(700);
// hide the late-night curfew overlay if present, keep onboarding
await p.evaluate(()=>{ var c=document.getElementById('curfew'); if(c) c.classList.remove('show'); });
await p.screenshot({path:'store-assets/ob-1.png'});
// go to the last slide
await p.evaluate(()=>{ for(var i=0;i<4;i++) obNext(); });
await p.waitForTimeout(300);
await p.screenshot({path:'store-assets/ob-2.png'});
await b.close();
console.log('onboarding previews done');
