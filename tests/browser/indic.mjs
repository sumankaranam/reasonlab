import assert from 'node:assert/strict';
import {courses} from '../../public/indic-data.js';
import {storageKey} from '../../public/indic-engine.js';
const {chromium} = await import('../../work/browser-check/node_modules/playwright/index.mjs');
const base = process.env.FR_BASE || 'http://127.0.0.1:5188';
const browser = await chromium.launch({headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const account = '11111111-1111-4111-8111-111111111111';
const ownerTwo = '22222222-2222-4222-8222-222222222222';

try {
  const context = await browser.newContext({viewport: {width: 320, height: 740}});
  await context.addInitScript(() => {
    localStorage.setItem('reasonlab-usage-optout', 'true');
    window.played = [];
    Object.defineProperty(window, 'speechSynthesis', {value: {
      getVoices: () => [{lang: 'en-US'}],
      addEventListener() {},
      speak: utterance => window.played.push(utterance.text),
      cancel() {}
    }});
  });
  await context.route('**/auth-client.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: `
      let callback;
      export const service = {
        async user() {
          const id = sessionStorage.getItem('test-account');
          if (sessionStorage.getItem('test-delayed')) await new Promise(resolve => window.resolveTestAccount = resolve);
          return id ? {id} : null;
        },
        async signOut() { sessionStorage.removeItem('test-account'); callback?.(); }
      };
      export const onAccountChange = listener => { callback = listener; window.testAccountChanged = listener; };
    `
  }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const heading = name => page.getByRole('heading', {name, exact: true});
  const lessonButton = id => page.locator(`.lesson-row[data-lesson="${id}"]`);
  const answers = page.locator('[data-answer]');
  const openQuiz = async lesson => {
    await lessonButton(lesson.id).click();
    await page.locator('[data-mode="quiz"]').click();
  };
  const takeQuiz = async (lesson, misses = 0, start = 0) => {
    for (let index = start; index < lesson.words.length; index++) {
      const choice = index < misses
        ? page.locator(`[data-answer]:not([data-answer="${index}"])`).first()
        : page.locator(`[data-answer="${index}"]`);
      await choice.click();
      await page.locator('#next').click();
    }
  };

  const tamil = courses.ta.lessons[0];
  await page.goto(base + '/tamil.html');
  await heading('Learn Tamil').waitFor();
  assert.equal(await page.locator('.lesson-row').count(), 12);
  assert.equal(await page.locator('.indic-stage').count(), 3);
  await page.screenshot({path: 'work/tamil-path-mobile.png', fullPage: true});
  assert.equal(await page.getByText(/Badge earned/).count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  await lessonButton(tamil.id).click();
  await page.locator('[data-mode="cards"]').click();
  assert.equal(await page.locator('.word-script').textContent(), tamil.words[0].text);
  await page.locator('#listen').click();
  assert.match(await page.locator('#audio-status').textContent(), /No Tamil voice/);
  assert.deepEqual(await page.evaluate(() => window.played), []);
  await page.locator('#next').click();
  await page.reload();
  await page.locator('#resume').click();
  assert.equal(await page.locator('.word-script').textContent(), tamil.words[1].text);
  await page.locator('#back-lesson').click();
  await page.locator('#leave').click();
  await page.locator('[data-mode="quiz"]').click();
  await heading('Start a different activity?').waitFor();
  await page.locator('#stay').click();
  await page.locator('[data-mode="cards"]').click();
  assert.equal(await page.locator('.word-script').textContent(), tamil.words[1].text);
  await page.locator('#back-lesson').click();
  await page.locator('#leave').click();
  await page.locator('[data-mode="quiz"]').click();
  await page.locator('#leave').click();
  assert.equal(await page.locator('#next').isDisabled(), true);
  await page.locator('[data-answer="1"]').click();
  assert.equal(await answers.filter({visible: true}).count(), 4);
  for (const option of await answers.all()) assert.equal(await option.isDisabled(), true);
  assert.match(await page.locator('#quiz-feedback').textContent(), /meaning is/);
  await page.reload();
  await page.locator('#resume').click();
  assert.match(await page.locator('#quiz-feedback').textContent(), /meaning is/);
  await page.locator('#next').click();
  await takeQuiz(tamil, 0, 1);
  await heading('Quiz score · 75%').waitFor();
  await page.locator('#result-path').click();
  await page.getByText('1 of 12 lessons complete').waitFor();
  assert.equal(await page.getByText(/Badge earned/).count(), 0);

  for (const lesson of courses.ta.lessons.filter(lesson => lesson.stage === tamil.stage).slice(1)) {
    await openQuiz(lesson);
    await takeQuiz(lesson);
    await heading('Quiz score · 100%').waitFor();
    await page.locator('#result-path').click();
  }
  await page.getByText(/Badge earned/).waitFor();

  await page.goto(base + '/kannada.html');
  await heading('Learn Kannada').waitFor();
  await page.screenshot({path: 'work/kannada-path-mobile.png', fullPage: true});
  await page.getByText('0 of 24 lessons complete').waitFor();
  assert.equal(await page.locator('.lesson-row').count(), 24);
  assert.equal(await page.locator('.indic-stage').count(), 6);
  const kannada = courses.kn.lessons[0];
  await openQuiz(kannada);
  await takeQuiz(kannada, 2);
  await heading('Quiz score · 50%').waitFor();
  await page.locator('#result-path').click();
  await page.getByText('0 of 24 lessons complete').waitFor();
  await lessonButton(kannada.id).click();
  await page.locator('[data-mode="dialogue"]').click();
  assert.equal(await page.locator('.word-script').textContent(), kannada.dialogue[0].text);
  await page.locator('#next').click();
  await page.locator('header a[data-hub]').click();
  await page.locator('#exit[open]').waitFor();
  await page.locator('#stay').click();
  assert.equal(await page.locator('.word-script').textContent(), kannada.dialogue[1].text);

  await page.goto(base + '/kannada.html');
  const expanded = courses.kn.lessons.at(-1);
  await openQuiz(expanded);
  await page.getByRole('button', {name: 'Start new activity', exact: true}).click();
  await takeQuiz(expanded);
  await heading('Quiz score · 100%').waitFor();
  await page.locator('#result-path').click();
  await page.reload();
  await page.getByText('1 of 24 lessons complete').waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  await page.evaluate(id => {
    sessionStorage.setItem('test-account', id);
    sessionStorage.setItem('test-delayed', 'yes');
  }, account);
  const guestKey = storageKey('ta', null, 1);
  const guestBefore = await page.evaluate(key => localStorage.getItem(key), guestKey);
  await page.goto(base + '/tamil.html');
  await page.waitForFunction(() => typeof window.resolveTestAccount === 'function');
  assert.equal(await page.locator('.lesson-row').count(), 0);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), guestKey), guestBefore);
  await page.evaluate(() => {
    sessionStorage.removeItem('test-delayed');
    window.resolveTestAccount();
  });
  await page.getByText('0 of 12 lessons complete').waitFor();
  assert.equal(await page.locator('#child-signout').count(), 1);

  await lessonButton(tamil.id).click();
  await page.locator('[data-mode="cards"]').click();
  await page.locator('#next').click();
  await page.locator('#course-path').click();
  await page.locator('#leave').click();
  await page.locator('#learner-slot').selectOption('2');
  assert.equal(await page.locator('#resume').count(), 0);
  await page.locator('#learner-slot').selectOption('1');
  await page.locator('#resume').click();
  assert.equal(await page.locator('.word-script').textContent(), tamil.words[1].text);
  await page.evaluate(id => {
    sessionStorage.setItem('test-account', id);
    window.testAccountChanged();
  }, ownerTwo);
  await heading('Learn Tamil').waitFor();
  assert.equal(await page.locator('#resume').count(), 0);
  await page.screenshot({path: 'work/indic-signed-in-mobile.png', fullPage: true});
  assert.deepEqual(errors, []);
  console.log('PASS Tamil and Kannada mobile lessons, quiz feedback and scores, badges, pause/replace/resume, no-voice fallback, learner slots and mocked account isolation.');
} finally {
  await browser.close();
}


