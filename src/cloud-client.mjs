import { createClient } from '@supabase/supabase-js';
export function createCloud(config, factory = createClient) {
  const {supabaseUrl='',publishableKey=''}=config||{};
  if(!supabaseUrl&&!publishableKey)return null;
  let url;try{url=new URL(supabaseUrl);}catch{throw new Error('Neplatné pripojenie databázy.');}
  if(url.protocol!=='https:'||url.pathname!=='/'||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey))throw new Error('Databáza vyžaduje HTTPS adresu projektu a verejný publishable kľúč.');
  const client=factory(url.origin,publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'farmcrew_auth_v1'}});
  let revision=null,identity=null;
  const check=result=>{if(result.error)throw result.error;return result.data;};
  async function authenticate(action,first,last,password){
    const {data,error}=await client.functions.invoke('name-auth',{body:{action,first,last,password}});
    if(error){let code=data?.code;try{code=(await error.context?.json())?.code||code;}catch{}throw new Error(code||'AUTH_UNAVAILABLE');}
    if(!data?.session?.access_token||!data?.session?.refresh_token)throw new Error('AUTH_UNAVAILABLE');
    check(await client.auth.setSession(data.session));return data;
  }
  return {
    client,
    async session(){return check(await client.auth.getSession())?.session||null;},
    async load(){const auth=check(await client.auth.getUser());if(!auth?.user)return null;identity=auth.user.id;const snapshot=check(await client.rpc('farmcrew_snapshot'));if(!snapshot||snapshot.authId!==identity)throw new Error('Neplatná odpoveď databázy.');revision=snapshot.revision;return snapshot;},
    async command(action,payload={}){if(revision===null)throw new Error('Najprv obnov pripojenie k databáze.');const result=check(await client.rpc('farmcrew_command',{p_action:action,p_payload:payload,p_revision:revision,p_request:crypto.randomUUID()}));revision=result.revision;return result;},
    signIn:(first,last,password)=>authenticate('login',first,last,password),
    signUp:(first,last,password)=>authenticate('register',first,last,password),
    async signOut(){check(await client.auth.signOut({scope:'local'}));revision=null;identity=null;},
    onAuthChange(fn){return client.auth.onAuthStateChange((event,session)=>{setTimeout(()=>fn(event,session),0);});}
  };
}
if(typeof window!=='undefined'){try{window.FarmCloud=createCloud(window.FARMCREW_CONFIG);}catch(error){window.FarmCloud={configurationError:error.message};}}
