/* Assul Peças: GTM-5RM4RSMJ is the only locally installed Google loader.
 * The loader requires specific V2 consent and the approved Peças hostname. */
(function () {
  'use strict';
  if (window.AssulPecasPrivacy) return;
  var panel = document.getElementById('privacy-panel');
  var status = document.getElementById('privacy-status');
  var accept = document.getElementById('privacy-accept');
  var reject = document.getElementById('privacy-reject');
  var cancel = document.getElementById('privacy-cancel');
  if (!panel || !status || !accept || !reject || !cancel) return;
  var openers = document.querySelectorAll('[data-privacy-open]');
  // Activation authorized for Peças; retain this switch for a reviewed rollback.
  var MEASUREMENT_CONFIGURATION_REVIEWED = true;
  var KEY = 'assul_pecas_privacy_v2';
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  var allowed = false;
  var choiceKnown = false;
  var scriptStates = { gtm: 'idle' };
  var startupQueued = false;
  var reloading = false;
  var returnFocus = null;
  var savedForFuture = false;
  var forcedDenial = new URL(window.location.href).searchParams.get('privacy') === 'deny';
  var approvedHost = ['www.xn--assulautorizadapeas-myb.com.br', 'localhost', '127.0.0.1'].indexOf(window.location.hostname) !== -1;
  window.AssulPecasPrivacy = Object.freeze({ version: 2, gtmEnabled: MEASUREMENT_CONFIGURATION_REVIEWED, container: 'GTM-5RM4RSMJ' });

  function tell(text) { status.textContent = text; }
  function renderState() {
    panel.setAttribute('data-gtm-state', scriptStates.gtm);
  }
  function hasStarted() { return startupQueued || scriptStates.gtm !== 'idle'; }
  function parse(raw) {
    try {
      var value = JSON.parse(raw);
      var now = Date.now();
      if (!value || value.version !== 2 || typeof value.allowed !== 'boolean' || typeof value.savedAt !== 'number' || !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt > MAX_AGE) return null;
      return value;
    } catch (error) { return null; }
  }
  function storageWritable() {
    var probe = KEY + '_check';
    try {
      window.localStorage.removeItem(probe);
      if (window.localStorage.getItem(probe) !== null) return false;
      window.localStorage.setItem(probe, '1');
      if (window.localStorage.getItem(probe) !== '1') return false;
      window.localStorage.removeItem(probe);
      return window.localStorage.getItem(probe) === null;
    } catch (error) { return false; }
  }
  function readChoice() {
    if (forcedDenial) return { allowed: false };
    try { if (window.sessionStorage.getItem(KEY) === 'deny') return { allowed: false }; } catch (error) { /* optional fallback */ }
    try {
      var value = parse(window.localStorage.getItem(KEY));
      return value && value.allowed && !storageWritable() ? null : value;
    } catch (error) { return null; }
  }
  function clearStaleChoice() {
    try { window.localStorage.removeItem(KEY); return window.localStorage.getItem(KEY) === null; } catch (error) { return false; }
  }
  function sessionDenial(value) {
    try {
      if (value) window.sessionStorage.setItem(KEY, 'deny');
      else window.sessionStorage.removeItem(KEY);
    } catch (error) { /* URL fallback below also prevents automatic restoration */ }
  }
  function protectNavigation(denied) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var raw = link.getAttribute('href');
      if (!raw || raw.charAt(0) === '#') return;
      try {
        var next = new URL(raw, window.location.href);
        if (next.origin !== new URL(window.location.href).origin) return;
        if (denied) next.searchParams.set('privacy', 'deny');
        else if (next.searchParams.get('privacy') === 'deny') next.searchParams.delete('privacy');
        link.setAttribute('href', next.href);
      } catch (error) { /* leave unrelated links untouched */ }
    });
  }
  function saveChoice(value) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ version: 2, allowed: value, savedAt: Date.now() }));
      var readBack = parse(window.localStorage.getItem(KEY));
      return !!readBack && readBack.allowed === value;
    } catch (error) { return false; }
  }
  function denySignals() {
    if (!Array.isArray(window.dataLayer)) return;
    window.dataLayer.push({ assul_ads_measurement: 'denied', assul_ads_consent_version: 2 });
    (function () { window.dataLayer.push(arguments); })('consent', 'update', {
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', personalization_storage: 'denied'
    });
  }
  function gtag() { window.dataLayer.push(arguments); }
  function loadScript(kind, src, label) {
    if (scriptStates[kind] !== 'idle') return;
    scriptStates[kind] = 'loading'; renderState();
    function failed() {
      if (reloading || scriptStates[kind] !== 'loading') return;
      scriptStates[kind] = 'failed'; renderState();
      tell('Não foi possível carregar ' + label + '. Você pode recarregar a página para tentar novamente ou retirar a permissão.');
    }
    try {
      var script = document.createElement('script');
      script.async = true;
      script.src = src;
      script.referrerPolicy = 'no-referrer';
      script.onload = function () {
        if (!reloading && scriptStates[kind] === 'loading') {
          scriptStates[kind] = 'loaded'; renderState();
        }
      };
      script.onerror = failed;
      document.head.appendChild(script);
    } catch (error) { failed(); }
  }
  function loadTools() {
    if (!MEASUREMENT_CONFIGURATION_REVIEWED || !allowed || !approvedHost || startupQueued) return;
    startupQueued = true;
    if (window.dataLayer && !Array.isArray(window.dataLayer)) {
      scriptStates.gtm = 'failed'; renderState();
      tell('Não foi possível carregar as ferramentas. Nenhuma nova tentativa será feita nesta página.'); return;
    }
    window.dataLayer = window.dataLayer || [];
    // The GTM loader sees default denial before startup.
    gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', personalization_storage: 'denied'
    });
    gtag('consent', 'update', {
      analytics_storage: 'denied', ad_storage: 'granted', ad_user_data: 'denied', ad_personalization: 'denied', personalization_storage: 'denied'
    });
    window.dataLayer.push({ assul_ads_measurement: 'granted', assul_ads_consent_version: 2 });
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    loadScript('gtm', 'https://www.googletagmanager.com/gtm.js?id=GTM-5RM4RSMJ', 'o Google Tag Manager');
  }
  function show(focus) {
    returnFocus = document.activeElement;
    panel.hidden = false;
    cancel.hidden = !choiceKnown;
    tell(!MEASUREMENT_CONFIGURATION_REVIEWED ? 'A medição está desativada nesta versão. Você pode registrar sua escolha; nenhuma ferramenta do Google será carregada.' : (choiceKnown ? (allowed ? 'Sua escolha atual permite a medição limitada de anúncios do Google.' : 'Sua escolha atual não permite a medição de anúncios do Google.') : 'Nada do Google será carregado antes de você permitir.'));
    if (focus) reject.focus();
  }
  function hide() {
    panel.hidden = true;
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
  }
  function choose(value) {
    if (reloading) return;
    if (value === false) {
      allowed = false; choiceKnown = true;
      sessionDenial(true);
      savedForFuture = saveChoice(false);
      if (!savedForFuture) savedForFuture = clearStaleChoice();
      denySignals();
      if (!savedForFuture) {
        var deniedUrl = new URL(window.location.href);
        deniedUrl.searchParams.set('privacy', 'deny'); forcedDenial = true; protectNavigation(true);
        // A URL override prevents a stale saved permission from reviving after reload.
        if (hasStarted()) { reloading = true; window.location.replace(deniedUrl.href); return; }
        try { window.history.replaceState(null, '', deniedUrl.href); } catch (error) { /* no manager was loaded */ }
      } else if (hasStarted()) { reloading = true; window.location.reload(); return; }
      hide(); return;
    }
    allowed = true; choiceKnown = true;
    savedForFuture = saveChoice(true);
    sessionDenial(false);
    if (savedForFuture && forcedDenial) {
      var cleanUrl = new URL(window.location.href); cleanUrl.searchParams.delete('privacy');
      try { window.history.replaceState(null, '', cleanUrl.href); forcedDenial = false; protectNavigation(false); } catch (error) { /* choice remains safe */ }
    }
    hide(); loadTools();
  }
  accept.addEventListener('click', function () { choose(true); });
  reject.addEventListener('click', function () { choose(false); });
  cancel.addEventListener('click', hide);
  panel.addEventListener('keydown', function (event) { if (event.key === 'Escape' && choiceKnown) { event.preventDefault(); hide(); } });
  openers.forEach(function (button) { button.hidden = false; button.addEventListener('click', function () { show(true); }); });
  function revalidate() {
    if (!allowed || reloading) return;
    var next = readChoice();
    if (!next || next.allowed !== true) {
      allowed = false; denySignals();
      if (hasStarted()) { reloading = true; window.location.reload(); }
    }
  }
  window.addEventListener('storage', function (event) { if (event.key === KEY || event.key === null) revalidate(); });
  window.addEventListener('pageshow', revalidate);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') revalidate(); });
  if (forcedDenial) { sessionDenial(true); clearStaleChoice(); protectNavigation(true); }
  renderState();
  var saved = readChoice();
  if (saved) { allowed = saved.allowed; choiceKnown = true; savedForFuture = true; loadTools(); }
  else show(false);
}());
