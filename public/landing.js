import {lessons as frenchLessons} from './french-data.js';
import {courses} from './indic-data.js';
import {service,onAccountChange} from './auth-client.js';
import {showChildHeader} from './child-profile-ui.js';
import {readLearningToday,saveSelectedLearner,selectedLearner} from './today-core.js';
import {readProfiles} from './child-profiles.js';
import {themeScene,readTheme} from './themes.js';
const app=document.querySelector('#landing');let user=null,warning='',identityVersion=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function guestChosen(){try{return sessionStorage.getItem('reasonlab-explore')==='yes';}catch{return false;}}

function gardenPlant({goal,grown},index){
 const colors=['#78a957','#65a37a','#dba551'];
 const pots=['#ad573e','#536f91','#876391'];
 const leaves=[
  '<path d="M38 48C24 47 19 39 20 32c10-1 18 6 18 16ZM38 39c0-13 9-18 17-18 0 9-8 17-17 18Z"/>',
  '<path d="M38 49C23 48 16 40 16 32c12 0 21 7 22 17ZM38 42c1-14 8-20 20-23 0 13-9 22-20 23ZM37 30c-10-5-15-14-12-24 10 3 16 13 12 24Z"/>',
  '<path d="M38 49C25 49 18 43 18 33c12 0 18 7 20 16ZM38 42c2-10 9-16 19-17 0 11-8 17-19 17Z" fill="#78a957"/><path d="M38 9c6-7 14 0 11 5 9 3 6 12-2 12-2 8-12 8-16 1-8 0-11-8-4-12-2-7 6-11 11-6Z"/><circle cx="38" cy="19" r="5" fill="#9c6138"/>',
 ];
 return `<li class="${grown?'grown':''}"><svg viewBox="0 0 76 78" aria-hidden="true" focusable="false">
  <ellipse cx="38" cy="71" rx="27" ry="4" fill="#c4d3ac"/>
  ${grown?`<path d="M38 54V${[36,27,22][index]}" stroke="#476b40" stroke-width="2.5" stroke-linecap="round"/><g fill="${colors[index]}">${leaves[index]}</g>`:
   '<path d="M24 52q14-7 28 0Z" fill="#a58a6b"/><ellipse cx="38" cy="48" rx="3" ry="2" fill="#805f3e" transform="rotate(-25 38 48)"/>'}
  <path d="M22 54h32l-4 14q-1 3-4 3H30q-3 0-4-3Z" fill="${grown?pots[index]:'#9e8b75'}"/>
  <rect x="20" y="52" width="36" height="6" rx="2" fill="${grown?pots[index]:'#9e8b75'}"/>
  <path d="M24 58h28" stroke="#332b21" stroke-opacity=".2"/>
 </svg><span>${grown?'Grown at ':'Grows at '}${goal}</span></li>`;
}

function courseRow(course){
 const {dueCount}=course.review;
 const reviewLabel=dueCount?`${dueCount} ${dueCount===1?'word':'words'} due`:'Review words';
 return `<li>
  <div><span class="today-native today-native-${course.id}" lang="${course.id}">${course.native}</span>
  <h3>${course.name}</h3><p>${course.completed} of ${course.total} lessons completed${course.inProgress?' · Activity saved':''}</p></div>
  <div class="today-course-actions">
   <a class="today-link" href="${course.href}">${course.started?'Continue':'Start'} ${course.name} <span aria-hidden="true">→</span></a>
   <a class="today-link today-review" href="${course.reviewHref}" aria-label="${reviewLabel} in ${course.name}">${reviewLabel} <span aria-hidden="true">→</span></a>
  </div>
 </li>`;
}

