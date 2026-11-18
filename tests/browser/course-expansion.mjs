import assert from 'node:assert/strict';
const {chromium}=await import('../../work/browser-check/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
try {
 const page=await browser.newPage({viewport:{width:320,height:740}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto((process.env.FR_BASE||'http://127.0.0.1:5188')+'/french.html');
 await page.locator('.journey-chapter').last().locator('summary').click();
 await page.locator('[data-cards="project-update"]').click();
 assert.ok(await page.locator('svg[role="img"]').count());
 await page.locator('#flip-card').click();
 await page.reload();
 await page.locator('#resume-activity').click();
 assert.equal(await page.locator('[data-rate-card]').count(),2);
 await page.locator('#pause-activity').click();
 await page.locator('nav [data-view="library"]').click();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('[data-chat]').last().click();
 // Replacing the paused flashcards may require an explicit confirmation.
 const confirm=page.getByRole('button',{name:/Start new activity/});
 if(await confirm.count())await confirm.click();
 await page.locator('.conversation-scene').waitFor();
 const scene=await page.locator('.conversation-scene').textContent();
 assert.ok(scene.length>30);
 await page.reload();
 await page.locator('#resume-activity').click();
 assert.equal(await page.locator('.conversation-scene').textContent(),scene);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 console.log('PASS expanded French cards, resume, conversation context and 320px layout.');
} finally {await browser.close();}
