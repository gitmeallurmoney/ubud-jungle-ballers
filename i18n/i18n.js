/* ============================================================
   Ubud Jungle Ballers — tiny i18n runtime (no framework, no build-time
   transpile). Plain <script> so window.t / window.UBJ_I18N are available
   synchronously to every inline script, deferred module, and tournament.js.

   Load order (in <head>, both blocking):
     1. i18n/strings.js   → window.__I18N_STRINGS = { en:{…}, id:{…} }
                             (generated from i18n/*.json by scripts/build-i18n.mjs)
     2. i18n/i18n.js      → this file

   Pages are pre-rendered per language by the build (English at "/", Bahasa at
   "/id/") for SEO + direct links + first-visit auto-detect. BOTH catalogs ship
   in strings.js, so the EN/ID toggle switches language IN PLACE — it rewrites
   every [data-i18n] / [data-i18n-attr] node on the current page, keeps the
   user exactly where they are (same scroll, no reload, no navigation), and
   fires a document `i18n:changed` event so JS-rendered content (squad rows,
   globe panel, tournament fee, modals) re-renders. The choice is persisted to
   localStorage; on a later reload the inline <head> redirect routes to the
   matching per-locale URL.
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'ubj.lang';
  var html = document.documentElement;
  var lang = (html.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();
  if (lang !== 'id') lang = 'en';

  var STRINGS = (typeof window !== 'undefined' && window.__I18N_STRINGS) || {};
  var dict = STRINGS[lang] || {};
  var enDict = STRINGS.en || {};

  // ---- translation lookup ------------------------------------------------
  function get(obj, path) {
    if (!obj) return undefined;
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  // t(key)            → string for the active language (falls back to en, then the key)
  // t(key, { n: 3 })  → interpolates {n} placeholders
  function t(key, vars) {
    var s = get(dict, key);
    if (s == null) s = get(enDict, key);
    if (s == null) return key;
    s = String(s);
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, name) {
        return vars[name] != null ? vars[name] : m;
      });
    }
    return s;
  }

  // ---- Intl formatters (locale-aware) ------------------------------------
  var LOCALE_MAP = { en: 'en-US', id: 'id-ID' };
  function locale() { return LOCALE_MAP[lang] || 'en-US'; }

  function formatNumber(value, opts) {
    opts = opts || {};
    var o = {};
    if (opts.decimals != null) { o.minimumFractionDigits = o.maximumFractionDigits = opts.decimals; }
    if (opts.compact) { o.notation = 'compact'; o.compactDisplay = 'short'; }
    try { return new Intl.NumberFormat(locale(), o).format(value); }
    catch (e) { return new Intl.NumberFormat('en-US', o).format(value); }
  }

  function formatDate(date, style) {
    style = style || 'medium';
    var d = date instanceof Date ? date : new Date(date);
    var opts = {
      short:  { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long:   { month: 'long', day: 'numeric', year: 'numeric' },
    };
    try { return new Intl.DateTimeFormat(locale(), opts[style] || opts.medium).format(d); }
    catch (e) { return new Intl.DateTimeFormat('en-US', opts[style] || opts.medium).format(d); }
  }

  // IDR formats with no decimals and a "Rp" symbol; en shows "IDR" by default.
  // Locale drives grouping: 1500000 → "Rp 1.500.000" (id) vs "IDR 1,500,000" (en).
  function formatCurrency(value, currency) {
    currency = currency || 'IDR';
    var o = { style: 'currency', currency: currency, currencyDisplay: 'symbol' };
    if (currency === 'IDR') { o.minimumFractionDigits = o.maximumFractionDigits = 0; }
    try { return new Intl.NumberFormat(locale(), o).format(value); }
    catch (e) { return String(value); }
  }

  // Localized country name from an ISO alpha-2 code ("DE" → "Germany"/"Jerman").
  // Cached per-locale so an in-place language switch picks up the new locale.
  var _regionNames = {};
  function countryName(code, fallback) {
    if (!code) return fallback || '';
    try {
      var loc = locale();
      if (!_regionNames[loc]) _regionNames[loc] = new Intl.DisplayNames([loc], { type: 'region' });
      return _regionNames[loc].of(String(code).toUpperCase()) || fallback || code;
    } catch (e) {
      return fallback || code;
    }
  }

  // ---- in-place language switch ------------------------------------------
  // Rewrites tagged nodes/attributes to `code`, persists it, updates the
  // toggle, and notifies page modules — without navigating.
  function applyLanguage(code) {
    code = code === 'id' ? 'id' : 'en';
    try { localStorage.setItem(STORE_KEY, code); } catch (e) {}
    if (code === lang) { refreshToggle(); return; }

    lang = code;
    dict = STRINGS[lang] || {};
    html.setAttribute('lang', lang);
    window.UBJ_I18N.lang = lang;

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      var v = get(dict, key); if (v == null) v = get(enDict, key);
      if (v != null) nodes[i].innerHTML = v;
    }

    var anodes = document.querySelectorAll('[data-i18n-attr]');
    for (var a = 0; a < anodes.length; a++) {
      var spec = anodes[a].getAttribute('data-i18n-attr').split(';');
      for (var s = 0; s < spec.length; s++) {
        var pair = spec[s].split(':');
        var attr = pair[0] && pair[0].trim();
        var akey = pair[1] && pair[1].trim();
        if (!attr || !akey) continue;
        var av = get(dict, akey); if (av == null) av = get(enDict, akey);
        if (av != null) anodes[a].setAttribute(attr, av);
      }
    }

    refreshToggle();
    dispatchChanged();
  }

  function dispatchChanged() {
    var detail = { lang: lang };
    try {
      document.dispatchEvent(new CustomEvent('i18n:changed', { detail: detail }));
    } catch (e) {
      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('i18n:changed', false, false, detail);
      document.dispatchEvent(ev);
    }
  }

  // setLanguage = the toggle action: switch in place (no navigation).
  function setLanguage(code) { applyLanguage(code); }

  // ---- toggle UI ---------------------------------------------------------
  // Injects the sliding "thumb" once, wires clicks, and reflects active state.
  function wireToggle() {
    var toggles = document.querySelectorAll('.lang-toggle');
    for (var i = 0; i < toggles.length; i++) {
      if (!toggles[i].querySelector('.lang-toggle-thumb')) {
        var thumb = document.createElement('span');
        thumb.className = 'lang-toggle-thumb';
        thumb.setAttribute('aria-hidden', 'true');
        toggles[i].insertBefore(thumb, toggles[i].firstChild);
      }
    }
    var btns = document.querySelectorAll('[data-lang-set]');
    for (var j = 0; j < btns.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          setLanguage(btn.getAttribute('data-lang-set'));
        });
      })(btns[j]);
    }
    refreshToggle();
  }

  function refreshToggle() {
    var toggles = document.querySelectorAll('.lang-toggle');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].classList.toggle('is-id', lang === 'id');
      toggles[i].classList.toggle('is-en', lang === 'en');
    }
    var btns = document.querySelectorAll('[data-lang-set]');
    for (var j = 0; j < btns.length; j++) {
      var active = btns[j].getAttribute('data-lang-set') === lang;
      btns[j].classList.toggle('is-active', active);
      btns[j].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  if (document.readyState !== 'loading') wireToggle();
  else document.addEventListener('DOMContentLoaded', wireToggle);

  // ---- public surface ----------------------------------------------------
  window.t = t;
  window.UBJ_I18N = {
    lang: lang,
    t: t,
    setLanguage: setLanguage,
    applyLanguage: applyLanguage,
    formatNumber: formatNumber,
    formatDate: formatDate,
    formatCurrency: formatCurrency,
    countryName: countryName,
  };
})();
