import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
// header with two buttons
const c=await b.newContext({viewport:{width:432,height:400},deviceScaleFactor:2.5,colorScheme:'dark'});
const p=await c.newPage();
await p.goto('file://'+process.cwd()+'/index.html',{waitUntil:'load'});
await p.waitForTimeout(700);
await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(o=>{o.classList.remove('show');o.style.display='none';});});
await p.screenshot({path:'store-assets/fix-buttons.png'});
// breathing overlay redesigned
const c2=await b.newContext({viewport:{width:432,height:900},deviceScaleFactor:2.5,colorScheme:'dark'});
const p2=await c2.newPage();
await p2.goto('file://'+process.cwd()+'/index.html',{waitUntil:'load'});
await p2.waitForTimeout(600);
await p2.evaluate(()=>{
  document.querySelectorAll('.overlay').forEach(o=>{o.classList.remove('show');o.style.display='';});
  document.getElementById('breathe').classList.add('show');
  var rf=document.getElementById('breatheReframe'); if(rf) rf.textContent="You're overwhelmed, and that's okay – it will pass. Breathe with the circle. You've already done 5 small things today.";
  var bc=document.getElementById('bcue'); if(bc) bc.textContent='Breathe in';
});
await p2.waitForTimeout(500);
await p2.screenshot({path:'store-assets/fix-breathe.png'});
// onboarding timeout slide
await p2.evaluate(()=>{ document.getElementById('breathe').classList.remove('show'); obShow(); for(var i=0;i<4;i++) obNext(); });
await p2.waitForTimeout(300);
await p2.screenshot({path:'store-assets/fix-ob-timeout.png'});
await b.close();
console.log('fix previews done');
