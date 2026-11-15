import {dimensions,preferenceQuestions,interests,interestQuestions,careers} from './discovery-data.js';
export const VERSION=1;
export function questionsFor(kind,grade){
 if(!Number.isInteger(grade)||grade<1||grade>10)throw Error('Choose a grade from 1 to 10.');
 if(kind==='preferences')return preferenceQuestions;
 if(kind==='interests')return interestQuestions(grade<=3);
 throw Error('Unknown questionnaire.');
}
export function score(kind,grade,answers){
 const questions=questionsFor(kind,grade);
 if(!Array.isArray(answers)||answers.length!==questions.length||answers.some(a=>a!==null&&(!Number.isInteger(a)||a<1||a>5)))throw Error('Invalid responses.');
 const groups=kind==='preferences'?dimensions:interests;
 const scales=groups.map(d=>{
   const values=questions.flatMap((q,i)=>q.dimension===d.id&&answers[i]!==null?[kind==='preferences'&&q.reverse?6-answers[i]:answers[i]]:[]);
   const available=questions.filter(q=>q.dimension===d.id).length;
   const minimum=kind==='preferences'?6:grade<=3?2:4;
   const ready=values.length>=minimum;
   const raw=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
   const value=raw===null?null:Math.round((raw-1)*25);
   return {id:d.id,answered:values.length,available,ready,value,mean:raw===null?null:Math.round(raw*100)/100,
     pole:kind==='preferences'&&ready?(value<40?d.id[0]:value>60?d.id[1]:'X'):null};
 });
 const ready=scales.every(d=>d.ready);
 return {kind,scales,ready,answered:answers.filter(a=>a!==null).length,total:questions.length,
   code:kind==='preferences'&&ready?scales.map(d=>d.pole).join(''):null};
}
export function careerSuggestions(result){
 if(result?.kind!=='interests'||!result.ready)return [];
 return careers.map(c=>{
   const matched=c.tags.map(id=>result.scales.find(d=>d.id===id));
   // An ordinal editorial sorting aid. Never display this as suitability/probability.
   return {...c,order:matched.reduce((n,d)=>n+d.value,0)/matched.length,
     reasons:matched.map(d=>({id:d.id,mean:d.mean}))};
 }).sort((a,b)=>b.order-a.order||a.id.localeCompare(b.id,undefined,{numeric:true}));
}
export function validRecord(r){
 try{return r?.version===VERSION&&[1,2,3].includes(r.profile)&&Number.isFinite(r.date)&&r.date>0&&
   (r.kind!=='preferences'||r.self16===true)&&!!score(r.kind,r.grade,r.answers);}catch{return false;}
}
export function recordsFor(records,profile,grade){return records.filter(r=>validRecord(r)&&r.profile===profile&&r.grade===grade).sort((a,b)=>b.date-a.date);}
export function discoveryKey(userId=null){if(userId!==null&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId))throw Error('Invalid account identifier');return `reasonlab-discovery-v1${userId?':'+userId:''}`;}
