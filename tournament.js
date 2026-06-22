/* ============================================================
   King of the Jungle — tournament registration flow
   - Multi-step modal (reuses the .join-* styling from style.css)
   - Submits each team to Supabase: logo -> Storage, row -> table
   - No build step, no SDK: plain fetch against Supabase REST + Storage.

   SETUP: fill in CONFIG below. See SETUP-TOURNAMENT.md for the
   one-time Supabase steps (create table + bucket + policies).
   Until Supabase is configured, the form runs in PREVIEW MODE:
   it walks through every step and shows the success screen, but
   nothing is sent anywhere (a note is logged to the console).
   ============================================================ */

// Keys come from env.js (window.__ENV), generated from .env.local / Vercel env
// vars by scripts/gen-env.mjs — never hard-coded here. See SETUP-TOURNAMENT.md.
const ENV = (typeof window !== 'undefined' && window.__ENV) || {};

const CONFIG = {
  /* ----- Supabase (set via .env.local → env.js, NOT inline) ----- */
  supabaseUrl:     ENV.SUPABASE_URL      || 'https://YOUR-PROJECT-REF.supabase.co',
  supabaseAnonKey: ENV.SUPABASE_ANON_KEY || 'YOUR-ANON-PUBLIC-KEY',
  logoBucket:      'team-logos',                            // Storage bucket name
  signupTable:     'tournament_signups',                    // table name

  /* ----- Entry fee — a NUMBER in IDR. Formatted per active language via Intl:
     1500000 → "IDR 1,500,000" (en) / "Rp 1.500.000" (id). The "per team"
     caption is a translation (i18n/*.json → tour.feeNote), not set here. ----- */
  feeAmount: 1500000,       // EDIT

  /* ----- Where teams pay (bank / e-wallet transfer) ----- */
  bankName:      'BCA',                       // EDIT
  accountName:   'Ubud Jungle Ballers',       // EDIT
  accountNumber: '0000000000',                // EDIT
  ewalletName:   'GoPay / OVO',               // EDIT
  ewalletNumber: '+62 812-0000-0000',         // EDIT

  /* ----- WhatsApp line for questions + payment proof (digits, intl format) ----- */
  whatsappAdmin: '6281234567890',             // EDIT
  /* ----- WhatsApp GROUP invite link (https://chat.whatsapp.com/...) -----
     Optional: leave '' to hide the "Join the group" link until you have one. */
  whatsappGroup: '',                          // EDIT
};

