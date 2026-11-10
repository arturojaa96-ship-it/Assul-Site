const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/assets/privacy.js'), 'utf8');
const KEY = 'assul_pecas_privacy_v2', AGE = 180 * 24 * 60 * 60 * 1000, NOW = 1794225600000;
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
    location, dataLayer: [],
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
    // Execute the production loader in a VM; no external script is executed.
    const code = source;
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
function latest(c) { return c.window.dataLayer.filter(x => x[0] === 'consent').at(-1); }
function assertSignals(c, grant) { for (const key of CONSENTS) assert.equal(latest(c)[2][key], grant && key === 'ad_storage' ? 'granted' : 'denied'); }
test('Initial deferred signals deny all storage; no dynamic scripts', () => {
 const c = make(); assertSignals(c, false); assert.equal(latest(c)[1], 'default'); assert.equal(c.scripts.length, 0); assert.equal(c.elements['privacy-panel'].hidden, false); assert.equal(c.writes.length, 0);
});
test('Acceptance grants only ad_storage, repeated clicks and evaluation do not duplicate signal', () => {
 const c = accepted(); assertSignals(c, true); const n=c.window.dataLayer.length; c.click('privacy-accept'); c.evaluate(); assert.equal(c.window.dataLayer.length,n); assert.equal(c.scripts.length,0);
});
test('Withdrawal denies all signals without pretending to unload GTM or reloading', () => {
 const c=accepted(); c.click('privacy-reject'); assertSignals(c,false); assert.equal(c.navigations.length,0); assert.equal(c.scripts.length,0); assert.equal(JSON.parse(c.storage.get(KEY)).allowed,false); c.click('privacy-accept'); assertSignals(c,true);
});
test('Reopen, cancel, Escape and focus return preserve choices',()=>{
 const c=accepted();c.open();assert.equal(c.doc.activeElement.id,'privacy-reject');c.click('privacy-cancel');assert.equal(c.doc.activeElement.id,'opener');c.open();let prevented=false;c.elements['privacy-panel'].events.keydown({key:'Escape',preventDefault(){prevented=true;}});assert(prevented);assert.equal(c.elements['privacy-panel'].hidden,true);assertSignals(c,true);
});
test('Invalid and obsolete choices deny; valid V2 choices restore signals',()=>{
 for(const raw of [null,'broken',saved(true,NOW-AGE-1),saved(true,NOW+1),JSON.stringify({version:1,allowed:true,savedAt:NOW}),JSON.stringify({version:2,allowed:'true',savedAt:NOW})]){const c=make({saved:raw});assertSignals(c,false);assert.equal(c.elements['privacy-panel'].hidden,false);}
 for(const grant of [true,false]){const c=make({saved:saved(grant)});assertSignals(c,grant);assert.equal(c.elements['privacy-panel'].hidden,true);}
});
test('Cross-tab withdrawal, deletion, clear, cached page and expiry deny without reload',()=>{
 for(const raw of [saved(false),null])for(const key of [KEY,null]){const c=make({saved:saved(true)});c.crossTab(raw,key);assertSignals(c,false);assert.equal(c.navigations.length,0);}
 const c=make({saved:saved(true)});c.storage.set(KEY,saved(false));c.resume();assertSignals(c,false);
 const e=make({saved:saved(true)});e.advance(AGE+1);e.visible();assertSignals(e,false);
});
test('Storage failures preserve refusal through session and same-origin URLs',()=>{
 const opts={},c=accepted(opts);opts.writeFail=true;opts.removeFail=true;opts.sessionFail=true;c.click('privacy-reject');assertSignals(c,false);assert.equal(new URL(c.window.location.href).searchParams.get('privacy'),'deny');assert.equal(new URL(c.links[0].attrs.href).searchParams.get('privacy'),'deny');assert.equal(c.links[2].attrs.href,'https://wa.me/554136675877');assert.equal(c.navigations.length,0);
 const n=make({saved:saved(true),sessionSaved:'deny'});assertSignals(n,false);
 const u=make({saved:saved(true),url:'https://www.xn--assulautorizadapeas-myb.com.br/?privacy=deny'});assertSignals(u,false);u.click('privacy-accept');assertSignals(u,true);assert(!new URL(u.window.location.href).searchParams.has('privacy'));
});
test('Unwritable storage never automatically restores grant; per-page explicit choice works',()=>{
 const c=make({saved:saved(true),writeFail:true,readFail:true,removeFail:true,sessionFail:true});assertSignals(c,false);c.click('privacy-accept');assertSignals(c,true);c.click('privacy-reject');assertSignals(c,false);
});
test('Only approved host permits local grant; literal HTML loading is not host gated',()=>{
 for(const url of ['https://www.assul.com.br/','https://assul.com.br/','https://assul-site.vercel.app/','https://www.xn--assulautorizadapeas-myb.com.br.evil.example/'])assertSignals(accepted({url}),false);
 for(const url of ['http://localhost:8790/','http://127.0.0.1:8790/'])assertSignals(accepted({url}),true);
});
test('Malformed dataLayer is not overwritten; no dynamic scripts or form field access',()=>{
 const c=accepted({badDataLayer:true});assert(!Array.isArray(c.window.dataLayer));assert.equal(c.scripts.length,0);c.click('privacy-reject');assert.equal(c.navigations.length,0);
 assert(!/createElement|appendChild|gtm.start|event:|p-consent|p-nome|p-cnpj|form-profissional|fetch\(|XMLHttpRequest|sendBeacon|\.value\b|innerHTML|location.reload|location.replace/.test(source));
});
test('Versioned pages restore saved preference without reinserting cached GTM loader',()=>{
 const first=accepted(); const second=make({saved:first.storage.get(KEY)});assertSignals(second,true);assert.equal(second.scripts.length,0);second.resume();assert.equal(second.scripts.length,0);second.click('privacy-reject');const third=make({saved:second.storage.get(KEY)});assertSignals(third,false);assert.equal(third.scripts.length,0);
});
console.log(JSON.stringify({result:'PASS',groups:groups.length,mode:'Offline VM. No remote code executed; cannot verify remote tags or initial consent ordering.',cases:groups},null,2));
