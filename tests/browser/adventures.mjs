import assert from 'node:assert/strict';
import {chromium} from '../../work/browser-check/node_modules/playwright/index.mjs';
import {storageKey, periodKey} from '../../public/adventure-engine.js';

const base = process.env.FR_BASE || 'http://127.0.0.1:5188';
const account = '11111111-1111-4111-8111-111111111111';
const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const baseTime = new Date(2026, 10, 16, 12);
const auth = `
  let listener;
  export const service = {
    async user() {
      const id = sessionStorage.getItem('adventure-test-account');
      if (sessionStorage.getItem('adventure-test-delay')) {
        await new Promise(resolve => { window.resolveAdventureAuth = resolve; });
      }
      return id ? {id} : null;
    },
    async signOut() {
      sessionStorage.removeItem('adventure-test-account');
      listener?.();
    }
  };
  export const onAccountChange = fn => {
    listener = fn;
    window.adventureAuthChanged = fn;
  };
`;

async function makeContext(blocked = false) {
  const context = await browser.newContext({viewport:{width:320, height:740}});
  await context.addInitScript(blocked => {
    localStorage.setItem('reasonlab-usage-optout', 'true');
    if (blocked) {
      for (const name of ['getItem', 'setItem']) {
        Storage.prototype[name] = () => { throw new Error('Storage blocked in this test'); };
      }
    }
  }, blocked);
  await context.route('**/auth-client.js', route => route.fulfill({contentType:'text/javascript', body:auth}));
  return context;
}

const records = (page, user = null, slot = 1) => page.evaluate(
  key => JSON.parse(localStorage.getItem(key) || '[]'), storageKey(user, slot)
);
const next = page => page.locator('#adv-next').click();
const firstAnswer = page => page.locator('.adv-option').first();
const goMap = page => page.locator('header #adventure-map').click();
const goProgress = page => page.locator('header #adventure-progress').click();
const pickJourney = (page, id) => page.locator('[data-journey="' + id + '"]').click();
const beginPractice = async (page, area) => {
  await pickJourney(page, area);
  await page.getByText('Try this', {exact:true}).waitFor();
  await page.getByRole('heading', {name:'Let’s solve one together'}).waitFor();
  await page.locator('#adv-practice').click();
};

async function finishAnswers(page, count, weekly = false) {
  for (let i = 0; i < count; i += 1) {
    if (await page.locator('#adv-ready').count()) {
      await page.locator('#adv-ready').click();
      assert.equal(await page.locator('.adv-option').count(), 0);
      await page.clock.runFor(6500);
    }
    await firstAnswer(page).click();
    if (weekly) assert.match(await page.locator('#adv-answer-status').innerText(), /review it at the end/);
    assert.equal(await page.locator('.adv-option:not([disabled])').count(), 0);
    await next(page);
  }
}

async function noOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 320);
}

