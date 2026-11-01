export function normalizeNames(first,last){
  const clean=v=>typeof v==='string'?v.normalize('NFKC').trim().replace(/\s+/gu,' '):'';
  first=clean(first);last=clean(last);
  const valid=/^[\p{L}\p{N}][\p{L}\p{M}\p{N} .'_-]*$/u;
  if(!first||!last||first.length>50||last.length>60||first.length+last.length+1>80||!valid.test(first)||!valid.test(last))throw new Error('INVALID_NAME');
  return {first,last,name:first+' '+last,canonical:JSON.stringify([first.toLowerCase(),last.toLowerCase()])};
}
export async function sha256(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
export async function loginIdentity(first,last){const names=normalizeNames(first,last),key=await sha256(names.canonical);return {...names,key,alias:key+'@members.farmcrew.invalid'};}
