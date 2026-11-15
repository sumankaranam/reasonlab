const MAX_SPEECH_LENGTH = 3000;
const MAX_RECORDING_MS = 15_000;
const RECOGNITION_TIMEOUT_MS = 15_000;
const VOICE_WAIT_MS = 1200;

/**
 * Browser audio helpers for French practice. Call recognize() only after the
 * UI has obtained an explicit grown-up confirmation for microphone access.
 */
export function createFrenchAudio({ onStatus, onTranscript, onRecording, environment } = {}) {
  const host = environment ?? globalThis;
  const win = host.window ?? host;
  const nav = host.navigator ?? win.navigator;
  const timers = host.setTimeout ? host : globalThis;
  let destroyed = false;
  let operation = 0;
  let recognition = null;
  let recognitionTimer = null;
  let recorder = null;
  let recorderStream = null;
  let recordingTimer = null;
  let recordingGeneration = 0;
  let recordingCommit = false;
  let recordingPending = false;
  let recordingUrl = null;
  let finalizingRecorder = null;
  let speechUtterance = null;
  let speechPending = false;
  let voiceWaitCleanup = null;

  const status = (message, token = operation) => {
    if (!destroyed && token === operation && typeof onStatus === 'function') onStatus(message);
  };
  const revokeRecordingUrl = () => {
    if (recordingUrl) {
      try { (win.URL ?? host.URL)?.revokeObjectURL?.(recordingUrl); } catch { /* best effort */ }
      recordingUrl = null;
    }
  };
  const stopTracks = (stream) => {
    for (const track of stream?.getTracks?.() ?? []) {
      try { track.stop(); } catch { /* best effort */ }
    }
  };
  const cancelRecognitionTimer = () => {
    if (recognitionTimer !== null) timers.clearTimeout(recognitionTimer);
    recognitionTimer = null;
  };
  const clearRecordingTimer = () => {
    if (recordingTimer !== null) timers.clearTimeout(recordingTimer);
    recordingTimer = null;
  };
  const cancelVoiceWait = () => {
    voiceWaitCleanup?.();
    voiceWaitCleanup = null;
  };

  function stopRecognition() {
    cancelRecognitionTimer();
    const active = recognition;
    recognition = null;
    if (active) {
      active.onresult = active.onerror = active.onend = null;
      try { active.abort?.(); } catch { try { active.stop?.(); } catch { /* best effort */ } }
    }
  }

  function finishRecording(commit) {
    recordingCommit = Boolean(commit);
    clearRecordingTimer();
    const activeRecorder = recorder;
    const activeStream = recorderStream;
    recorder = null;
    recorderStream = null;
    recordingPending = false;
    stopTracks(activeStream);
    if (!commit && activeRecorder) {
      activeRecorder.ondataavailable = activeRecorder.onerror = activeRecorder.onstop = null;
    }
    if (activeRecorder && activeRecorder.state !== 'inactive') {
      try { activeRecorder.stop(); } catch { /* recorder may have stopped already */ }
    }
  }

  function stop() {
    operation++;
    const wasActive = Boolean(speechPending || speechUtterance || recognition || recorder || recordingPending || recordingCommit || recordingUrl);
    cancelVoiceWait();
    const synthesis = win.speechSynthesis;
    try { synthesis?.cancel?.(); } catch { /* best effort */ }
    speechUtterance = null;
    stopRecognition();
    recordingCommit = false;
    recordingGeneration++;
    finishRecording(false);
    if (finalizingRecorder) {
      finalizingRecorder.ondataavailable = finalizingRecorder.onerror = finalizingRecorder.onstop = null;
      finalizingRecorder = null;
    }
    speechPending = false;
    revokeRecordingUrl();
    if (wasActive) status('Audio stopped.');
  }

  function capabilities() {
    const synthesis = win.speechSynthesis;
    let frenchVoice = false;
    try {
      frenchVoice = Boolean(synthesis?.getVoices?.().some((voice) => /^fr(?:-|$)/i.test(voice.lang ?? '')));
    } catch { /* voice list is optional */ }
    return {
      speech: Boolean(synthesis && typeof win.SpeechSynthesisUtterance === 'function'),
      recording: Boolean(nav?.mediaDevices?.getUserMedia && typeof win.MediaRecorder === 'function' && (win.URL ?? host.URL)?.createObjectURL),
      recognition: Boolean(win.SpeechRecognition || win.webkitSpeechRecognition),
      frenchVoice
    };
  }

  function getFrenchVoice(token) {
    const synthesis = win.speechSynthesis;
    const findVoice = () => {
      try { return synthesis?.getVoices?.().find((voice) => /^fr(?:-|$)/i.test(voice.lang ?? '')) ?? null; }
      catch { return null; }
    };
    const current = findVoice();
    if (current) return Promise.resolve(current);
    if (!synthesis?.addEventListener) return Promise.resolve(null);

    return new Promise((resolve) => {
      let done = false;
      let timer = null;
      const finish = (voice) => {
        if (done) return;
        done = true;
        if (timer !== null) timers.clearTimeout(timer);
        synthesis.removeEventListener?.('voiceschanged', onVoicesChanged);
        if (voiceWaitCleanup === cancel) voiceWaitCleanup = null;
        resolve(voice);
      };
      const onVoicesChanged = () => {
        const voice = findVoice();
        if (voice) finish(voice);
      };
      const cancel = () => finish(null);
      voiceWaitCleanup = cancel;
      synthesis.addEventListener('voiceschanged', onVoicesChanged);
      timer = timers.setTimeout(() => finish(findVoice()), VOICE_WAIT_MS);
      if (token !== operation) finish(null);
    });
  }

  async function speak(text, slow = false) {
    if (destroyed) return;
    const token = ++operation;
    stopRecognition();
    recordingGeneration++;
    recordingCommit = false;
    finishRecording(false);
    speechPending = false;
    cancelVoiceWait();
    speechUtterance = null;
    try { win.speechSynthesis?.cancel?.(); } catch { /* best effort */ }

    const synthesis = win.speechSynthesis;
    if (!synthesis || typeof win.SpeechSynthesisUtterance !== 'function') {
      status('French audio playback is not supported in this browser.', token);
      return;
    }
    const phrase = String(text ?? '').trim().slice(0, MAX_SPEECH_LENGTH);
    if (!phrase) return;
    speechPending = true;
    status('Preparing French audio…', token);
    const voice = await getFrenchVoice(token);
    if (destroyed || token !== operation) return;
    speechPending = false;
    if (!voice) {
      status('A French voice is not available. Enable a French voice in your device settings and try again.', token);
      return;
    }

    const utterance = new win.SpeechSynthesisUtterance(phrase);
    utterance.lang = 'fr-FR';
    utterance.voice = voice;
    utterance.rate = slow ? 0.65 : 0.85;
    utterance.onend = () => {
      if (speechUtterance === utterance && token === operation) {
        speechUtterance = null;
        status('Audio finished.', token);
      }
    };
    utterance.onerror = () => {
      if (speechUtterance === utterance && token === operation) {
        speechUtterance = null;
        status('French audio could not be played. Please try again.', token);
      }
    };
    speechUtterance = utterance;
    try { synthesis.speak(utterance); }
    catch {
      speechUtterance = null;
      status('French audio could not be played. Please try again.', token);
    }
  }

  async function record() {
    if (destroyed) return;
    const token = ++operation;
    recordingGeneration++;
    const thisRecording = recordingGeneration;
    stopRecognition();
    cancelVoiceWait();
    try { win.speechSynthesis?.cancel?.(); } catch { /* best effort */ }
    speechUtterance = null;
    speechPending = false;
    finishRecording(false);
    revokeRecordingUrl();
    recordingCommit = true;

    if (!nav?.mediaDevices?.getUserMedia || typeof win.MediaRecorder !== 'function') {
      status('Microphone recording is not supported in this browser.', token);
      return;
    }
    recordingPending = true;
    status('Requesting microphone access…', token);
    let stream;
    try { stream = await nav.mediaDevices.getUserMedia({ audio: true }); }
    catch {
      if (token === operation && thisRecording === recordingGeneration) {
        recordingPending = false;
        recordingCommit = false;
        status('Microphone access was not granted. Check browser permissions and try again.', token);
      }
      return;
    }
    if (destroyed || token !== operation || thisRecording !== recordingGeneration || !recordingCommit) {
      stopTracks(stream);
      return;
    }

    let activeRecorder;
    try { activeRecorder = new win.MediaRecorder(stream); }
    catch {
      recordingPending = false;
      recordingCommit = false;
      stopTracks(stream);
      status('A recording could not be started on this device.', token);
      return;
    }
    recorder = activeRecorder;
    recorderStream = stream;
    const chunks = [];
    activeRecorder.ondataavailable = (event) => {
      if (event.data?.size && token === operation && thisRecording === recordingGeneration) chunks.push(event.data);
    };
    activeRecorder.onerror = () => {
      if (recorder === activeRecorder && thisRecording === recordingGeneration) {
        recordingCommit = false;
        status('The microphone recording stopped unexpectedly.', token);
        finishRecording(false);
      }
    };
    activeRecorder.onstop = () => {
      if (finalizingRecorder === activeRecorder) finalizingRecorder = null;
      if (thisRecording !== recordingGeneration || destroyed) { chunks.length = 0; return; }
      if (!recordingCommit || !chunks.length) {
        if (token === operation && recordingCommit) status('No audio was captured. Please try again.', token);
        recordingCommit = false;
        return;
      }
      recordingCommit = false;
      const finishedChunks = chunks.splice(0);
      try {
        const blob = new win.Blob(finishedChunks, { type: activeRecorder.mimeType || 'audio/webm' });
        recordingUrl = (win.URL ?? host.URL).createObjectURL(blob);
        if (token === operation && !destroyed) {
          onRecording?.(recordingUrl);
          status('Recording ready to play.', token);
        } else revokeRecordingUrl();
      } catch {
        status('The recording could not be prepared for playback.', token);
      } finally {
        finishedChunks.length = 0;
      }
    };
    try {
      activeRecorder.start();
      recordingPending = false;
      status('Recording… It will stop automatically after 15 seconds.', token);
      recordingTimer = timers.setTimeout(() => {
        if (token === operation && thisRecording === recordingGeneration) stopRecording();
      }, MAX_RECORDING_MS);
    } catch {
      recordingCommit = false;
      finishRecording(false);
      status('A recording could not be started on this device.', token);
    }
  }

  function stopRecording() {
    if (destroyed || (!recorder && !recordingPending)) return;
    clearRecordingTimer();
    if (recordingPending && !recorder) {
      operation++;
      recordingGeneration++;
      recordingCommit = false;
      recordingPending = false;
      status('Microphone request cancelled.');
      return;
    }
    recordingCommit = true;
    finalizingRecorder = recorder;
    finishRecording(true);
  }

  function recognize() {
    if (destroyed) return;
    if (recordingPending || recorder || recordingCommit) {
      status('Finish or cancel the microphone recording before using speech recognition.');
      return;
    }
    if (speechPending || speechUtterance) {
      status('Wait for French audio to finish before using speech recognition.');
      return;
    }
    const Recognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!Recognition) {
      status('French speech recognition is not supported in this browser.');
      return;
    }
    const token = ++operation;
    stopRecognition();
    const instance = new Recognition();
    recognition = instance;
    instance.lang = 'fr-FR';
    instance.continuous = false;
    instance.interimResults = false;
    instance.onresult = (event) => {
      if (recognition !== instance || token !== operation || destroyed) return;
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) onTranscript?.(transcript);
      status(transcript ? 'Speech recognized.' : 'No speech was detected. Try again.', token);
      stopRecognition();
    };
    instance.onerror = (event) => {
      if (recognition !== instance || token !== operation) return;
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access was not granted for speech recognition.'
        : event.error === 'no-speech'
          ? 'No speech was detected. Try again.'
          : 'French speech recognition could not start. Please try again.';
      stopRecognition();
      status(message, token);
    };
    instance.onend = () => {
      if (recognition === instance && token === operation) {
        stopRecognition();
        status('Speech recognition ended. Try again if needed.', token);
      }
    };
    try {
      instance.start();
      status('Listening for French…', token);
      recognitionTimer = timers.setTimeout(() => {
        if (recognition === instance && token === operation) {
          stopRecognition();
          status('Listening timed out. Try again.', token);
        }
      }, RECOGNITION_TIMEOUT_MS);
    } catch {
      stopRecognition();
      status('French speech recognition could not start. Please try again.', token);
    }
  }

  function destroy() {
    if (destroyed) return;
    stop();
    destroyed = true;
    revokeRecordingUrl();
    onStatus = onTranscript = onRecording = undefined;
  }

  return { speak, stop, record, stopRecording, recognize, destroy, capabilities };
}
