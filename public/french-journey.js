import {lessons as courseLessons, stories, conversations, stages} from './french-data.js';

export const VERSION = 1;
// Bump when authored task ordering or resume-relevant content changes.
export const contentVersion = 1;
const lessonOrder = [
  'sound-hello','introductions','feelings','alphabet','family','school',
  'food','articles','avoir-etre','questions','days','numbers','colors',
  'er-verbs','negation','gender-agreement','where-things-are','directions',
  'time','weather','shopping','routine','future-plans','connectors',
  'passe-compose','imparfait','story-sequence','opinions','pros-cons',
  'possibilities','repair','plans-talk','opinions-chat','directions-chat',
  'shopping-chat','story-chat',
  'library-loans','club-signup','weekend-invite','recipe-steps','market-ingredients','garden-help',
  'train-trip','trail-walk','museum-choice','lost-property','poster-project','project-update'
];
const byId = new Map(courseLessons.map(l => [l.id, l]));
const chapterDefs = [
  ['first-hello','Hello and introductions','Say hello, share a fictional name, and ask how someone feels.','Start a friendly conversation with a greeting, a name, and a simple feeling.',['Greet someone and say your name.','Ask how someone feels.','Close a short conversation politely.'],'Practise a two-line greeting with a toy or imaginary character.',3],
  ['people-and-days','People, school and everyday life','Talk about familiar people, school, food, and simple routines.','Use short phrases to describe familiar people and everyday choices.',['Name a family member or friend.','Say what you like to eat.','Describe a simple school day.'],'Name three things you might see in a classroom and say them in French.',5],
  ['ask-and-find','Ask questions and find things','Ask clear questions, describe objects, and follow simple directions.','Find a place or object by asking and listening for useful details.',['Ask where something is.','Use a simple negative.','Follow a short direction.'],'Give an imaginary toy one French direction: à gauche, à droite, or tout droit.',5],
  ['daily-plans','Daily life and plans','Talk about time, weather, shopping, routines, and tomorrow.','Make a simple plan and explain what you need for the day.',['Say what the weather is like.','Ask for something politely.','Describe a plan for tomorrow.'],'Choose tomorrow’s weather and say one item you would take.',6],
  ['stories-and-choices','Stories and choices','Describe past events, compare options, and share a reason.','Tell what happened and connect ideas with useful time words.',['Say what happened yesterday.','Give a reason for a choice.','Put events in order.'],'Tell a tiny three-part story using d’abord, ensuite, and finalement.',7],
  ['conversation-builder','Keep a conversation going','Repair a misunderstanding, negotiate plans, and tell a connected story.','Respond flexibly when a plan changes or a word is missing.',['Ask someone to repeat.','Suggest and adjust a plan.','Share a connected past story.'],'Role-play changing a pretend meeting time and agree on a new one.',7],
  ['community-and-hobbies','Community and hobbies','Take part in activities around the neighbourhood.','Make a plan with a friend and ask for what you need.',['Ask about borrowing a book or joining a club.','Suggest another day for an activity.','Follow a recipe and ask for a measured amount.'],'Pretend to plan a club snack. Choose two ingredients and say how much you need.',7],
  ['outings-and-projects','Outings and projects','Ask for travel information and work on a shared project.','Compare choices, solve a small problem, and give a progress update.',['Check a departure time and platform.','Describe a missing item.','Say what your group has finished and what remains.'],'Plan a pretend nature poster together. Say who will draw and who will write.',7]
];
export const journeyChapters = chapterDefs.map(([id,title,goal,description,canDo,homeActivity,daysHint],i)=>({
  id,title,goal,description,lessonIds:lessonOrder.slice(i*6,i*6+6),
  missionId:['first-chat','everyday-chat','find-the-library','market-order','park-story','change-the-plan','sign-up-for-an-activity','finish-the-nature-display'][i],
  canDo,homeActivity,daysHint
}));