function learningToday(current,profiles){
 const profile=profiles[current],today=readLearningToday(window.localStorage,user?.id||null,current);
 const {next,garden,activityCount,earnedBadges,completedAdventures,dailyComplete,reasoningHref}=today;
 return `<section class="today" aria-labelledby="today-title">
  <div class="today-heading">
   <div><div class="eyebrow">${user?'YOUR LEARNING HOME':'EXPLORE AS A GUEST'}</div>
   <h1 id="today-title">My Learning <em>Today</em></h1>
   <p>${profile?`Welcome, ${esc(profile.name)}!`:`Welcome, Learner ${current}!`} Pick up where you left off or try something new.</p></div>
   <div class="today-learner"><label for="today-learner">Learner</label><select id="today-learner">${[1,2,3].map(n=>`<option value="${n}"${n===current?' selected':''}>${esc(profiles[n]?.name||`Learner ${n}`)}</option>`).join('')}</select></div>
  </div>
  ${warning?`<p role="status">${esc(warning)}</p>`:''}
  <p id="today-status" role="status" hidden></p>
  <div class="today-grid">
   <article class="today-next">
    <span class="today-kicker">Suggested next step</span>
    <h2>${next.title}</h2><p>${next.detail}</p>
    <a class="primary" href="${next.href}">${next.label} →</a>
   </article>
   <article class="today-garden">
    <h2>My learning garden</h2>
    <p><strong>${activityCount}</strong> ${activityCount===1?'activity':'activities'} completed</p>
    <ul class="today-plants" aria-label="Garden milestones">${garden.map(gardenPlant).join('')}</ul>
    <p class="today-garden-note">Finish lessons and reasoning adventures to grow your plants. Take breaks whenever you like.</p>
   </article>
   <article class="today-courses">
    <h2>My languages</h2>
    <ul class="today-course-list">${today.languages.map(courseRow).join('')}</ul>
   </article>
   <article class="today-reasoning">
    <div class="today-trail-art" aria-hidden="true"><svg viewBox="0 0 280 80" focusable="false">
     <path d="M0 66c40-1 65-47 100-40s37 40 77 40 61-40 103-38" fill="none" stroke="#a595cc" stroke-width="2" stroke-dasharray="4 5"/>
     <rect x="52" y="16" width="38" height="38" rx="9" fill="#fff9e3" stroke="#e9d69c" transform="rotate(-14 71 35)"/>
     <path d="m72 23 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#b77839"/>
     <rect x="168" y="38" width="39" height="37" rx="9" fill="#f8f4ff" stroke="#cabae8" transform="rotate(10 188 56)"/>
     <circle cx="188" cy="56" r="7" fill="none" stroke="#836bad" stroke-width="2"/><path d="m188 50 2 7-6 2z" fill="#836bad"/>
     <path d="m229 19 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#a094cc"/>
    </svg></div>
    <h2>Reasoning adventures</h2>
    <p>${dailyComplete?'You finished a Daily Trail today.':'Today’s Daily Trail is waiting.'}</p>
    <p><strong>${completedAdventures}</strong> ${completedAdventures===1?'adventure':'adventures'} completed · <strong>${earnedBadges}</strong> ${earnedBadges===1?'badge':'badges'} earned</p>
    <a class="today-link" href="${reasoningHref}">Open reasoning adventures <span aria-hidden="true">→</span></a>
   </article>
  </div>
 </section>`;
}

