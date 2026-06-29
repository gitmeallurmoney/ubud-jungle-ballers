/* ============================================================
   Ubud Jungle Ballers — Admin dashboard
   Plain JS, no framework/bundler. Uses Supabase Auth (GoTrue REST)
   for email+password sign-in and PostgREST for data, all gated by
   row-level security (see SETUP-ADMIN.md). The anon key is public;
   real access is granted only to a logged-in admin's JWT.
   ============================================================ */
(function () {
  'use strict';

  var ENV = window.__ENV || {};
  var SUPABASE_URL = (ENV.SUPABASE_URL || '').replace(/\/$/, '');
  var ANON = ENV.SUPABASE_ANON_KEY || '';
  var CONFIGURED = SUPABASE_URL && ANON &&
    SUPABASE_URL.indexOf('YOUR-') === -1 && ANON.indexOf('YOUR-') === -1;

  var SKEY = 'ujb.admin.session';

  // ---------- tiny helpers ----------
  function $(id) { return document.getElementById(id); }
  function show(view) {
    ['auth', 'notice', 'dash'].forEach(function (v) {
      $('view-' + v).classList.toggle('hidden', v !== view);
    });
  }
  function toast(msg, isError) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast show' + (isError ? ' toast--error' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.className = 'toast'; }, 3000);
  }
  function fmtDate(s) {
    if (!s) return '—';
    var d = new Date(s);
    if (isNaN(d)) return '—';
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function daysAgo(s, n) {
    var d = new Date(s).getTime();
    return !isNaN(d) && (Date.now() - d) <= n * 86400000;
  }
  function AuthError(m) { this.name = 'AuthError'; this.message = m; }
  AuthError.prototype = Object.create(Error.prototype);

  // ---------- session ----------
  function loadSession() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (e) { return null; } }
  function saveSession(s) { localStorage.setItem(SKEY, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(SKEY); }
  function persistTokens(d) {
    var now = Math.floor(Date.now() / 1000);
    var prev = loadSession() || {};
    saveSession({
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: d.expires_at || (now + (d.expires_in || 3600)),
      user: d.user || prev.user || null
    });
  }

  // ---------- GoTrue (auth) ----------
  function authUrl(p) { return SUPABASE_URL + '/auth/v1' + p; }
  async function gotrue(path, body) {
    var res = await fetch(authUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON },
      body: JSON.stringify(body)
    });
    var data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || data.message || data.error || ('Error ' + res.status));
    }
    return data;
  }
  function signIn(email, password) {
    return gotrue('/token?grant_type=password', { email: email, password: password })
      .then(function (d) { persistTokens(d); return d; });
  }
  function signUp(email, password) {
    return gotrue('/signup', { email: email, password: password })
      .then(function (d) { if (d.access_token) persistTokens(d); return d; });
  }
  function refreshSession() {
    var s = loadSession();
    if (!s || !s.refresh_token) return Promise.reject(new AuthError('no session'));
    return gotrue('/token?grant_type=refresh_token', { refresh_token: s.refresh_token })
      .then(function (d) { persistTokens(d); return loadSession(); });
  }
  async function getToken() {
    var s = loadSession();
    if (!s) return null;
    var now = Math.floor(Date.now() / 1000);
    if (s.expires_at && s.expires_at - 30 <= now) {
      try { s = await refreshSession(); } catch (e) { clearSession(); return null; }
    }
    return s ? s.access_token : null;
  }
  async function signOut() {
    var token = (loadSession() || {}).access_token;
    clearSession();
    if (token) {
      try { await fetch(authUrl('/logout'), { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + token } }); } catch (e) {}
    }
    show('auth');
    setAuthMode(false);
  }

  // ---------- PostgREST (data) ----------
  function restUrl(p) { return SUPABASE_URL + '/rest/v1' + p; }
  async function rest(path, opts) {
    opts = opts || {};
    var token = await getToken();
    if (!token) throw new AuthError('Not signed in');
    function go(tok) {
      var headers = Object.assign(
        { apikey: ANON, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
        opts.headers || {}
      );
      return fetch(restUrl(path), {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body != null ? JSON.stringify(opts.body) : undefined
      });
    }
    var res = await go(token);
    if (res.status === 401) {
      try { await refreshSession(); } catch (e) { clearSession(); throw new AuthError('Session expired'); }
      res = await go((loadSession() || {}).access_token);
    }
    if (!res.ok) {
      var t = '';
      try { t = await res.text(); } catch (e) {}
      throw new Error('Request failed (' + res.status + ') ' + t);
    }
    if (res.status === 204) return null;
    var ct = res.headers.get('content-type') || '';
    return ct.indexOf('application/json') !== -1 ? res.json() : res.text();
  }

  // ---------- identity / authorization ----------
  async function whoAmI() {
    var s = loadSession();
    var user = s && s.user;
    if (!user) {
      var token = await getToken();
      if (!token) return { authed: false };
      var r = await fetch(authUrl('/user'), { headers: { apikey: ANON, Authorization: 'Bearer ' + token } });
      if (!r.ok) { clearSession(); return { authed: false }; }
      user = await r.json();
      var ses = loadSession(); if (ses) { ses.user = user; saveSession(ses); }
    }
    var rows = await rest('/admins?select=user_id&user_id=eq.' + encodeURIComponent(user.id));
    return { authed: true, user: user, isAdmin: Array.isArray(rows) && rows.length > 0 };
  }

  // ---------- data ----------
  function fetchTeams()    { return rest('/tournament_signups?select=*&order=created_at.desc'); }
  function fetchMembers()  { return rest('/club_signups?select=*&order=created_at.desc'); }
  function fetchAdmins()   { return rest('/admins?select=*&order=created_at.asc'); }
  function fetchRequests() { return rest('/admin_requests?select=*&order=requested_at.asc'); }

  function setTeamStatus(id, status) {
    return rest('/tournament_signups?id=eq.' + encodeURIComponent(id),
      { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: { status: status } });
  }
  function deleteRow(table, id) {
    return rest('/' + table + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }
  function approveRequest(req) {
    return rest('/admins', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { user_id: req.user_id, email: req.email } })
      .then(function () { return rest('/admin_requests?user_id=eq.' + encodeURIComponent(req.user_id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } }); });
  }
  function rejectRequest(req) {
    return rest('/admin_requests?user_id=eq.' + encodeURIComponent(req.user_id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }
  function removeAdmin(a) {
    return rest('/admins?user_id=eq.' + encodeURIComponent(a.user_id), { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }

  // ====================================================================
  //  DOM building (textContent everywhere → user data is never HTML)
  // ====================================================================
  function elNode(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function chipList(arr) {
    var box = elNode('div', 'chips');
    (Array.isArray(arr) ? arr : []).forEach(function (v) { box.appendChild(elNode('span', 'chip', v)); });
    if (!box.childNodes.length) box.appendChild(elNode('span', 'cell-dim', '—'));
    return box;
  }
  function waLink(num) {
    if (!num) return document.createTextNode('—');
    var a = elNode('a', null, num);
    a.href = 'https://wa.me/' + String(num).replace(/[^\d]/g, '');
    a.target = '_blank'; a.rel = 'noopener';
    return a;
  }
  function iconBtn(label, cls, onClick) {
    var b = elNode('button', 'btn btn--sm' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  // generic, sortable, XSS-safe table
  function renderTable(tableId, columns, rows, sortState, onSort) {
    var table = $(tableId);
    table.innerHTML = '';
    var thead = elNode('thead');
    var htr = elNode('tr');
    columns.forEach(function (c) {
      var th = elNode('th', null, c.label);
      if (c.sort) {
        th.dataset.sort = c.sort;
        th.addEventListener('click', function () { onSort(c.sort); });
        if (sortState && sortState.key === c.sort) {
          th.appendChild(elNode('span', 'arrow', sortState.dir === 'asc' ? ' ▲' : ' ▼'));
        }
      }
      htr.appendChild(th);
    });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = elNode('tbody');
    rows.forEach(function (r) {
      var tr = elNode('tr');
      columns.forEach(function (c) {
        var td = elNode('td', c.cls || null);
        var v = c.render ? c.render(r) : c.get(r);
        if (v instanceof Node) td.appendChild(v);
        else td.textContent = (v == null || v === '') ? '—' : String(v);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  function setState(id, kind, title, body) {
    var box = $(id);
    if (kind === 'none') { box.innerHTML = ''; return; }
    box.innerHTML = '';
    var wrap = elNode('div', 'state');
    if (kind === 'loading') { wrap.appendChild(elNode('div', 'spinner')); wrap.appendChild(elNode('p', null, 'Loading…')); }
    else { if (title) wrap.appendChild(elNode('div', 'display', title)); wrap.appendChild(elNode('p', null, body || '')); }
    box.appendChild(wrap);
  }

  // ====================================================================
  //  STATE + VIEWS
  // ====================================================================
  var store = {
    teams: { rows: [], sort: { key: 'created_at', dir: 'desc' }, search: '', filter: '' },
    members: { rows: [], sort: { key: 'created_at', dir: 'desc' }, search: '', filter: '' },
    admins: [], requests: [], me: null
  };

  function sortRows(rows, sort) {
    var out = rows.slice();
    out.sort(function (a, b) {
      var x = a[sort.key], y = b[sort.key];
      if (x == null) x = ''; if (y == null) y = '';
      if (typeof x === 'number' && typeof y === 'number') return sort.dir === 'asc' ? x - y : y - x;
      x = String(x).toLowerCase(); y = String(y).toLowerCase();
      return sort.dir === 'asc' ? (x < y ? -1 : x > y ? 1 : 0) : (x > y ? -1 : x < y ? 1 : 0);
    });
    return out;
  }

  // ---- TEAMS ----
  var teamCols = [
    { label: 'Registered', sort: 'created_at', get: function (r) { return fmtDate(r.created_at); } },
    { label: 'Team', cls: 'cell-strong', sort: 'team_name', get: function (r) { return r.team_name; } },
    { label: 'Captain', sort: 'admin_name', get: function (r) { return r.admin_name; } },
    { label: 'WhatsApp', render: function (r) { return waLink(r.admin_whatsapp); } },
    { label: 'Roster', cls: 'num', sort: 'roster_size', get: function (r) { return r.roster_size; } },
    { label: 'Logo', render: function (r) {
        if (!r.logo_url) return document.createTextNode('—');
        var a = elNode('a'); a.href = r.logo_url; a.target = '_blank'; a.rel = 'noopener';
        var img = elNode('img', 'logo-thumb'); img.src = r.logo_url; img.alt = ''; img.loading = 'lazy';
        a.appendChild(img); return a;
      } },
    { label: 'Status', render: function (r) { return statusSelect(r); } },
    { label: '', cls: 'row-actions-cell', render: function (r) {
        var box = elNode('div', 'row-actions');
        box.appendChild(iconBtn('Delete', 'btn--danger', function () { onDeleteTeam(r); }));
        return box;
      } }
  ];

  function statusSelect(team) {
    var sel = document.createElement('select');
    var cur = team.status || 'pending';
    ['pending', 'paid', 'confirmed'].forEach(function (s) {
      var o = document.createElement('option'); o.value = s; o.textContent = s;
      if (s === cur) o.selected = true; sel.appendChild(o);
    });
    function applyCls() { sel.className = 'select status-select status-' + sel.value; }
    applyCls();
    sel.addEventListener('change', function () {
      var next = sel.value, prev = team.status;
      applyCls();
      setTeamStatus(team.id, next)
        .then(function () { team.status = next; toast('Marked “' + team.team_name + '” as ' + next + '.'); refreshStats(); })
        .catch(function (e) { sel.value = prev || 'pending'; applyCls(); toast(errMsg(e), true); });
    });
    return sel;
  }

  // ---- MEMBERS ----
  var memberCols = [
    { label: 'Joined', sort: 'created_at', get: function (r) { return fmtDate(r.created_at); } },
    { label: 'Name', cls: 'cell-strong', sort: 'name', get: function (r) { return r.name; } },
    { label: 'Age', cls: 'num', sort: 'age', get: function (r) { return r.age; } },
    { label: 'Nationality', sort: 'nationality', get: function (r) { return r.nationality; } },
    { label: 'In Bali', render: function (r) { return r.bali_timeframe ? elNode('span', 'chip', r.bali_timeframe) : document.createTextNode('—'); } },
    { label: 'Level', render: function (r) { return r.level ? elNode('span', 'chip', r.level) : document.createTextNode('—'); } },
    { label: 'Positions', cls: 'wrap-cell', render: function (r) { return chipList(r.positions); } },
    { label: 'Sessions', cls: 'wrap-cell', render: function (r) { return chipList(r.sessions); } },
    { label: '', cls: 'row-actions-cell', render: function (r) {
        var box = elNode('div', 'row-actions');
        box.appendChild(iconBtn('Delete', 'btn--danger', function () { onDeleteMember(r); }));
        return box;
      } }
  ];

  function filteredTeams() {
    var q = store.teams.search.toLowerCase(), f = store.teams.filter;
    var rows = store.teams.rows.filter(function (r) {
      if (f && (r.status || 'pending') !== f) return false;
      if (!q) return true;
      return [r.team_name, r.admin_name, r.admin_whatsapp].some(function (v) { return String(v || '').toLowerCase().indexOf(q) !== -1; });
    });
    return sortRows(rows, store.teams.sort);
  }
  function filteredMembers() {
    var q = store.members.search.toLowerCase(), f = store.members.filter;
    var rows = store.members.rows.filter(function (r) {
      if (f && r.level !== f) return false;
      if (!q) return true;
      return [r.name, r.nationality, (r.positions || []).join(' '), (r.sessions || []).join(' ')]
        .some(function (v) { return String(v || '').toLowerCase().indexOf(q) !== -1; });
    });
    return sortRows(rows, store.members.sort);
  }

  function drawTeams() {
    var rows = filteredTeams();
    renderTable('table-teams', teamCols, rows, store.teams.sort, function (k) { toggleSort('teams', k); });
    $('count-teams').textContent = store.teams.rows.length;
    setState('state-teams', rows.length ? 'none' : 'empty', store.teams.rows.length ? 'No matches' : 'No teams yet',
      store.teams.rows.length ? 'Try a different search or filter.' : 'Tournament registrations will appear here.');
  }
  function drawMembers() {
    var rows = filteredMembers();
    renderTable('table-members', memberCols, rows, store.members.sort, function (k) { toggleSort('members', k); });
    $('count-members').textContent = store.members.rows.length;
    setState('state-members', rows.length ? 'none' : 'empty', store.members.rows.length ? 'No matches' : 'No sign-ups yet',
      store.members.rows.length ? 'Try a different search or filter.' : 'Member sign-ups will appear here.');
  }

  function toggleSort(which, key) {
    var s = store[which].sort;
    if (s.key === key) s.dir = s.dir === 'asc' ? 'desc' : 'asc';
    else { s.key = key; s.dir = 'asc'; }
    which === 'teams' ? drawTeams() : drawMembers();
  }

  // ---- ADMINS tab ----
  function drawAdmins() {
    var reqCols = [
      { label: 'Email', cls: 'cell-strong', get: function (r) { return r.email; } },
      { label: 'Requested', get: function (r) { return fmtDate(r.requested_at); } },
      { label: '', cls: 'row-actions-cell', render: function (r) {
          var box = elNode('div', 'row-actions');
          box.appendChild(iconBtn('Approve', 'btn--gold', function () { onApprove(r); }));
          box.appendChild(iconBtn('Reject', 'btn--danger', function () { onReject(r); }));
          return box;
        } }
    ];
    renderTable('table-requests', reqCols, store.requests, null, function () {});
    setState('state-requests', store.requests.length ? 'none' : 'empty', 'No pending requests', 'New sign-ups awaiting approval show up here.');

    var meId = store.me && store.me.id;
    var admCols = [
      { label: 'Email', cls: 'cell-strong', get: function (r) { return r.email + (r.user_id === meId ? '  (you)' : ''); } },
      { label: 'Admin since', get: function (r) { return fmtDate(r.created_at); } },
      { label: '', cls: 'row-actions-cell', render: function (r) {
          var box = elNode('div', 'row-actions');
          if (r.user_id === meId) { box.appendChild(elNode('span', 'cell-dim', '—')); return box; }
          box.appendChild(iconBtn('Remove', 'btn--danger', function () { onRemoveAdmin(r); }));
          return box;
        } }
    ];
    renderTable('table-admins', admCols, store.admins, null, function () {});
    setState('state-admins', store.admins.length ? 'none' : 'empty', 'No admins', '');
    $('count-admins').textContent = store.requests.length;
  }

  // ---- stats ----
  function refreshStats() {
    var teams = store.teams.rows, members = store.members.rows;
    var awaiting = teams.filter(function (t) { return (t.status || 'pending') !== 'confirmed'; }).length;
    var recent = teams.filter(function (t) { return daysAgo(t.created_at, 7); }).length +
                 members.filter(function (m) { return daysAgo(m.created_at, 7); }).length;
    var cards = [
      { k: 'Tournament teams', v: teams.length, accent: true },
      { k: 'Member sign-ups', v: members.length, accent: true },
      { k: 'Awaiting payment', v: awaiting },
      { k: 'New · last 7 days', v: recent }
    ];
    var box = $('stats'); box.innerHTML = '';
    cards.forEach(function (c) {
      var card = elNode('div', 'stat' + (c.accent ? ' stat--accent' : ''));
      card.appendChild(elNode('div', 'mono stat-k', c.k));
      card.appendChild(elNode('div', 'display stat-v', String(c.v)));
      box.appendChild(card);
    });
  }

  // ====================================================================
  //  ACTIONS
  // ====================================================================
  function errMsg(e) {
    if (e instanceof AuthError) { setTimeout(function () { show('auth'); }, 800); return 'Session ended — please sign in again.'; }
    return (e && e.message) ? e.message.replace(/Request failed \(\d+\)\s*/, '') || 'Something went wrong.' : 'Something went wrong.';
  }
  function onDeleteTeam(t) {
    if (!confirm('Delete team “' + t.team_name + '”? This cannot be undone.')) return;
    deleteRow('tournament_signups', t.id).then(function () {
      store.teams.rows = store.teams.rows.filter(function (r) { return r.id !== t.id; });
      drawTeams(); refreshStats(); toast('Team deleted.');
    }).catch(function (e) { toast(errMsg(e), true); });
  }
  function onDeleteMember(m) {
    if (!confirm('Delete sign-up “' + m.name + '”? This cannot be undone.')) return;
    deleteRow('club_signups', m.id).then(function () {
      store.members.rows = store.members.rows.filter(function (r) { return r.id !== m.id; });
      drawMembers(); refreshStats(); toast('Sign-up deleted.');
    }).catch(function (e) { toast(errMsg(e), true); });
  }
  function onApprove(r) {
    approveRequest(r).then(function () {
      store.requests = store.requests.filter(function (x) { return x.user_id !== r.user_id; });
      store.admins.push({ user_id: r.user_id, email: r.email, created_at: new Date().toISOString() });
      drawAdmins(); toast('Approved ' + r.email + '.');
    }).catch(function (e) { toast(errMsg(e), true); });
  }
  function onReject(r) {
    if (!confirm('Reject and remove the request from ' + r.email + '?')) return;
    rejectRequest(r).then(function () {
      store.requests = store.requests.filter(function (x) { return x.user_id !== r.user_id; });
      drawAdmins(); toast('Request rejected.');
    }).catch(function (e) { toast(errMsg(e), true); });
  }
  function onRemoveAdmin(a) {
    if (!confirm('Remove admin access for ' + a.email + '?')) return;
    removeAdmin(a).then(function () {
      store.admins = store.admins.filter(function (x) { return x.user_id !== a.user_id; });
      drawAdmins(); toast('Admin removed.');
    }).catch(function (e) { toast(errMsg(e), true); });
  }

  // ---- CSV export ----
  function csvCell(v) {
    if (v == null) v = '';
    if (Array.isArray(v)) v = v.join('; ');
    v = String(v);
    // Neutralize CSV/formula injection — names come from public sign-up forms.
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function exportCSV(filename, header, rows, mapRow) {
    var lines = [header.map(csvCell).join(',')];
    rows.forEach(function (r) { lines.push(mapRow(r).map(csvCell).join(',')); });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function exportTeams() {
    var rows = filteredTeams();
    if (!rows.length) return toast('Nothing to export.', true);
    exportCSV('tournament-teams.csv',
      ['Registered', 'Team', 'Captain', 'WhatsApp', 'Roster size', 'Status', 'Logo URL'],
      rows, function (r) { return [r.created_at, r.team_name, r.admin_name, r.admin_whatsapp, r.roster_size, r.status || 'pending', r.logo_url]; });
    toast('Exported ' + rows.length + ' teams.');
  }
  function exportMembers() {
    var rows = filteredMembers();
    if (!rows.length) return toast('Nothing to export.', true);
    exportCSV('member-signups.csv',
      ['Joined', 'Name', 'Age', 'Nationality', 'In Bali', 'Level', 'Positions', 'Sessions'],
      rows, function (r) { return [r.created_at, r.name, r.age, r.nationality, r.bali_timeframe, r.level, r.positions, r.sessions]; });
    toast('Exported ' + rows.length + ' sign-ups.');
  }

  // ====================================================================
  //  LOADING + DASHBOARD ENTRY
  // ====================================================================
  function loadTeams() {
    setState('state-teams', 'loading');
    return fetchTeams().then(function (rows) { store.teams.rows = rows || []; drawTeams(); refreshStats(); })
      .catch(function (e) { setState('state-teams', 'empty', 'Could not load', errMsg(e)); });
  }
  function loadMembers() {
    setState('state-members', 'loading');
    return fetchMembers().then(function (rows) { store.members.rows = rows || []; drawMembers(); refreshStats(); })
      .catch(function (e) { setState('state-members', 'empty', 'Could not load', errMsg(e)); });
  }
  function loadAdmins() {
    return Promise.all([fetchAdmins(), fetchRequests()]).then(function (res) {
      store.admins = res[0] || []; store.requests = res[1] || []; drawAdmins();
    }).catch(function (e) { toast(errMsg(e), true); });
  }

  function enterDashboard(user) {
    store.me = user;
    $('me-email').textContent = user.email || '—';
    show('dash');
    refreshStats();
    loadTeams(); loadMembers(); loadAdmins();
  }

  // ---- tabs ----
  function switchTab(name) {
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.classList.toggle('is-active', t.dataset.tab === name);
    });
    ['teams', 'members', 'admins'].forEach(function (n) {
      $('panel-' + n).classList.toggle('hidden', n !== name);
    });
  }

  // ====================================================================
  //  AUTH UI
  // ====================================================================
  var signupMode = false;
  function authMsg(text, kind) {
    var m = $('auth-msg');
    if (!text) { m.className = 'auth-msg hidden'; m.textContent = ''; return; }
    m.textContent = text;
    m.className = 'auth-msg' + (kind === 'error' ? ' auth-msg--error' : kind === 'ok' ? ' auth-msg--ok' : '');
  }
  function setAuthMode(toSignup) {
    signupMode = toSignup;
    $('auth-title').textContent = toSignup ? 'Create account' : 'Sign in';
    $('auth-sub').textContent = toSignup ? 'Register an admin account for the club.' : 'Review tournament & member sign-ups.';
    $('auth-submit').textContent = toSignup ? 'Create account' : 'Sign in';
    $('auth-switch-text').textContent = toSignup ? 'Already have an account?' : 'No account yet?';
    $('auth-switch').textContent = toSignup ? 'Sign in' : 'Create one';
    $('auth-firsthint').classList.toggle('hidden', !toSignup);
    $('password').setAttribute('autocomplete', toSignup ? 'new-password' : 'current-password');
    authMsg('');
  }
  function showAuth() { show('auth'); setAuthMode(false); }
  function showNotice() {
    show('notice');
    var s = loadSession();
    $('notice-body').textContent = (s && s.user && s.user.email ? s.user.email + ' — ' : '') +
      'your account was created but is awaiting approval from an existing admin before you can open the dashboard.';
  }

  async function onAuthSubmit(e) {
    e.preventDefault();
    var email = $('email').value.trim();
    var password = $('password').value;
    if (!email || !password) return;
    var btn = $('auth-submit'); btn.disabled = true; var label = btn.textContent; btn.textContent = '…';
    authMsg('');
    try {
      if (signupMode) {
        var d = await signUp(email, password);
        if (!d.access_token) {
          // email confirmation is ON in Supabase
          setAuthMode(false);
          authMsg('Account created. Check your email to confirm, then sign in.', 'ok');
          return;
        }
      } else {
        await signIn(email, password);
      }
      var me = await whoAmI();
      if (!me.authed) { authMsg('Could not sign in. Try again.', 'error'); return; }
      if (me.isAdmin) enterDashboard(me.user);
      else showNotice();
    } catch (err) {
      authMsg(friendlyAuthError(err), 'error');
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  }
  function friendlyAuthError(err) {
    var m = (err && err.message) || '';
    if (/invalid login/i.test(m)) return 'Wrong email or password.';
    if (/already registered|already been registered/i.test(m)) return 'That email is already registered — sign in instead.';
    if (/password.*(6|8|characters)/i.test(m)) return 'Password is too short.';
    if (/email.*invalid|invalid.*email/i.test(m)) return 'That email looks invalid.';
    return m || 'Something went wrong.';
  }

  // ====================================================================
  //  WIRE UP + INIT
  // ====================================================================
  function wire() {
    $('auth-form').addEventListener('submit', onAuthSubmit);
    $('auth-switch').addEventListener('click', function () { setAuthMode(!signupMode); });
    $('signout').addEventListener('click', signOut);
    $('notice-signout').addEventListener('click', signOut);

    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.addEventListener('click', function () { switchTab(t.dataset.tab); });
    });

    $('search-teams').addEventListener('input', function () { store.teams.search = this.value; drawTeams(); });
    $('filter-teams').addEventListener('change', function () { store.teams.filter = this.value; drawTeams(); });
    $('refresh-teams').addEventListener('click', loadTeams);
    $('export-teams').addEventListener('click', exportTeams);

    $('search-members').addEventListener('input', function () { store.members.search = this.value; drawMembers(); });
    $('filter-members').addEventListener('change', function () { store.members.filter = this.value; drawMembers(); });
    $('refresh-members').addEventListener('click', loadMembers);
    $('export-members').addEventListener('click', exportMembers);
  }

  async function init() {
    wire();
    if (!CONFIGURED) {
      showAuth();
      authMsg('Supabase isn’t configured (env.js). Add SUPABASE_URL + SUPABASE_ANON_KEY and run gen-env.', 'error');
      $('auth-submit').disabled = true;
      return;
    }
    if (!loadSession()) { showAuth(); return; }
    try {
      var me = await whoAmI();
      if (!me.authed) { showAuth(); return; }
      if (me.isAdmin) enterDashboard(me.user);
      else showNotice();
    } catch (e) {
      if (e instanceof AuthError) { clearSession(); showAuth(); }
      else { showAuth(); authMsg(errMsg(e), 'error'); }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
