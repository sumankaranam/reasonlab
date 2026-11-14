export function validConfig(config){
 try{const u=new URL(config.url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash)return false;
 const key=config.publishableKey;if(typeof key!=='string')return false;
 if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))return true;
 const payload=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return key.split('.').length===3&&payload.role==='anon';
 }catch{return false;}
}
export function progressKeys(userId=null){if(userId!==null&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId))throw Error('Invalid account identifier');const suffix=userId?`:${userId}`:'';return {history:`reasonlab-kids-history${suffix}`,settings:`reasonlab-kids-settings${suffix}`};}
export function normalizeEmail(input){const email=String(input).trim();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');return email;}
export function createAuthService(client,config,origin){
 const requireReady=()=>{if(!client||!validConfig(config))throw Error('Sign-in has not been configured yet. Guest practice is available.');};
 return {
  async user(){if(!client)return null;const {data:{session},error:sessionError}=await client.auth.getSession();if(sessionError)throw sessionError;if(!session)return null;const {data,error}=await client.auth.getUser();if(error)throw error;return data.user||null;},
  async email(input,adult){requireReady();if(!config.emailEnabled)throw Error('Email sign-in is not enabled.');if(!adult)throw Error('An adult must manage this account.');const email=normalizeEmail(input);const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)throw error;return email;},
  async verify(email,token){requireReady();if(!config.emailEnabled)throw Error('Email sign-in is not enabled.');if(!/^\d{6,10}$/.test(token))throw Error('Enter the numeric code from your email.');const {data,error}=await client.auth.verifyOtp({email:normalizeEmail(email),token,type:'email'});if(error)throw error;if(!data.user||!data.session)throw Error('The code did not establish a session. Please request a new code.');return data.user;},
  async google(adult){requireReady();if(!config.googleEnabled)throw Error('Google sign-in is not enabled.');if(!adult)throw Error('An adult must manage this account.');const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('/account.html',origin).href,scopes:'openid email profile'}});if(error)throw error;return data;},
  async signOut(){requireReady();const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;}
 };
}
