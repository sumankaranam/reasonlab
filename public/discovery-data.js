// Original ReasonLab prompts. Not licensed MBTI or O*NET assessment items.
export const dimensions = [
  {id:'EI',title:'Where you recharge',left:'E · Shared activity',right:'I · Quiet reflection',explain:'Time with people and time alone can both help. This describes a current preference, not social skill.',tips:['Talk through a new idea with a willing partner, then make space for quiet thought.','Offer a moment to think or write before discussing an idea together.']},
  {id:'SN',title:'How you approach information',left:'S · Concrete details',right:'N · Possibilities',explain:'Specific examples and imaginative connections are both useful. This is not a creativity or intelligence score.',tips:['Start with a worked example, then ask how the idea might apply elsewhere.','Start with the big question, then test the idea against specific examples.']},
  {id:'TF',title:'What you consider in decisions',left:'T · Consistent criteria',right:'F · People and values',explain:'Everyone can reason and care. These options describe emphasis, not whether someone has empathy or logic.',tips:['Explain a shared rule and ask who it affects and how.','Discuss who is affected, then agree on a fair rule everyone understands.']},
  {id:'JP',title:'How you organise activities',left:'J · Planned structure',right:'P · Flexible exploration',explain:'Planning and adapting are skills anyone can develop. This is not a measure of responsibility.',tips:['Make a short plan with a buffer and a choice about how to begin.','Offer two ways to start, with one clear checkpoint and a realistic finish time.']}
];
const pairs = [
 ['EI','After a busy day I usually prefer','a shared activity with other people','some quiet time on my own'],
 ['EI','When an idea is forming, I like to','talk it through as it develops','think it through before discussing it'],
 ['EI','For a free afternoon I am often drawn to','doing something with a group','a solo activity or a small quiet meeting'],
 ['EI','In a new club I tend to','start several conversations','watch first and join a conversation later'],
 ['EI','When celebrating something good I prefer','bringing several people together','sharing it with one or two close people'],
 ['EI','A comfortable project session often includes','frequent discussion with teammates','longer stretches of independent work'],
 ['EI','When choosing a study break I lean toward','chatting or playing with others','a quieter activity with little conversation'],
 ['EI','Before presenting an idea I prefer to','try explaining it aloud with someone','prepare my thoughts privately first'],
 ['SN','When learning something unfamiliar I prefer','a specific example I can follow','an overview of the possibilities'],
 ['SN','When looking at a new object I first notice','its actual features and how it works','what else it could become or represent'],
 ['SN','A satisfying explanation starts with','observable facts and examples','a connecting idea or overall pattern'],
 ['SN','When improving a project I first consider','practical changes to what already exists','a different approach to the whole project'],
 ['SN','When describing a place I focus on','what I actually saw and did','the impressions and ideas it brought to mind'],
 ['SN','For a new assignment I would rather begin with','clear examples of the expected result','room to imagine several possible results'],
 ['SN','A question that often interests me is','How does this work in a real example?','What might happen if the situation changed?'],
 ['SN','When exploring a topic I naturally start with','the details and build toward the big picture','the big picture and then seek the details'],
 ['TF','When two reasonable choices compete I first compare','consistent criteria and likely outcomes','personal values and effects on people'],
 ['TF','When giving project feedback I start with','what meets the agreed standards','what matters to the person receiving it'],
 ['TF','When a group disagrees I first look for','a principle that applies to everyone','an understanding of each person’s concerns'],
 ['TF','When explaining a difficult decision I lead with','the reasons and trade-offs','the values and people I considered'],
 ['TF','A fair exception to a rule needs me to consider first','whether the same reasoning works in other cases','the particular circumstances of those involved'],
 ['TF','When choosing between two group plans I first ask','Which best meets our stated goals?','Which best respects what people care about?'],
 ['TF','In a friendly debate I am especially interested in','whether the argument holds together','why the issue matters to each person'],
 ['TF','When helping someone decide I usually begin by','mapping options and consequences','asking what feels important to them'],
 ['JP','For a project with time available I prefer','setting a plan before getting started','trying an approach and adjusting as I go'],
 ['JP','For a weekend outing I enjoy','knowing the main plan ahead of time','leaving several options open'],
 ['JP','When facing several tasks I like to','decide the order and finish one by one','switch between tasks as ideas develop'],
 ['JP','When a decision can wait I usually prefer','settling it so I can plan around it','keeping options open a little longer'],
 ['JP','A comfortable workspace helps me','see a clear system and next steps','reach several things I am exploring'],
 ['JP','When starting a group project I want to','agree on milestones early','explore ideas before fixing milestones'],
 ['JP','When plans change unexpectedly I prefer','quickly agreeing on a revised plan','seeing what new options become possible'],
 ['JP','At the beginning of an open afternoon I prefer','choosing what I will do first and next','deciding as the afternoon unfolds']
];
// Alternate the visible poles to reduce a repeated left-position response pattern.
export const preferenceQuestions=pairs.map(([dimension,prompt,a,b],i)=>({id:`p${i+1}`,dimension,prompt,a:i%2?b:a,b:i%2?a:b,reverse:!!(i%2)}));
export const interests=[
 {id:'R',name:'Making & doing',formal:'Realistic',description:'Hands-on projects, tools, movement and practical results.',activities:['Build a small bridge from paper and test it','Grow a plant and record what helps it thrive','Assemble a useful object from safe materials','Repair or improve something with adult supervision','Create a model that moves','Plan a safe outdoor observation walk']},
 {id:'I',name:'Investigating',formal:'Investigative',description:'Questions, experiments, evidence and understanding why.',activities:['Test which paper shape holds the most weight','Look for a pattern in a small set of numbers','Compare two explanations using evidence','Explore how a familiar machine works','Ask a question about nature and investigate it','Use a simple program or puzzle to test an idea']},
 {id:'A',name:'Creating',formal:'Artistic',description:'Stories, images, music, design and original expression.',activities:['Invent a character and tell their story','Design a poster with your own pictures','Make a rhythm or a short piece of music','Create a different ending to a story','Sketch a more useful everyday object','Make a short animation or performance']},
 {id:'S',name:'Helping & teaching',formal:'Social',description:'Explaining, listening, supporting and working with people.',activities:['Explain a game to someone learning it','Help someone practise something they chose','Listen to a friend’s idea and ask kind questions','Make a welcoming activity for a new group member','Teach a small skill you enjoy','Work with others on a community kindness project']},
 {id:'E',name:'Leading & persuading',formal:'Enterprising',description:'Starting projects, presenting ideas and organising people.',activities:['Suggest an activity and invite others to join','Explain why a group should try your idea','Plan a pretend stall with a useful product','Help a group choose a shared goal','Present a project to a friendly audience','Organise roles for a small team challenge']},
 {id:'C',name:'Organising & checking',formal:'Conventional',description:'Order, records, careful processes and reliable details.',activities:['Sort a collection so items are easy to find','Make a checklist for a small project','Keep a simple record of a plant or game','Find mistakes in a set of instructions','Plan how to use a pretend project budget','Create a schedule that includes breaks']}
];
export function interestQuestions(young=false){return interests.flatMap(d=>d.activities.slice(0,young?3:6).map((prompt,i)=>({id:`${d.id}${i+1}`,dimension:d.id,prompt}))).sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)));}
// Editorial exploration links, not occupational suitability or predicted success.
const careerRows=[
 ['Engineering & building','RI','Civil engineer, mechanical engineer, engineering technician','Maths, physics, design','Build two paper bridges, measure their load and improve one.','What did you enjoy: building, measuring, or redesigning?'],
 ['Software & digital tools','IC','Software developer, software tester, accessibility tester','Computing, maths, communication','Create a tiny quiz or a paper prototype and ask someone to test it.','Did you enjoy inventing the behaviour or finding and fixing mistakes?'],
 ['Science & research','IR','Research scientist, lab technician, field researcher','Science, maths, writing','Compare plant growth conditions using a safe, fair observation plan.','How would you tell whether your explanation is wrong?'],
 ['Design & user experience','AI','Product designer, interaction designer, design researcher','Art, computing, communication','Redesign a school bag on paper after asking someone what is difficult about theirs.','Did listening change your design?'],
 ['Writing & storytelling','AS','Writer, editor, journalist','Languages, reading, social studies','Interview a willing family member and write a short story with their permission.','Do you prefer inventing a story or discovering a real one?'],
 ['Education & mentoring','SA','Teacher, instructional designer, learning facilitator','Languages, subject knowledge, communication','Teach a willing person a five-minute skill, then ask what helped.','How did you change your explanation for them?'],
 ['Community & public service','SE','Community organiser, public-service coordinator, youth worker','Social studies, languages, teamwork','Map a small community need and propose two ways to help.','Whose views should shape the plan?'],
 ['Business & entrepreneurship','EC','Entrepreneur, operations coordinator, business analyst','Maths, communication, economics','Plan a pretend service, interview a potential user and estimate costs.','What problem does it solve and who might not want it?'],
 ['Health & care exploration','SI','Nurse, physiotherapist, public-health educator','Biology, communication, science','Make a clear public-health poster using an authoritative public source.','Do you enjoy explaining, investigating, or supporting people?'],
 ['Environment & conservation','RI','Environmental technician, conservation scientist, sustainability coordinator','Geography, biology, maths','Observe local litter or water use safely and chart possible improvements.','Which trade-offs would your solution involve?'],
 ['Visual arts & animation','AR','Illustrator, animator, craft artist','Art, storytelling, digital tools','Make a six-frame story or a simple stop-motion scene.','Which part would you like to revise and why?'],
 ['Music & performance','AE','Musician, performer, sound designer','Music, language, teamwork','Create a short performance or sound scene for a willing audience.','Did you enjoy creating, practising, performing, or producing?'],
 ['Data & analysis','IC','Data analyst, statistician, research assistant','Maths, computing, communication','Record a harmless daily observation and draw a chart with a clear question.','What can the data tell you, and what can it not tell you?'],
 ['Finance & recordkeeping','CI','Accountant, financial operations assistant, auditor','Maths, communication, economics','Track a pretend event budget and check someone else’s calculations.','Did you enjoy planning, explaining, or checking the details?'],
 ['Law & civic reasoning','EI','Legal researcher, policy analyst, mediator','Reading, writing, social studies','Compare two sides of a school-policy question using evidence and respectful discussion.','What new evidence would change your view?'],
 ['Architecture & spaces','AR','Architect, interior designer, landscape designer','Maths, art, geography','Draw an accessible reading space and explain how different people could use it.','How did real constraints affect the design?'],
 ['Skilled trades & maintenance','RC','Electrician, carpenter, equipment technician','Maths, practical design, safety','Draw an assembly guide for a safe cardboard model; avoid electrical or power-tool work.','Could another person follow your instructions?'],
 ['Agriculture & food systems','RI','Horticulturist, agricultural technician, food scientist','Biology, geography, maths','Grow seeds or map how one food reaches your home.','Which parts involve science, tools, people, and planning?'],
 ['Hospitality & events','ES','Event coordinator, hospitality manager, visitor guide','Communication, languages, organisation','Plan a pretend welcome event including accessibility, timing and costs.','How would you help a guest whose needs differ from yours?'],
 ['Sports & recreation','RS','Coach, recreation coordinator, sports technician','Physical education, biology, communication','Design an inclusive movement game with a safe alternative for each activity.','Did you enjoy teaching, organising, or adapting the game?'],
 ['Libraries & information','CS','Librarian, archivist, information assistant','Languages, computing, organisation','Organise a small collection and help another person find an item.','What makes information easy for someone else to use?'],
 ['Communication & media','EA','Communications specialist, producer, marketing researcher','Writing, art, social studies','Create two honest posters for the same idea and ask which is clearer.','How can you persuade without misleading?'],
 ['Transport & logistics','CR','Logistics planner, transport coordinator, supply-chain analyst','Maths, geography, computing','Plan a pretend delivery route with time, distance and accessibility constraints.','Which changes would make the plan more reliable?'],
 ['Product & project coordination','EC','Project coordinator, product manager, quality coordinator','Communication, maths, teamwork','Break a group project into steps, owners and a simple review checklist.','How will you notice and handle a plan that is not working?']
];
export const careers=careerRows.map(([name,tags,roles,subjects,project,reflection],i)=>({id:`career-${i+1}`,name,tags:[...tags],roles,subjects,project,reflection}));
export const parentingTopics=[
 ['Connection before correction','Begin with a calm check-in: “What felt easy, tricky, or interesting today?” Listen before offering solutions.','Name the feeling without labelling the child: “That was frustrating,” rather than “You are bad at this.”'],
 ['Praise a useful process','Notice a specific action: “You checked the clue again and changed your plan.” Invite the child to name what helped.','Avoid comparisons with siblings or tying affection, privileges, or identity to a score.'],
 ['Practice without pressure','Let the learner choose a short activity and a comfortable challenge. Stop or simplify when frustration grows.','Use mistakes to decide the next example, not as a reason to repeat a test until a preferred label appears.'],
 ['Routines with choice','Agree on a predictable starting point, a manageable goal and a break. Offer two acceptable ways to begin.','Make room for rest, play and interests outside the app. A longer session is not automatically more useful.'],
 ['Memory games in everyday life','Try recalling two or three objects, a shopping-list game, or a short rhythm. Let the child choose the starting difficulty.','Do not diagnose memory or attention from a flash-digit task. Reading speed, distraction and familiarity can affect it.'],
 ['Reasoning together','Ask “What makes you think that?” and “Can we try another example?” Model changing your mind when evidence changes.','Separate a mistaken answer from the person. Invite explanations without turning every conversation into a quiz.'],
 ['Friends and collaboration','Offer both shared projects and time alone. Practise taking turns, listening and asking for help.','Quietness does not imply a social deficit; enjoying groups does not mean a child never needs quiet.'],
 ['Fair boundaries and repair','Explain an understandable boundary, listen to the child’s view and follow through calmly. Reconnect after a disagreement.','Avoid humiliation, threats or punishment based on personality results. Adults can apologise and model repair.'],
 ['Exploring futures','Try projects, library books and conversations with people in varied occupations. Ask about the ordinary and difficult parts of the work.','Keep academic, vocational, creative and community pathways open. Check local entry requirements when a real decision approaches.'],
 ['Working with school','Share concrete observations and ask the teacher what they see across settings. Agree on one small support to try.','The app cannot diagnose learning or developmental conditions. Persistent difficulties deserve a conversation with the school or an appropriately qualified professional.']
];
export const ageGuides={
 '1-3':{title:'Grades 1–3 · Play and discover',approach:'Read activity choices aloud if helpful. Let the child point, talk or show their answer; an adult should not guess preferences for them.',activities:['Make a story with three objects.','Sort household items in two different ways.','Build a paper tower together.','Take turns recalling a short clap pattern.'],prompt:'“Which part would you like to do again?”',independence:'Offer one small choice at a time. Participate without taking over; stop while the activity still feels enjoyable.'},
 '4-6':{title:'Grades 4–6 · Try and explain',approach:'Invite the learner to choose projects and explain what they liked. Interests may change with experience and confidence.',activities:['Design a board game and test its rules.','Keep a simple nature observation notebook.','Teach someone a chosen skill.','Plan a pretend event with a small budget.'],prompt:'“What did you change when your first idea did not work?”',independence:'Agree on a small plan together, then let the learner own one part. Review the process without taking over every decision.'},
 '7-10':{title:'Grades 7–10 · Explore with ownership',approach:'Discuss results only with the learner’s agreement. Give them room to disagree and revise their answers after new experiences.',activities:['Build a small portfolio project in two different fields.','Interview a trusted adult about the ordinary parts of their work.','Compare academic and vocational pathways from official local sources.','Join a safe, supervised community or school project.'],prompt:'“What would you want to try before deciding whether this suits you?”',independence:'Agree on boundaries and checkpoints together. Let the teen choose the approach, ask for support and reflect on trade-offs.'}
};
export const sources=[
 ['Myers & Briggs Foundation: responsible use of type','https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/'],
 ['O*NET: interest exploration and the RIASEC framework','https://www.onetcenter.org/IP.html'],
 ['UNICEF: communicating with your teen','https://www.unicef.org/parenting/child-care/11-tips-communicating-your-teen']
];