(function () {
  'use strict';

  // i18n bridge — i18n/i18n.js loads before this script, but degrade gracefully.
  const tr = (typeof window !== 'undefined' && window.t) || ((k) => k);
  const I18N = (typeof window !== 'undefined' && window.UBJ_I18N) || { formatCurrency: (v) => String(v) };
  // Entry fee, formatted for the active locale (Rp 1.500.000 vs IDR 1,500,000).
  const feeDisplay = () => I18N.formatCurrency(CONFIG.feeAmount, 'IDR');

  // ---- Render CONFIG values into the page -----------------------------
  function applyConfig() {
    document.querySelectorAll('[data-cfg]').forEach((el) => {
      const key = el.getAttribute('data-cfg');
      if (key === 'whatsappDisplay') {
        el.textContent = '+' + CONFIG.whatsappAdmin.replace(/\D/g, '');
      } else if (key === 'fee') {
        el.textContent = feeDisplay();
      } else if (key === 'feeNote') {
        el.textContent = tr('tour.feeNote');     // localized "per team" / "per tim"
      } else if (key in CONFIG) {
        el.textContent = CONFIG[key];
      }
    });
    document.querySelectorAll('[data-cfg-href="whatsappLink"]').forEach((a) => {
      a.href = 'https://wa.me/' + CONFIG.whatsappAdmin.replace(/\D/g, '');
    });
    // General "got a question" contact link, with a friendly pre-filled message.
    const askText = encodeURIComponent("Hi! I've got a question about the King of the Jungle tournament.");
    document.querySelectorAll('[data-cfg-href="whatsappAsk"]').forEach((a) => {
      a.href = 'https://wa.me/' + CONFIG.whatsappAdmin.replace(/\D/g, '') + '?text=' + askText;
    });
    // WhatsApp group invite link — only shown once a link is configured.
    document.querySelectorAll('[data-cfg-href="whatsappGroup"]').forEach((a) => {
      if (CONFIG.whatsappGroup) { a.href = CONFIG.whatsappGroup; a.hidden = false; }
      else { a.hidden = true; }
    });
  }
  applyConfig();

  const isConfigured =
    !CONFIG.supabaseUrl.includes('YOUR-PROJECT') &&
    !CONFIG.supabaseAnonKey.includes('YOUR-ANON');

  // ---- Modal elements --------------------------------------------------
  const modal      = document.getElementById('tour-modal');
  if (!modal) return;
  const form       = document.getElementById('tour-form');
  let   stepNum    = document.getElementById('tour-step-num');
  const progress   = document.getElementById('tour-progress-bar');
  const backBtn    = document.getElementById('tour-back');
  const nextBtn    = document.getElementById('tour-next');
  const errorEl    = document.getElementById('tour-error');
  const doneWa     = document.getElementById('tour-done-wa');
  const doneMsg    = document.getElementById('tour-done-msg');
  const doneSum    = document.getElementById('tour-done-summary');
  const ebProgress = modal.querySelector('.join-eyebrow-progress');
  const ebDone     = modal.querySelector('.join-eyebrow-done');
  const modalFoot  = modal.querySelector('.join-modal-foot');

  // Logo upload bits
  const logoInput  = document.getElementById('tour-logo');
  const logoDrop   = document.getElementById('tour-logo-drop');
  const logoThumb  = document.getElementById('tour-logo-thumb');
  const logoHint   = document.getElementById('tour-logo-hint');
  const MAX_LOGO   = 4 * 1024 * 1024; // 4 MB
  // Raster only — SVG is excluded because logos live in a PUBLIC bucket and an
  // SVG can carry <script> (would execute if opened directly from its URL).
  const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  // Captured so a re-opened modal can restore the dropzone to its empty state.
  const LOGO_THUMB_DEFAULT = logoThumb.innerHTML;
  const LOGO_HINT_DEFAULT  = logoHint.textContent;
  const FETCH_TIMEOUT_MS   = 25000;

  // Background regions made `inert` while the modal is open (focus trap + a11y).
  const bgRegions = [
    document.getElementById('site-nav'),
    document.querySelector('main.tour-main'),
    document.querySelector('.cd-footer'),
    document.getElementById('mobile-drawer'),
  ];

  const TOTAL_STEPS = 3;

  function freshData() {
    return { team: '', admin: '', whatsapp: '', roster: '', logoFile: null, logoUrl: null };
  }

  let savedTrigger = null;
  const state = {
    step: 1,
    submitting: false,
    data: freshData(),
  };

  // ---- Open / close ----------------------------------------------------
  function setBackgroundInert(on) {
    bgRegions.forEach((el) => {
      if (!el) return;
      if (on) el.setAttribute('inert', '');
      else    el.removeAttribute('inert');
    });
  }
  function resetForm() {
    state.data = freshData();
    state.submitting = false;
    form.reset();
    logoThumb.innerHTML  = LOGO_THUMB_DEFAULT;
    logoHint.textContent = LOGO_HINT_DEFAULT;
    nextBtn.classList.remove('is-loading');
    showStep(1);
  }
  function closeDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    const burger = document.getElementById('nav-burger');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  function openModal() {
    savedTrigger = document.activeElement;
    // Fresh start once a registration has completed, so a captain can enter
    // another team without a stale success screen or the previous team's data.
    if (state.step > TOTAL_STEPS) resetForm();
    setBackgroundInert(true);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const f = modal.querySelector('.join-step.is-active input, .join-step.is-active button');
      if (f) f.focus();
    }, 320);
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    if (savedTrigger && typeof savedTrigger.focus === 'function') savedTrigger.focus();
  }

  // Any element marked [data-register] (or linking to #register) opens it.
  // Close the mobile drawer first (without it resetting the scroll lock that
  // openModal sets), so the drawer CTA behaves like every other entry point.
  document.querySelectorAll('[data-register], a[href="#register"]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); closeDrawer(); openModal(); });
  });
  modal.addEventListener('click', (e) => { if (e.target.matches('[data-tour-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // ---- Step navigation -------------------------------------------------
  function showStep(n) {
    state.step = n;
    for (const step of modal.querySelectorAll('.join-step')) {
      const isActive = Number(step.dataset.step) === n;
      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    }
    const isDone = n > TOTAL_STEPS;

    ebProgress.hidden = isDone;
    ebDone.hidden     = !isDone;
    if (!isDone) stepNum.textContent = String(n);

    progress.style.width = (isDone ? 100 : Math.round((n / TOTAL_STEPS) * 100)) + '%';

    modalFoot.hidden = isDone;
    backBtn.hidden   = n === 1;
    nextBtn.textContent = n === TOTAL_STEPS ? tr('tour.btnRegister') : tr('join.continue');
    errorEl.hidden = true;
    errorEl.textContent = '';

    setTimeout(() => {
      const f = modal.querySelector('.join-step.is-active input, .join-step.is-active button');
      if (f && typeof f.focus === 'function') f.focus();
    }, 50);
  }

  // ---- Mirror text inputs into state -----------------------------------
  modal.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'tour-team')   state.data.team = t.value.trim();
    if (t.id === 'tour-admin')  state.data.admin = t.value.trim();
    if (t.id === 'tour-wa')     state.data.whatsapp = t.value.trim();
    if (t.id === 'tour-roster') state.data.roster = t.value.trim();
  });

  // ---- Logo selection + preview ----------------------------------------
  function setLogo(file) {
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) { logoInput.value = ''; showError(tr('tour.errLogoType')); return; }
    if (file.size > MAX_LOGO)                     { logoInput.value = ''; showError(tr('tour.errLogoSize')); return; }
    state.data.logoFile = file;
    state.data.logoUrl  = null; // a new file invalidates any previously-uploaded URL
    logoHint.textContent = file.name;
    // Preview thumbnail. The read is async, so guard against the selection
    // changing (or the form being reset) before it resolves.
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (state.data.logoFile !== file) return;
      logoThumb.innerHTML = '<img src="' + ev.target.result + '" alt="" />';
    };
    reader.readAsDataURL(file);
    errorEl.hidden = true;
  }
  logoInput.addEventListener('change', () => setLogo(logoInput.files[0]));
  // Drag & drop onto the dropzone
  ['dragenter', 'dragover'].forEach((ev) =>
    logoDrop.addEventListener(ev, (e) => { e.preventDefault(); logoDrop.classList.add('is-drag'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    logoDrop.addEventListener(ev, (e) => { e.preventDefault(); logoDrop.classList.remove('is-drag'); }));
  logoDrop.addEventListener('drop', (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) { setLogo(f); }
  });

  // ---- Validation ------------------------------------------------------
  function validateStep(n) {
    const d = state.data;
    if (n === 1) {
      if (!d.team)     return tr('tour.errTeam');
      if (!d.logoFile) return tr('tour.errLogo');
    }
    if (n === 2) {
      if (!d.admin)                       return tr('tour.errAdmin');
      const digits = d.whatsapp.replace(/\D/g, '');
      if (digits.length < 8)              return tr('tour.errWa');
    }
    if (n === 3) {
      const r = Number(d.roster);
      if (!d.roster || !Number.isInteger(r) || r < 7 || r > 20) return tr('tour.errRoster');
    }
    return null;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    const activeSub = modal.querySelector('.join-step.is-active .join-step-sub');
    if (activeSub) activeSub.after(errorEl);
  }

  backBtn.addEventListener('click', () => { if (state.step > 1) showStep(state.step - 1); });

  nextBtn.addEventListener('click', () => {
    if (state.submitting) return;
    const err = validateStep(state.step);
    if (err) { showError(err); return; }
    if (state.step < TOTAL_STEPS) { showStep(state.step + 1); }
    else { submit(); }
  });

  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') {
      e.preventDefault();
      nextBtn.click();
    }
  });

  // ---- Supabase calls (plain fetch) ------------------------------------
  function sbHeaders(extra) {
    return Object.assign({
      apikey: CONFIG.supabaseAnonKey,
      Authorization: 'Bearer ' + CONFIG.supabaseAnonKey,
    }, extra || {});
  }

  function slug(s) {
    return (s || 'team').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'team';
  }

  // fetch that aborts if it hasn't settled in time, so a stalled mobile
  // connection surfaces as a normal error instead of an endless spinner.
  function fetchWithTimeout(url, opts) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    return fetch(url, Object.assign({}, opts, { signal: ctrl.signal })).finally(() => clearTimeout(t));
  }

  async function uploadLogo(file) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const path = Date.now() + '-' + slug(state.data.team) + '.' + ext;
    const url = CONFIG.supabaseUrl + '/storage/v1/object/' + CONFIG.logoBucket + '/' + encodeURIComponent(path);
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: sbHeaders({ 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' }),
      body: file,
    });
    if (!res.ok) throw new Error('Logo upload failed (' + res.status + '): ' + (await res.text()));
    return CONFIG.supabaseUrl + '/storage/v1/object/public/' + CONFIG.logoBucket + '/' + path;
  }

  async function insertSignup(payload) {
    const res = await fetchWithTimeout(CONFIG.supabaseUrl + '/rest/v1/' + CONFIG.signupTable, {
      method: 'POST',
      headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Signup save failed (' + res.status + '): ' + (await res.text()));
  }

  // ---- Submit ----------------------------------------------------------
  async function submit() {
    const d = state.data;
    state.submitting = true;
    nextBtn.classList.add('is-loading');
    nextBtn.textContent = tr('tour.btnRegistering');
    errorEl.hidden = true;

    try {
      if (isConfigured) {
        // Reuse an already-uploaded logo on retry so a failed insert doesn't
        // leave a fresh orphaned file in storage on every attempt.
        if (!state.data.logoUrl) state.data.logoUrl = await uploadLogo(d.logoFile);
        await insertSignup({
          team_name:      d.team,
          admin_name:     d.admin,
          admin_whatsapp: d.whatsapp,
          roster_size:    Number(d.roster),
          logo_url:       state.data.logoUrl,
        });
      } else {
        console.warn('[King of the Jungle] PREVIEW MODE — Supabase not configured in tournament.js, so this signup was NOT stored. Fill in CONFIG.supabaseUrl / supabaseAnonKey to go live. See SETUP-TOURNAMENT.md.');
      }
      renderSuccess();
      showStep(TOTAL_STEPS + 1);
    } catch (err) {
      console.error(err);
      const msg = err && err.name === 'AbortError'
        ? tr('tour.errTimeout')
        : tr('tour.errGeneric', { msg: ((err && err.message) || 'please try again') });
      showError(msg);
    } finally {
      state.submitting = false;
      nextBtn.classList.remove('is-loading');
      nextBtn.textContent = tr('tour.btnRegister');
    }
  }

  function renderSuccess() {
    const d = state.data;

    // WhatsApp deep-link pre-filled with the team's details + a payment prompt.
    // Build the message as plain text, then encode the whole thing once.
    const msg = [
      '*King of the Jungle — team registration*',
      'Team: ' + d.team,
      'Captain: ' + d.admin,
      'WhatsApp: ' + d.whatsapp,
      'Squad size: ' + d.roster,
      '',
      'Sending payment proof for the ' + feeDisplay() + ' entry fee.',
    ].join('\n');
    doneWa.href = 'https://wa.me/' + CONFIG.whatsappAdmin.replace(/\D/g, '') + '?text=' + encodeURIComponent(msg);

    const first = (d.admin.split(/\s+/)[0] || '').trim();
    doneMsg.textContent = first
      ? tr('tour.doneMsgNamed', { name: first, fee: feeDisplay() })
      : tr('tour.doneMsgAnon', { fee: feeDisplay() });

    doneSum.innerHTML =
      '<div class="join-done-summary-head mono">' + tr('tour.sumHead') + '</div>' +
      '<dl class="join-done-summary-list">' +
        row(tr('tour.sumTeam'), d.team) +
        row(tr('tour.sumCaptain'), d.admin) +
        row(tr('tour.sumWhatsApp'), d.whatsapp) +
        row(tr('tour.sumSquadSize'), d.roster) +
        row(tr('tour.sumLogo'), d.logoFile ? d.logoFile.name : '—') +
      '</dl>';
  }

  function row(k, v) { return '<dt class="mono">' + k + '</dt><dd>' + escapeHtml(String(v)) + '</dd>'; }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- Language toggled in place ---------------------------------------
  document.addEventListener('i18n:changed', function () {
    applyConfig();                                       // reformat fee/feeNote + re-fill data-cfg
    stepNum = document.getElementById('tour-step-num');  // re-acquire after the text swap
    if (stepNum && state.step <= TOTAL_STEPS) stepNum.textContent = String(state.step);
    if (modal.classList.contains('is-open') && state.step <= TOTAL_STEPS) {
      nextBtn.textContent = state.step === TOTAL_STEPS ? tr('tour.btnRegister') : tr('join.continue');
    }
  });

  // ---- Init ------------------------------------------------------------
  showStep(1);
})();
