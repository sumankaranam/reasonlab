import {cloudStatus, enableCloud, syncNow, restoreCloud, replaceCloud, disableCloud, deleteCloud} from './cloud-sync.js';

let adult = null, busy = false, notice = '', generation = 0;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountCloudControls(user) {
  adult = user;
  generation++;
  notice = '';
  busy = false;
  document.querySelector('#cloud-account')?.remove();
  if (!user) return;
  const section = document.createElement('section');
  section.id = 'cloud-account';
  section.className = 'card';
  const account=document.querySelector('#account');
  const editor=document.querySelector('#child-editor');
  if(editor)editor.before(account);
  account.after(section);
  const dock=document.querySelector('#theme-dock');
  if(dock)document.querySelector('main').after(dock);
  render();
}

function render() {
  const section = document.querySelector('#cloud-account');
  if (!section || !adult) return;
  const state = cloudStatus(adult);
  section.innerHTML = `<h2>Your learning, on another device</h2>
    <p>Optional cloud saving keeps completed reasoning and language progress, vocabulary reviews, and learner nicknames and avatars in your adult account. Guest work, personality reflections, recordings and unfinished answers stay on this device.</p>
    <p id="cloud-message" role="status" aria-live="polite">${esc(notice || state.message || 'Cloud saving is off on this device.')}</p>
    ${!state.enabled ? `<label class="cloud-consent"><input id="cloud-consent" type="checkbox"> I’m the parent or responsible adult. I agree to store these learner profiles and progress in my account.</label><div class="actions"><button class="primary" id="cloud-enable">Enable cloud saving</button></div>` : `
    <div class="actions"><button class="primary" id="cloud-save">Save / check cloud</button><button class="secondary" id="cloud-restore">Use cloud copy on this device</button></div>
    ${state.state === 'conflict' ? '<p>Choose which copy to keep. Your device copy has not been overwritten.</p><button class="secondary" id="cloud-replace">Use this device’s copy in cloud</button>' : ''}
    <div class="actions"><button class="text-btn" id="cloud-disable">Turn off on this device</button></div>`}
    <div class="actions"><button class="text-btn" id="cloud-delete">Delete cloud copy</button></div>
    <p class="small">On another device, sign in with the same adult account and enable cloud saving here. If a cloud copy already exists, choose “Use cloud copy on this device.” Wait for a saved confirmation before closing a learning page. No automatic merging of competing device changes.</p>
    <a href="/progress-privacy.html">What is saved and how to delete it</a>`;
  section.setAttribute('aria-busy', String(busy));
  section.querySelectorAll('button').forEach(button => { button.disabled = busy; });
  const bind = (id, callback) => section.querySelector(id)?.addEventListener('click', callback);
  bind('#cloud-enable', () => {
    if (!section.querySelector('#cloud-consent').checked) {
      section.querySelector('#cloud-message').textContent = 'Please read and confirm the adult cloud-saving choice first.';
      return;
    }
    void run(user => enableCloud(user));
  });
  bind('#cloud-save', () => void run(user => syncNow(user)));
  bind('#cloud-restore', () => {
    if (confirm('Replace this device’s saved reasoning, language and vocabulary progress with the cloud copy? Unfinished language activities may be reset. Guest and personality history are kept.')) {
      void run(async user => { await restoreCloud(user); if (cloudStatus(user).state === 'synced') location.reload(); });
    }
  });
  bind('#cloud-replace', () => {
    if (confirm('Replace the cloud copy with this device’s progress? Changes saved only by another device will be replaced.')) void run(user => replaceCloud(user));
  });
  bind('#cloud-disable', () => void run(user => disableCloud(user)));
  bind('#cloud-delete', () => {
    if (confirm('Delete the cloud copy of learner profiles and progress? Device copies and your adult sign-in account will remain. Cloud saving will be turned off here.')) void run(user => deleteCloud(user));
  });
}

async function run(action) {
  if (busy || !adult) return;
  const user = adult, token = generation;
  busy = true;
  notice = '';
  render();
  try { await action(user); }
  catch { if (token === generation) notice = 'Cloud saving could not finish. Your device copy is still available. Try again when connected.'; }
  finally { if (token === generation) { busy = false; render(); } }
}

window.addEventListener('reasonlab-cloud-change', () => { if (!busy) render(); });
