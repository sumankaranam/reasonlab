const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'../../work/browser-check/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.FR_BASE||'http://127.0.0.1:5188';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const overflow=async()=>{await page.waitForLoadState('load');await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow at '+page.url());};
const clickNav=async view=>page.locator(`nav [data-view="${view}"]`).click();
async function finishActivity({wrongFirst=false,helpFirst=false}={}){
 let i=0;
 while(await page.locator('#skip-question').count()){
  if(i===0&&helpFirst&&await page.locator('#reveal-listening').count())await page.locator('#reveal-listening').click();
  if(i===0&&wrongFirst){await page.locator('[data-answer]').last().click();await page.locator('#retry').count().then(async n=>{if(n){await page.locator('#retry').click();await page.locator('[data-answer]').first().click();}});}
  else await page.locator('#skip-question').click();
  await page.locator('#next-question').click();i++;assert.ok(i<40,'activity failed to finish');
 }
 assert.ok(await page.getByText('Look what',{exact:false}).count());return i;
}
try{
 await page.goto(base+'/french.html');await page.locator('[data-lesson]').first().waitFor();await overflow();
 assert.equal(await page.locator('.path-lesson').count(),36);
 await page.screenshot({path:'work/french-mobile.png',fullPage:false});
 assert.equal(await page.locator('.journey-chapter').count(),6);
 await page.locator('[data-lesson="sound-hello"]').first().click();await page.locator('[data-start][data-mode="reading"]').click();
 await clickNav('home');await page.locator('#exit').waitFor({state:'visible'});await page.locator('#stay').click();
 const count=await finishActivity({wrongFirst:true});assert.ok(count>=12);
 await clickNav('progress');assert.ok(await page.getByText('1 of 36 lessons explored',{exact:false}).count());
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const dl=await downloadPromise;await dl.saveAs('work/french-export.json');const report=JSON.parse(await fs.readFile('work/french-export.json','utf8'));assert.equal(report.learner,1);assert.equal(report.progress.history.length,1);assert.equal(report.progress.history[0].total,count);assert.equal(JSON.stringify(report).includes('transcript'),false);
 await page.reload();await page.locator('[data-lesson]').first().waitFor();await clickNav('progress');assert.ok(await page.getByText('1 of 36 lessons explored',{exact:false}).count());
 await page.locator('#learner').selectOption('2');assert.ok(await page.getByText('0 of 36 lessons explored',{exact:false}).count());await page.reload();await page.locator('#learner').waitFor();assert.equal(await page.locator('#learner').inputValue(),'2');await clickNav('progress');await page.locator('#learner').selectOption('1');
 await clickNav('library');assert.equal(await page.locator('[data-chat]').count(),12);assert.equal(await page.locator('[data-story]').count(),6);await page.locator('[data-chat]').last().click();assert.equal(await finishActivity(),4);
 await clickNav('library');await page.locator('[data-story]').last().click();await page.locator('[data-story-quiz]').click();assert.equal(await finishActivity(),3);
 await clickNav('library');await page.locator('[data-checkpoint]').first().click();assert.equal(await finishActivity(),12);
 await clickNav('phrasebook');await page.locator('#word-search').fill('école');assert.ok((await page.locator('.fr-word').count())>=1);await page.locator('#word-search').fill('zzzzzz');assert.equal(await page.locator('.fr-word').count(),0);await page.locator('#word-search').fill('bonjour');await page.locator('[data-studio-phrase]').first().click();
 assert.equal(await page.locator('#record').isDisabled(),true);assert.equal(await page.locator('#recognize').isDisabled(),true);assert.equal(await page.locator('#recording').isVisible(),false);await page.locator('#studio-select').selectOption('merci');await page.locator('[data-say]').first().click();await page.waitForTimeout(1400);assert.ok((await page.locator('#audio-status').textContent()).length>0);
 for(const view of ['home','library','phrasebook','studio','progress']){await page.setViewportSize({width:320,height:740});await clickNav(view);await overflow();}
 await page.locator('#print').waitFor();await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.equal(await page.locator('details:not([open])').count(),0);await page.pdf({path:'work/french-family-report.pdf',format:'A4'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.ok(await page.locator('details:not([open])').count());
 page.once('dialog',d=>d.accept());await page.locator('#delete-progress').click();assert.ok(await page.getByText('0 of 36 lessons explored',{exact:false}).count());
 await page.goto(base+'/account.html');await page.getByRole('heading',{name:'Sign in or create an account',exact:true}).waitFor();assert.equal(await page.locator('a[href*="signin-setup"]').count(),0);
 const missing=await page.request.get(base+'/signin-setup.html');assert.equal(missing.status(),404);
 await page.goto(base+'/');await page.locator('[data-french]').waitFor();await page.locator('[data-french]').click();await page.locator('#french').waitFor();
 assert.deepEqual(errors,[]);console.log('PASS French mobile journey, activity/retry/skip, storage/learner isolation, conversations/stories/checkpoints, search/studio gates, export/print/delete, owner-page removal and home integration.');
}finally{await browser.close();}
