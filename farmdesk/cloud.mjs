import { createClient } from '@supabase/supabase-js';

// Players sign in with a name and password. Supabase Auth needs an e-mail address, so the name maps
// to a fixed address on the reserved .invalid domain. Nothing is ever sent there; e-mail confirmation
// must stay off in the FarmDesk Supabase project.
const LOGIN_DOMAIN = 'farmdesk.invalid';
const cleanName = name => String(name ?? '').normalize('NFC').trim().replace(/\s+/g, ' ');
function loginEmail(name) {
  const clean = cleanName(name);
  if (clean.length < 2 || clean.length > 60) throw new Error('INVALID_NAME');
  // Diacritics and letter case are ignored, so "Tomáš" and "tomas" are the same login.
  const slug = clean.toLocaleLowerCase('sk').split(' ').map(part => {
    const ascii = part.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    return ascii || 'x' + Array.from(new TextEncoder().encode(part), b => b.toString(16).padStart(2, '0')).join('');
  });
  return `${slug.join('.')}@${LOGIN_DOMAIN}`;
}

const config = window.FARMDESK_CONFIG;
if (config?.supabaseUrl && config?.publishableKey) {
  const sb = createClient(config.supabaseUrl, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'farmdesk-auth' }
  });
  const fail = error => { if (error) throw error; };
  const PAGE = 1000;

  window.FarmCloud = Object.freeze({
    cleanName,
    async session() { const { data, error } = await sb.auth.getSession(); fail(error); return data.session; },
    async signIn(name, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: loginEmail(name), password });
      fail(error); return data.session;
    },
    async signUp(name, password) {
      const { data, error } = await sb.auth.signUp({ email: loginEmail(name), password, options: { data: { name: cleanName(name) } } });
      fail(error);
      if (!data.session) throw new Error('CONFIRM_EMAIL_ON');
      return data.session;
    },
    async signOut() { await sb.auth.signOut(); },
    async join(name) { const { data, error } = await sb.rpc('farmdesk_join', { p_name: cleanName(name) }); fail(error); return data; },
    async members() { const { data, error } = await sb.from('members').select('*').order('created_at'); fail(error); return data; },
    async setMember(user, status = null, role = null) {
      const { data, error } = await sb.rpc('farmdesk_set_member', { p_user: user, p_status: status, p_role: role }); fail(error); return data;
    },
    async setPassword(user, password) { const { error } = await sb.rpc('farmdesk_set_password', { p_user: user, p_password: password }); fail(error); },
    async loadAll() {
      const rows = [];
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await sb.from('records').select('kind,id,data,created_by,created_at,updated_by,updated_at')
          .order('created_at').order('kind').order('id').range(from, from + PAGE - 1);
        fail(error); rows.push(...data);
        if (data.length < PAGE) return rows;
      }
    },
    async upsert(records) {
      for (let i = 0; i < records.length; i += 300) {
        const chunk = records.slice(i, i + 300).map(({ kind, id, data }) => ({ kind, id, data }));
        const { error } = await sb.from('records').upsert(chunk, { onConflict: 'kind,id' }); fail(error);
      }
    },
    async remove(keys) {
      const byKind = new Map();
      for (const { kind, id } of keys) byKind.set(kind, [...(byKind.get(kind) || []), id]);
      for (const [kind, ids] of byKind) {
        for (let i = 0; i < ids.length; i += 200) {
          const { error } = await sb.from('records').delete().eq('kind', kind).in('id', ids.slice(i, i + 200)); fail(error);
        }
      }
    },
    // Push notifications: the public key, this player's devices, saving and removing a device, a test.
    async pushKey() { const { data, error } = await sb.rpc('farmdesk_push_key'); fail(error); return data; },
    async pushDevices() { const { data, error } = await sb.from('push_subscriptions').select('endpoint,prefs,user_agent,updated_at'); fail(error); return data; },
    async savePush(endpoint, p256dh, auth, prefs, userAgent) {
      const { data, error } = await sb.rpc('farmdesk_save_push', { p_endpoint: endpoint, p_p256dh: p256dh, p_auth: auth, p_prefs: prefs, p_user_agent: userAgent || null }); fail(error); return data;
    },
    async deletePush(endpoint) { const { error } = await sb.from('push_subscriptions').delete().eq('endpoint', endpoint); fail(error); },
    async testPush() { const { data, error } = await sb.functions.invoke('farmdesk-notify', { body: { action: 'test' } }); fail(error); return data; },
    // Calls onChange after any change by any player; returns a function that stops listening.
    subscribe(onChange) {
      const channel = sb.channel('farmdesk-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, () => onChange('records'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => onChange('members'))
        .subscribe();
      return () => sb.removeChannel(channel);
    },
    onAuth(callback) { return sb.auth.onAuthStateChange((event, session) => callback(event, session)); }
  });
}
