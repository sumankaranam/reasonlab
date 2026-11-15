import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrenchAudio } from '../public/french-audio.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fakeTimers() {
  let nextId = 1;
  const jobs = new Map();
  return {
    jobs,
    setTimeout(fn, delay) { const id = nextId++; jobs.set(id, { fn, delay }); return id; },
    clearTimeout(id) { jobs.delete(id); },
    fire(delay) {
      const due = [...jobs.entries()].filter(([, job]) => job.delay === delay);
      for (const [id, job] of due) { jobs.delete(id); job.fn(); }
    }
  };
}

function makeEnvironment(overrides = {}) {
  const revoked = [];
  const created = [];
  const env = {
    URL: {
      createObjectURL(blob) { const url = `blob:test-${created.length + 1}`; created.push({ url, blob }); return url; },
      revokeObjectURL(url) { revoked.push(url); }
    },
    Blob,
    setTimeout,
    clearTimeout,
    ...overrides
  };
  return { env, revoked, created };
}

test('speech uses a French voice, clips long text and applies requested pace', async () => {
  const utterances = [];
  let cancelCount = 0;
  const french = { lang: 'fr-FR' };
  class Utterance { constructor(text) { this.text = text; utterances.push(this); } }
  const { env } = makeEnvironment({
    speechSynthesis: {
      getVoices: () => [{ lang: 'en-US' }, french],
      cancel: () => { cancelCount++; },
      speak: (utterance) => { utterance.started = true; }
    },
    SpeechSynthesisUtterance: Utterance
  });
  const audio = createFrenchAudio({ environment: env });

  await audio.speak('bonjour'.repeat(600), true);
  assert.equal(utterances.length, 1);
  assert.equal(utterances[0].text.length, 3000);
  assert.equal(utterances[0].lang, 'fr-FR');
  assert.equal(utterances[0].voice, french);
  assert.equal(utterances[0].rate, 0.65);
  assert.equal(cancelCount, 1);

  await audio.speak('salut');
  assert.equal(utterances[1].rate, 0.85);
  assert.equal(audio.capabilities().frenchVoice, true);
  audio.destroy();
});

test('never uses an English fallback when no French voice is available', async () => {
  const messages = [];
  let spoke = false;
  class Utterance {}
  const { env } = makeEnvironment({
    speechSynthesis: { getVoices: () => [{ lang: 'en-US' }], cancel() {}, speak() { spoke = true; } },
    SpeechSynthesisUtterance: Utterance
  });
  const audio = createFrenchAudio({ environment: env, onStatus: (message) => messages.push(message) });
  await audio.speak('Bonjour');
  assert.equal(spoke, false);
  assert.match(messages.at(-1), /French voice is not available/i);
  audio.destroy();
});

test('permission denial reports a helpful status without retaining media', async () => {
  const messages = [];
  const { env } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: async () => { throw new Error('denied'); } } },
    MediaRecorder: class {}
  });
  const audio = createFrenchAudio({ environment: env, onStatus: (message) => messages.push(message) });
  await audio.record();
  assert.match(messages.at(-1), /Microphone access was not granted/i);
  assert.equal(audio.capabilities().recording, true);
  audio.destroy();
});

test('stopping during a pending microphone request stops any late stream tracks', async () => {
  const request = deferred();
  let trackStops = 0;
  let recorderStarts = 0;
  const stream = { getTracks: () => [{ stop() { trackStops++; } }] };
  const { env } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: () => request.promise } },
    MediaRecorder: class { start() { recorderStarts++; } }
  });
  const audio = createFrenchAudio({ environment: env });
  const pending = audio.record();
  audio.stop();
  request.resolve(stream);
  await pending;
  assert.equal(trackStops, 1);
  assert.equal(recorderStarts, 0);
  audio.destroy();
});

