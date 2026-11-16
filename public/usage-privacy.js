import {mountTheme} from './themes.js';
mountTheme();const choice=document.querySelector('#usage-optout'),status=document.querySelector('#usage-choice-status');
try{choice.checked=localStorage.getItem('reasonlab-usage-optout')==='true';}catch{status.textContent='Browser storage is unavailable; visit statistics are skipped.';}
choice.onchange=()=>{try{localStorage.setItem('reasonlab-usage-optout',String(choice.checked));status.textContent=choice.checked?'Future page loads will not be counted.':'Future page loads may be counted unless your browser opts out.';}catch{status.textContent='Could not save this choice; browser storage is unavailable.';}};
