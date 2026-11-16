import assert from 'node:assert/strict';
const {chromium}=await import('../../work/browser-check/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});const base=process.env.FR_BASE||'http://127.0.0.1:5188';
try{
const context=await browser.newContext({viewport:{width:390,height:844}});const events=[];await context.route('**/api/usage',r=>{events.push(r.request().postDataJSON());return r.fulfill({status:204});});const page=await context.newPage();
await page.goto(base+'/?private=must-not-send');await page.locator('#learning-theme').waitFor();await page.waitForTimeout(100);assert.deepEqual(events,[{page:'hub',visit:true}]);
await page.goto(base+'/french.html');await page.locator('#learning-theme').waitFor();await page.waitForTimeout(100);assert.deepEqual(events[1],{page:'french',visit:false});
await page.evaluate(()=>sessionStorage.setItem('reasonlab-last-visit',String(Date.now()-31*60000)));await page.reload();await page.locator('#learning-theme').waitFor();await page.waitForTimeout(100);assert.equal(events[2].visit,true);
await page.goto(base+'/usage-privacy.html');await page.locator('#usage-optout').check();assert.equal(events.length,3);await page.goto(base+'/');await page.locator('#learning-theme').waitFor();await page.waitForTimeout(100);assert.equal(events.length,3);
await page.goto(base+'/usage-privacy.html');await page.setViewportSize({width:320,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
const gpc=await browser.newContext();await gpc.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));let count=0;await gpc.route('**/api/usage',r=>{count++;return r.fulfill({status:204});});const p=await gpc.newPage();await p.goto(base+'/');await p.locator('#learning-theme').waitFor();assert.equal(count,0);await gpc.close();
console.log('PASS aggregate-only payloads, 30-minute tab visits, no queries/identities, opt-out, GPC and mobile privacy page. Collection endpoint mocked.');
}finally{await browser.close();}
