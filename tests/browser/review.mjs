import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';
import {catalog, reviewKey} from '../../public/review-core.js';

const {chromium} = await import('../../work/browser-check/node_modules/playwright/index.mjs');
const staticAssets = process.env.REVIEW_STATIC === '1' && !process.env.FR_BASE;
const base = process.env.FR_BASE || (staticAssets ? 'http://reasonlab.test' : 'http://127.0.0.1:5188');
const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const adult = '11111111-1111-4111-8111-111111111111';

try {
  const context = await browser.newContext({viewport: {width: 320, height: 740}});
  await context.addInitScript(() => {
    localStorage.setItem('reasonlab-usage-optout', 'true');
    window.played = [];
    Object.defineProperty(window, 'speechSynthesis', {value: {
      getVoices: () => window.reviewVoices ?? [{lang: 'en-US'}],
      speak: utterance => window.played.push({text: utterance.text, lang: utterance.lang}),
      cancel() {},
      addEventListener() {},
    }});
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: class {
      constructor(text) { this.text = text; }
    }});
  });
  if (staticAssets) {
    const types = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'};
    await context.route(base + '/**', async route => {
      const path = new URL(route.request().url()).pathname;
      const resource = new URL('../../public' + path, import.meta.url);
      try {
        await route.fulfill({contentType: types[extname(path)], body: await readFile(resource)});
      } catch {
        await route.fulfill({status: 404, body: 'Not found'});
      }
    });
  }
  await context.route('**/auth-client.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: `
      export const service = {
        async user() {
          if (sessionStorage.getItem('delay')) await new Promise(resolve => window.releaseAccount = resolve);
          const id = sessionStorage.getItem('account');
          return id ? {id} : null;
        },
      };
      export const onAccountChange = listener => {window.accountChanged = listener;};
    `,
  }));
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
  const word = page.locator('.review-word');
  const ready = () => word.waitFor();
  const reveal = () => page.getByRole('button', {name: 'Reveal English'}).click();
  const choose = (name = 'Remembered') => page.getByRole('button', {name, exact: true}).click();
  const taFirst = catalog('ta')[0];
  await page.goto(base + '/tamil.html?learner=2');
  const courseLink = page.getByRole('link', {name: 'Review Tamil words'});
  assert.equal(await courseLink.getAttribute('href'), '/review.html?lang=ta&learner=2');
  await courseLink.click();
  await ready();
  assert.equal(await word.textContent(), taFirst.text);
  assert.equal(await page.locator('#review-learner').inputValue(), '2');
  await page.getByRole('button', {name: 'Listen', exact: true}).click();
  assert.match(await page.locator('#review-audio').textContent(), /Tamil voice is unavailable/);
  assert.deepEqual(await page.evaluate(() => played), []);
  await page.evaluate(() => window.reviewVoices = [{lang: 'en-US'}, {lang: 'ta-IN'}]);
  await page.getByRole('button', {name: 'Listen', exact: true}).click();
  assert.deepEqual(await page.evaluate(() => played), [{text: taFirst.text, lang: 'ta-IN'}]);
  assert.equal(await page.getByRole('heading', {name: taFirst.meaning}).count(), 0);
  await reveal();
  assert.equal(await page.locator('#review-meaning').textContent(), taFirst.meaning);
  assert.equal(await page.locator('#review-meaning').evaluate(element => element === document.activeElement), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({path: 'work/review-tamil-mobile.png', fullPage: true});
  await choose('Still learning');
  await page.reload();
  await ready();
  assert.notEqual(await word.textContent(), taFirst.text);
  assert.match(await page.locator('.review-meta').textContent(), /Card 2 of 5/);
  const guestStorage = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), reviewKey(null, 'ta', 2));
  assert.deepEqual(Object.keys(guestStorage.cards), [taFirst.id]);
  assert.equal(guestStorage.cards[taFirst.id].lapses, 1);

  await page.locator('#review-learner').selectOption('3');
  assert.equal(await word.textContent(), taFirst.text);
  await page.locator('#review-learner').selectOption('2');
  assert.notEqual(await word.textContent(), taFirst.text);
  await page.locator('#review-language').selectOption('kn');
  assert.equal(await word.textContent(), catalog('kn')[0].text);
  assert.equal(await page.locator('#course-link').getAttribute('href'), '/kannada.html?learner=2');

  await page.evaluate(id => {
    sessionStorage.setItem('account', id);
    sessionStorage.setItem('delay', '1');
    accountChanged('SIGNED_IN');
  }, adult);
  await page.waitForFunction(() => typeof window.releaseAccount === 'function');
  assert.equal(await page.locator('#review-deck').isVisible(), false);
  await page.evaluate(() => { sessionStorage.removeItem('delay'); releaseAccount(); });
  await ready();
  await page.locator('#review-language').selectOption('ta');
  assert.equal(await word.textContent(), taFirst.text);
  for (let i = 0; i < 5; i++) {
    await reveal();
    await choose();
  }
  await page.getByRole('heading', {name: 'You’re done for today!'}).waitFor();
  assert.match(await page.locator('#review-deck').textContent(), /Next review/);
  await page.reload();
  await page.getByRole('heading', {name: 'You’re done for today!'}).waitFor();
  const signedStorage = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), reviewKey(adult, 'ta', 2));
  assert.equal(Object.keys(signedStorage.cards).length, 5);
  assert.equal(signedStorage.cards[taFirst.id].lapses, 0);
  assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), reviewKey(null, 'ta', 2)), guestStorage);

  await page.goto(base + '/french.html?learner=3');
  assert.equal(await page.getByRole('link', {name: 'Review French words'}).getAttribute('href'), '/review.html?lang=fr&learner=3');
  await page.getByRole('link', {name: 'Review French words'}).click();
  await ready();
  await reveal();
  assert.ok(await page.locator('.review-art svg').count());
  await page.screenshot({path: 'work/review-french-mobile.png', fullPage: true});
  for (const theme of ['unicorn', 'racing', 'fairytale', 'space', 'ocean', 'classic']) {
    await page.locator('#learning-theme').selectOption(theme);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await page.getByRole('button', {name: 'Remembered'}).isVisible(), true);
  }
  assert.deepEqual(errors, []);
  console.log('Mobile vocabulary review passed for course links, optional audio, reload, learner scope and verified accounts.');
} finally {
  await browser.close();
}