test('recording creates a local playback URL and revokes it on the next recording and destroy', async () => {
  const tracks = [];
  const recorders = [];
  const playback = [];
  class Recorder {
    constructor(stream) { this.stream = stream; this.state = 'inactive'; this.mimeType = 'audio/webm'; recorders.push(this); }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob(['clip'], { type: this.mimeType }) });
      this.onstop?.();
    }
  }
  const { env, revoked, created } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: async () => {
      const track = { stop() { track.stopped = true; } };
      tracks.push(track);
      return { getTracks: () => [track] };
    } } },
    MediaRecorder: Recorder
  });
  const audio = createFrenchAudio({ environment: env, onRecording: (url) => playback.push(url) });

  await audio.record();
  assert.equal(recorders.length, 1);
  audio.stopRecording();
  assert.equal(playback[0], 'blob:test-1');
  assert.equal(created[0].blob.type, 'audio/webm');
  assert.equal(tracks[0].stopped, true);

  await audio.record();
  assert.deepEqual(revoked, ['blob:test-1']);
  audio.destroy();
  assert.deepEqual(revoked, ['blob:test-1']);
});

test('recognition is French, single-shot, reports transcript, and aborts on stop', () => {
  const instances = [];
  const transcript = [];
  class Recognition {
    constructor() { instances.push(this); }
    start() { this.started = true; }
    abort() { this.aborted = true; }
  }
  const { env } = makeEnvironment({ SpeechRecognition: Recognition });
  const audio = createFrenchAudio({ environment: env, onTranscript: (text) => transcript.push(text) });
  audio.recognize();
  const rec = instances[0];
  assert.equal(rec.lang, 'fr-FR');
  assert.equal(rec.continuous, false);
  assert.equal(rec.interimResults, false);
  assert.equal(rec.started, true);
  rec.onresult({ results: [[{ transcript: 'Bonjour tout le monde' }]] });
  assert.deepEqual(transcript, ['Bonjour tout le monde']);
  audio.recognize();
  const second = instances[1];
  audio.stop();
  assert.equal(second.aborted, true);
  audio.destroy();
});

test('recognize during recording leaves its automatic stop timer and stream intact', async () => {
  const clock = fakeTimers();
  const messages = [];
  const recorders = [];
  let trackStops = 0;
  let recognizerStarts = 0;
  class Recorder {
    constructor() { this.state = 'inactive'; recorders.push(this); }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['captured']) }); this.onstop?.(); }
  }
  class Recognition { start() { recognizerStarts++; } }
  const { env, created } = makeEnvironment({
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() { trackStops++; } }] }) } },
    MediaRecorder: Recorder,
    SpeechRecognition: Recognition
  });
  const audio = createFrenchAudio({ environment: env, onStatus: (m) => messages.push(m) });
  await audio.record();
  assert.ok([...clock.jobs.values()].some((job) => job.delay === 15_000));
  audio.recognize();
  assert.equal(recognizerStarts, 0);
  assert.match(messages.at(-1), /recording/i);
  assert.ok([...clock.jobs.values()].some((job) => job.delay === 15_000));
  clock.fire(15_000);
  assert.equal(trackStops, 1);
  assert.equal(created.length, 1);
  audio.destroy();
});

test('recognize during pending getUserMedia neither invalidates nor duplicates the request', async () => {
  const request = deferred();
  let recorderStarts = 0;
  let recognitionStarts = 0;
  class Recorder { start() { recorderStarts++; this.state = 'recording'; } stop() { this.state = 'inactive'; this.onstop?.(); } }
  class Recognition { start() { recognitionStarts++; } }
  const { env } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: () => request.promise } },
    MediaRecorder: Recorder,
    SpeechRecognition: Recognition
  });
  const audio = createFrenchAudio({ environment: env });
  const pending = audio.record();
  audio.recognize();
  request.resolve({ getTracks: () => [{ stop() {} }] });
  await pending;
  assert.equal(recorderStarts, 1);
  assert.equal(recognitionStarts, 0);
  audio.stop();
  audio.destroy();
});

