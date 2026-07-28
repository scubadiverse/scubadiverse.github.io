import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
// phone view: show the Help button under the header
const c=await b.newContext({viewport:{width:432,height:560},deviceScaleFactor:2.5,colorScheme:'dark'});
const p=await c.newPage();
await p.goto('file://'+process.cwd()+'/index.html',{waitUntil:'load'});
await p.waitForTimeout(600);
await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(o=>{o.classList.remove('show');o.style.display='none';});});
await p.screenshot({path:'store-assets/help-button.png'});
// the guide page
const c2=await b.newContext({viewport:{width:432,height:900},deviceScaleFactor:2,colorScheme:'dark'});
const p2=await c2.newPage();
await p2.goto('file://'+process.cwd()+'/guide.html',{waitUntil:'load'});
await p2.waitForTimeout(400);
await p2.screenshot({path:'store-assets/guide-page.png',fullPage:true});
await b.close();
console.log('help previews done');
