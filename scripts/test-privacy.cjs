const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/assets/privacy.js'), 'utf8');
const KEY = 'assul_pecas_privacy_v2', AGE = 180 * 24 * 60 * 60 * 1000, NOW = 1794225600000;
const ADS = 'https://www.googletagmanager.com/gtag/js?id=AW-16968445825';
const GTM = 'https://www.googletagmanager.com/gtm.js?id=GTM-5RM4RSMJ';
const CONSENTS = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization', 'personalization_storage'];
const groups = [];
function test(name, fn) { fn(); groups.push(name); }
function saved(allowed, savedAt = NOW) { return JSON.stringify({ version: 2, allowed, savedAt }); }
function make(options = {}) {
  const elements = {}, scripts = [], navigations = [], storageEvents = {}, documentEvents = {}, writes = [];
  let clock = NOW, created = 0, insertions = 0;
  let href = options.url || 'https://www.xn--assulautorizadapeas-myb.com.br/';
  const storage = new Map(options.saved === undefined ? [] : [[KEY, options.saved]]);
  if (options.legacySaved !== undefined) storage.set('assul_pecas_privacy_v1', options.legacySaved);
  const session = new Map(options.sessionSaved ? [[KEY, options.sessionSaved]] : []);
  const doc = { activeElement: null, visibilityState: 'visible', addEventListener(k, f) { documentEvents[k] = f; } };
  function el(id) {
    return { id, hidden: true, attrs: {}, textContent: '', events: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] ?? null; }, addEventListener(k, v) { this.events[k] = v; }, focus() { doc.activeElement = this; } };
  }
  for (const id of ['privacy-panel', 'privacy-status', 'privacy-accept', 'privacy-reject', 'privacy-cancel']) elements[id] = el(id);
  const opener = el('opener'), links = [el('privacy-link'), el('home-link'), el('external-link')];
  links[0].attrs.href = 'privacidade.html'; links[1].attrs.href = '/'; links[2].attrs.href = 'https://wa.me/554136675877';
  doc.getElementById = id => elements[id];
  doc.querySelectorAll = s => { if (s === 'a[href]') return links; assert.equal(s, '[data-privacy-open]'); return [opener]; };
  doc.createElement = tag => { assert.equal(tag, 'script'); created++; if (options.createFail || options.createFailAt === created) throw Error('create'); return {}; };
  doc.head = { appendChild(s) { insertions++; if (options.insertFail || options.insertFailAt === insertions) throw Error('insert'); s.queueAtInsertion = [...window.dataLayer]; scripts.push(s); } };
  const location = { get href() { return href; }, get hostname() { return new URL(href).hostname; }, reload() { navigations.push({ type: 'reload', href }); }, replace(url) { href = url; navigations.push({ type: 'replace', href }); } };
  const window = {
    location,
    history: { replaceState(a, b, url) { if (options.historyFail) throw Error('history'); href = url; } },
    sessionStorage: {
      getItem(k) { if (options.sessionFail) throw Error('session'); return session.get(k) || null; },
      setItem(k, v) { if (options.sessionFail) throw Error('session'); session.set(k, v); },
      removeItem(k) { if (options.sessionFail) throw Error('session'); session.delete(k); }
    },
    localStorage: {
      removeItem(k) { if (options.removeFail) throw Error('remove'); storage.delete(k); },
      getItem(k) { if (options.readFail) throw Error('read'); return storage.get(k) || null; },
      setItem(k, v) { if (options.writeFail) throw Error('write'); writes.push({ k, v }); if (!options.ignoreWrite) storage.set(k, v); }
    },
    addEventListener(k, f) { storageEvents[k] = f; }
  };
  if (options.badDataLayer) window.dataLayer = {};
  class Clock extends Date { static now() { return clock; } }
  const ctx = { window, document: doc, URL, Date: Clock, JSON, Array, Object, Number };
  function evaluate() {
    // Enabled mode is simulated only in memory; no external script is executed.
    const code = options.draftMode ? source : source.replace('var ADS_CONFIGURATION_REVIEWED = false;', 'var ADS_CONFIGURATION_REVIEWED = true;');
    vm.runInNewContext(code, ctx, { timeout: 1000 });
  }
  evaluate();
  return {
    window, doc, elements, opener, links, session, scripts, navigations, storage, writes, evaluate,
    state: kind => elements['privacy-panel'].attrs['data-' + kind + '-state'],
    advance(ms) { clock += ms; }, resume() { storageEvents.pageshow(); }, visible() { documentEvents.visibilitychange(); },
    click: id => elements[id].events.click(), open() { opener.focus(); opener.events.click(); },
    crossTab(raw, key = KEY) { if (raw === null) storage.delete(KEY); else storage.set(KEY, raw); storageEvents.storage({ key }); }
  };
}
function accepted(options) { const c = make(options); c.click('privacy-accept'); return c; }
function allDenied(command) { for (const key of CONSENTS) assert.equal(command[2][key], 'denied', key); }
function singlePair(c) { assert.deepEqual(c.scripts.map(s => s.src).sort(), [ADS, GTM].sort()); }

