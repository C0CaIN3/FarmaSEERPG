import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {createHandler} from './handler.mjs';
import config from './public-config.json' with {type:'json'};

const url=Deno.env.get('SUPABASE_URL')!;
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey=Deno.env.get('SUPABASE_ANON_KEY')!;
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
  global:{fetch:(input:RequestInfo|URL,init?:RequestInit)=>fetch(input,{...init,signal:AbortSignal.timeout(12000)})}};
const admin=createClient(url,serviceKey,options);
const check=(result:any)=>{if(result.error)throw result.error;return result.data;};
Deno.serve(createHandler({
  origins:config.origins,
  validKey:(key:string)=>key===config.publishableKey||key===anonKey,
  attempt:async(key:string,peer:string,register:boolean)=>check(await admin.rpc('farmcrew_name_attempt',{p_login_key:key,p_peer_key:peer,p_register:register})),
  createUser:(attributes:any)=>admin.auth.admin.createUser(attributes),
  signIn:async(email:string,password:string)=>{
    const auth=createClient(url,anonKey,options);
    const {data,error}=await auth.auth.signInWithPassword({email,password});
    return {...data,error,signOut:()=>auth.auth.signOut({scope:'local'})};
  },
  enroll:async(id:string,key:string,first:string,last:string)=>check(await admin.rpc('farmcrew_name_enroll',{p_auth_id:id,p_login_key:key,p_first:first,p_last:last}))
}));
