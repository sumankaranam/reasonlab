import assert from 'node:assert/strict';
import {chromium} from '../../work/browser-check/node_modules/playwright/index.mjs';
import {storageKey} from '../../public/indic-engine.js';
import {courses} from '../../public/indic-data.js';
const base=process.env.FR_BASE||'http://127.0.0.1:5188';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const owner='11111111-1111-4111-8111-111111111111', other='22222222-2222-4222-8222-222222222222';
const remote=new Map(), errors=[];
async function device(id){
 const context=await browser.newContext({viewport:{width:320,height:800}});
 await context.addInitScript(()=>localStorage.setItem('reasonlab-usage-optout','true'));
 await context.route('**/auth-client.js',r=>r.fulfill({contentType:'text/javascript',body:`
 import {configureCloud,initializeCloud} from '/cloud-sync.js';
 const user={id:'${id}',email:'parent@example.test'};
 configureCloud({getToken:async expected=>{if(expected!==user.id)throw Error('wrong account');return user.id;}});
 export const service={user:async()=>{await initializeCloud(user);return user;},signOut:async()=>initializeCloud(null)};
 export const configured=true,authConfig={googleEnabled:true,emailEnabled:false},initializationError=null;
 export const onAccountChange=()=>{};`}));
 await context.route('**/api/progress',async route=>{
  const request=route.request(), key=request.headers().authorization?.replace('Bearer ','');
  assert.ok([owner,other].includes(key));
  const row=remote.get(key)||{revision:0,data:null};
  if(request.method()==='GET')return route.fulfill({json:row});
  const body=request.postDataJSON();assert.equal(body.user_id,undefined);
  if(body.revision!==row.revision)return route.fulfill({status:409,json:{error:'changed'}});
  const next={revision:row.revision+1,data:request.method()==='DELETE'?null:body.data};remote.set(key,next);
  return route.fulfill({json:{revision:next.revision}});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/account.html');await page.locator('#cloud-enable').waitFor();
 return {context,page};
}
const setProgress=(page,ids)=>page.evaluate(({key,ids})=>localStorage.setItem(key,JSON.stringify({version:1,completed:Object.fromEntries(ids.map(id=>[id,100])),activity:null})),{key:storageKey('ta',owner,1),ids});
const localProgress=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),storageKey('ta',owner,1));
async function enable(page){await page.locator('#cloud-consent').check();await page.locator('#cloud-enable').click();}
async function confirmed(page,selector){page.once('dialog',dialog=>dialog.accept());await page.locator(selector).click();}
try{
 const a=await device(owner), first=courses.ta.lessons[0].id, second=courses.ta.lessons[1].id, third=courses.ta.lessons[2].id;
 await a.page.locator('#cloud-enable').click();assert.equal(remote.size,0);
 await setProgress(a.page,[first]);await enable(a.page);await a.page.getByText('Cloud progress is up to date.',{exact:true}).first().waitFor();
 assert.equal(remote.get(owner).data.indic.ta[1].completed[first],100);
 const b=await device(owner);await enable(b.page);await b.page.locator('#cloud-replace').waitFor();
 await Promise.all([b.page.waitForEvent('domcontentloaded'),confirmed(b.page,'#cloud-restore')]);await b.page.locator('#cloud-save').waitFor();
 assert.equal((await localProgress(b.page)).completed[first],100);
 await setProgress(a.page,[first,second]);await a.page.locator('#cloud-save').click();await a.page.getByText('Cloud progress is up to date.',{exact:true}).first().waitFor();
 await setProgress(b.page,[first,third]);await b.page.locator('#cloud-save').click();await b.page.locator('#cloud-replace').waitFor();
 assert.equal((await localProgress(b.page)).completed[third],100);assert.equal(remote.get(owner).data.indic.ta[1].completed[third],undefined);
 await b.page.screenshot({path:'work/cloud-conflict-320.png',fullPage:true});
 await Promise.all([b.page.waitForEvent('domcontentloaded'),confirmed(b.page,'#cloud-restore')]);await b.page.locator('#cloud-save').waitFor();
 assert.equal((await localProgress(b.page)).completed[second],100);
 await confirmed(b.page,'#cloud-delete');await b.page.locator('#cloud-enable').waitFor();assert.equal(remote.get(owner).data,null);
 await setProgress(a.page,[first,second,third]);await a.page.locator('#cloud-save').click();await a.page.locator('#cloud-replace').waitFor();assert.equal(remote.get(owner).data,null);
 const c=await device(other);await enable(c.page);await c.page.getByText('Cloud progress is up to date.',{exact:true}).first().waitFor();
 assert.deepEqual(remote.get(other).data.indic.ta[1].completed,{});
 assert.equal(await a.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 console.log('PASS cloud account consent, two-device restore/conflict, deletion without stale resurrection, account isolation and 320px layout. Auth and remote transport mocked.');
}finally{await browser.close();}
