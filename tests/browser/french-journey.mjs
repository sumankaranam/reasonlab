const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'../../work/browser-check/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
const base=process.env.FR_BASE||'http://127.0.0.1:5188';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const key='reasonlab-french:learner-1';
const raw=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
const goHome=()=>page.locator('nav [data-view="home"]').click();
const resume=async()=>{await page.reload();await page.locator('#resume-activity').click();};
const overflow=async()=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile overflow');};
const current=()=>page.evaluate(async k=>{const {restoreActivity}=await import('/french-activities.js');const s=restoreActivity(JSON.parse(localStorage.getItem(k)).journey.draft);return {q:s.tasks[s.index],index:s.index,total:s.tasks.length};},key);
async function correct(q){if(q.kind==='choice')await page.getByRole('button',{name:q.answer,exact:true}).click();else if(q.kind==='type'){await page.locator('#typed-answer').fill(q.answer);await page.locator('#answer-form [type="submit"]').click();}else{const chosen=await page.locator('[data-remove]').count();for(const token of q.answer.split(' ').slice(chosen)){await page.locator('[data-token]:not([disabled])').filter({hasText:new RegExp('^'+token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first().click();}await page.locator('#answer-form [type="submit"]').click();}}
try{
 await page.goto(base+'/french.html');await page.locator('.journey-chapter').first().waitFor();assert.equal(await page.locator('.path-lesson').count(),48);assert.equal(await page.locator('.journey-chapter').count(),8);assert.equal(await page.locator('.next-adventure [data-lesson]').getAttribute('data-lesson'),'sound-hello');
 await page.locator('#plan-minutes').selectOption('10');await page.locator('#plan-days').selectOption('5');await page.reload();await page.locator('#plan-days').waitFor();assert.equal(await page.locator('#plan-days').inputValue(),'5');await overflow();await page.screenshot({path:'work/french-journey-mobile.png'});
 await page.locator('[data-cards="sound-hello"]').first().click();await page.locator('#flip-card').click();await page.locator('[data-rate-card="known"]').click();await page.locator('#flip-card').click();await page.locator('[data-rate-card="again"]').click();await page.locator('#flip-card').click();await page.locator('#pause-activity').click();assert.equal((await raw()).journey.draft.index,2);
 await page.locator('#learner').selectOption('2');assert.equal(await page.locator('#resume-activity').count(),0);await page.locator('#learner').selectOption('1');await resume();assert.equal(await page.locator('#flip-card').count(),0);assert.equal(await page.locator('[data-rate-card]').count(),2);
 while(await page.locator('[data-rate-card],#flip-card').count()){if(await page.locator('#flip-card').count())await page.locator('#flip-card').click();await page.locator('[data-rate-card="known"]').click();}
 assert.equal((await raw()).journey.draft,null);assert.equal((await raw()).journey.flashcards['sound-hello'].known,5);assert.equal(Object.keys((await raw()).lessons).length,0);
 await page.locator('[data-lesson="sound-hello"]').click();assert.ok(await page.locator('.picture-word svg').count());await page.locator('[data-mode="reading"]').click();
 let typed=false,built=false,total=0;
 while(await page.locator('#skip-question').count()){
  const {q,index,total:n}=await current();total=n;
  if(index===0){const options=await page.locator('[data-answer]').allTextContents();await page.getByRole('button',{name:options.find(o=>o!==q.answer),exact:true}).click();await page.locator('#retry').click();await correct(q);await resume();assert.notEqual((await raw()).journey.draft.answers[0].response,q.answer);}
  else if(q.kind==='type'&&!typed){await page.locator('#typed-answer').fill(q.answer.slice(0,2));await resume();assert.equal(await page.locator('#typed-answer').inputValue(),q.answer.slice(0,2));await correct(q);typed=true;}
  else if(q.kind==='build'&&!built){const token=q.answer.split(' ')[0];await page.getByRole('button',{name:token,exact:true}).click();const indices=(await raw()).journey.draft.tokens;await resume();assert.deepEqual((await raw()).journey.draft.tokens,indices);await correct(q);built=true;}
  else await correct(q);
  await page.locator('#next-question').click();
 }
 assert.equal(await page.locator('.fr-score').textContent(),`${total-1}/${total}`);assert.equal((await raw()).journey.draft,null);assert.equal((await raw()).history.length,1);assert.ok(await page.locator('.new-achievements').count());
 // Fixture supplies the other five previously completed lessons; the mission is exercised through the real UI.
 await page.evaluate(async k=>{const {journeyChapters}=await import('/french-journey.js');const p=JSON.parse(localStorage.getItem(k));for(const id of journeyChapters[0].lessonIds)if(!p.lessons[id])p.lessons[id]={best:80,latest:80,attempts:1,stars:2,date:Date.now(),due:Date.now()+86400000,box:0};localStorage.setItem(k,JSON.stringify(p));},key);
 await page.reload();await page.locator('.next-adventure [data-mission]').click();await page.locator('[data-start-mission]').click();
 let turns=0;while(await page.locator('#skip-question').count()){const {q}=await current();await correct(q);if(turns===1)await resume();await page.locator('#next-question').click();turns++;}
 assert.equal(turns,4);assert.equal((await raw()).journey.missions['first-chat'].best,100);assert.ok((await page.locator('.new-achievements .earned').count())>=2);
 await goHome();assert.equal(await page.locator('.chapter-state').first().textContent(),'✓ Stamp earned');assert.notEqual(await page.locator('.next-adventure [data-lesson]').getAttribute('data-lesson'),'sound-hello');
 await page.locator('[data-lesson="food"]').first().click().catch(async()=>{await page.locator('.journey-chapter').nth(1).locator('summary').first().click();await page.locator('[data-lesson="food"]').click();});await page.locator('[data-cards="food"]').click();await page.screenshot({path:'work/french-flashcards-mobile.png'});await page.setViewportSize({width:320,height:740});await overflow();await page.locator('#pause-activity').click();await overflow();
 for(const v of ['library','phrasebook','studio','progress']){await page.locator(`nav [data-view="${v}"]`).click();await overflow();}
 // Account-scoping test uses a mock verified identity adapter; this is not a live Google login test.
 const accounts=await browser.newContext();await accounts.route('**/auth-client.js',r=>r.fulfill({contentType:'text/javascript',body:`export const service={user:async()=>window.testAdult?{id:window.testAdult}:null};export function onAccountChange(fn){window.testAccountChange=fn;}` }));
 const a=await accounts.newPage();await a.addInitScript(()=>window.testAdult='12345678-1234-1234-1234-123456789abc');await a.goto(base+'/french.html');await a.locator('[data-cards="sound-hello"]').first().click();await a.locator('#flip-card').click();await a.locator('#pause-activity').click();
 await a.evaluate(()=>{window.testAdult='22345678-1234-1234-1234-123456789abc';window.testAccountChange();});await a.waitForFunction(()=>!document.querySelector('#resume-activity'));assert.equal(await a.locator('#resume-activity').count(),0);
 await a.evaluate(()=>{window.testAdult='12345678-1234-1234-1234-123456789abc';window.testAccountChange();});await a.locator('#resume-activity').waitFor();await a.reload();await a.locator('#resume-activity').click();assert.equal(await a.locator('[data-rate-card]').count(),2);await accounts.close();
 assert.deepEqual(errors,[]);console.log('PASS learning plan, visual cards, auto-save/reload/typed/token/retry resume, learner/account isolation, first-conversation and chapter achievements, original progress migration and mobile layouts. Identity was mocked, not a live provider login.');
}finally{await browser.close();}
