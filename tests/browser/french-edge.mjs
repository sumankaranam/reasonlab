const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'../../work/browser-check/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
const base=process.env.FR_BASE||'http://127.0.0.1:5188';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:390,height:844}});
await context.addInitScript(()=>{window.__spoken=[];window.__micRequests=0;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'fr-FR',name:'Test French'}],cancel(){},speak(u){window.__spoken.push(u.text);setTimeout(()=>u.onend?.(),0);}}});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia(){window.__micRequests++;return Promise.reject(new DOMException('Test denial','NotAllowedError'));}}});window.MediaRecorder=class{};});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base+'/french.html');await page.locator('[data-lesson="sound-hello"]').waitFor();
 const tasks=await page.evaluate(async()=>{const{lessons}=await import('/french-data.js');const{makeExercises}=await import('/french-engine.js');return makeExercises(lessons.find(l=>l.id==='sound-hello'),lessons,1,'mixed');});
 await page.locator('[data-lesson="sound-hello"]').click();await page.locator('[data-mode="mixed"]').click();
 for(let i=0;i<tasks.length;i++){
  const q=tasks[i];if(q.skill==='listening'){await page.locator('[data-say]').first().click();if(i===1)await page.locator('#reveal-listening').click();}
  if(q.kind==='choice'){
   if(i===0){const wrong=page.locator('[data-answer]').filter({hasNotText:q.answer}).first();await wrong.click();await page.locator('#retry').click();}
   await page.getByRole('button',{name:q.answer,exact:true}).click();
  }else if(q.kind==='type'){await page.locator('#typed-answer').fill(q.answer);await page.locator('#answer-form [type="submit"]').click();}
  else{for(const token of q.answer.split(' ')){await page.locator('[data-token]:not([disabled])').filter({hasText:new RegExp('^'+token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first().click();}await page.locator('#answer-form [type="submit"]').click();}
  await page.locator('#next-question').click();
 }
 assert.equal(await page.locator('.fr-score').textContent(),`${tasks.length-2}/${tasks.length}`);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('reasonlab-french:learner-1')));assert.equal(saved.history[0].assisted,1);assert.equal(saved.lessons['sound-hello'].attempts,1);
 await page.locator('nav [data-view="studio"]').click();assert.equal(await page.evaluate(()=>window.__micRequests),0);
 await page.locator('#mic-adult').check();await page.locator('#record').click();await page.getByText('Microphone access was not granted.',{exact:false}).waitFor();assert.equal(await page.evaluate(()=>window.__micRequests),1);
 await page.locator('#studio-select').selectOption('merci');await page.locator('[data-say]').first().click();assert.ok((await page.evaluate(()=>window.__spoken)).includes('merci'));
 await page.locator('nav [data-view="home"]').click();await page.locator('[data-lesson="sound-hello"]').click();await page.locator('[data-mode="mixed"]').click();await page.locator('nav [data-view="library"]').click();await page.locator('#leave').click();assert.equal(await page.locator('[data-chat]').count(),12);
 await page.goto(base+'/');await page.locator('[data-setup="daily"]').click();await page.locator('#begin').click();await page.locator('#french-link').click();await page.locator('#leave').waitFor({state:'visible'});await page.locator('#discard').click();await page.locator('#french').waitFor();
 assert.deepEqual(errors,[]);
 const blocked=await browser.newContext({viewport:{width:320,height:740}});await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});const p=await blocked.newPage();await p.goto(base+'/french.html');await p.getByText('Browser storage is unavailable or full.',{exact:false}).waitFor();await p.locator('[data-lesson]').first().click();assert.ok(await p.getByText('Meet the words',{exact:true}).count());await blocked.close();
 console.log('PASS correct answers, first-attempt retry preservation, listening-help exclusion, token building, typed accents, mic gates/denial, audio reuse, unfinished guards, Kids exit, blocked storage. Audio hardware was simulated.');
}finally{await browser.close();}
