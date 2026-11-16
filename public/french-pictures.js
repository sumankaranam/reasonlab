// Original, lightweight picture cards for the French course. All artwork is inline SVG.
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const norm = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const canonical = (value) => norm(String(value ?? '').replace(/\s*\([^)]*\)/g, '')).replace(/^(un|une|le|la|les|du|des|de l|a|an|the|some)\s+/, '');

const base = `<rect width="240" height="160" rx="22" fill="#fff8df"/><circle cx="207" cy="29" r="15" fill="#ffe28a"/><path d="M15 132 Q70 119 120 132 T225 130 V160 H15Z" fill="#d8f4df"/>`;
const art = {
  apple: `<path d="M120 54c-19-14-43 0-42 28 1 26 17 45 38 45 7 0 12-4 18-4s12 4 19 4c21 0 37-20 38-45 1-28-24-42-43-28-10 7-17 7-28 0Z" fill="#f24f58" stroke="#ad3242" stroke-width="4"/><path d="M121 56q-2-20 8-29" fill="none" stroke="#71472f" stroke-width="6" stroke-linecap="round"/><path d="M127 37q21-17 33-3-10 20-33 14" fill="#55b86a"/>`,
  pear: `<path d="M121 46q-3 20-19 38c-30 32-18 54 18 54h17c36 0 48-22 18-54-16-18-19-38-22-49-3-12-17-10-12 11Z" fill="#a9d84e" stroke="#63943c" stroke-width="4"/><path d="M128 39q-1-13 7-20" stroke="#71472f" stroke-width="5" stroke-linecap="round"/><path d="M132 25q19-13 27 0-9 15-27 10" fill="#42a968"/>`,
  bread: `<path d="M55 105q-4-38 24-50 12-17 31-12 16-18 34-5 29-6 39 22 19 16 2 49-43 29-99 12-18 0-31-16Z" fill="#e8a64e" stroke="#a96635" stroke-width="4"/><path d="M85 69q-8 10-4 23m35-32q-8 11-3 23m34-17q-8 10-3 20" fill="none" stroke="#fff0c3" stroke-width="8" stroke-linecap="round"/>`,
  cheese: `<path d="M47 91 171 48l34 23v50H47Z" fill="#ffd34e" stroke="#cf932d" stroke-width="4"/><path d="m47 91 124-43v73L47 139Z" fill="#ffbd35" stroke="#cf932d" stroke-width="4"/><circle cx="94" cy="104" r="8" fill="#f49a27"/><circle cx="146" cy="86" r="6" fill="#f49a27"/><circle cx="167" cy="112" r="9" fill="#f49a27"/>`,
  cake: `<path d="M57 91h126v42H57Z" fill="#ff8c98" stroke="#cb5268" stroke-width="4"/><path d="M57 91q30 13 63 0t63 0" fill="none" stroke="#fff" stroke-width="11"/><path d="M68 78q0-24 24-24t24 24m8 0q0-24 24-24t24 24" fill="#ffc95d"/><path d="M93 52V37m40 15V37" stroke="#ff7659" stroke-width="5"/><path d="M91 33q3-11 5 0m35 0q3-11 5 0" fill="#ff9d36"/>`,
  water: `<path d="M118 34q-20 31-37 57a43 43 0 1 0 77 0q-20-31-40-57Z" fill="#54c8ee" stroke="#298bbd" stroke-width="4"/><path d="M96 105q13 11 29 4" fill="none" stroke="#dcf9ff" stroke-width="7" stroke-linecap="round"/>`,
  book: `<path d="M48 52q37-15 72 5v77q-35-20-72-5Zm144 0q-37-15-72 5v77q35-20 72-5Z" fill="#77c6f4" stroke="#387ea9" stroke-width="4"/><path d="M120 57v77M64 69q23-7 40 3m-40 15q23-7 40 3m55-21q22-8 35-3m-35 18q22-8 35-3" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  pencil: `<path d="m72 116 72-75q11-11 22 0t0 22l-72 75-29 7Z" fill="#ffcf48" stroke="#a87434" stroke-width="4"/><path d="m65 145 7-29 22 22Z" fill="#f2c49a" stroke="#a87434" stroke-width="4"/><path d="m144 42 22 22" stroke="#f26c75" stroke-width="11"/>`,
  school: `<path d="M45 72 120 30l75 42v67H45Z" fill="#ffcf62" stroke="#a96b3d" stroke-width="4"/><path d="M34 74 120 25l86 49-8 12-78-44-78 44Z" fill="#e96661"/><path d="M103 99h34v40h-34Z" fill="#8b6149"/><path d="M62 89h24v23H62Zm92 0h24v23h-24Z" fill="#8de1ed" stroke="#fff" stroke-width="4"/><path d="M67 64v-19h20v8" stroke="#8060a5" stroke-width="5" fill="none"/>`,
  backpack: `<path d="M75 61q0-22 25-22h40q25 0 25 22v67q0 15-14 15H89q-14 0-14-15Z" fill="#ff795c" stroke="#b74c49" stroke-width="4"/><path d="M91 62q0-18 29-18t29 18M82 85h76v34H82Z" fill="#ffc25a" stroke="#b74c49" stroke-width="4"/><path d="M103 99h33" stroke="#b74c49" stroke-width="4" stroke-linecap="round"/>`,
  family: `<circle cx="86" cy="66" r="20" fill="#bf805b"/><circle cx="151" cy="63" r="19" fill="#efbd8c"/><circle cx="119" cy="93" r="16" fill="#dfa071"/><path d="M52 132q0-38 34-38t34 38m1 0q0-37 31-37t34 37m-86 0q0-27 19-27t20 27" fill="#6d9be9"/><path d="M68 61q4-28 34-20" stroke="#443549" stroke-width="9" stroke-linecap="round"/>`,
  happy: `<circle cx="120" cy="91" r="54" fill="#ffd170" stroke="#cf9d41" stroke-width="4"/><circle cx="101" cy="79" r="4" fill="#604b48"/><circle cx="140" cy="79" r="4" fill="#604b48"/><path d="M97 101q23 29 47 0" fill="none" stroke="#b65355" stroke-width="6" stroke-linecap="round"/>`,
  tired: `<circle cx="120" cy="91" r="54" fill="#bfe8f2" stroke="#68a8bf" stroke-width="4"/><path d="M91 79h19m20 0h19" stroke="#526c85" stroke-width="5" stroke-linecap="round"/><path d="M103 112q17-13 34 0" fill="none" stroke="#526c85" stroke-width="5" stroke-linecap="round"/><path d="M170 49q20-20 25 0t-25 26" fill="#fff" stroke="#8ec9d5" stroke-width="3"/>`,
  sun: `<circle cx="120" cy="91" r="34" fill="#ffb939" stroke="#eb8d35" stroke-width="4"/><g stroke="#f19b33" stroke-width="7" stroke-linecap="round"><path d="M120 31v16m0 88v16M60 91h16m88 0h16M77 48l12 12m62 62 12 12m0-86-12 12m-62 62-12 12"/></g>`,
  rain: `<path d="M74 92q-12-25 15-35 5-31 37-24 24 4 26 27 31 0 22 32Z" fill="#a9d8e8" stroke="#5794ae" stroke-width="4"/><path d="m91 111-8 19m38-19-8 19m38-19-8 19" stroke="#399ed0" stroke-width="7" stroke-linecap="round"/>`,
  clock: `<circle cx="120" cy="91" r="53" fill="#fff" stroke="#7469ac" stroke-width="7"/><path d="M120 54v39l28 16" fill="none" stroke="#7469ac" stroke-width="7" stroke-linecap="round"/><circle cx="120" cy="91" r="5" fill="#ed795e"/>`,
  calendar: `<rect x="62" y="47" width="116" height="91" rx="10" fill="#fff" stroke="#6295bd" stroke-width="5"/><path d="M62 70h116" stroke="#f27c75" stroke-width="15"/><path d="M88 39v19m64-19v19" stroke="#6295bd" stroke-width="7" stroke-linecap="round"/><g fill="#76bbdf"><circle cx="88" cy="90" r="5"/><circle cx="120" cy="90" r="5"/><circle cx="152" cy="90" r="5"/><circle cx="88" cy="116" r="5"/><circle cx="120" cy="116" r="5"/></g><circle cx="152" cy="116" r="8" fill="#fa796b"/>`,
  park: `<path d="M54 126q4-54 35-54t35 54Zm65 0q4-69 39-69t39 69Z" fill="#55b96e" stroke="#358a53" stroke-width="4"/><path d="M80 126V99m97 27V87" stroke="#82543d" stroke-width="11"/><path d="M33 132q35-12 67 0t70 0 38 0v20H33Z" fill="#93d66f"/><circle cx="69" cy="46" r="9" fill="#ffdc61"/>`,
  house: `<path d="M49 80 120 28l71 52v60H49Z" fill="#ffce70" stroke="#a8744d" stroke-width="4"/><path d="m39 81 81-61 81 61-9 12-72-53-72 53Z" fill="#ed7668"/><path d="M103 99h34v41h-34Z" fill="#a8754d"/><path d="M63 91h24v22H63Zm90 0h24v22h-24Z" fill="#9ae1ec" stroke="#fff" stroke-width="3"/>`,
  museum: `<path d="M45 69 120 32l75 37Z" fill="#f3bd5f" stroke="#987548" stroke-width="4"/><path d="M53 73h134v11H53Z" fill="#e7a94a"/><g fill="#fff3d0" stroke="#987548" stroke-width="3"><path d="M66 84h20v48H66Zm44 0h20v48h-20Zm44 0h20v48h-20Z"/></g><path d="M48 135h144v11H48Z" fill="#c78846"/><path d="M91 60q8-16 17 0m25 0q8-16 17 0" fill="none" stroke="#9e6840" stroke-width="4"/>`,
  shop: `<path d="M61 70h118v71H61Z" fill="#ffe1a1" stroke="#ae7548" stroke-width="4"/><path d="m51 70 13-31h111l14 31Z" fill="#ef6d68" stroke="#ae554f" stroke-width="4"/><path d="M66 70q0 20 19 0 0 20 19 0 0 20 19 0 0 20 19 0 0 20 19 0 0 20 19 0" fill="#ffd274"/><rect x="108" y="98" width="31" height="43" fill="#84c9e8" stroke="#ae7548" stroke-width="3"/>`,
  clothes: `<path d="m92 52 20-15h17l20 15 24 18-18 22-14-10v52H99V82L85 92 67 70Z" fill="#aa82d8" stroke="#70549b" stroke-width="4"/><path d="M112 37q2 22 17 0" fill="none" stroke="#fff" stroke-width="4"/><circle cx="124" cy="83" r="4" fill="#fff"/>`,
  hello: `<circle cx="105" cy="71" r="26" fill="#d79d78"/><path d="M61 140q1-48 44-48t44 48Z" fill="#66aadd"/><path d="M134 89q32-4 29-35l-13-16q-8-9-13 2l-4 18q-8-16-17-11t3 25Z" fill="#d79d78" stroke="#9b654e" stroke-width="4"/><path d="M148 37q8-17 21-16m-7 28q16-8 24-3" fill="none" stroke="#ed9c43" stroke-width="4" stroke-linecap="round"/>`,
  map: `<path d="m57 54 42-14 43 14 42-14v86l-42 14-43-14-42 14Z" fill="#9bd9ac" stroke="#548d70" stroke-width="4"/><path d="M99 40v86m43-72v86" stroke="#fff" stroke-width="4"/><path d="M74 111q22-19 40-34 18-17 41-6" fill="none" stroke="#ee745d" stroke-width="6" stroke-dasharray="5 8"/><path d="m145 64 13 7-13 6Z" fill="#ee745d"/>`,
  colors: `<circle cx="83" cy="75" r="25" fill="#ef5359" stroke="#fff" stroke-width="4"/><circle cx="120" cy="75" r="25" fill="#ffd044" stroke="#fff" stroke-width="4"/><circle cx="157" cy="75" r="25" fill="#4da7e5" stroke="#fff" stroke-width="4"/><circle cx="101" cy="113" r="25" fill="#5dc879" stroke="#fff" stroke-width="4"/><circle cx="139" cy="113" r="25" fill="#a37ad4" stroke="#fff" stroke-width="4"/>`,
};

const topics = {
  apple:['pomme','pomme rouge','apple','red apple'], pear:['poire','pear'], bread:['pain','du pain','bread'], cheese:['fromage','du fromage','cheese'], cake:['gateau','un gateau','cake'], water:['eau','de l eau','water'],
  book:['livre','un livre','book'], pencil:['crayon','un crayon','pencil'], school:['ecole','une ecole','school'], backpack:['sac a dos','backpack','schoolbag'], family:['famille','une famille','family','friends','amis','les amis'], happy:['content','contente','happy'], tired:['fatigue','fatiguee','tired'], sun:['soleil','le soleil','sun'], rain:['pluie','il pleut','rain','it is raining'], clock:['horloge','heure','clock','time'], calendar:['calendrier','date','calendar'], park:['parc','au parc','park','tree','arbre'], house:['maison','une maison','house','home'], museum:['musee','le musee','museum'], shop:['magasin','boutique','shop','store'], clothes:['vetement','vetements','veste','manteau','clothes','coat','jacket'], hello:['bonjour','salut','hello','hi','wave','au revoir'], map:['carte','une carte','map','directions'], colors:['couleur','couleurs','colors','colour palette','palette'],
};
const names = {apple:'An apple',pear:'A pear',bread:'Bread',cheese:'Cheese',cake:'A cake',water:'Water',book:'A book',pencil:'A pencil',school:'A school',backpack:'A backpack',family:'Family and friends',happy:'A happy face',tired:'A tired face',sun:'The sun',rain:'Rain',clock:'A clock',calendar:'A calendar',park:'A park with trees',house:'A house',museum:'A museum',shop:'A shop',clothes:'A shirt',hello:'A friendly wave',map:'A map and route',colors:'A palette of colors'};
const index = new Map();
for (const [key, aliases] of Object.entries(topics)) for (const alias of aliases) index.set(canonical(alias), key);

const countWords = ['zero','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix sept','dix huit','dix neuf','vingt'];
const countEnglish = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const colors = {rouge:['red','#ed4b55'],bleu:['blue','#4098df'],bleue:['blue','#4098df'],vert:['green','#50b76b'],verte:['green','#50b76b'],jaune:['yellow','#ffd23f'],noir:['black','#303743'],noire:['black','#303743'],blanc:['white','#fff'],blanche:['white','#fff'],red:['red','#ed4b55'],blue:['blue','#4098df'],green:['green','#50b76b'],yellow:['yellow','#ffd23f'],black:['black','#303743'],white:['white','#fff']};
const escapeText = (value) => esc(value).replace(/[\u0000-\u001f\u007f]/g, ' ');
let pictureId = 0;
function svg(title, body) { const id=`picture-title-${++pictureId}`;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" role="img" aria-labelledby="${id}"><title id="${id}">${escapeText(title)}</title>${base}${body}</svg>`; }
function quantity(n) {
  const dots = Array.from({length:n},(_,i)=>{const cols=n<=10?5:5, x=79+(i%cols)*21, y=76+Math.floor(i/cols)*19;return `<circle cx="${x}" cy="${y}" r="7" fill="#f05f56" stroke="#b8464c" stroke-width="2"/>`;}).join('');
  return svg(`${n} ${n===1?'object':'objects'}: ${n} ${n===1?'dot':'dots'}`,`<rect x="53" y="44" width="134" height="94" rx="16" fill="#fff" stroke="#e0a64f" stroke-width="4"/><text x="120" y="66" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#4d5560">${n}</text>${dots}`);
}
function colorCard(key) { const [en,swatch]=colors[key]; const label=key[0].toUpperCase()+key.slice(1);return svg(`${label}, the color ${en}`,`<rect x="49" y="43" width="142" height="96" rx="16" fill="#fff" stroke="#dbca9f" stroke-width="4"/><rect x="64" y="56" width="112" height="49" rx="10" fill="${swatch}" stroke="#666" stroke-width="${swatch==='#fff'?3:1}"/><text x="120" y="128" text-anchor="middle" font-family="system-ui,sans-serif" font-size="17" font-weight="700" fill="#394354">${en}</text>`); }
const pair = (left, right) => `<g transform="translate(4 48) scale(.48)">${left}</g><g transform="translate(120 48) scale(.48)">${right}</g>`;

