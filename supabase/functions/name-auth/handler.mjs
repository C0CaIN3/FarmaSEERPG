import {loginIdentity,sha256} from './names.mjs';

export function createHandler(deps){
  return async function handle(req){
    const origin=req.headers.get('origin');
    const allowed=!origin||deps.origins.includes(origin);
    const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
      ...(origin&&allowed?{'Access-Control-Allow-Origin':origin}:{}),
      'Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type',
      'Access-Control-Allow-Methods':'POST, OPTIONS'};
    const reply=(code,status=400)=>new Response(JSON.stringify({code}),{status,headers});
    if(!allowed)return reply('ORIGIN_NOT_ALLOWED',403);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(req.method!=='POST')return reply('METHOD_NOT_ALLOWED',405);
    if(!deps.validKey(req.headers.get('apikey')||''))return reply('INVALID_API_KEY',401);
    if(!/^application\/json(?:;|$)/i.test(req.headers.get('content-type')||''))return reply('INVALID_REQUEST');
    let credentials;
    try{
      if(Number(req.headers.get('content-length'))>4096)return reply('INVALID_REQUEST');
      const reader=req.body?.getReader();if(!reader)return reply('INVALID_REQUEST');
      let size=0,raw='';const decoder=new TextDecoder();
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return reply('INVALID_REQUEST');}raw+=decoder.decode(value,{stream:true});}
      credentials=JSON.parse(raw+decoder.decode());
    }catch{return reply('INVALID_REQUEST');}
    const {action,first,last,password}=credentials||{};
    if(!['register','login'].includes(action))return reply('INVALID_REQUEST');
    let identity;
    try{identity=await loginIdentity(first,last);}catch{return reply('INVALID_NAME');}
    if(typeof password!=='string'||password.length<(action==='register'?12:1)||new TextEncoder().encode(password).length>72)return reply('INVALID_PASSWORD');
    let signedIn;
    try{
      // The gateway appends its peer address; use the final hop, not a client prefix.
      const peer=(req.headers.get('x-forwarded-for')||'unknown').split(',').at(-1).trim();
      const limited=await deps.attempt(identity.key,await sha256(peer),action==='register');
      if(!limited)return reply('RATE_LIMITED',429);
      if(action==='register'){
        const created=await deps.createUser({email:identity.alias,password,email_confirm:true,
          app_metadata:{farmcrew_name_login:'v1'},user_metadata:{full_name:identity.name}});
        if(created.error&&!['email_exists','user_already_exists'].includes(created.error.code))
          return reply(created.error.code==='weak_password'?'INVALID_PASSWORD':'AUTH_UNAVAILABLE',created.error.code==='weak_password'?400:503);
        // A retry after a lost response may find the account already created.
        // It must prove the same password; an existing password is never overwritten.
      }
      signedIn=await deps.signIn(identity.alias,password);
      if(signedIn.error||!signedIn.session||signedIn.user?.app_metadata?.farmcrew_name_login!=='v1'){
        if(signedIn.session)await signedIn.signOut?.().catch(()=>{});
        return reply(action==='register'?'NAME_TAKEN':'INVALID_CREDENTIALS',action==='register'?409:401);
      }
      await deps.enroll(signedIn.user.id,identity.key,identity.first,identity.last);
      return new Response(JSON.stringify({session:{access_token:signedIn.session.access_token,refresh_token:signedIn.session.refresh_token}}),{status:200,headers});
    }catch(error){
      if(signedIn?.session)await signedIn.signOut?.().catch(()=>{});
      const message=error?.message;
      return reply(message==='MEMBERSHIP_REQUIRED'?'ACCOUNT_BLOCKED':'AUTH_UNAVAILABLE',message==='MEMBERSHIP_REQUIRED'?403:503);
    }
  };
}
