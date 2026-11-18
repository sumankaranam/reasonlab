import assert from 'node:assert/strict';
import {progressKeys} from '../../public/auth-core.js';
import {profileKey} from '../../public/child-profiles.js';
import {storageKey} from '../../public/indic-engine.js';
import {catalog, recordReview, reviewKey} from '../../public/review-core.js';

const {chromium} = await import('../../work/browser-check/node_modules/playwright/index.mjs');
const base = process.env.FR_BASE || 'http://127.0.0.1:5188';
const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const adult = '11111111-1111-4111-8111-111111111111';
const fixtures = {
  [progressKeys(null).settings]: {profile: 1, grade: 5},
  [progressKeys(adult).settings]: {profile: 2},
  [profileKey(adult)]: {2: {name: '<b>Sunny</b>', avatar: 'sunny'}},
  [storageKey('ta', null, 3)]: {version: 1, completed: {'ta-hello': 100}},
  [reviewKey(null, 'ta', 3)]: recordReview(null, 'ta', catalog('ta')[0].id, 'good', Date.now() - 2 * 86_400_000),
};

try {
  const context = await browser.newContext({viewport: {width: 320, height: 844}});
  await context.addInitScript(entries => {
    if (location.origin === 'null') return;
    localStorage.setItem('reasonlab-usage-optout', 'true');
    for (const [key, value] of Object.entries(entries)) {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(value));
    }
  }, fixtures);
  await context.route('**/auth-client.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: `
      export const service = {user: async () => {
        const id = sessionStorage.getItem('fake-account');
        return id ? {id} : null;
      }};
      export const onAccountChange = listener => {window.fakeAccountChanged = listener};
    `,
  }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/');
  await page.locator('#explore-guest').click();
  await page.getByRole('heading', {name: 'My Learning Today'}).waitFor();
  assert.equal(await page.locator('.path-grid .path-card').count(), 3);
  assert.equal(await page.locator('.today-plants .grown').count(), 0);
  const learner = page.getByLabel('Learner', {exact: true});
  await learner.selectOption('3');
  await page.locator('.today-next').getByRole('heading', {name: 'Review Tamil words'}).waitFor();
  assert.equal(await page.locator('.today-plants .grown').count(), 1);
  assert.equal(await page.locator('.today-next a').getAttribute('href'), '/review.html?lang=ta&learner=3');
  assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).grade, progressKeys(null).settings), 5);
  for (const theme of ['classic', 'unicorn', 'racing', 'fairytale', 'space', 'ocean']) {
    await page.locator('#learning-theme').selectOption(theme);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, theme);
  }
  await page.getByRole('link', {name: 'Continue Tamil'}).click();
  await page.waitForURL(/\/tamil(?:\.html)?\?learner=3$/);
  await page.getByText('1 of 12 lessons', {exact: false}).first().waitFor();
  await page.goto(base + '/#languages');
  await page.locator('.language-grid').waitFor();
  assert.equal(await page.locator('.language-path a[href="/tamil.html?learner=3"]').count(), 1);
  await page.evaluate(id => sessionStorage.setItem('fake-account', id), adult);
  await page.goto(base + '/#explore');
  await page.reload();
  await page.getByText('YOUR LEARNING HOME', {exact: true}).waitFor();
  assert.equal(await learner.inputValue(), '2');
  assert.match(await page.locator('.today-heading p').textContent(), /<b>Sunny<\/b>/);
  assert.equal(await page.locator('.today-heading p b').count(), 0);
  assert.equal(await page.locator('.today-plants .grown').count(), 0);
  await page.screenshot({path:'work/my-learning-today-320.png',fullPage:true});
  assert.deepEqual(errors, []);
  console.log('PASS Today guest and mocked account isolation, due review, course slot links and six themes at 320px.');
} finally {
  await browser.close();
}
