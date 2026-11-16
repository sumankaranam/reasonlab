import {avatars,avatarSvg,readProfiles,saveProfile} from './child-profiles.js';
import {progressKeys} from './auth-core.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function showChildHeader(user,slot,navigate,service){
  let bar=document.querySelector('#child-banner');
  if(!bar){bar=document.createElement('section');bar.id='child-banner';bar.className='child-banner no-print';document.querySelector('header').after(bar);}
  bar.hidden=!user;if(!user){bar.replaceChildren();return;}
  const child=readProfiles(user.id)[slot];
  bar.innerHTML=`<div class="child-welcome"><span class="child-face">${avatarSvg(child?.avatar)}</span><div><strong>${child?`Hello, ${esc(child.name)}!`:`Welcome, Learner ${slot}!`}</strong><span>Your next adventure awaits · Learner ${slot}</span></div></div><div class="child-actions"><button class="secondary" id="edit-child">${child?'Edit profiles':'Choose name & avatar'}</button><button class="text-btn" id="child-signout">Sign out</button></div><p id="child-status" role="status"></p>`;
  bar.querySelector('#edit-child').onclick=()=>navigate(()=>location.assign('/account.html'));
  bar.querySelector('#child-signout').onclick=()=>navigate(async()=>{const button=bar.querySelector('#child-signout');button.disabled=true;try{await service.signOut();location.assign('/account.html');}catch{bar.querySelector('#child-status').textContent='Could not sign out. Please try again.';button.disabled=false;}});
}
export function mountProfileEditor(user,service){
  let host=document.querySelector('#child-editor');if(!host){host=document.createElement('section');host.id='child-editor';host.className='card child-editor';document.querySelector('#account').after(host);}
  if(!user){host.remove();return;}
  if(!Object.keys(readProfiles(user.id)).length)document.querySelector('#account').before(host);
  let slot=1;try{const s=JSON.parse(localStorage.getItem(progressKeys(user.id).settings)||'{}');if([1,2,3].includes(s.profile))slot=s.profile;}catch{}
  function render(){const profiles=readProfiles(user.id),p=profiles[slot];
    host.innerHTML=`<h2>${Object.keys(profiles).length?'Your little explorers':'Who’s ready for an adventure?'}</h2><p>Choose a child’s first name or nickname and a colorful friend. No full name, photo or child email needed. All ten avatars are available to everyone.</p><label>Child profile<select id="child-slot">${[1,2,3].map(n=>`<option value="${n}" ${slot===n?'selected':''}>${profiles[n]?esc(profiles[n].name):`Learner ${n}`}</option>`).join('')}</select></label><form id="child-form"><label>Child’s nickname<input id="child-name" maxlength="30" required autocomplete="off" value="${esc(p?.name||'')}" placeholder="e.g. Alex"></label><fieldset><legend>Choose your avatar</legend><div class="avatar-grid">${avatars.map(a=>`<label class="avatar-option"><input type="radio" name="child-avatar" value="${a.id}" ${(p?.avatar||avatars[0].id)===a.id?'checked':''}><span class="avatar-picture">${avatarSvg(a.id)}</span><span>${a.name}</span><span class="sr-only">${a.label}</span></label>`).join('')}</div></fieldset><button class="primary" type="submit">Save profile</button><p id="profile-message" role="status" aria-live="polite"></p></form><p class="small">Saved only in this browser under your adult account. Profiles use the existing three learner slots; editing a name or avatar keeps that learner’s progress.</p><div class="actions"><a class="secondary" href="/">Explore challenges</a><a class="secondary" href="/french.html">Learn French</a></div>`;
    host.querySelector('#child-slot').onchange=e=>{slot=Number(e.target.value);render();};
    host.querySelector('#child-form').onsubmit=e=>{e.preventDefault();const status=host.querySelector('#profile-message');try{saveProfile(user.id,slot,host.querySelector('#child-name').value,new FormData(e.target).get('child-avatar'));const key=progressKeys(user.id).settings;for(const suffix of ['',':french']){let s={profile:1,grade:1,stage:1};try{s={...s,...JSON.parse(localStorage.getItem(key+suffix)||'{}')};}catch{}s.profile=slot;localStorage.setItem(key+suffix,JSON.stringify(s));}render();host.querySelector('#profile-message').textContent='Profile saved! Ready for your next adventure.';showChildHeader(user,slot,fn=>fn(),service);}catch{status.textContent='Could not save this profile. Use a nickname and avatar, and check that browser storage is available.';}};
  }render();showChildHeader(user,slot,fn=>fn(),service);
}
