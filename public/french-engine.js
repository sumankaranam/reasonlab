// Pure learning logic. Scores describe these exercises, never proficiency certification.
import {progressKeys} from './auth-core.js';
export const VERSION=1;
const DAY=86400000;
export function frenchKey(userId=null,profile=1){
 if(![1,2,3].includes(profile))throw Error('Invalid learner');
 return progressKeys(userId).history.replace('kids-history','french')+`:learner-${profile}`;
}
export function normalize(value){return String(value??'').normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/[.,!?;:«»“”]/g,'').replace(/\s+/g,' ').trim();}
export function assess(task,response){
 const actual=normalize(response),answers=[task.answer,...(task.accepted||[])].map(normalize);
 if(!actual)return {correct:false,accentOnly:false};
 const correct=answers.includes(actual),fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 return {correct,accentOnly:!correct&&answers.some(a=>fold(a)===fold(actual))};
}
export function shuffled(items,seed=1){let n=(Number(seed)>>>0)||1;const r=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296;};const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makeExercises(lesson,allLessons,seed=1,mode='mixed'){
 // Keep seeded sessions from the original course stable when new stages are appended.
 const legacyStages=new Set(['first-words','everyday','explorer','storyteller','connector','conversation']);
 const pool=legacyStages.has(lesson.stage)?allLessons.filter(l=>legacyStages.has(l.stage)):allLessons;
 const vocabulary=pool.flatMap(l=>l.words),tasks=[];
 lesson.words.forEach((w,i)=>{
  const choices=[w.en,...shuffled([...new Set(vocabulary.map(x=>x.en))].filter(x=>normalize(x)!==normalize(w.en)),seed+i).slice(0,3)];
  const listening=mode==='listening'||(mode==='mixed'&&i%3===1);
  tasks.push({id:`${lesson.id}:word:${i}`,lessonId:lesson.id,kind:'choice',skill:listening?'listening':'reading',prompt:listening?'Listen. What does the French phrase mean?':`What does “${w.fr}” mean?`,audio:w.fr,answer:w.en,choices:shuffled(choices,seed+i+37),explanation:`${w.fr} means ${w.en}.`});
 });
 if(mode!=='listening')lesson.tasks.forEach((q,i)=>tasks.push({...q,id:`${lesson.id}:task:${i}`,lessonId:lesson.id,skill:q.kind==='choice'?'reading':'writing',choices:q.choices?shuffled(q.choices,seed+i+83):undefined}));
 return tasks;
}
export function checkpoint(stage,lessons,seed=1){
 const eligible=lessons.filter(l=>l.stage===stage);
 return shuffled(eligible.flatMap(l=>shuffled(makeExercises(l,lessons,seed),seed+l.id.length).slice(0,2)),seed).slice(0,12);
}
export function summarize(tasks,answers){
 const skills={},missed=[];let correct=0,assisted=0,answered=0;
 tasks.forEach((q,i)=>{const a=answers[i];const skill=q.skill||'reading';skills[skill]??={correct:0,total:0,assisted:0};skills[skill].total++;
  const helped=!!a?.assisted;const ok=!!a&&!a.skipped&&!helped&&assess(q,a.response).correct;
  if(a&&!a.skipped&&normalize(a.response))answered++;
  if(helped){assisted++;skills[skill].assisted++;}
  if(ok){correct++;skills[skill].correct++;}else missed.push({id:q.id,prompt:q.prompt,answer:q.answer,response:a?.response||'',explanation:q.explanation||'',assisted:helped});
 });
 const total=tasks.length,pct=total?Math.round(correct/total*100):0;
 return {total,answered,correct,assisted,pct,stars:total?(pct>=90?3:pct>=70?2:1):0,skills,missed};
}
export function emptyProgress(){return {version:VERSION,lessons:{},history:[]};}
const finite=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(n)&&n>=min&&n<=max;
export function cleanProgress(input,lessonIds=[]){
 const clean=emptyProgress();if(!input||input.version!==VERSION)return clean;
 const allowed=new Set(lessonIds);
 if(input.lessons&&typeof input.lessons==='object')for(const [id,r] of Object.entries(input.lessons)){
  if(!allowed.has(id)||!r||![r.best,r.latest].every(n=>finite(n,0,100))||!Number.isInteger(r.attempts)||!finite(r.attempts,1,100000)||!Number.isInteger(r.stars)||!finite(r.stars,1,3)||!finite(r.date)||!finite(r.due)||!Number.isInteger(r.box)||!finite(r.box,0,4))continue;
  clean.lessons[id]={best:r.best,latest:r.latest,attempts:r.attempts,stars:r.stars,date:r.date,due:r.due,box:r.box};
 }
 if(Array.isArray(input.history))clean.history=input.history.filter(r=>r&&typeof r.id==='string'&&/^[a-z0-9:_-]{1,100}$/.test(r.id)&&finite(r.date)&&Number.isInteger(r.total)&&finite(r.total,1,200)&&Number.isInteger(r.correct)&&finite(r.correct,0,r.total)&&Number.isInteger(r.assisted)&&finite(r.assisted,0,r.total)&&r.skills&&typeof r.skills==='object'&&Object.entries(r.skills).every(([k,s])=>['reading','listening','writing','conversation'].includes(k)&&s&&Number.isInteger(s.total)&&finite(s.total,1,200)&&Number.isInteger(s.correct)&&finite(s.correct,0,s.total)&&Number.isInteger(s.assisted)&&finite(s.assisted,0,s.total))).slice(0,100).map(r=>({id:r.id,date:r.date,total:r.total,correct:r.correct,assisted:r.assisted,skills:r.skills}));
 return clean;
}
export function recordCompletion(progress,id,result,now=Date.now(),isLesson=true){
 if(!result.total)return progress;
 const next={version:VERSION,lessons:{...progress.lessons},history:[{id,date:now,total:result.total,correct:result.correct,assisted:result.assisted,skills:result.skills},...progress.history].slice(0,100)};
 if(isLesson){const prev=progress.lessons[id];const box=result.pct>=80?(prev?Math.min(4,prev.box+(now>=prev.due?1:0)):0):0;
  next.lessons[id]={best:Math.max(prev?.best||0,result.pct),latest:result.pct,attempts:Math.min(100000,(prev?.attempts||0)+1),stars:Math.max(prev?.stars||0,result.stars),date:now,due:now+[1,3,7,14,30][box]*DAY,box};
 }
 return next;
}
export function reviewQueue(progress,lessons,now=Date.now()){
 return lessons.filter(l=>progress.lessons[l.id]&&progress.lessons[l.id].due<=now).sort((a,b)=>progress.lessons[a.id].due-progress.lessons[b.id].due||progress.lessons[a.id].latest-progress.lessons[b.id].latest);
}
export function skillSummary(progress){
 const sums={};for(const r of progress.history.slice(0,10))for(const [k,s] of Object.entries(r.skills)){sums[k]??={total:0,correct:0,assisted:0};for(const field of ['total','correct','assisted'])sums[k][field]+=s[field];}
 return Object.entries(sums).map(([skill,s])=>({...s,skill,pct:Math.round(s.correct/s.total*100),label:s.total<10?'Keep exploring':s.correct/s.total>=.8?'Going well':s.correct/s.total>=.5?'Growing':'Try together'}));
}
