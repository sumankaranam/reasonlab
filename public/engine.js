export const categories=['Number patterns','Visual patterns','Deductive logic'];
export function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function generate(seed,count=18,filter='all',level='mixed'){
 const r=rng(seed),int=(a,b)=>a+Math.floor(r()*(b-a+1)),out=[];const seen=new Set();
 for(let attempts=0;out.length<count&&attempts<10000;attempts++){
  const cat=filter==='all'?out.length%3:categories.indexOf(filter);if(cat<0)throw Error('Unknown category');
  const d=level==='mixed'?1+Math.floor(out.length/(count/3)):Number(level);let q;const a=int(2,20),b=int(2,9);
  if(cat===0){let seq,answer,explanation;
   if(d===1){seq=Array.from({length:5},(_,i)=>a+i*b);answer=a+5*b;explanation=`Add ${b} each time. ${seq[4]} + ${b} = ${answer}.`;}
   else if(d===2){seq=Array.from({length:5},(_,i)=>a+b*i*(i+1)/2);answer=a+15*b;explanation=`The differences are ${b}, ${b*2}, ${b*3}, ${b*4}. The next difference is ${b*5}, giving ${answer}.`;}
   else{seq=Array.from({length:6},(_,i)=>i%2===0?a+Math.floor(i/2)*b:a*2+Math.floor(i/2)*(b+1));answer=a+3*b;explanation=`Two sequences alternate. Positions 1, 3, 5, 7 increase by ${b}: ${a}, ${a+b}, ${a+2*b}, ${answer}.`;}
   const opts=shuffle([answer,answer+b,answer-b,answer+2*b],r);q={category:categories[cat],prompt:'Which number comes next?',sequence:seq,answer,options:opts,explanation};
  }else if(cat===1){const start=int(0,7),step=d===2?int(4,6):int(1,3),accelerate=d===3;const cells=Array.from({length:5},(_,i)=>(start+step*i+(accelerate?i*(i-1)/2:0))%8);const answer=(start+step*5+(accelerate?10:0))%8;const opts=shuffle([answer,(answer+1)%8,(answer+3)%8,(answer+5)%8],r);q={category:categories[cat],prompt:'Where will the dot move next?',visual:cells,answer,options:opts,explanation:accelerate?`The dot moves clockwise by ${step}, ${step+1}, ${step+2}, ${step+3} positions. Next it moves ${step+4} positions.`:`The dot moves ${step} position${step>1?'s':''} clockwise each time.`};
  }else{const names=shuffle(['Luma','Neri','Tavi','Sora','Meki','Vela','Pavo','Dori','Feni','Kora'],r);const [x,y,z,w]=names;let statements,answer,opts;
   if(d===1){statements=[`All ${x} are ${y}.`,`All ${y} are ${z}.`];answer=`All ${x} are ${z}.`;opts=[answer,`All ${z} are ${x}.`,`No ${x} are ${z}.`,`Some ${z} are not ${y}.`];}
   else if(d===2){statements=[`All ${x} are ${y}.`,`No ${y} are ${z}.`,`Some ${w} are ${x}.`];answer=`Some ${w} are not ${z}.`;opts=[answer,`All ${w} are ${x}.`,`Some ${x} are ${z}.`,`All ${z} are ${w}.`];}
   else{statements=[`Some ${x} are ${y}.`,`All ${y} are ${z}.`,`No ${z} are ${w}.`];answer=`Some ${x} are not ${w}.`;opts=[answer,`All ${x} are ${z}.`,`No ${x} are ${w}.`,`Some ${y} are ${w}.`];}
   q={category:categories[cat],prompt:'Which conclusion must be true?',statements,answer,options:shuffle(opts,r),explanation:d===1?`Following both rules, every ${x} belongs to ${y}, and therefore to ${z}. The reverse does not follow.`:d===2?`The ${w} that are ${x} must also be ${y}. Since no ${y} are ${z}, those ${w} cannot be ${z}.`:`The ${x} that are ${y} must be ${z}. No ${z} are ${w}, so at least some ${x} are not ${w}.`};
  }
  const key=JSON.stringify([q.category,q.sequence,q.visual,q.statements]);if(seen.has(key))continue;seen.add(key);out.push({...q,id:`${seed}-${out.length}`,difficulty:d});
 }if(out.length!==count)throw Error('Unable to assemble session');return out;
}
export function score(questions,answers){return {correct:questions.filter((q,i)=>answers[i]===q.answer).length,total:questions.length,answered:questions.filter((_,i)=>answers[i]!==null&&answers[i]!==undefined).length,domains:categories.map(category=>({category,total:questions.filter(q=>q.category===category).length,correct:questions.filter((q,i)=>q.category===category&&answers[i]===q.answer).length})).filter(d=>d.total)};}
