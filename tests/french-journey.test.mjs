import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,conversations,stories,stages} from '../public/french-data.js';
import {VERSION,contentVersion,journeyChapters,missions,createJourney,cleanJourney,cleanPlan,validDraft,chapterStatus,recordMission,earnedBadges,recommendedStep,recordFlashcards} from '../public/french-journey.js';

const independent=(pct=80)=>({pct,answered:4,assisted:0,skipped:0});
const cleanProgress=()=>({lessons:{}});

test('six chapters cover all lessons once and open with conversational essentials',()=>{
 assert.equal(journeyChapters.length,6);
 assert.equal(journeyChapters[0].lessonIds[0],'sound-hello');
 assert.equal(journeyChapters[0].lessonIds[1],'introductions');
 assert.equal(journeyChapters[0].lessonIds[2],'feelings');
 assert.deepEqual([...new Set(journeyChapters.flatMap(c=>c.lessonIds))].sort(),lessons.map(l=>l.id).sort());
 for(const c of journeyChapters){assert.equal(c.lessonIds.length,6);assert.equal(c.canDo.length,3);assert.ok(c.homeActivity);assert.ok(c.daysHint>0);assert.ok(missions.some(m=>m.id===c.missionId&&m.chapterId===c.id));}
});

test('six original missions have coherent, bilingual, child-safe choice turns',()=>{
 assert.equal(missions.length,6);
 assert.deepEqual(missions.map(m=>m.chapterId),journeyChapters.map(c=>c.id));
 for(const m of missions){assert.ok(m.turns.length>=4&&m.turns.length<=6);for(const t of m.turns){assert.ok(t.speaker&&t.fr&&t.en&&t.reply&&t.explanation);assert.equal(t.choices.length,2);assert.ok(Number.isInteger(t.answer)&&t.answer>=0&&t.answer<t.choices.length);assert.ok(t.choices.every(c=>c.fr&&c.en));}}
 assert.match(missions[0].turns[1].fr,/Noé/);
 assert.doesNotMatch(JSON.stringify(missions),/email|phone|address|password/i);
});

test('journey defaults, plan limits, and legacy migration are bounded',()=>{
 assert.deepEqual(createJourney(),{version:VERSION,draft:null,missions:{},flashcards:{},plan:{minutes:5,days:3},badges:[]});
 assert.deepEqual(cleanPlan({minutes:15,days:7}),{minutes:15,days:7});
 assert.deepEqual(cleanPlan({minutes:99,days:1}),{minutes:5,days:3});
 assert.deepEqual(cleanJourney(null),createJourney());
 assert.deepEqual(cleanJourney({version:0}).missions,{});
 const migrated=cleanJourney({version:VERSION,missions:{bogus:{best:100}},flashcards:{'nope':{known:1,total:1}}});
 assert.deepEqual(migrated.missions,{});assert.deepEqual(migrated.flashcards,{});
});

test('resume descriptors validate IDs and lengths, permit null first answers, and discard unsafe payloads',()=>{
 const draft={version:contentVersion,kind:'lesson',id:'sound-hello',seed:0,mode:'mixed',index:2,answers:[null,{response:'bonjour',skipped:false,assisted:false}],tokens:[0,2],typed:'',checked:false,retry:false,assisted:false,translated:false,updatedAt:10};
 assert.deepEqual(validDraft(draft),draft);
 assert.equal(validDraft({...draft,id:'unknown'}),null);
 assert.equal(validDraft({...draft,kind:'chat',id:'unknown'}),null);
 assert.equal(validDraft({...draft,version:contentVersion+1}),null);
 assert.equal(validDraft({...draft,seed:-1}),null);
 assert.equal(validDraft({...draft,index:101}),null);
 assert.equal(validDraft({...draft,answers:[{response:'x'.repeat(251),skipped:false,assisted:false}]}),null);
 assert.equal(validDraft({...draft,answers:Array(101).fill(null)}),null);
 assert.equal(validDraft({...draft,tokens:Array(61).fill(1)}),null);
 assert.equal(validDraft({...draft,tokens:[-1]}),null);
 assert.equal(validDraft({...draft,typed:'x'.repeat(251)}),null);
 assert.equal(validDraft({...draft,mode:'html'}),null);
 assert.equal(validDraft({...draft,answers:[{response:'yes',skipped:'false',assisted:false}]}),null);
 assert.equal(validDraft({...draft,tasks:[{html:'unsafe'}]}).tasks,undefined);
 const daily={...draft,kind:'daily',id:'daily',lessonIds:['sound-hello','introductions']};
 assert.deepEqual(validDraft(daily),daily);
 assert.equal(validDraft({...daily,lessonIds:['invented']}),null);
 assert.equal(validDraft({...draft,kind:'cards',id:'sound-hello'}).kind,'cards');
 assert.equal(validDraft({...draft,kind:'checkpoint',id:stages[0].id}).kind,'checkpoint');
 assert.equal(validDraft({...draft,kind:'chat',id:conversations[0].id}).kind,'chat');
 assert.equal(validDraft({...draft,kind:'story',id:stories[0].id}).kind,'story');
});

