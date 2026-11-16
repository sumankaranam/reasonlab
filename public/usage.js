// Aggregate page counts only. Never send account identity, child data or URL queries.
const pages={'/':'hub','/index':'hub','/index.html':'hub','/kids':'kids','/kids.html':'kids','/french':'french','/french.html':'french','/discover':'discovery','/discover.html':'discovery','/account':'account','/account.html':'account','/classic':'classic','/classic.html':'classic'};
let attempted=false;
export async function recordUsage(){
  if(attempted||document.visibilityState!=='visible'||!pages[location.pathname]||navigator.globalPrivacyControl||navigator.doNotTrack==='1')return;
  attempted=true;
  try{
    if(localStorage.getItem('reasonlab-usage-optout')==='true')return;
    const now=Date.now(),last=Number(sessionStorage.getItem('reasonlab-last-visit')||0);
    const response=await fetch('/api/usage',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:pages[location.pathname],visit:!last||now-last>=30*60*1000}),keepalive:true});
    if(response.ok)sessionStorage.setItem('reasonlab-last-visit',String(now));
  }catch{/* Learning must work even when analytics or storage is unavailable. */}
}
if(typeof document!=='undefined'){void recordUsage();document.addEventListener('visibilitychange',()=>{void recordUsage();});}
