export const dayKey=(now=Date.now())=>new Date(now+19800000).toISOString().slice(0,10);
export function previousDay(now=Date.now()){
  const today=dayKey(now),end=new Date(today+'T00:00:00+05:30').getTime();
  return {date:dayKey(end-1),from:new Date(end-86400000).toISOString(),to:new Date(end).toISOString()};
}
const validCount=n=>Number.isSafeInteger(n)&&n>=0;
export async function registrationCounts(env,window,fetcher=fetch){
  if(!env.SUPABASE_REPORT_KEY)return null;
  const response=await fetcher('https://krbuoncrksahcrnufprg.supabase.co/rest/v1/rpc/reasonlab_registration_counts',{method:'POST',headers:{apikey:env.SUPABASE_REPORT_KEY,...(env.SUPABASE_REPORT_KEY.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${env.SUPABASE_REPORT_KEY}`}),'Content-Type':'application/json'},body:JSON.stringify({p_from:window.from,p_to:window.to}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Registration counts unavailable');
  const value=await response.json();if(!validCount(value.new_accounts)||!validCount(value.total_accounts))throw Error('Invalid registration counts');return value;
}
export function reportText(window,rows,registrations){
  const views=rows.reduce((n,r)=>n+r.page_views,0),visits=rows.reduce((n,r)=>n+r.visits,0);
  return [`ReasonLab daily report — ${window.date} (India time)`,`Reporting window: ${window.from} to ${window.to} (exclusive)`,
    `New adult registrations: ${registrations?.new_accounts??'Unavailable — Supabase reporting setup required'}`,
    `Total adult accounts as of day end (currently retained): ${registrations?.total_accounts??'Unavailable'}`,
    `Estimated tab visits: ${visits}`,`Page views: ${views}`,'',...rows.map(r=>`${r.page}: ${r.page_views} page views; ${r.visits} visit starts`),'',
    'Visits are new tab sessions or a page load after 30 minutes without a recorded page load in that tab. They are not unique people. Repeat devices/tabs may count again; bots may inflate counts. Opt-outs, blockers and network failures can undercount.',
    'Counts begin when collection was deployed; no historical visit backfill. New registrations count adult Supabase accounts, not child profiles. Deleted accounts are not included. The first collection day may be partial.',
    'Only daily page totals are stored. This report contains no child names, answers, recordings, account emails or individual visitor identifiers.'].join('\n');
}
export async function runReport(env,now=Date.now(),fetcher=fetch){
  const window=previousDay(now);
  await env.USAGE_DB.prepare('DELETE FROM daily_usage WHERE day < ?').bind(dayKey(now-90*86400000)).run();
  await env.USAGE_DB.prepare('DELETE FROM sent_reports WHERE day < ?').bind(dayKey(now-90*86400000)).run();
  if(!env.RESEND_API_KEY){console.log('Daily report pending sender setup');return {status:'sender-not-configured'};}
  if(await env.USAGE_DB.prepare('SELECT day FROM sent_reports WHERE day = ?').bind(window.date).first())return {status:'already-sent'};
  const {results}=await env.USAGE_DB.prepare('SELECT page, page_views, visits FROM daily_usage WHERE day = ? ORDER BY page_views DESC').bind(window.date).all();
  let counts=null;try{counts=await registrationCounts(env,window,fetcher);}catch{console.log('Registration totals unavailable; report will explicitly mark missing data');}
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`reasonlab-daily-${window.date}`},body:JSON.stringify({from:env.REPORT_FROM||'ReasonLab <onboarding@resend.dev>',to:['sumanmighty@gmail.com'],subject:`ReasonLab daily stats — ${window.date}`,text:reportText(window,results,counts)}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Daily email delivery request failed');
  const result=await response.json();if(typeof result.id!=='string')throw Error('Email provider did not confirm acceptance');
  await env.USAGE_DB.prepare('INSERT OR IGNORE INTO sent_reports (day) VALUES (?)').bind(window.date).run();
  console.log('Daily report accepted by email provider');return {status:'accepted'};
}
