// FarmDesk push notifications (Supabase Edge Function "farmdesk-notify").
// Called every minute by pg_cron with the secret stored in public.notify_config, and by signed-in
// players for a test notification. It works out water, harvest and rent alerts from the shared
// records the same way the app does, adds queued events (work started/finished, sales, new players)
// and sends each alert once per event to every subscribed device that wants that category.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APP_URL = 'https://c0cain3.github.io/FarmaSEERPG/farmdesk/';
const admin = createClient(SB_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const CORS = {
  'Access-Control-Allow-Origin': 'https://c0cain3.github.io',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin'
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// ---- Same estimates as farmdesk/app.js (keep in sync) ------------------------------------------
const H = 3600000, D = 24 * H;
const MELON = 'Vodný melón';
const measuredMelonHours = Math.round((18 + 24 / 60) / (103 / 246));
const measuredMelonDryHours = Number(((18 + 24 / 60) / (1 - 119 / 246)).toFixed(2));
type Farm = Record<string, any>;
type Settings = { growth: number; dry: number; melonHours?: number; melonDryHours?: number; cropTimes?: Record<string, { growth?: number; dry?: number }> };
const PUMPKIN = 'Tekvica';
const measuredPumpkinHours = 44;     // fitted from three photos, see farmdesk/merania
const measuredPumpkinDryHours = 35.2;
const named = (f: Farm) => f.crop === MELON || f.crop === PUMPKIN;
const confirmed = (f: Farm, s: Settings, k: 'growth' | 'dry') => { const v = +(s.cropTimes?.[f.crop]?.[k] ?? 0); return v > 0 ? v : null; };
const growthHours = (f: Farm, s: Settings) => confirmed(f, s, 'growth') ?? (f.crop === MELON ? (s.melonHours ?? measuredMelonHours) : f.crop === PUMPKIN ? measuredPumpkinHours : s.growth);
const dryingHours = (f: Farm, s: Settings) => confirmed(f, s, 'dry') ?? (f.crop === MELON ? (s.melonDryHours ?? measuredMelonDryHours) : f.crop === PUMPKIN ? measuredPumpkinDryHours : s.dry);
function progress(f: Farm, s: Settings, t = Date.now()) {
  const percent = (stamp: number, hours: number) => Math.max(0, Math.min(100, (t - stamp) / (hours * H) * 100));
  const growth = f.planted ? percent(f.planted, growthHours(f, s)) : 0;
  const g = named(f) && growth < 100 ? Math.min(99, Math.round(growth)) : Math.floor(growth);
  const remaining = f.watered ? 100 - percent(f.watered, dryingHours(f, s)) : 0;
  const w = named(f) && remaining > 0 ? Math.max(1, Math.round(remaining)) : Math.ceil(remaining);
  return { g, w };
}
const doorSides: [string, number][] = [['ľavé', 4], ['stredné', 3], ['pravé', 4]];
function doorText(n: number) {
  let start = 0;
  for (const [side, count] of doorSides) { if (n > start && n <= start + count) return `${side} dvere ${n - start}`; start += count; }
  return '';
}
const farmTitle = (f?: Farm) => f ? f.name + (f.door ? ` (${doorText(+f.door)})` : '') : 'Farma';
const jobNames: Record<string, string> = { dig: 'kopanie', till: 'rýľovanie', water: 'polievanie', plant: 'sadenie', harvest: 'zber' };
const money = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n) + ' Ft';
const when = (t: number) => new Date(t).toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
const farmUrl = (id?: string) => id ? `${APP_URL}#farma-${encodeURIComponent(id)}` : APP_URL;

type Alert = { key: string; category: string; title: string; body: string; url: string; leadersOnly?: boolean; exclude?: string | null; farm?: string };

// A player who pressed "Beriem ja" holds the farm until it is watered, at most six hours.
function claimNote(f: Farm, t: number): string {
  const c = f.waterClaim;
  if (!c || typeof c !== 'object' || !(+c.at > (+f.watered || 0)) || t - +c.at > 6 * H) return '';
  return ` Berie ${c.name || 'hráč'}.`;
}

// ---- Alerts from the current state of the farms ---------------------------------------------------
function stateAlerts(farms: Farm[], s: Settings, t = Date.now()): Alert[] {
  const out: Alert[] = [];
  for (const f of farms) {
    if (f.archived) continue;
    const name = farmTitle(f), url = farmUrl(f.id);
    if (f.planted) {
      const { g, w } = progress(f, s, t);
      if (g >= 100) out.push({ key: `harvest:${f.id}:${f.planted}`, category: 'harvest', title: `${name}: úroda je zrelá`, body: 'Rast 100 %. Môžete zbierať.', url, farm: f.id });
      else if (w <= 25) out.push({ key: `water:${f.id}:${f.watered ?? 0}:${w <= 0 ? 0 : 25}`, category: 'water', title: `${name}: treba poliať`, body: (w <= 0 ? 'Voda je na nule, úroda nerastie.' : `Voda ${w} %. Polejte čoskoro.`) + claimNote(f, t), url, farm: f.id });
    }
    if (f.due) {
      const due = +f.due, term = f.term || 'Termín';
      // Two days before, one day before, and at the deadline itself (the "lapsed" alert below).
      for (const days of [2, 1]) {
        const target = due - days * D;
        if (f.createdAt && target < f.createdAt) continue;
        if (t >= target && t < due && t < target + D) {
          out.push({ key: `rent:${f.id}:${due}:${days}`, category: 'rent', title: `${name}: ${days === 2 ? 'termín o 2 dni' : 'termín zajtra'}`, body: `${term} · ${when(due)}`, url, farm: f.id });
        }
      }
      if (t >= due && t < due + D) out.push({ key: `lapsed:${f.id}:${due}`, category: 'rent', title: `${name}: termín uplynul`, body: `${term} bol ${when(due)}. Zaplaťte nájom, inak farma prepadne.`, url, farm: f.id });
    }
  }
  return out;
}

// ---- Alerts from queued events -----------------------------------------------------------------
function eventAlert(e: Record<string, any>, farms: Map<string, Farm>, names: Map<string, string>, logs: Farm[]): Alert | null {
  const actor = names.get(e.actor) || 'Hráč';
  const p = e.payload || {}, f = farms.get(p.farm);
  const base = { key: `event:${e.id}`, exclude: e.actor as string | null, url: farmUrl(p.farm), farm: p.farm };
  if (e.event === 'work_start') {
    const o = p.ongoing || {};
    const jobs = (o.jobs || []).map((j: string) => jobNames[j] || j).join(', ');
    return { ...base, category: 'work', title: `${farmTitle(f)}: práca začala`, body: `${o.who || 'Pracovník'} · ${jobs}${o.who && o.who.includes(actor) ? '' : ` · poslal ${actor}`}` };
  }
  if (e.event === 'work_end') {
    const o = p.ongoing || {};
    const done = logs.some(l => l.farm === p.farm && +l.at >= (+o.startedAt || 0) - 60000);
    return { ...base, category: 'work', title: `${farmTitle(f)}: práca ${done ? 'hotová' : 'zrušená'}`, body: `${o.who || 'Pracovník'} · ${done ? 'zapísal' : 'zrušil'} ${actor}` };
  }
  if (e.event === 'sale') {
    const x = p.tx || {};
    return { ...base, category: 'money', title: `${farmTitle(f)}: predaj úrody`, body: `${actor} predal za ${money(+x.amount || 0)}. Pozrite vyúčtovanie farmy.` };
  }
  if (e.event === 'water_claim') {
    const c = p.claim || {};
    const who = names.get(c.by) || c.name || actor;
    return { ...base, category: 'water', title: `${farmTitle(f)}: polievanie berie ${who}`, body: `${who} ide poliať túto farmu. Ostatní ju nemusia riešiť.` };
  }
  if (e.event === 'player_pending') {
    return { key: `event:${e.id}`, exclude: e.actor, category: 'players', leadersOnly: true, title: 'Nový hráč čaká na schválenie', body: `${p.name || 'Hráč'} sa zaregistroval. Schváľ ho v Nastaveniach → Hráči.`, url: APP_URL };
  }
  return null;
}

async function vapid() {
  const { data, error } = await admin.from('notify_config').select('cron_secret, vapid_public, vapid_private').eq('id', true).single();
  if (error) throw error;
  let { vapid_public, vapid_private } = data;
  if (!vapid_public || !vapid_private) {
    // First run: create the key pair here so the private key is never typed or copied anywhere.
    const keys = webpush.generateVAPIDKeys();
    const { error: e2 } = await admin.from('notify_config').update({ vapid_public: keys.publicKey, vapid_private: keys.privateKey }).eq('id', true).is('vapid_public', null);
    if (e2) throw e2;
    const again = await admin.from('notify_config').select('vapid_public, vapid_private').eq('id', true).single();
    vapid_public = again.data!.vapid_public; vapid_private = again.data!.vapid_private;
  }
  webpush.setVapidDetails(APP_URL, vapid_public, vapid_private);
  return { cronSecret: data.cron_secret as string, publicKey: vapid_public as string };
}

type Sub = { endpoint: string; user_id: string; p256dh: string; auth: string; prefs: Record<string, boolean> };
async function send(sub: Sub, payload: Record<string, unknown>) {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), { TTL: 6 * 3600, urgency: 'high' });
    return true;
  } catch (err: any) {
    // Gone or invalid devices are removed; anything else is retried on a later run.
    if ([404, 410].includes(err?.statusCode)) await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    console.error('push failed', err?.statusCode, err?.body || String(err));
    return false;
  }
}

