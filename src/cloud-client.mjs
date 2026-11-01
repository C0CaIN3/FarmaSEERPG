import { createClient } from '@supabase/supabase-js';

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
  const redirectTo = () => new URL('./', window.location.href).href;
  const check = result => { if (result.error) throw result.error; return result.data; };
  async function load() {
    const auth = check(await client.auth.getUser());
    if (!auth?.user) return null;
    identity = auth.user.id;
    // The database decides the role once. User metadata supplies only a display name.
    const fullName = typeof auth.user.user_metadata?.full_name === 'string' ? auth.user.user_metadata.full_name : 'Člen partie';
    const snapshot = check(await client.rpc('farmcrew_join', { p_name: fullName }));
    if (!snapshot || snapshot.authId !== identity) throw new Error('Neplatná odpoveď databázy.');
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
    async signIn(email, password) { check(await client.auth.signInWithPassword({ email: email.trim(), password })); },
    async signUp(email, password, name) { return check(await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo(), data: { full_name: name.trim() } } })); },
    async reset(email) { check(await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectTo() })); },
    async password(password) { check(await client.auth.updateUser({ password })); },
    async signOut() { check(await client.auth.signOut({ scope: 'local' })); revision = null; identity = null; },
    onAuthChange(fn) { return client.auth.onAuthStateChange((event, session) => { setTimeout(() => fn(event, session), 0); }); }
  };
}

if (typeof window !== 'undefined') {
  try { window.FarmCloud = createCloud(window.FARMCREW_CONFIG); }
  catch (error) { window.FarmCloud = { configurationError: error.message }; }
}