test('mission pass requires an independent four-answer attempt and survives weaker retries',()=>{
 let journey=createJourney(),progress=cleanProgress();
 assert.deepEqual(recommendedStep(progress,journey),{kind:'lesson',id:'sound-hello',chapterId:'first-hello'});
 for(const id of journeyChapters[0].lessonIds)progress.lessons[id]={best:75};
 assert.equal(chapterStatus(journeyChapters[0],progress,journey).nextLessonId,null);
 assert.equal(chapterStatus(journeyChapters[0],progress,journey).complete,false);
 assert.deepEqual(recommendedStep(progress,journey),{kind:'mission',id:'first-chat',chapterId:'first-hello'});
 journey=recordMission(journey,'first-chat',{pct:100,answered:0,assisted:0,skipped:4},1);
 assert.equal(journey.missions['first-chat'].best,0);
 journey=recordMission(journey,'first-chat',{pct:100,answered:4,assisted:1,skipped:0},2);
 assert.equal(journey.missions['first-chat'].best,0);
 journey=recordMission(journey,'first-chat',independent(75),3);
 assert.equal(chapterStatus(journeyChapters[0],progress,journey).complete,true);
 journey=recordMission(journey,'first-chat',{pct:20,answered:3,assisted:0,skipped:1},4);
 assert.equal(journey.missions['first-chat'].attempts,4);
 assert.equal(chapterStatus(journeyChapters[0],progress,journey).missionPassed,true);
 assert.deepEqual(recommendedStep(progress,journey),{kind:'lesson',id:'food',chapterId:'people-and-days'});
});

test('mission retries do not duplicate path progress; badges are derived and rating is explicit',()=>{
 let progress=cleanProgress(),journey=createJourney();
 assert.equal(earnedBadges(progress,journey).some(b=>b.earned),false);
 progress.lessons['sound-hello']={best:70};
 assert.equal(earnedBadges(progress,journey).find(b=>b.id==='first-lesson').earned,true);
 journey=recordMission(journey,'first-chat',independent(80),1);
 journey=recordMission(journey,'first-chat',independent(90),2);
 journey=recordMission(journey,'first-chat',{pct:100,answered:4,assisted:2,skipped:0},3);
 assert.equal(journey.missions['first-chat'].attempts,3);
 assert.equal(journey.missions['first-chat'].best,90);
 assert.equal(earnedBadges(progress,journey).find(b=>b.id==='first-conversation').earned,true);
 const unchanged=recordFlashcards(journey,'bad-id',2,5,10);
 assert.equal(unchanged,journey);
 journey=recordFlashcards(journey,'sound-hello',3,5,10);
 assert.equal(earnedBadges(progress,journey).find(b=>b.id==='vocabulary-review').earned,true);
 assert.equal(earnedBadges(progress,journey).find(b=>b.id==='journey-complete').earned,false);
});

test('chapter stamps require all six lessons and that chapter mission; final passport requires all stamps',()=>{
 let progress=cleanProgress(),journey=createJourney();
 for(const id of journeyChapters[0].lessonIds)progress.lessons[id]={best:70};
 const stampId=`chapter:${journeyChapters[0].id}`;
 assert.equal(earnedBadges(progress,journey).find(b=>b.id===stampId).earned,false);
 journey=recordMission(journey,'first-chat',{pct:70,answered:4},10);
 let badges=earnedBadges(progress,journey);
 assert.equal(badges.find(b=>b.id===stampId).earned,true);
 assert.match(badges.find(b=>b.id===stampId).description,/70% first-answer accuracy/);
 assert.equal(badges.filter(b=>b.id.startsWith('chapter:')&&b.earned).length,1);
 assert.equal(badges.find(b=>b.id==='journey-complete').earned,false);
});