// The API returns at most 1000 rows per request, so the shared records are read page by page.
async function allRecords() {
  const rows: { kind: string; id: string; data: Farm }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin.from('records').select('kind,id,data').order('kind').order('id').range(from, from + 999);
    if (error) throw error;
    rows.push(...data!);
    if (data!.length < 1000) return rows;
  }
}
function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function runCycle() {
  const [records, membersRes, subsRes, queueRes] = await Promise.all([
    allRecords(),
    admin.from('members').select('user_id,name,role,status'),
    admin.from('push_subscriptions').select('endpoint,user_id,p256dh,auth,prefs'),
    admin.from('notify_queue').select('id,event,payload,actor').is('sent_at', null).order('id').limit(200)
  ]);
  for (const r of [membersRes, subsRes, queueRes]) if (r.error) throw r.error;
  const members = membersRes.data!, subs = subsRes.data as Sub[], queue = queueRes.data!;
  const farms = records.filter(r => r.kind === 'farm').map(r => r.data as Farm);
  const logs = records.filter(r => r.kind === 'log').map(r => r.data as Farm);
  const st = (records.find(r => r.kind === 'settings' && r.id === 'main')?.data || {}) as Record<string, any>;
  const settings: Settings = { growth: +st.growth > 0 ? +st.growth : 48, dry: +st.dry > 0 ? +st.dry : 24, melonHours: +st.melonHours > 0 ? +st.melonHours : undefined, melonDryHours: +st.melonDryHours > 0 ? +st.melonDryHours : undefined, cropTimes: st.cropTimes && typeof st.cropTimes === 'object' ? st.cropTimes : undefined };
  const farmMap = new Map<string, Farm>(farms.map(f => [f.id, f]));
  const names = new Map<string, string>(members.map(m => [m.user_id, m.name]));
  const active = new Map<string, Record<string, any>>(members.filter(m => m.status === 'active').map(m => [m.user_id, m]));

  // Periodic alerts are sent once per key; events once per queue row.
  const candidates = stateAlerts(farms, settings);
  const keys = candidates.map(a => a.key);
  const already = new Set<string>();
  for (let i = 0; i < keys.length; i += 200) {
    const { data, error } = await admin.from('notify_sent').select('key').in('key', keys.slice(i, i + 200));
    if (error) throw error;
    for (const row of data!) already.add(row.key);
  }
  const alerts = candidates.filter(a => !already.has(a.key));
  for (const e of queue) { const a = eventAlert(e, farmMap, names, logs); if (a) alerts.push(a); }
  if (!alerts.length) {
    if (queue.length) await admin.from('notify_queue').update({ sent_at: new Date().toISOString() }).in('id', queue.map(e => e.id));
    return { alerts: 0, sent: 0 };
  }

  // One device gets at most one notification per category per run; several farms are summarised.
  let sent = 0;
  for (const sub of subs) {
    const member = active.get(sub.user_id);
    if (!member) continue;
    const mine = alerts.filter(a => sub.prefs?.[a.category] !== false && a.exclude !== sub.user_id && (!a.leadersOnly || member.role === 'leader'));
    const byCategory = new Map<string, Alert[]>();
    for (const a of mine) byCategory.set(a.category, [...(byCategory.get(a.category) || []), a]);
    for (const [category, list] of byCategory) {
      const one = list.length === 1 ? list[0] : null;
      const summary = { water: 'farmy treba poliať', harvest: 'farmy sú zrelé na zber', rent: 'termíny nájmov', work: 'zmeny v prácach', money: 'predaje úrody', players: 'noví hráči' }[category] || 'upozornenia';
      const payload = one
        ? { title: one.title, body: one.body, url: one.url, tag: `${category}:${one.farm || one.key}` }
        : { title: `${list.length} ${summary}`, body: list.map(a => a.title.split(':')[0]).slice(0, 6).join(', ') + (list.length > 6 ? ' …' : ''), url: APP_URL, tag: `${category}:summary` };
      if (await send(sub, payload)) sent++;
    }
  }

  const fresh = alerts.filter(a => !a.key.startsWith('event:')).map(a => ({ key: a.key }));
  if (fresh.length) await admin.from('notify_sent').upsert(fresh, { onConflict: 'key', ignoreDuplicates: true });
  if (queue.length) await admin.from('notify_queue').update({ sent_at: new Date().toISOString() }).in('id', queue.map(e => e.id));
  // Housekeeping: forget old keys and sent events.
  await admin.from('notify_sent').delete().lt('sent_at', new Date(Date.now() - 30 * D).toISOString());
  await admin.from('notify_queue').delete().lt('created_at', new Date(Date.now() - 7 * D).toISOString()).not('sent_at', 'is', null);
  return { alerts: alerts.length, sent };
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  try {
    const { cronSecret, publicKey } = await vapid();
    const secret = req.headers.get('x-cron-secret');
    if (secret) {
      if (!sameSecret(secret, cronSecret)) return json({ error: 'forbidden' }, 403);
      return json(await runCycle());
    }
    // Signed-in player: test notification to their own devices.
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: who, error } = await admin.auth.getUser(token);
    if (error || !who?.user) return json({ error: 'unauthorized' }, 401);
    const { data: me } = await admin.from('members').select('status,name').eq('user_id', who.user.id).maybeSingle();
    if (me?.status !== 'active') return json({ error: 'forbidden' }, 403);
    const body = await req.json().catch(() => ({}));
    if (body?.action === 'key') return json({ publicKey });
    const { data: subs } = await admin.from('push_subscriptions').select('endpoint,user_id,p256dh,auth,prefs').eq('user_id', who.user.id);
    let sent = 0;
    for (const sub of (subs || []) as Sub[]) if (await send(sub, { title: 'FarmDesk funguje', body: `Ahoj ${me.name}, takto ti budú chodiť upozornenia.`, url: APP_URL, tag: 'test' })) sent++;
    return json({ sent, devices: subs?.length || 0 });
  } catch (err) {
    console.error(err);
    return json({ error: 'server' }, 500);
  }
});