const turn=(speaker,fr,en,choices,answer,reply,explanation)=>({speaker,fr,en,choices:choices.map(([fr,en])=>({fr,en})),answer,reply,explanation});
export const missions=[
 {id:'first-chat',title:'Say hello and meet someone',chapterId:'first-hello',scene:'Two fictional classmates meet before an activity.',goal:'Greet someone, share a fictional name, ask how they feel, and say goodbye.',turns:[
  turn('Noé','Bonjour !','Hello!',[['Bonjour !','Hello!'],['Au revoir !','Goodbye!']],0,'Tu t’appelles comment ?','A greeting is a natural first response.'),
  turn('Noé','Je m’appelle Noé. Et toi ?','My name is Noé. And you?',[['Je m’appelle Lina.','My name is Lina.'],['Je suis au marché.','I am at the market.']],0,'Enchanté, Lina. Ça va ?','Give a fictional name and return the question.'),
  turn('Noé','Ça va bien, merci. Et toi ?','I am well, thank you. And you?',[['Ça va bien aussi, merci.','I am well too, thank you.'],['J’ai trois pommes.','I have three apples.']],0,'Très bien !','A simple feeling answer keeps the exchange going.'),
  turn('Noé','Ça va bien. À bientôt !','I am well. See you soon!',[['À bientôt !','See you soon!'],['Je ne sais pas.','I do not know.']],0,'Au revoir !','A friendly goodbye closes the conversation.') ]},
 {id:'everyday-chat',title:'Talk about a school day',chapterId:'people-and-days',scene:'Two fictional classmates chat about a school garden.',goal:'Ask about a familiar activity and respond with a simple detail.',turns:[
  turn('Mina','Tu aimes le jardin de l’école ?','Do you like the school garden?',[['Oui, j’aime les plantes.','Yes, I like plants.'],['Je m’appelle jardin.','My name is garden.']],0,'Qu’est-ce que tu fais dans le jardin ?','Answer the question with a relevant preference.'),
  turn('Noé','J’arrose les fleurs avec la classe.','I water the flowers with the class.',[['C’est une belle activité.','That is a nice activity.'],['Il est trois heures.','It is three o’clock.']],0,'Tu as une fleur préférée ?','A kind reaction fits the topic.'),
  turn('Mina','J’aime les fleurs jaunes.','I like yellow flowers.',[['Moi aussi, elles sont jolies.','Me too, they are pretty.'],['Je ne vais jamais école.','I never go school.']],0,'Nous pouvons les dessiner demain.','Respond to the shared detail.'),
  turn('Noé','Bonne idée, à demain !','Good idea, see you tomorrow!',[['À demain !','See you tomorrow!'],['Où est la rue ?','Where is the street?']],0,'À demain !','A simple farewell ends the chat.') ]},
 {id:'find-the-library',title:'Find the library',chapterId:'ask-and-find',scene:'A fictional visitor asks a local student for directions.',goal:'Ask where a place is, listen, and check the route.',turns:[
  turn('Visiteur','Excusez-moi, où est la bibliothèque ?','Excuse me, where is the library?',[['Elle est près de l’école.','It is near the school.'],['Je mange une soupe.','I am eating soup.']],0,'Continuez tout droit, puis tournez à gauche.','A location answers the question.'),
  turn('Élève','Continuez tout droit, puis tournez à gauche.','Go straight ahead, then turn left.',[['Je continue tout droit et je tourne à gauche ?','I go straight ahead and turn left?'],['La bibliothèque est une pomme.','The library is an apple.']],0,'Oui, c’est bien ça.','Repeat the key directions to check understanding.'),
  turn('Visiteur','Est-elle loin ?','Is it far?', [['Non, elle est à cinq minutes à pied.','No, it is a five-minute walk.'],['Je ne suis pas une rue.','I am not a street.']],0,'Vous verrez l’entrée près du parc.','A short distance answers the question.'),
  turn('Élève','Vous avez compris ?','Did you understand?', [['Oui, merci de votre aide !','Yes, thank you for your help!'],['Hier, je tourne à gauche.','Yesterday, I turn left.']],0,'Avec plaisir !','Thank the helper and close politely.') ]},
 {id:'market-order',title:'Order a snack',chapterId:'daily-plans',scene:'A fictional student orders a snack at a market stall.',goal:'Make a polite request, understand a price, and finish the exchange.',turns:[
  turn('Vendeur','Bonjour, qu’est-ce que vous désirez ?','Hello, what would you like?',[['Je voudrais une poire, s’il vous plaît.','I would like a pear, please.'],['Où est la bibliothèque ?','Where is the library?']],0,'Bien sûr. Vous en voulez une ou deux ?','A polite request answers what the customer wants.'),
  turn('Cliente','Une seule, merci. Combien ça coûte ?','Just one, thank you. How much does it cost?',[['Ça coûte deux euros.','It costs two euros.'],['Je suis derrière la porte.','I am behind the door.']],0,'Voilà votre poire.','Ask about the price after choosing.'),
  turn('Vendeur','Ça coûte deux euros.','It costs two euros.',[['Voici deux euros. Merci !','Here are two euros. Thank you!'],['Je n’aime pas parler hier.','I do not like to speak yesterday.']],0,'Merci beaucoup.','Complete the purchase politely.'),
  turn('Cliente','Merci, bonne journée !','Thank you, have a good day!',[['Bonne journée !','Have a good day!'],['Il pleuvait demain.','It was raining tomorrow.']],0,'Au revoir !','A friendly closing is appropriate.') ]},
 {id:'park-story',title:'Tell a park story',chapterId:'stories-and-choices',scene:'A fictional friend tells what happened on a walk.',goal:'Describe the setting, a past event, and what happened next.',turns:[
  turn('Ari','Qu’as-tu fait hier ?','What did you do yesterday?',[['Je suis allé au parc.','I went to the park.'],['Je vais au parc demain.','I am going to the park tomorrow.']],0,'Quel temps faisait-il ?','Answer with a completed past activity.'),
  turn('Lina','Il faisait beau et les oiseaux chantaient.','The weather was nice and the birds were singing.', [['C’est un joli décor.','That is a lovely setting.'],['Je voudrais un reçu.','I would like a receipt.']],0,'Qu’est-ce qui s’est passé ensuite ?','This describes the background of the story.'),
  turn('Ari','Nous avons trouvé un petit sentier.','We found a small path.', [['Où menait-il ?','Where did it lead?'],['À quelle heure est-il ?','What time is it?']],0,'Il menait à un étang.','Ask a relevant follow-up about the discovery.'),
  turn('Lina','Après, nous avons observé les canards.','Afterwards, we watched the ducks.', [['Quelle belle promenade !','What a lovely walk!'],['Je ne comprends pas la taille.','I do not understand the size.']],0,'Oui, nous y retournerons bientôt.','React and connect the story to a future plan.') ]},
 {id:'change-the-plan','title':'Change the plan',chapterId:'conversation-builder',scene:'Two fictional friends adjust a meeting when a place is closed.',goal:'Suggest another place, agree on a time, and confirm the plan.',turns:[
  turn('Jules','La médiathèque est fermée aujourd’hui.','The library is closed today.', [['Dommage. Où pouvons-nous aller ?','That is a shame. Where can we go?'],['Je m’appelle fermé.','My name is closed.']],0,'Le parc est ouvert, mais il peut pleuvoir.','Ask for another option.'),
  turn('Maya','On pourrait se retrouver au musée.','We could meet at the museum.', [['Bonne idée. À quelle heure ?','Good idea. What time?'],['Je suis une heure.','I am an hour.']],0,'Vers trois heures ?','Respond to the suggestion and make the plan specific.'),
  turn('Jules','Trois heures, ça marche. Où est l’entrée ?','Three o’clock works. Where is the entrance?', [['Devant la grande porte, près du jardin.','In front of the big door, near the garden.'],['Hier, je vais à la maison.','Yesterday, I go home.']],0,'Parfait, je t’attends là.','Confirm the meeting details.'),
  turn('Maya','D’accord. Si je suis en retard, je t’envoie un message.','All right. If I am late, I will send you a message.', [['Merci, à tout à l’heure !','Thanks, see you later!'],['Je ne sais jamais un musée.','I never know a museum.']],0,'À tout à l’heure !','A practical backup keeps the changed plan clear.') ]},
 {id:'sign-up-for-an-activity',title:'Sign up for a cooking workshop',chapterId:'community-and-hobbies',scene:'You want to join the cooking workshop at the library. You are free only on Sunday, and you can bring apples.',goal:'Ask to sign up, choose a session and check what to bring.',turns:[
  turn('Camille','Bonjour ! Qu’est-ce qui vous intéresse ?','Hello! What are you interested in?',[['Je voudrais m’inscrire à l’atelier de dessin.','I would like to sign up for the drawing workshop.'],['Je voudrais m’inscrire à l’atelier de cuisine.','I would like to sign up for the cooking workshop.']],1,'Il reste des places samedi et dimanche.','Use m’inscrire à to ask to sign up. Cuisine identifies the cooking workshop.'),
  turn('Camille','Il reste des places samedi et dimanche.','There are still places available on Saturday and Sunday.',[['Dimanche, ça me va. À quelle heure ?','Sunday works for me. What time?'],['Samedi, ça me va. À quelle heure ?','Saturday works for me. What time?']],0,'La séance de dimanche commence à dix heures.', 'Choose the day you are free and ask for the time.'),
  turn('Camille','La séance de dimanche commence à dix heures.','The Sunday session starts at ten.',[['Il faut apporter quoi pour la recette ?','What do we need to bring for the recipe?'],['Il faut arriver à neuf heures ?','Do we need to arrive at nine?']],0,'Il faut apporter un kilo de pommes ou une barquette de fraises.', 'Il faut asks here what the recipe requires.'),
  turn('Camille','Il faut apporter un kilo de pommes ou une barquette de fraises.','Bring either a kilo of apples or a small tray of strawberries.',[['Je peux apporter une barquette de fraises.','I can bring a small tray of strawberries.'],['Je peux apporter un kilo de pommes.','I can bring a kilo of apples.']],1,'Très bien, je vous inscris pour dimanche.', 'Offer to bring the quantity of apples requested.'),
  turn('Camille','Très bien, je vous inscris pour dimanche.','Great, I’ll sign you up for Sunday.',[['Merci. À dimanche, à dix heures !','Thank you. See you Sunday at ten!'],['Merci. À samedi, à dix heures !','Thank you. See you Saturday at ten!']],0,'À dimanche !', 'Thank Camille and confirm the day and time.') ]},
 {id:'finish-the-nature-display',title:'Finish a nature display',chapterId:'outings-and-projects',scene:'Your partner will finish the poster while you count photos. You have sorted three photos, including one of the footbridge.',goal:'Agree on jobs, report progress and confirm that the display is ready.',turns:[
  turn('Nadia','J’ai déjà choisi les photos du sentier. Il reste à les compter.','I’ve already chosen the trail photos. We still need to count them.',[['Je peux compter les photos pendant que tu termines l’affiche.','I can count the photos while you finish the poster.'],['Je peux terminer l’affiche pendant que tu comptes les photos.','I can finish the poster while you count the photos.']],0,'D’accord. Il y a de la place pour trois photos sur l’affiche.', 'Use je peux to offer to do your part. Pendant que links the two tasks.'),
  turn('Nadia','D’accord. Il y a de la place pour trois photos sur l’affiche.','All right. There is room for three photos on the poster.',[['J’ai déjà trié quatre photos.','I’ve already sorted four photos.'],['J’ai déjà trié trois photos.','I’ve already sorted three photos.']],1,'Parfait, on peut mettre les trois. Tu as une photo de la passerelle ?', 'Report the number of photos you have sorted.'),
  turn('Nadia','Parfait, on peut mettre les trois. Tu as une photo de la passerelle ?','Perfect, we can use all three. Do you have a photo of the footbridge?',[['Oui, la voici. On voit la rivière derrière.','Yes, here it is. You can see the river behind it.'],['Non, il faut encore en prendre une.','No, we still need to take one.']],0,'Super ! Il reste à écrire une légende pour cette photo.', 'Show the photo and describe what is visible in it.'),
  turn('Nadia','Super ! Il reste à écrire une légende pour cette photo.','Great! We still need to write a caption for this photo.',[['Je propose « Le train entre en gare ».','I suggest “The train arrives at the station”.'],['Je propose « La passerelle au-dessus de la rivière ».','I suggest “The footbridge over the river”.']],1,'Parfait, je l’écris. Voilà, l’affiche est prête.', 'Choose a caption that describes the photo.'),
  turn('Nadia','Parfait, je l’écris. Voilà, l’affiche est prête.','Perfect, I’ll write it. There, the poster is ready.',[['Super, on peut la présenter à la classe.','Great, we can show it to the class.'],['Il reste à choisir les trois photos.','We still need to choose the three photos.']],0,'Oui, allons-y !', 'Respond to the finished poster with the next step.') ]}
];

