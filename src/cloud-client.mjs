import { createClient } from '@supabase/supabase-js';

// Players sign in with their first and last name. Supabase Auth needs an e-mail address, so the
// name maps to a fixed address on the reserved .invalid domain. Nothing is ever sent there, and
// e-mail confirmation must stay off in the Supabase project.
export const LOGIN_DOMAIN = 'farmcrew.invalid';
export const cleanName = name => String(name ?? '').normalize('NFC').trim().replace(/\s+/g, ' ');
export function loginEmail(name) {
  const parts = cleanName(name).toLocaleLowerCase('sk').split(' ');
  if (parts.length < 2 || cleanName(name).length < 3 || cleanName(name).length > 80) throw new Error('INVALID_NAME');
  // Diacritics are ignored, so "Ján Novák" and "Jan Novak" are the same login.
  const slug = parts.map(part => {
    const ascii = part.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    return ascii || 'x' + Array.from(new TextEncoder().encode(part), b => b.toString(16).padStart(2, '0')).join('');
  });
  const email = `${slug.join('.')}@${LOGIN_DOMAIN}`;
  if (email.length > 254) throw new Error('INVALID_NAME');
  return email;
}

export function createCloud(config, factory = createClient) {
  const { supabaseUrl = '', publishableKey = '' } = config || {};
  if (!supabaseUrl && !publishableKey) return null;
  // Fail closed on incomplete configuration; do not silently enter a demo profile.
  let url;
  try { url = new URL(supabaseUrl); } catch { throw new Error('Neplatné pripojenie databázy.'); }
  if (url.protocol !== 'https:' || url.pathname !== '/' || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
    throw new Error('Databáza vyžaduje HTTPS adresu projektu a verejný publishable kľúč.');
  }
  const client = factory(url.origin, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'farmcrew_auth_v1' }
  });
  let revision = null, identity = null;
  const check = result => { if (result.error) throw result.error; return result.data; };
  async function load() {
    const auth = check(await client.auth.getUser());
    if (!auth?.user) return null;
    identity = auth.user.id;
    // The database decides the role once. User metadata supplies only a display name.
    const fullName = typeof auth.user.user_metadata?.full_name === 'string' ? auth.user.user_metadata.full_name : 'Člen partie';
    const snapshot = check(await client.rpc('farmcrew_join', { p_name: fullName }));
    if (!snapshot || snapshot.authId !== identity) throw new Error('Neplatná odpoveď databázy.');
    // Accounts after the first leader wait until a leader approves them.
    if (snapshot.pending === true) { revision = null; throw new Error('APPROVAL_PENDING'); }
    revision = snapshot.revision;
    return snapshot;
  }
  return {
    client,
    async session() { return check(await client.auth.getSession())?.session || null; },
    load,
    async command(action, payload = {}) {
      if (revision === null) throw new Error('Najprv obnov pripojenie k databáze.');
      const result = check(await client.rpc('farmcrew_command', {
        p_action: action, p_payload: payload, p_revision: revision, p_request: crypto.randomUUID()
      }));
      revision = result.revision;
      return result;
    },
    async signIn(name, password) { check(await client.auth.signInWithPassword({ email: loginEmail(name), password })); },
    async signUp(name, password) { return check(await client.auth.signUp({ email: loginEmail(name), password, options: { data: { full_name: cleanName(name) } } })); },
    async password(password) { check(await client.auth.updateUser({ password })); },
    async signOut() { check(await client.auth.signOut({ scope: 'local' })); revision = null; identity = null; },
    onAuthChange(fn) { return client.auth.onAuthStateChange((event, session) => { setTimeout(() => fn(event, session), 0); }); }
  };
}

if (typeof window !== 'undefined') {
  try { window.FarmCloud = createCloud(window.FARMCREW_CONFIG); }
  catch (error) { window.FarmCloud = { configurationError: error.message }; }
}
