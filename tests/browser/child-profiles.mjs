import assert from 'node:assert/strict';
const {chromium}=await import('../../work/browser-check/node_modules/playwright/index.mjs');
const base=process.env.FR_BASE||'http://127.0.0.1:5188';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
try{
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.route('**/auth-client.js',route=>route.fulfill({contentType:'text/javascript',body:`const id=sessionStorage.getItem('test-identity')||'11111111-1111-4111-8111-111111111111';export const authConfig={googleEnabled:true,emailEnabled:false};export const configured=true,initializationError=null;export const service={user:async()=>sessionStorage.getItem('signed-out')?null:{id,email:'adult@example.test'},signOut:async()=>{sessionStorage.setItem('signed-out','yes')},google:async()=>{}};export const onAccountChange=()=>{};`}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/account.html');await page.locator('#child-name').waitFor();assert.equal(await page.locator('[name=child-avatar]').count(),10);
await page.locator('#child-name').fill('Mia <3');await page.locator('[value=bloom]').check();await page.locator('#child-form button[type=submit]').click();await page.getByText('Profile saved! Ready for your next adventure.').waitFor();assert.match(await page.locator('#child-banner').innerText(),/Mia <3/);
await page.locator('#child-slot').selectOption('2');await page.locator('#child-name').fill('Sam');await page.locator('[value=rocket]').check();await page.locator('#child-form button[type=submit]').click();
for(const path of ['/','/french.html','/discover.html']){await page.goto(base+path);await page.getByText('Hello, Sam!',{exact:true}).waitFor();assert.equal(await page.locator('#child-signout').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
await page.goto(base+'/french.html');await page.locator('[data-lesson="sound-hello"]').first().click();await page.locator('[data-cards="sound-hello"]').first().click();await page.locator('#child-signout').click();assert.equal(await page.locator('#exit').isVisible(),true);await page.locator('#exit').evaluate(d=>d.close());assert.equal(await page.evaluate(()=>sessionStorage.getItem('signed-out')),null);
await page.goto(base+'/account.html');await page.locator('#child-slot').selectOption('1');assert.equal(await page.locator('#child-name').inputValue(),'Mia <3');await page.setViewportSize({width:320,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'work/child-profiles-mobile.png',fullPage:true});
await page.evaluate(()=>sessionStorage.setItem('test-identity','22222222-2222-4222-8222-222222222222'));await page.reload();assert.equal(await page.locator('#child-name').inputValue(),'');
await page.locator('#child-signout').click();await page.locator('#google').waitFor();assert.equal(await page.locator('#child-editor').count(),0);assert.equal(await page.locator('#child-banner').isVisible(),false);
assert.deepEqual(errors,[]);console.log('PASS profile onboarding, ten avatars, escaping, save/reload, three page banners, learner/account separation, 320px layout and sign-out. Auth identity mocked; no real login claimed.');
}finally{await browser.close();}