export function createJourney(){return {version:VERSION,draft:null,missions:{},flashcards:{},plan:{minutes:5,days:3},badges:[]};}
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const boundedText=(v,n)=>typeof v==='string'&&v.length<=n;
const knownMission=new Set(missions.map(m=>m.id));
const knownStory=new Set(stories.map(s=>s.id));
const knownConversation=new Set(conversations.map(c=>c.id));
const knownStage=new Set(stages.map(s=>s.id));
const validId=(kind,id,lessonIds)=> typeof id==='string'&&({
  lesson:lessonIds.has(id),cards:lessonIds.has(id),daily:id==='daily',checkpoint:knownStage.has(id),
  chat:knownConversation.has(id),story:knownStory.has(id),mission:knownMission.has(id)
}[kind]===true);

// Persist only a bounded replay descriptor and answer state. Generated task objects and HTML are reconstructed from content + seed.
export function validDraft(raw,lessonList=courseLessons){
 if(!raw||raw.version!==contentVersion||!['lesson','checkpoint','chat','story','mission','daily','cards'].includes(raw.kind))return null;
 const lessonIds=new Set(lessonList.map(l=>l.id));
 if(!validId(raw.kind,raw.id,lessonIds)||!finite(raw.seed,0,4294967295)||!Number.isInteger(raw.seed)||!Number.isInteger(raw.index)||!finite(raw.index,0,100))return null;
 if(!['mixed','reading','listening','text'].includes(raw.mode)||!finite(raw.updatedAt,0,Number.MAX_SAFE_INTEGER))return null;
 if(raw.kind==='daily'&&(!Array.isArray(raw.lessonIds)||raw.lessonIds.length<1||raw.lessonIds.length>lessonList.length||!raw.lessonIds.every(id=>lessonIds.has(id))))return null;
 if(raw.kind!=='daily'&&raw.lessonIds!=null)return null;
 if(!Array.isArray(raw.answers)||raw.answers.length>100||!raw.answers.every(a=>a===null||(a&&boundedText(a.response,250)&&typeof a.skipped==='boolean'&&typeof a.assisted==='boolean')))return null;
 if(raw.feedback!=null&&(!raw.feedback||!boundedText(raw.feedback.response,250)||typeof raw.feedback.skipped!=='boolean'||typeof raw.feedback.assisted!=='boolean'))return null;
 if(!Array.isArray(raw.tokens)||raw.tokens.length>60||!raw.tokens.every(t=>Number.isInteger(t)&&finite(t,0,1000000)))return null;
 if(raw.typed!=null&&!boundedText(raw.typed,250))return null;
 if(!['checked','retry','assisted','translated'].every(k=>typeof raw[k]==='boolean'))return null;
 return {version:contentVersion,kind:raw.kind,id:raw.id,...(raw.lessonIds?{lessonIds:[...raw.lessonIds]}:{}),mode:raw.mode,seed:raw.seed,index:raw.index,answers:raw.answers.map(a=>a===null?null:{response:a.response,skipped:a.skipped,assisted:a.assisted}),tokens:[...raw.tokens],typed:raw.typed||'',checked:raw.checked,retry:raw.retry,assisted:raw.assisted,translated:raw.translated,updatedAt:raw.updatedAt,...(raw.feedback?{feedback:{response:raw.feedback.response,skipped:raw.feedback.skipped,assisted:raw.feedback.assisted}}:{})};
}
export function cleanPlan(raw){const minutes=[5,10,15].includes(raw?.minutes)?raw.minutes:5,days=[2,3,5,7].includes(raw?.days)?raw.days:3;return {minutes,days};}
export function cleanJourney(raw,lessonList=courseLessons){
 const clean=createJourney(); if(!raw||raw.version!==VERSION)return clean;
 clean.draft=validDraft(raw.draft,lessonList);
 if(raw.plan&&[5,10,15].includes(raw.plan.minutes)&&[2,3,5,7].includes(raw.plan.days))clean.plan=cleanPlan(raw.plan);
 if(raw.missions&&typeof raw.missions==='object')for(const [id,r] of Object.entries(raw.missions)){
  if(!knownMission.has(id)||!r||!finite(r.best,0,100)||!Number.isInteger(r.attempts)||!finite(r.attempts,1,100000)||!finite(r.date,0,Number.MAX_SAFE_INTEGER)||!Number.isInteger(r.answered)||!finite(r.answered,0,6)||!Number.isInteger(r.assisted)||!finite(r.assisted,0,6)||!Number.isInteger(r.skipped)||!finite(r.skipped,0,6))continue;
  clean.missions[id]={best:r.best,attempts:r.attempts,date:r.date,answered:r.answered,assisted:r.assisted,skipped:r.skipped};
 }
 if(raw.flashcards&&typeof raw.flashcards==='object')for(const [id,r] of Object.entries(raw.flashcards)){
  if(!new Set(lessonList.map(l=>l.id)).has(id)||!r||!Number.isInteger(r.known)||!finite(r.known,0,1000)||!Number.isInteger(r.total)||!finite(r.total,1,1000)||r.known>r.total||!finite(r.date,0,Number.MAX_SAFE_INTEGER))continue;
  clean.flashcards[id]={known:r.known,total:r.total,date:r.date};
 }
 return clean;
}
export function recordMission(journey,id,result,now=Date.now()){
 if(!knownMission.has(id)||!result||!finite(result.pct,0,100)||!Number.isInteger(result.answered)||!finite(result.answered,0,6)||!Number.isInteger(result.assisted??0)||!finite(result.assisted??0,0,6)||!Number.isInteger(result.skipped??0)||!finite(result.skipped??0,0,6)||!finite(now,0,Number.MAX_SAFE_INTEGER))return journey;
 const assisted=result.assisted??0,skipped=result.skipped??0;
 const prev=journey.missions[id], eligible=result.answered>=4&&assisted===0&&skipped===0;
 const isNewBest=eligible&&result.pct>(prev?.best||-1);
 const nextBest=eligible?Math.max(prev?.best||0,result.pct):(prev?.best||0);
 return {...journey,missions:{...journey.missions,[id]:{best:nextBest,attempts:Math.min(100000,(prev?.attempts||0)+1),date:now,answered:isNewBest?result.answered:(prev?.answered||0),assisted:isNewBest?assisted:(prev?.assisted||0),skipped:isNewBest?skipped:(prev?.skipped||0)}}};
}
export function recordFlashcards(journey,lessonId,known,total,now=Date.now()){
 if(!byId.has(lessonId)||!Number.isInteger(known)||!finite(known,0,1000)||!Number.isInteger(total)||!finite(total,1,1000)||known>total||!finite(now,0,Number.MAX_SAFE_INTEGER))return journey;
 const prev=journey.flashcards[lessonId];return {...journey,flashcards:{...journey.flashcards,[lessonId]:{known,total,date:now}}};
}
export function chapterStatus(chapter,progress,journey){
 const rows=chapter.lessonIds.map(id=>progress?.lessons?.[id]),mastered=rows.filter(r=>r&&r.best>=70).length,mission=journey?.missions?.[chapter.missionId];
 const missionPassed=!!mission&&mission.best>=70&&mission.answered>=4&&mission.assisted===0&&mission.skipped===0;
 const nextLessonId=chapter.lessonIds.find(id=>!progress?.lessons?.[id]||progress.lessons[id].best<70)||null;
 return {mastered,total:chapter.lessonIds.length,missionPassed,complete:mastered===chapter.lessonIds.length&&missionPassed,nextLessonId};
}
export function earnedBadges(progress,journey){
 const lessonEntries=Object.entries(progress?.lessons||{}),firstLesson=lessonEntries.some(([,r])=>r?.best>=70);
 const passed=missions.some(m=>chapterStatus(journeyChapters.find(c=>c.id===m.chapterId),progress,journey).missionPassed);
 const vocab=Object.values(journey?.flashcards||{}).some(r=>r.total>=5);
 const chapterBadges=journeyChapters.map(c=>({id:`chapter:${c.id}`,title:c.title,description:`Reach 70% first-answer accuracy on all ${c.lessonIds.length} lessons and complete “${missions.find(m=>m.id===c.missionId).title}” without help at 70% or higher.`,earned:chapterStatus(c,progress,journey).complete}));
 const complete=chapterBadges.every(b=>b.earned);
 return [
  {id:'first-lesson',title:'First lesson',description:'Reach 70% first-answer accuracy on one lesson.',earned:firstLesson},
  {id:'first-conversation',title:'First conversation',description:'Complete a guided mission without help at 70% or higher.',earned:passed},
  {id:'vocabulary-review',title:'Vocabulary review',description:'Rate at least five reviewed cards for yourself.',earned:vocab},
  ...chapterBadges,
  {id:'journey-complete',title:'Journey passport',description:`Complete all ${journeyChapters.length} chapters and their guided missions.`,earned:complete}
 ];
}
export function recommendedStep(progress,journey){
 for(const chapter of journeyChapters){const status=chapterStatus(chapter,progress,journey);if(status.nextLessonId)return {kind:'lesson',id:status.nextLessonId,chapterId:chapter.id};if(!status.missionPassed)return {kind:'mission',id:chapter.missionId,chapterId:chapter.id};}
 return {kind:'complete',id:null,chapterId:null};
}
