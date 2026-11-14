import {authConfig} from './auth-config.js';
import {validConfig,createAuthService} from './auth-core.js';
let client=null,initializationError=null;
if(validConfig(authConfig)){
 try{const {createClient}=await import('./vendor/supabase.js');client=createClient(authConfig.url,authConfig.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storage:sessionStorage,storageKey:'reasonlab-auth-v1'}});await client.auth.initialize();}catch(error){initializationError=error;}
}
export const service=createAuthService(client,authConfig,location.origin);
export const configured=validConfig(authConfig)&&!!client;
export {authConfig,initializationError};
export function onAccountChange(callback){return client?.auth.onAuthStateChange((event,session)=>callback(event,session?.user||null));}