function render(){
 const current=selectedLearner(window.localStorage,user?.id||null);showChildHeader(user,current,fn=>fn(),service);document.querySelector('#account-link').textContent=user?'Adult account':'Adult sign in';app.after(document.querySelector('#theme-dock'));
 const hub=!!user||guestChosen()||['#explore','#languages'].includes(location.hash);if(hub){try{sessionStorage.setItem('reasonlab-explore','yes');}catch{}}
 const profiles=readProfiles(user?.id||null);
 const learnerQuery=current===1?"":`?learner=${current}`;
 if(location.hash==='#languages'){
 app.innerHTML=`<section class="hub-heading"><a class="text-btn" href="#explore">← All activities</a><div class="eyebrow">LANGUAGE ADVENTURES</div><h1>A new language.<br><em>A new way to say hello.</em></h1><p>Start with words and pictures, then build toward small conversations.</p></section><div class="language-grid"><article class="path-card language-path"><span class="path-symbol" aria-hidden="true">Bonjour!</span><span class="path-label">AVAILABLE NOW</span><h2>French</h2><p>${frenchLessons.length} lessons, picture flashcards, pronunciation and guided conversations. Start at the beginning or resume your journey.</p><a class="primary" href="/french.html${learnerQuery}">Open French →</a></article>${[['Tamil','தமிழ்','tamil'],['Kannada','ಕನ್ನಡ','kannada']].map(([name,script,path])=>`<article class="path-card language-path"><span class="path-symbol" aria-hidden="true">${script}</span><span class="path-label">AVAILABLE NOW</span><h2>${name}</h2><p>${courses[path==='tamil'?'ta':'kn'].lessons.length} lessons with picture cards, pronunciation guides and everyday conversations. Save your place and learn at your pace.</p><a class="primary" href="/${path}.html${learnerQuery}">Open ${name} →</a></article>`).join('')}${['Spanish','German','Hindi','Japanese'].map(name=>`<article class="path-card coming-soon"><span class="path-label">COMING SOON</span><h2>${name}</h2><p>More language adventures are on the way. This course is not available yet.</p></article>`).join('')}</div><p class="hub-footnote">Instructions are in English. ${user?"Visit Adult account for optional cloud saving.":"Guest progress is saved in this browser."}</p>`;
 }else if(hub){
 app.innerHTML=`${learningToday(current,profiles)}<h2 class="today-path-heading">Explore all activities</h2><div class="path-grid"><article class="path-card"><div class="path-illustration" aria-hidden="true"><span>Bonjour!</span><span>Hola!</span><b>あ</b></div><span class="path-label">WORDS · LISTENING · CONVERSATION</span><h2>Language learning</h2><p>Learn with pictures, voices and small conversations. French, Tamil and Kannada are ready to explore.</p><a class="primary" href="#languages">Choose a language →</a><small>Beginner-friendly · Learn at your pace</small></article><article class="path-card"><div class="path-illustration puzzle-art" aria-hidden="true"><span>3</span><span>6</span><b>?</b></div><span class="path-label">PATTERNS · LOGIC · MEMORY</span><h2>Reasoning & memory</h2><p>Explore four puzzle worlds: patterns, logic stories, visual reasoning and memory. Try daily adventures and a weekly challenge.</p><a class="primary" href="/adventures.html${learnerQuery}">Explore reasoning →</a><small>Grades 1–10 · Practice, not a clinical IQ score</small></article><article class="path-card"><div class="path-illustration discovery-art" aria-hidden="true"><span>✦</span><span>♡</span><b>?</b></div><span class="path-label">INTERESTS · PREFERENCES · POSSIBILITIES</span><h2>Interests & personality</h2><p>Discover activities you enjoy, explore possible careers, and find ideas for family conversations.</p><a class="primary" href="/discover.html">Explore interests →</a><small>Interests: Grades 1–10 · Personality reflection: ages 16+</small></article></div><aside class="hub-footnote">${user?'Learner progress is saved in this browser. Visit Adult account for optional cloud saving.':'Guest progress is saved in this browser. Signing in opens a separate learning history.'}</aside>`;
 }else{
 app.innerHTML=`<section class="welcome"><div class="welcome-copy"><div class="eyebrow">Little steps. Wonderful discoveries.</div><h1>A world of learning.<br><em>A place for every curious mind.</em></h1><p>Meet a new language, solve a playful puzzle, or discover what sparks your interest.</p><div class="entry-actions"><a class="primary" href="/account.html">Adult sign in →</a><a class="secondary" href="#explore" id="explore-guest">Explore as a guest →</a></div><p class="small">Children don’t need an email account. You can explore for free.</p>${warning?`<p role="status">${esc(warning)}</p>`:''}</div><div class="welcome-picture" aria-hidden="true">${themeScene(readTheme())}<span>A little curiosity goes a long way.</span></div></section><section class="welcome-preview" aria-label="What you can explore"><div><b>Say hello to a new language</b><p>Pictures, listening and friendly conversations.</p></div><div><b>Give your curiosity a workout</b><p>Daily patterns, logic and memory adventures.</p></div><div><b>Find what sparks your interest</b><p>Activities and ideas for growing minds.</p></div></section><p class="hub-footnote">Sign-in is managed by adults. Learning progress stays on this device; no child email is needed.</p>`;
 }
}
app.addEventListener('change', event=>{
 const select=event.target;
 if(select.id!=='today-learner')return;
 const userId=user?.id||null;
 if(saveSelectedLearner(window.localStorage,userId,Number(select.value))){
  render();
  document.querySelector('#today-learner').focus({preventScroll:true});
 }else{
  select.value=String(selectedLearner(window.localStorage,userId));
  const status=document.querySelector('#today-status');
  status.hidden=false;
  status.textContent='Browser storage is unavailable. Your learner selection could not be saved.';
 }
});
window.addEventListener('pageshow',event=>{if(event.persisted)void refresh();});
window.addEventListener('hashchange',()=>{if(location.hash==='#theme-dock')return;render();const h=app.querySelector('h1');h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo(0,0);});
async function refresh(){const run=++identityVersion;try{const next=await service.user();if(run!==identityVersion)return;user=next;warning='';}catch{if(run!==identityVersion)return;user=null;warning='We could not verify your account. You can still explore as a guest.';}render();}
render();await refresh();onAccountChange(()=>{void refresh();});
