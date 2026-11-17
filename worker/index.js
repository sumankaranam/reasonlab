import {handleProgress} from './progress.js';
import {dayKey,runReport} from './reporting.js';
export const allowedPages=['tamil','kannada','hub','kids','french','discovery','account','classic'];
export function validEvent(value){return value&&Object.keys(value).length===2&&allowedPages.includes(value.page)&&typeof value.visit==='boolean';}
const reply=(status)=>new Response(null,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(request);
    if(url.pathname==='/api/progress')return handleProgress(request,env);
    if(url.pathname!=='/api/usage')return reply(404);
    if(request.method!=='POST')return reply(405);
    if(request.headers.get('Origin')!==url.origin||request.headers.get('Content-Type')!=='application/json')return reply(403);
    if(Number(request.headers.get('Content-Length'))>128)return reply(413);
    try{
      const reader=request.body?.getReader();if(!reader)return reply(400);let body='',bytes=0;const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>128){await reader.cancel();return reply(413);}body+=decoder.decode(part.value,{stream:true});}body+=decoder.decode();
      let event;try{event=JSON.parse(body);}catch{return reply(400);}if(!validEvent(event))return reply(400);
      // No IP, user agent, URL query, user ID or per-visit record is stored.
      const table=event.page==='hub'?'hub_usage':['tamil','kannada'].includes(event.page)?'language_usage':'daily_usage';
      await env.USAGE_DB.prepare(`INSERT INTO ${table} (day,page,page_views,visits) VALUES (?,?,1,?) ON CONFLICT(day,page) DO UPDATE SET page_views=page_views+1,visits=visits+excluded.visits`).bind(dayKey(),event.page,event.visit?1:0).run();
      return reply(204);
    }catch{return reply(503);}
  },
  async scheduled(event,env){await runReport(env,event.scheduledTime);},
};