export const pictureTopics = Object.freeze(Object.keys(topics));
const getScene = (id) => Object.hasOwn(sceneArt,id) ? sceneArt[id] : sceneArt.default;
export function wordPicture(fr, en, lessonId = '') {
  const f=canonical(fr), e=canonical(en);
  const key=index.get(f)||index.get(e);
  if (key) return svg(names[key],art[key]);
  const number = countWords.indexOf(f) >= 0 ? countWords.indexOf(f) : countEnglish.indexOf(e) >= 0 ? countEnglish.indexOf(e) : /^([0-9]|1[0-9]|20)$/.test(f) ? Number(f) : /^([0-9]|1[0-9]|20)$/.test(e) ? Number(e) : -1;
  if (number>=0) return quantity(number);
  const rawFr=norm(fr), rawEn=canonical(en);
  if (colors[rawFr] || colors[rawEn]) return colorCard(colors[rawFr] ? rawFr : rawEn);
  const title = `Scene for ${String(fr || en || 'this lesson')}${en ? ` — ${String(en)}` : ''}`;
  return svg(title, getScene(lessonId));
}

const sceneArt = {
  default:`<circle cx="120" cy="76" r="37" fill="#ffd170"/><path d="M56 139q5-39 38-39t38 39m5 0q4-39 37-39t38 39" fill="#64a9db"/><path d="M100 75q20 20 40 0" fill="none" stroke="#a95055" stroke-width="5" stroke-linecap="round"/>`,
  alphabet:`<rect x="54" y="47" width="132" height="91" rx="14" fill="#fff" stroke="#8a79c8" stroke-width="4"/><text x="120" y="111" text-anchor="middle" font-family="system-ui,sans-serif" font-size="48" font-weight="800" fill="#e96d60">ABC</text>`,
  numbers:`<rect x="57" y="48" width="126" height="88" rx="14" fill="#fff" stroke="#5796bd" stroke-width="4"/><text x="120" y="111" text-anchor="middle" font-family="system-ui,sans-serif" font-size="49" font-weight="800" fill="#ed6d5f">1 2 3</text>`,
  colors:art.colors,
  'sound-hello':art.hello,
  introductions:art.family,
  articles:pair(art.book,art.apple),
  family:art.family,
  school:pair(art.school,art.backpack),
  food:pair(art.apple,art.bread),
  feelings:pair(art.happy,art.tired),
  days:art.calendar,
  'avoir-etre':art.family,
  'er-verbs':art.family,
  questions:`${art.hello}<text x="165" y="61" font-family="system-ui,sans-serif" font-size="35" font-weight="800" fill="#865cb6">?</text>`,
  negation:`${art.apple}<path d="m73 49 94 91" stroke="#e64f5a" stroke-width="9" stroke-linecap="round"/>`,
  'where-things-are':`${art.book}<path d="M59 139h121" stroke="#ab7650" stroke-width="7"/>`,
  'gender-agreement':pair(art.house,art.park),
  directions:art.map,
  time:art.clock,
  weather:pair(art.sun,art.rain),
  shopping:pair(art.shop,art.clothes),
  routine:pair(art.clock,art.backpack),
  'passe-compose':pair(art.book,art.calendar),
  imparfait:art.park,
  'future-plans':pair(art.map,art.sun),
  connectors:`${art.family}<path d="M80 49q38-24 77 0" fill="none" stroke="#865cb6" stroke-width="5" stroke-linecap="round"/><path d="m151 40 9 9-12 3" fill="#865cb6"/>`,
  opinions:art.family,
  'pros-cons':pair(art.map,art.house),
  'story-sequence':pair(art.book,art.clock),
  possibilities:pair(art.map,art.sun),
  repair:art.hello,
  'plans-talk':art.family,
  'opinions-chat':art.family,
  'directions-chat':art.map,
  'shopping-chat':pair(art.shop,art.clothes),
  'story-chat':pair(art.book,art.park),
};
const lessonTopics = {alphabet:'The French alphabet', 'sound-hello':'A greeting and a friendly wave', introductions:'People meeting and saying hello', numbers:'Counting from zero to twenty', colors:'A palette of bright colors', articles:'Books and an apple', family:'Family and friends', school:'School and a backpack', food:'Bread and an apple', feelings:'Happy and tired faces', days:'A calendar', 'avoir-etre':'People describing themselves', 'er-verbs':'People talking together', questions:'People asking a question', negation:'An apple with a no symbol', 'gender-agreement':'A small house and a tall tree', 'where-things-are':'A book on a table', directions:'A map with a dotted route', time:'A clock', weather:'The sun and rain', shopping:'A shop with clothes', routine:'A clock and a school bag', 'passe-compose':'A book and a calendar', imparfait:'A park with trees', 'future-plans':'A map and the sun', connectors:'People linking ideas', opinions:'Friends sharing ideas', 'pros-cons':'A map and a house', 'story-sequence':'A book and a clock', possibilities:'A map and the sun', repair:'A friendly wave', 'plans-talk':'Friends meeting', 'opinions-chat':'Friends sharing ideas', 'directions-chat':'A map with a dotted route', 'shopping-chat':'A shop with clothes', 'story-chat':'A book and a park'};
export const pictureLessonIds = Object.freeze(Object.keys(lessonTopics));
export function lessonPicture(id) {
  const title = Object.hasOwn(lessonTopics,id) ? lessonTopics[id] : `Scene for ${String(id || 'French lesson').replace(/[-_]+/g,' ')}`;
  return svg(title,getScene(id));
}
