// Rebuild saved activities from trusted course content, never from saved HTML/tasks.
import {lessons,stages,conversations,stories} from './french-data.js';
import {makeExercises,checkpoint,shuffled} from './french-engine.js';
import {missions,validDraft} from './french-journey.js';
export function activityFor(descriptor){
 const d={mode:'mixed',...descriptor},random=d.seed||1;
 let tasks=[],id=d.id,title='',lesson=false,passage=null,translation=null,conversation=null;
 if(d.kind==='lesson'||d.kind==='cards'){
  const l=lessons.find(x=>x.id===d.id);if(!l)throw Error('Unknown lesson');title=l.title;lesson=d.kind==='lesson'&&d.mode!=='listening';
  tasks=d.kind==='cards'?l.words.map((w,i)=>({id:`${l.id}:card:${i}`,answer:w.en})):makeExercises(l,lessons,random,d.mode);
 }else if(d.kind==='checkpoint'){
  const stage=stages.find(x=>x.id===d.id);if(!stage)throw Error('Unknown stage');tasks=checkpoint(d.id,lessons,random);id=`checkpoint:${d.id}`;title=stage.title+' checkpoint';
 }else if(d.kind==='story'){
  const story=stories.find(x=>x.id===d.id);if(!story)throw Error('Unknown story');id=`story:${d.id}`;title=story.title;passage=story.fr;translation=story.en;tasks=story.questions.map((q,i)=>({...q,id:`${id}:${i}`,kind:'choice',skill:'reading',choices:shuffled(q.choices,random+i)}));
 }else if(d.kind==='chat'||d.kind==='mission'){
  const c=(d.kind==='chat'?conversations:missions).find(x=>x.id===d.id);if(!c)throw Error('Unknown conversation');id=`${d.kind}:${d.id}`;title=c.title;conversation=c;
  tasks=c.turns.map((t,i)=>{const choices=shuffled(t.choices,random+i);return {id:`${id}:${i}`,kind:'choice',skill:'conversation',speaker:t.speaker,fr:t.fr,en:t.en,prompt:'What would you say next?',choices:choices.map(x=>x.fr),choiceTranslations:choices.map(x=>x.en),answer:t.choices[t.answer].fr,reply:t.reply,explanation:t.explanation};});
 }else if(d.kind==='daily'){
  const pool=(d.lessonIds||[]).map(id=>lessons.find(l=>l.id===id)).filter(Boolean);if(!pool.length)throw Error('Empty review');title='Today’s familiar-word mix';id='daily';tasks=shuffled(pool.flatMap(l=>makeExercises(l,lessons,random)),random).slice(0,10);
 }else throw Error('Unknown activity');
 return {descriptor:d,id,title,lesson,tasks,passage,translation,conversation,index:0,answers:[],tokens:[],typed:'',checked:false,retry:false,assisted:false,translated:false,feedback:null};
}
export function restoreActivity(raw){
 const d=validDraft(raw,lessons);if(!d)return null;
 try{const s=activityFor(d);if(d.index>=s.tasks.length||d.answers.length>s.tasks.length)return null;
  if(d.answers.some((a,i)=>i<d.index&&!a)||d.answers.some((a,i)=>i>d.index&&a))return null;
  if(d.checked&&!d.answers[d.index]&&d.kind!=='cards')return null;
  const tokenCount=s.tasks[d.index]?.kind==='build'?s.tasks[d.index].answer.split(' ').length:0;
  if(d.tokens.some(n=>n>=tokenCount)||new Set(d.tokens).size!==d.tokens.length)return null;
  return {...s,index:d.index,answers:d.answers,tokens:d.tokens,typed:d.typed,checked:d.checked,retry:d.retry,assisted:d.assisted,translated:d.translated,feedback:d.feedback||null};
 }catch{return null;}
}
export function activityDraft(s,now=Date.now()){
 if(!s)return null;
 return validDraft({...s.descriptor,version:1,index:s.index,answers:s.answers,tokens:s.tokens,typed:s.typed||'',checked:s.checked,retry:s.retry,assisted:s.assisted,translated:s.translated,feedback:s.feedback||null,updatedAt:now},lessons);
}