try {
  const context = await makeContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install({time:baseTime});
  await page.goto(base + '/adventures.html');
  await page.locator('#adv-daily').waitFor();
  assert.equal(await page.locator('.adv-journey').count(), 4);
  assert.equal(await page.locator('#adv-level').inputValue(), '1');
  await page.locator('#adv-grade').selectOption('6');
  assert.equal(await page.locator('#adv-level').inputValue(), '2');
  await page.locator('#adv-grade').selectOption('10');
  assert.equal(await page.locator('#adv-level').inputValue(), '3');
  await page.locator('#adv-grade').selectOption('3');
  await noOverflow(page);
  await page.screenshot({path:'work/adventures-map-320.png', fullPage:true});

  await beginPractice(page, 'patterns');
  await page.locator('#adv-hint').click();
  await page.locator('#adv-hint-text').waitFor();
  await firstAnswer(page).click();
  assert.equal(await page.locator('.adv-option[data-selected]').count(), 1);
  assert.equal(await page.locator('.adv-option:disabled').count(), 4);
  assert.match(await page.locator('#adv-answer-status').innerText(), /Answer:/);
  assert.equal((await records(page)).length, 0);
  await goMap(page);
  await page.locator('dialog[open]').waitFor();
  await page.locator('#adventure-cancel').click();
  await page.locator('.adv-option[data-selected]').waitFor();
  await next(page);
  await finishAnswers(page, 5);
  let saved = await records(page);
  assert.equal(saved[0].assisted, 1);
  assert.deepEqual(Object.keys(saved[0].domains).sort(), ['logic','memory','patterns','visual']);

  await goMap(page);
  await beginPractice(page, 'memory');
  await page.locator('#adv-ready').click();
  assert.equal(await page.locator('.adv-option').count(), 0);
  await page.clock.runFor(2500);
  await page.locator('#adv-stimulus').waitFor();
  await page.clock.runFor(3500);
  assert.equal(await page.locator('#adv-stimulus').count(), 0);
  assert.equal(await page.locator('.adv-option').count(), 4);
  await firstAnswer(page).click();
  await next(page);
  await page.locator('#adv-ready').click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {configurable:true, value:true});
    document.dispatchEvent(new Event('visibilitychange'));
    delete document.hidden;
  });
  assert.equal(await page.locator('#adv-stimulus').count(), 0);
  await page.getByText(/clue was interrupted/).waitFor();
  await firstAnswer(page).click();
  await next(page);
  await page.locator('#adv-ready').click();
  await page.clock.fastForward(30000);
  await page.getByText(/clue was interrupted/).waitFor();
  await firstAnswer(page).click();
  await next(page);
  await page.locator('#adv-ready').click();
  await goMap(page);
  await page.locator('#adventure-cancel').click();
  await page.getByText(/clue was interrupted/).waitFor();
  assert.equal(await page.locator('#adv-ready').count(), 0);
  await firstAnswer(page).click();
  await next(page);
  await finishAnswers(page, 2);
  saved = await records(page);
  assert.equal(saved[0].interrupted, 3);

  await goMap(page);
  await page.locator('#adv-daily').click();
  await page.getByText('Puzzle 1 of 5').waitFor();
  await goMap(page);
  await page.locator('#adventure-confirm-action').click();
  assert.equal((await records(page)).length, 2);

  await page.locator('#adv-weekly').click();
  await page.locator('#adv-start-weekly').click();
  await page.getByText('Puzzle 1 of 12').waitFor();
  await finishAnswers(page, 12, true);
  await page.getByText(/can count toward independent progress/).waitFor();
  assert.equal((await records(page))[0].period, periodKey('weekly', baseTime));
  await goProgress(page);
  await page.getByText('1 qualifying week · 3 puzzles').first().waitFor();
  assert.equal(await page.getByText('More evidence needed', {exact:true}).count(), 4);
  await goMap(page);
  await page.locator('#adv-weekly').click();
  assert.equal(await page.locator('#adv-start-weekly').count(), 0);
  await page.getByText(/finished this week/).waitFor();

  await page.clock.setSystemTime(new Date(2026, 10, 23, 12));
  await goMap(page);
  await page.locator('#adv-weekly').click();
  await page.locator('#adv-start-weekly').click();
  await finishAnswers(page, 12, true);
  await goProgress(page);
  assert.equal(await page.getByText('2 qualifying weeks · 6 puzzles').count(), 4);
  assert.equal(await page.getByText(/% correct \(/).count(), 4);
  await noOverflow(page);
  await page.screenshot({path:'work/adventures-progress-320.png', fullPage:true});

  await goMap(page);
  await page.locator('#adv-level').selectOption('2');
  await page.locator('#adv-weekly').click();
  await page.locator('#adv-start-weekly').click();
  if (await page.locator('#adv-ready').count()) {
    await page.locator('#adv-ready').click();
    await page.clock.runFor(6500);
  }
  await page.locator('#adv-hint').click();
  await finishAnswers(page, 12, true);
  await page.getByText(/This check-in gives you practice/).waitFor();
  await goProgress(page);
  assert.equal(await page.getByText('0 qualifying weeks · 0 puzzles').count(), 4);

  await goMap(page);
  await page.locator('#adv-slot').selectOption('2');
  await goProgress(page);
  await page.getByText(/0 completed adventures/).waitFor();
  await goMap(page);
  await beginPractice(page, 'patterns');
  await finishAnswers(page, 6);
  assert.equal((await records(page, null, 2)).length, 1);
  assert.equal((await records(page)).length, 5);
  await goProgress(page);
  await page.locator('#adv-clear').click();
  await page.locator('#adventure-confirm-action').click();
  assert.equal((await records(page, null, 2)).length, 0);
  assert.equal((await records(page)).length, 5);

  await page.evaluate(id => {
    sessionStorage.setItem('adventure-test-account', id);
    sessionStorage.setItem('adventure-test-delay', '1');
    window.adventureAuthChanged();
  }, account);
  await page.waitForFunction(() => typeof window.resolveAdventureAuth === 'function');
  assert.equal(await page.locator('#adventure-map').isDisabled(), true);
  await page.evaluate(() => {
    sessionStorage.removeItem('adventure-test-delay');
    window.resolveAdventureAuth();
  });
  await page.locator('#adv-slot').waitFor();
  assert.equal(await page.locator('#adv-slot').inputValue(), '1');
  await beginPractice(page, 'patterns');
  await firstAnswer(page).click();
  await page.evaluate(() => window.adventureAuthChanged());
  await page.clock.runFor(10);
  await page.locator('.adv-option[data-selected]').waitFor();
  await next(page);
  await finishAnswers(page, 5);
  assert.equal((await records(page, account)).length, 1);
  assert.equal((await records(page)).length, 5);
  await goMap(page);
  await beginPractice(page, 'memory');
  await page.locator('#adv-ready').click();
  await page.evaluate(() => {
    sessionStorage.removeItem('adventure-test-account');
    window.adventureAuthChanged();
  });
  await page.locator('#adv-slot').waitFor();
  assert.equal(await page.locator('#adv-slot').inputValue(), '2');
  assert.equal(await page.locator('#adv-stimulus').count(), 0);
  assert.equal((await records(page, account)).length, 1);
  assert.deepEqual(errors, []);
  await context.close();

  const blocked = await makeContext(true);
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base + '/adventures.html');
  await blockedPage.locator('#adventure-save-status').waitFor();
  await beginPractice(blockedPage, 'logic');
  await finishAnswers(blockedPage, 6);
  await goProgress(blockedPage);
  await blockedPage.getByText(/1 completed adventure for/).waitFor();
  await blockedPage.locator('#adventure-save-status').waitFor();
  await blocked.close();
  console.log('PASS Adventures at 320px: grade defaults, first answers, hints, normal/hidden/delayed/leave memory, weekly evidence and replays, discard, learner/account isolation, same-account refresh and blocked storage.');
} finally {
  await browser.close();
}
