import {configureCloud,initializeCloud} from './cloud-sync.js';
import {authConfig} from './auth-config.js';
import {validConfig,createAuthService} from './auth-core.js';
let client=null,initializationError=null;
if(validConfig(authConfig)){
 try{const {createClient}=await import('./vendor/supabase.js');client=createClient(authConfig.url,authConfig.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storage:sessionStorage,storageKey:'reasonlab-auth-v1'}});await client.auth.initialize();}catch(error){initializationError=error;}
}
const baseService=createAuthService(client,authConfig,location.origin);
configureCloud({getToken:async expectedId=>{
 if(!client)throw Error('Sign in first');
 const {data,error}=await client.auth.getSession();
 if(error||!data.session||data.session.user.id!==expectedId)throw Error('Account changed');
 return data.session.access_token;
}});
export const service={...baseService,
 async user(){try{const user=await baseService.user();await initializeCloud(user);return user;}catch(error){await initializeCloud(null);throw error;}},
 async signOut(){await initializeCloud(null);await baseService.signOut();}
};
export const configured=validConfig(authConfig)&&!!client;
export {authConfig,initializationError};
export function onAccountChange(callback){return client?.auth.onAuthStateChange((event,session)=>callback(event,session?.user||null));}
