import {progressKeys} from './auth-core.js';

export const avatars = [
  ['sunny','Sunny','Girl with sunny curls','#ffe08a','#82502e',0],
  ['star','Star','Boy with star cap','#a8dafa','#b97950',1],
  ['bloom','Bloom','Girl with flower clips','#ffc8dd','#e9ae83',2],
  ['comet','Comet','Boy with wavy hair','#b9edbd','#67412d',3],
  ['rainbow','Rainbow','Girl with colorful braids','#d5c5ff','#875233',4],
  ['ocean','Ocean','Boy with round glasses','#9ee5e3','#e1a478',5],
  ['peach','Peach','Girl with a ponytail','#ffcfaa','#bd8055',6],
  ['rocket','Rocket','Boy with curly hair','#b9cfff','#e9b58f',7],
  ['spark','Spark','Girl with short hair','#f4c1ef','#69442f',8],
  ['forest','Forest','Boy with a green cap','#d5eda0','#ac714c',9],
].map(([id,name,label,color,skin,style])=>({id,name,label,color,skin,style}));
export function avatarSvg(id){
  const a=avatars.find(a=>a.id===id)||avatars[0],n=a.style;
  const hair=n===0||n===7?'<g fill="#45312d"><circle cx="30" cy="34" r="12"/><circle cx="43" cy="25" r="12"/><circle cx="58" cy="25" r="12"/><circle cx="70" cy="34" r="12"/></g>':n===1||n===9?`<path d="M26 37Q25 12 51 15Q76 16 76 37Z" fill="${n===1?'#6558bf':'#29885a'}"/><path d="M22 37H81" stroke="#fff" stroke-width="6"/>`:'<path d="M24 55V36Q24 12 51 15Q79 14 77 57L66 44L32 45Z" fill="#45312d"/>';
  const extra=n===2?'<g fill="#f45c8a"><circle cx="25" cy="34" r="8"/><circle cx="77" cy="34" r="8"/></g>':n===4?'<path d="M25 42L20 75M76 42L81 75" stroke="#45312d" stroke-width="12"/><path d="M20 69H27M76 69H84" stroke="#ffce40" stroke-width="6"/>':n===6?'<circle cx="78" cy="35" r="13" fill="#45312d"/><circle cx="74" cy="26" r="5" fill="#ee6295"/>':'';
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="49" fill="${a.color}"/><path d="M14 100Q16 73 50 73Q84 73 86 100" fill="${['#da5084','#5c63ba','#248f87','#e17e38','#7653b4'][n%5]}"/>${extra}${hair}<ellipse cx="50" cy="48" rx="24" ry="28" fill="${a.skin}"/>${n!==1&&n!==9?'<path d="M26 38Q26 12 51 18Q75 14 75 38Q59 33 53 25Q43 38 26 38" fill="#45312d"/>':''}<circle cx="41" cy="48" r="2.5" fill="#302929"/><circle cx="60" cy="48" r="2.5" fill="#302929"/><path d="M42 61Q50 68 59 61" fill="none" stroke="#723b36" stroke-width="3" stroke-linecap="round"/>${n===5?'<g fill="none" stroke="#33477b" stroke-width="2.5"><circle cx="40" cy="48" r="8"/><circle cx="61" cy="48" r="8"/><path d="M48 47H53"/></g>':''}<path d="M12 18L15 12L18 18L24 21L18 24L15 30L12 24L6 21Z" fill="#fff" opacity=".85"/></svg>`;
}
export function profileKey(userId){return progressKeys(userId).settings+':children';}
export function cleanProfiles(raw){const result={};for(const slot of [1,2,3]){const p=raw?.[slot];if(p&&typeof p.name==='string'&&p.name.trim()&&p.name.trim().length<=30&&avatars.some(a=>a.id===p.avatar))result[slot]={name:p.name.trim(),avatar:p.avatar};}return result;}
export function readProfiles(userId){try{return cleanProfiles(JSON.parse(localStorage.getItem(profileKey(userId))||'{}'));}catch{return {};}}
export function saveProfile(userId,slot,name,avatar){if(!userId)throw Error('Sign in with an adult account first.');if(![1,2,3].includes(slot))throw Error('Choose a learner.');name=String(name).trim();if(!name||name.length>30)throw Error('Use a nickname of 1–30 characters.');if(!avatars.some(a=>a.id===avatar))throw Error('Choose an avatar.');const profiles=readProfiles(userId);profiles[slot]={name,avatar};localStorage.setItem(profileKey(userId),JSON.stringify(profiles));return profiles;}