test('recognize during speech playback is rejected without invalidating speech callbacks', async () => {
  const messages = [];
  let recognitionStarts = 0;
  let utterance;
  class Utterance { constructor() { utterance = this; } }
  class Recognition { start() { recognitionStarts++; } }
  const { env } = makeEnvironment({
    speechSynthesis: { getVoices: () => [{ lang: 'fr-FR' }], cancel() {}, speak() {} },
    SpeechSynthesisUtterance: Utterance,
    SpeechRecognition: Recognition
  });
  const audio = createFrenchAudio({ environment: env, onStatus: (message) => messages.push(message) });
  await audio.speak('Bonjour');
  audio.recognize();
  assert.equal(recognitionStarts, 0);
  assert.match(messages.at(-1), /Wait for French audio/i);
  utterance.onend();
  assert.equal(messages.at(-1), 'Audio finished.');
  audio.destroy();
});

test('recognition timeout aborts the browser request and late result cannot update UI', () => {
  const clock = fakeTimers();
  const messages = [];
  const transcripts = [];
  let instance;
  class Recognition {
    constructor() { instance = this; }
    start() {}
    abort() { this.aborted = true; }
  }
  const { env } = makeEnvironment({
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    SpeechRecognition: Recognition
  });
  const audio = createFrenchAudio({ environment: env, onStatus: (m) => messages.push(m), onTranscript: (t) => transcripts.push(t) });
  audio.recognize();
  const staleResult = instance.onresult;
  clock.fire(15_000);
  assert.equal(instance.aborted, true);
  assert.match(messages.at(-1), /timed out/i);
  staleResult({ results: [[{ transcript: 'bonjour' }]] });
  assert.deepEqual(transcripts, []);
  audio.destroy();
});

test('stop cancels a just-stopped recording before late recorder events and revokes its URL', async () => {
  const callbacks = [];
  const revoked = [];
  class Recorder {
    constructor() { this.state = 'inactive'; }
    start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; callbacks.push([this.ondataavailable, this.onstop]); }
  }
  const { env } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } },
    MediaRecorder: Recorder,
    URL: {
      createObjectURL: () => 'blob:old',
      revokeObjectURL: (url) => revoked.push(url)
    }
  });
  const urls = [];
  const audio = createFrenchAudio({ environment: env, onRecording: (url) => urls.push(url) });
  await audio.record();
  audio.stopRecording();
  audio.stop();
  for (const [data, end] of callbacks) {
    data?.({ data: new Blob(['late']) });
    end?.();
  }
  assert.deepEqual(urls, []);
  assert.deepEqual(revoked, []);
  assert.equal(audio.capabilities().recording, true);
  audio.destroy();
});

test('recording keeps final dataavailable chunks that arrive after stop is requested', async () => {
  let pendingStop = null;
  const urls = [];
  const { env, created } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } },
    MediaRecorder: class {
      constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; }
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; pendingStop = this; }
    }
  });
  const audio = createFrenchAudio({ environment: env, onRecording: (url) => urls.push(url) });
  await audio.record();
  audio.stopRecording();
  pendingStop.ondataavailable({ data: new Blob(['last chunk']) });
  pendingStop.onstop();
  assert.deepEqual(urls, ['blob:test-1']);
  assert.equal(await created[0].blob.text(), 'last chunk');
  audio.stop();
  audio.destroy();
});

test('stop revokes completed recording URL and reports a distinct cancellation status', async () => {
  const messages = [];
  const { env, revoked } = makeEnvironment({
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } },
    MediaRecorder: class {
      constructor() { this.state = 'inactive'; }
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(['done']) }); this.onstop?.(); }
    }
  });
  const audio = createFrenchAudio({ environment: env, onStatus: (message) => messages.push(message) });
  await audio.record();
  audio.stopRecording();
  assert.equal(revoked.length, 0);
  audio.stop();
  assert.deepEqual(revoked, ['blob:test-1']);
  assert.equal(messages.at(-1), 'Audio stopped.');
  audio.destroy();
});