test('Initial choice: no Google scripts, dataLayer or preference writes', () => {
  const c = make(); assert.equal(c.elements['privacy-panel'].hidden, false); assert.equal(c.scripts.length, 0); assert(!c.window.dataLayer); assert.equal(c.writes.length, 0); assert.equal(c.opener.hidden, false); assert.equal(c.state('ads'), 'idle'); assert.equal(c.state('gtm'), 'idle');
});
test('Rejection stores only choice, version and timestamp without loading Google', () => {
  const c = make(); c.click('privacy-reject'); assert.equal(c.scripts.length, 0); assert.equal(c.navigations.length, 0); const record = JSON.parse(c.storage.get(KEY)); assert.equal(record.allowed, false); assert.deepEqual(Object.keys(record).sort(), ['allowed', 'savedAt', 'version']); assert.equal(c.elements['privacy-panel'].hidden, true);
});
test('Reopen, cancel and Escape preserve choice and return focus', () => {
  const c = make(); c.click('privacy-reject'); c.open(); assert.equal(c.doc.activeElement.id, 'privacy-reject'); c.click('privacy-cancel'); assert.equal(c.elements['privacy-panel'].hidden, true); assert.equal(c.doc.activeElement.id, 'opener'); c.open(); let prevented = false; c.elements['privacy-panel'].events.keydown({ key: 'Escape', preventDefault() { prevented = true; } }); assert(prevented); assert.equal(c.elements['privacy-panel'].hidden, true); assert.equal(JSON.parse(c.storage.get(KEY)).allowed, false);
});
test('One exact direct Ads script and existing GTM script are asynchronous and referrer-restricted', () => {
  const c = accepted(); singlePair(c); for (const s of c.scripts) { assert.equal(s.async, true); assert.equal(s.referrerPolicy, 'no-referrer'); } assert.equal(c.state('ads'), 'loading'); assert.equal(c.state('gtm'), 'loading');
});
test('Default denial, limited grant and one base config are queued before either external script', () => {
  const c = accepted(); for (const s of c.scripts) {
    const q = s.queueAtInsertion; assert.equal(q.length, 6); assert.equal(q[0][0], 'consent'); assert.equal(q[0][1], 'default'); allDenied(q[0]); assert.equal(q[1][0], 'consent'); assert.equal(q[1][1], 'update'); assert.equal(q[2].assul_ads_measurement, 'granted'); assert.equal(q[2].assul_ads_consent_version, 2); assert.equal(q[3][0], 'js'); assert.equal(q[4][0], 'config'); assert.equal(q[4][1], 'AW-16968445825'); assert.equal(q[4][2].allow_ad_personalization_signals, false); assert.deepEqual(Object.keys(q[4][2]), ['allow_ad_personalization_signals']); assert.equal(q[5].event, 'gtm.js');
  }
});
test('Only ad_storage is granted; user data, analytics and personalization remain denied', () => {
  const c = accepted(); for (const key of CONSENTS) assert.equal(c.window.dataLayer[1][2][key], key === 'ad_storage' ? 'granted' : 'denied', key);
});
test('Repeated acceptance and script evaluation never duplicate either script or base config', () => {
  const c = accepted(); for (let i = 0; i < 3; i++) c.click('privacy-accept'); c.evaluate(); singlePair(c); assert.equal(c.window.dataLayer.length, 6); assert.equal(c.window.dataLayer.filter(x => x[0] === 'config').length, 1);
});
test('Each script has an independent loading, loaded or failed state', () => {
  const c = accepted(); c.scripts.find(s => s.src === GTM).onload(); assert.equal(c.state('gtm'), 'loaded'); assert.equal(c.state('ads'), 'loading'); const ads = c.scripts.find(s => s.src === ADS); ads.onerror(); assert.equal(c.state('ads'), 'failed'); assert.equal(c.state('gtm'), 'loaded'); ads.onload(); assert.equal(c.state('ads'), 'failed');
});
test('Late duplicate network callbacks cannot change a terminal script state', () => {
  const c = accepted(); for (const s of c.scripts) { s.onload(); s.onerror(); } assert.equal(c.state('ads'), 'loaded'); assert.equal(c.state('gtm'), 'loaded');
});
test('Network failures do not silently retry or duplicate scripts', () => {
  const c = accepted(); for (const s of c.scripts) s.onerror(); c.click('privacy-accept'); singlePair(c); assert.equal(c.state('ads'), 'failed'); assert.equal(c.state('gtm'), 'failed'); c.click('privacy-reject'); assert.equal(c.navigations.length, 1);
});
test('Withdrawal denies all signals before one reload and blocks queued reacceptance', () => {
  const c = accepted(); c.click('privacy-reject'); assert.equal(JSON.parse(c.storage.get(KEY)).allowed, false); assert.equal(c.navigations.length, 1); assert.equal(c.navigations[0].type, 'reload'); assert.equal(c.window.dataLayer.at(-2).assul_ads_measurement, 'denied'); allDenied(c.window.dataLayer.at(-1)); const record = c.storage.get(KEY); c.click('privacy-accept'); c.click('privacy-reject'); assert.equal(c.storage.get(KEY), record); assert.equal(c.navigations.length, 1);
});
test('Callbacks after withdrawal do not revive or misreport scripts', () => {
  const c = accepted(); c.click('privacy-reject'); for (const s of c.scripts) { s.onload(); s.onerror(); } assert.equal(c.state('ads'), 'loading'); assert.equal(c.state('gtm'), 'loading'); assert.equal(c.navigations.length, 1);
});
test('Missing, malformed, expired, future and obsolete records fail closed', () => {
  for (const raw of [null, 'broken', saved(true, NOW - AGE - 1), saved(true, NOW + 1), JSON.stringify({ version: 1, allowed: true, savedAt: NOW }), JSON.stringify({ version: 2, allowed: 'true', savedAt: NOW }), JSON.stringify({ version: 2, allowed: true, savedAt: null })]) { const c = make({ saved: raw }); assert.equal(c.scripts.length, 0); assert.equal(c.elements['privacy-panel'].hidden, false); }
});
test('A valid V2 grant restores both tools; a valid refusal restores neither', () => {
  let c = make({ saved: saved(true) }); singlePair(c); assert.equal(c.elements['privacy-panel'].hidden, true); c = make({ saved: saved(false) }); assert.equal(c.scripts.length, 0); assert.equal(c.elements['privacy-panel'].hidden, true);
});
test('V1 accepted and rejected choices never authorize V2 Ads', () => {
  for (const allowed of [true, false]) { const c = make({ legacySaved: JSON.stringify({ version: 1, allowed, savedAt: NOW }) }); assert.equal(c.scripts.length, 0); assert(!c.window.dataLayer); assert.equal(c.elements['privacy-panel'].hidden, false); c.click('privacy-accept'); singlePair(c); assert.equal(JSON.parse(c.storage.get(KEY)).version, 2); }
});
test('Failed withdrawal writes invalidate the stale local grant before reload', () => {
  const options = {}, c = accepted(options); options.writeFail = true; c.click('privacy-reject'); assert.equal(c.storage.has(KEY), false); assert.equal(c.navigations[0].type, 'reload');
});
test('Session rejection overrides stale local permission on next page', () => {
  const options = {}, c = accepted(options); options.writeFail = true; options.removeFail = true; c.click('privacy-reject'); assert.equal(c.navigations[0].type, 'replace'); assert.equal(c.session.get(KEY), 'deny'); const next = make({ saved: c.storage.get(KEY), sessionSaved: c.session.get(KEY) }); assert.equal(next.scripts.length, 0);
});
test('Full storage failure preserves denial in URL and same-origin links only', () => {
  const options = { sessionFail: true }, c = accepted(options); options.writeFail = true; options.removeFail = true; c.click('privacy-reject'); assert.equal(new URL(c.navigations[0].href).searchParams.get('privacy'), 'deny'); assert.equal(new URL(c.links[0].attrs.href).searchParams.get('privacy'), 'deny'); assert.equal(c.links[2].attrs.href, 'https://wa.me/554136675877'); const next = make({ saved: c.storage.get(KEY), url: c.links[0].attrs.href, sessionFail: true, writeFail: true, removeFail: true }); assert.equal(next.scripts.length, 0);
});
test('A stale grant with unwritable storage cannot automatically restore tools', () => {
  const c = make({ saved: saved(true), writeFail: true, removeFail: true, sessionFail: true }); assert.equal(c.scripts.length, 0);
});
test('No storage supports an explicit per-page grant and safe withdrawal', () => {
  const c = make({ writeFail: true, readFail: true, removeFail: true, sessionFail: true }); assert.equal(c.scripts.length, 0); c.click('privacy-accept'); singlePair(c); c.click('privacy-reject'); assert.equal(new URL(c.navigations[0].href).searchParams.get('privacy'), 'deny');
});
test('Ignored preference writes are detected by readback', () => {
  const options = {}, c = accepted(options); options.ignoreWrite = true; options.removeFail = true; c.click('privacy-reject'); assert.equal(c.navigations[0].type, 'replace');
});
test('Fresh explicit grant removes forced denial only after verified persistence', () => {
  const c = make({ url: 'https://www.xn--assulautorizadapeas-myb.com.br/?privacy=deny', saved: saved(true) }); assert.equal(c.scripts.length, 0); c.click('privacy-accept'); assert.equal(new URL(c.window.location.href).searchParams.has('privacy'), false); singlePair(c);
});
test('A failed new preference write keeps the forced-denial URL', () => {
  const c = make({ url: 'https://www.xn--assulautorizadapeas-myb.com.br/?privacy=deny', writeFail: true }); c.click('privacy-accept'); assert.equal(new URL(c.window.location.href).searchParams.get('privacy'), 'deny'); singlePair(c);
});
test('Cross-tab rejection revokes both tools exactly once', () => {
  const c = make({ saved: saved(true) }); c.crossTab(saved(false)); assert.equal(c.navigations.length, 1); allDenied(c.window.dataLayer.at(-1)); c.crossTab(saved(false)); assert.equal(c.navigations.length, 1);
});
test('Cross-tab removal and clear revoke loaded tools', () => {
  for (const key of [KEY, null]) { const c = make({ saved: saved(true) }); c.crossTab(null, key); assert.equal(c.navigations.length, 1); }
});
test('Cached-page restoration revalidates silently withdrawn preferences', () => {
  const c = make({ saved: saved(true) }); c.storage.set(KEY, saved(false)); c.resume(); assert.equal(c.navigations.length, 1);
});
test('Visibility return revalidates expiration', () => {
  const c = make({ saved: saved(true) }); c.advance(AGE + 1); c.visible(); assert.equal(c.navigations.length, 1);
});
test('An unrelated storage event cannot grant or change consent', () => {
  const c = make({ saved: saved(false) }); c.crossTab(saved(true), 'unrelated'); assert.equal(c.scripts.length, 0);
});
test('Malformed dataLayer fails both tools without overwrite or retry', () => {
  const c = accepted({ badDataLayer: true }); assert.equal(c.scripts.length, 0); assert.equal(c.state('ads'), 'failed'); assert.equal(c.state('gtm'), 'failed'); assert(!Array.isArray(c.window.dataLayer)); c.click('privacy-accept'); assert.equal(c.scripts.length, 0); c.click('privacy-reject'); assert.equal(c.navigations.length, 1);
});
test('A DOM failure in either script preserves the other independent state', () => {
  for (const fail of ['createFailAt', 'insertFailAt']) for (const index of [1, 2]) {
    const c = accepted({ [fail]: index }); assert.equal(c.scripts.length, 1); assert.equal(c.state(index === 1 ? 'ads' : 'gtm'), 'failed'); assert.equal(c.state(index === 1 ? 'gtm' : 'ads'), 'loading'); c.click('privacy-accept'); assert.equal(c.scripts.length, 1); c.click('privacy-reject'); assert.equal(c.navigations.length, 1);
  }
});
test('Full DOM creation or insertion failure remains revocable', () => {
  for (const options of [{ createFail: true }, { insertFail: true }]) { const c = accepted(options); assert.equal(c.scripts.length, 0); assert.equal(c.state('ads'), 'failed'); assert.equal(c.state('gtm'), 'failed'); c.click('privacy-reject'); assert.equal(c.navigations.length, 1); }
});
test('Exact host allowlist excludes main Assul, previews and suffix lookalikes', () => {
  for (const url of ['https://www.assul.com.br/', 'https://assul.com.br/', 'https://assul-site.vercel.app/', 'https://www.xn--assulautorizadapeas-myb.com.br.evil.example/']) { const c = accepted({ url }); assert.equal(c.scripts.length, 0); assert(!c.window.dataLayer); }
});
test('Local QA hosts can simulate both scripts while source gate stays off', () => {
  for (const url of ['http://localhost:8790/', 'http://127.0.0.1:8790/']) singlePair(accepted({ url }));
});
test('Unmodified candidate is inert after acceptance and saved V2 permission', () => {
  assert.equal((source.match(/var ADS_CONFIGURATION_REVIEWED = false;/g) || []).length, 1);
  for (const options of [{ draftMode: true }, { draftMode: true, saved: saved(true) }]) { const c = accepted(options); assert.equal(c.scripts.length, 0); assert(!c.window.dataLayer); assert.equal(c.window.AssulPecasPrivacy.adsEnabled, false); c.open(); assert(c.elements['privacy-status'].textContent.includes('desativada')); }
});
test('Local loader never reads form fields or uses extra transmission APIs', () => {
  assert(!/p-consent|p-nome|p-cnpj|form-profissional|fetch\(|XMLHttpRequest|sendBeacon|\.value\b|innerHTML/.test(source));
});
test('Only one direct base config, one Ads loader and one existing GTM loader; no conversions', () => {
  assert.equal((source.match(/gtag\('config', 'AW-16968445825'/g) || []).length, 1); assert.equal((source.match(/https:\/\/www.googletagmanager.com\/gtag\/js\?id=/g) || []).length, 1); assert.equal((source.match(/https:\/\/www.googletagmanager.com\/gtm.js\?id=/g) || []).length, 1); assert(!/gtag\('event'|AW-\d+\/|\bsend_to:|\buser_id:|\buser_data:|allow_enhanced_conversions|allow_google_signals/.test(source)); assert(source.includes("destination: 'AW-16968445825'"));
});
test('Both pages contain one consent UI and loader, with no external-script or noscript bypass', () => {
  for (const file of ['index.html', 'privacidade.html']) { const h = fs.readFileSync(path.join(root, 'public', file), 'utf8'); for (const id of ['privacy-panel', 'privacy-status', 'privacy-accept', 'privacy-reject', 'privacy-cancel']) assert.equal((h.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1); assert.equal((h.match(/src="assets\/privacy\.js"/g) || []).length, 1); assert(h.includes('data-privacy-open hidden')); assert(!/<noscript[\s\S]*?iframe/i.test(h)); assert(!/src="https:\/\/www.googletagmanager.com/.test(h)); }
});
test('Deployable CSP remains the unchanged restrictive policy, pending explicit review', () => {
  const policy = "default-src 'self'; script-src 'self' https://www.googletagmanager.com/gtm.js; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')); assert.equal(config.headers[0].headers.find(x => x.key === 'Content-Security-Policy').value, policy);
});
console.log(JSON.stringify({ result: 'PASS', groups: groups.length, mode: 'Offline VM; source gate false; enabled behavior simulated in memory; external scripts never executed', cases: groups }, null, 2));
