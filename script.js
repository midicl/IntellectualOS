/* IntellectualOS enhancement layer.
   Loaded AFTER script.js. Overlays on top of existing globals without
   rewriting them. Observes DOM for .window nodes and upgrades them. */
(function () {
  'use strict';

  // ============================================================
  //  PHASE 1 — neutralise the old immersive-mode hooks so floating
  //            windows keep the dock visible.
  // ============================================================
  const origImmersive = window.startImmersiveMode;
  window.startImmersiveMode = function (win) {
    if (win) win.classList.remove('header-visible');
    // do NOT hide the dock anymore
  };
  window.endImmersiveMode = function () {};

  // ============================================================
  //  WINDOW MANAGER
  // ============================================================
  const WM = {
    topZ: 1000,
    focused: null,
    spawnN: 0,

    init() {
      const layer = document.getElementById('windows-layer');
      if (!layer) return;
      new MutationObserver((muts) => {
        muts.forEach((m) => m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.classList.contains('window')) this.upgrade(n);
        }));
      }).observe(layer, { childList: true });

      layer.querySelectorAll('.window').forEach((w) => this.upgrade(w));

      const preview = document.createElement('div');
      preview.id = 'wm-snap-preview';
      document.body.appendChild(preview);
      this.preview = preview;

      window.addEventListener('resize', () => {
        document.querySelectorAll('.window').forEach((w) => this.clampToViewport(w));
      });
    },

    upgrade(win) {
      if (win.dataset.wmUpgraded) return;
      win.dataset.wmUpgraded = '1';

      this.placeWindow(win);

      // add resize handles
      ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach((dir) => {
        const h = document.createElement('div');
        h.className = 'win-resize ' + dir;
        h.addEventListener('mousedown', (ev) => this.startResize(ev, win, dir));
        win.appendChild(h);
      });

      // add maximize button if not present
      const controls = win.querySelector('.win-controls');
      if (controls && !controls.querySelector('.btn-max')) {
        const max = document.createElement('div');
        max.className = 'win-btn btn-max';
        max.title = 'Maximize';
        max.addEventListener('click', (ev) => {
          ev.stopPropagation();
          win.classList.toggle('maximized');
        });
        controls.appendChild(max);
      }

      // drag — rebind header mousedown to our handler
      const header = win.querySelector('.win-header');
      if (header) {
        header.onmousedown = (ev) => {
          if (ev.target.closest('.win-btn')) return;
          this.startDrag(ev, win);
        };
        header.ondblclick = () => win.classList.toggle('maximized');
      }

      // click anywhere to focus
      win.addEventListener('mousedown', () => this.focus(win), true);

      this.focus(win);
    },

    placeWindow(win) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ww = Math.min(960, Math.round(vw * 0.7));
      const wh = Math.min(620, Math.round(vh * 0.7));
      const cascade = (this.spawnN++ % 6) * 28;
      const wx = Math.round((vw - ww) / 2) + cascade;
      const wy = Math.round((vh - wh) / 2) + cascade;
      win.style.setProperty('--ww', ww + 'px');
      win.style.setProperty('--wh', wh + 'px');
      win.style.setProperty('--wx', wx + 'px');
      win.style.setProperty('--wy', wy + 'px');
    },

    focus(win) {
      if (this.focused && this.focused !== win) this.focused.classList.remove('focused');
      this.focused = win;
      win.classList.add('focused');
      win.style.zIndex = ++this.topZ;
      window.activeWindowId = (win.id || '').replace('win-', '');
    },

    clampToViewport(win) {
      const r = win.getBoundingClientRect();
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      if (r.left > maxX) win.style.setProperty('--wx', maxX + 'px');
      if (r.top > maxY) win.style.setProperty('--wy', maxY + 'px');
    },

    startDrag(ev, win) {
      if (win.classList.contains('maximized')) {
        // unmaximize on drag — position under cursor
        win.classList.remove('maximized');
        const ww = parseFloat(getComputedStyle(win).getPropertyValue('--ww')) || 800;
        win.style.setProperty('--wx', (ev.clientX - ww / 2) + 'px');
        win.style.setProperty('--wy', Math.max(0, ev.clientY - 20) + 'px');
      }
      const r = win.getBoundingClientRect();
      const ox = ev.clientX - r.left;
      const oy = ev.clientY - r.top;

      const onMove = (e) => {
        const nx = e.clientX - ox;
        const ny = Math.max(0, e.clientY - oy);
        win.style.setProperty('--wx', nx + 'px');
        win.style.setProperty('--wy', ny + 'px');
        this.updateSnapPreview(e);
      };
      const onUp = (e) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.applySnap(win, e);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      ev.preventDefault();
    },

    startResize(ev, win, dir) {
      win.classList.remove('maximized');
      const r = win.getBoundingClientRect();
      const sx = ev.clientX, sy = ev.clientY;
      const sw = r.width, sh = r.height, sl = r.left, st = r.top;

      const onMove = (e) => {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        let nw = sw, nh = sh, nl = sl, nt = st;
        if (dir.includes('e')) nw = Math.max(380, sw + dx);
        if (dir.includes('s')) nh = Math.max(260, sh + dy);
        if (dir.includes('w')) { nw = Math.max(380, sw - dx); nl = sl + (sw - nw); }
        if (dir.includes('n')) { nh = Math.max(260, sh - dy); nt = st + (sh - nh); }
        win.style.setProperty('--ww', nw + 'px');
        win.style.setProperty('--wh', nh + 'px');
        win.style.setProperty('--wx', nl + 'px');
        win.style.setProperty('--wy', nt + 'px');
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      ev.preventDefault();
      ev.stopPropagation();
    },

    snapZone(e) {
      const T = 18;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (e.clientY < T) return 'top';
      if (e.clientX < T) return 'left';
      if (e.clientX > vw - T) return 'right';
      if (e.clientY > vh - T) return 'bottom';
      return null;
    },

    snapRect(zone) {
      const vw = window.innerWidth;
      const vh = window.innerHeight - 90;
      if (zone === 'top')    return { x: 0, y: 0, w: vw, h: vh };
      if (zone === 'left')   return { x: 0, y: 0, w: vw / 2, h: vh };
      if (zone === 'right')  return { x: vw / 2, y: 0, w: vw / 2, h: vh };
      if (zone === 'bottom') return { x: vw / 4, y: vh / 2, w: vw / 2, h: vh / 2 };
      return null;
    },

    updateSnapPreview(e) {
      const zone = this.snapZone(e);
      if (!zone) {
        this.preview.classList.remove('show');
        return;
      }
      const r = this.snapRect(zone);
      this.preview.style.left = r.x + 'px';
      this.preview.style.top = r.y + 'px';
      this.preview.style.width = r.w + 'px';
      this.preview.style.height = r.h + 'px';
      this.preview.classList.add('show');
    },

    applySnap(win, e) {
      this.preview.classList.remove('show');
      const zone = this.snapZone(e);
      if (!zone) return;
      const r = this.snapRect(zone);
      win.style.setProperty('--wx', r.x + 'px');
      win.style.setProperty('--wy', r.y + 'px');
      win.style.setProperty('--ww', r.w + 'px');
      win.style.setProperty('--wh', r.h + 'px');
    },
  };

  // ============================================================
  //  DOCK MAGNIFICATION
  // ============================================================
  const Dock = {
    init() {
      const dock = document.getElementById('dock-container');
      if (!dock) return;
      dock.addEventListener('mousemove', (e) => this.onMove(e, dock));
      dock.addEventListener('mouseleave', () => this.reset(dock));

      // indicator updates
      setInterval(() => this.syncIndicators(dock), 500);
    },

    onMove(e, dock) {
      const items = dock.querySelectorAll('.dock-item');
      items.forEach((it) => {
        it.classList.remove('mag-lv1', 'mag-lv2', 'mag-lv3');
        const r = it.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = Math.abs(e.clientX - cx);
        if (d < 30) it.classList.add('mag-lv3');
        else if (d < 60) it.classList.add('mag-lv2');
        else if (d < 100) it.classList.add('mag-lv1');
      });
    },

    reset(dock) {
      dock.querySelectorAll('.dock-item').forEach((it) =>
        it.classList.remove('mag-lv1', 'mag-lv2', 'mag-lv3')
      );
    },

    syncIndicators(dock) {
      const openIds = new Set();
      document.querySelectorAll('.window').forEach((w) => {
        if (!w.classList.contains('minimized')) openIds.add((w.id || '').replace('win-', ''));
      });
      const activeId = window.activeWindowId;
      dock.querySelectorAll('.dock-item').forEach((it) => {
        const id = it.dataset.appId || it.getAttribute('data-id') || '';
        it.classList.toggle('running', openIds.has(id));
        it.classList.toggle('active-window', id === activeId);
      });
    },
  };

  // ============================================================
  //  QUICK SETTINGS
  // ============================================================
  const ACCENTS = [
    { id: 'blue',    c: '#3b82f6', g: 'rgba(59, 130, 246, 0.55)' },
    { id: 'cyan',    c: '#06b6d4', g: 'rgba(6, 182, 212, 0.55)' },
    { id: 'green',   c: '#10b981', g: 'rgba(16, 185, 129, 0.55)' },
    { id: 'purple',  c: '#a855f7', g: 'rgba(168, 85, 247, 0.55)' },
    { id: 'pink',    c: '#ec4899', g: 'rgba(236, 72, 153, 0.55)' },
    { id: 'orange',  c: '#f97316', g: 'rgba(249, 115, 22, 0.55)' },
  ];

  const QS = {
    state: JSON.parse(localStorage.getItem('qs_state') || '{}'),

    init() {
      // injected button
      const btn = document.createElement('button');
      btn.id = 'quick-settings-btn';
      btn.innerHTML = '<i class="fas fa-sliders-h"></i>';
      btn.title = 'Quick settings';
      document.body.appendChild(btn);

      const panel = document.createElement('div');
      panel.id = 'quick-settings-panel';
      panel.innerHTML = `
        <div class="qs-section">
          <div class="qs-label">Accent</div>
          <div class="qs-accent-row">
            ${ACCENTS.map(a => `<div class="qs-accent" data-id="${a.id}" style="background:${a.c}"></div>`).join('')}
          </div>
        </div>
        <div class="qs-section">
          <div class="qs-label">Brightness</div>
          <input type="range" class="qs-slider" id="qs-brightness" min="50" max="110" step="1">
        </div>
        <div class="qs-section">
          <div class="qs-label">Performance</div>
          <div class="qs-perf">
            <button data-perf="balanced">Balanced</button>
            <button data-perf="low">Low power</button>
            <button data-perf="max">Max fps</button>
          </div>
        </div>`;
      document.body.appendChild(panel);

      btn.onclick = (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
      };
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
      });

      // accent
      panel.querySelectorAll('.qs-accent').forEach((el) => {
        el.onclick = () => this.setAccent(el.dataset.id);
      });
      // brightness
      const b = panel.querySelector('#qs-brightness');
      b.value = Math.round(((this.state.brightness || 1) * 100));
      b.oninput = () => this.setBrightness(b.value / 100);
      // perf
      panel.querySelectorAll('.qs-perf button').forEach((el) => {
        el.onclick = () => this.setPerf(el.dataset.perf);
      });

      // apply saved
      this.setAccent(this.state.accent || 'blue', true);
      this.setBrightness(this.state.brightness || 1, true);
      this.setPerf(this.state.perf || 'balanced', true);
    },

    save() { localStorage.setItem('qs_state', JSON.stringify(this.state)); },

    setAccent(id, silent) {
      const a = ACCENTS.find((x) => x.id === id) || ACCENTS[0];
      document.documentElement.style.setProperty('--accent', a.c);
      document.documentElement.style.setProperty('--accent-glow', a.g);
      document.querySelectorAll('.qs-accent').forEach((el) => {
        el.classList.toggle('selected', el.dataset.id === a.id);
      });
      this.state.accent = a.id;
      if (!silent) this.save();
    },

    setBrightness(v, silent) {
      document.documentElement.style.setProperty('--sys-brightness', v);
      this.state.brightness = v;
      if (!silent) this.save();
    },

    setPerf(mode, silent) {
      document.querySelectorAll('.qs-perf button').forEach((el) => {
        el.classList.toggle('active', el.dataset.perf === mode);
      });
      const bh = document.getElementById('blackhole-canvas');
      const snow = document.getElementById('snow-fx');
      if (mode === 'low') {
        if (bh) bh.style.display = 'none';
        if (snow) snow.style.display = 'none';
      } else {
        if (snow) snow.style.display = '';
        // blackhole visibility is driven by other code; leave it alone in non-low modes
      }
      this.state.perf = mode;
      if (!silent) this.save();
    },
  };

  // ============================================================
  //  SPOTIFY CLIENT (PKCE — no server, no client secret in frontend)
  //  Client ID is safe to expose. Secret is NEVER used here.
  // ============================================================
  const SPOTIFY_CLIENT_ID = 'ccc86d1c9b6942ed9629a72638b27527';
  const SPOTIFY_REDIRECT_URI = location.origin + '/';
  const SPOTIFY_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-top-read',
  ].join(' ');

  function b64url(bytes) {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return new Uint8Array(buf);
  }
  function randStr(n) {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return b64url(a);
  }

  const Spotify = {
    token: null,
    expiresAt: 0,
    refreshing: null,
    deviceId: null,
    player: null,
    listeners: new Set(),

    async init() {
      // saved tokens
      try {
        const saved = JSON.parse(localStorage.getItem('sp_tok') || 'null');
        if (saved?.access_token && saved.expiresAt > Date.now() + 30_000) {
          this.token = saved.access_token;
          this.expiresAt = saved.expiresAt;
        }
      } catch {}

      // handle redirect back from Spotify authorize page
      const qp = new URLSearchParams(location.search);
      if (qp.get('code') && qp.get('state')) {
        const savedState = localStorage.getItem('sp_state');
        if (qp.get('state') !== savedState) {
          console.warn('[spotify] state mismatch');
        } else {
          await this.exchangeCode(qp.get('code'));
        }
        history.replaceState(null, '', location.pathname);
      } else if (qp.get('error')) {
        console.warn('[spotify] auth error:', qp.get('error'));
        history.replaceState(null, '', location.pathname);
      }

      // refresh silently if we have a refresh_token
      if (!this.token) await this.tryRefresh();

      this.ensureSDK();
      this.notify();
    },

    async login() {
      const verifier = randStr(64);
      const challenge = b64url(await sha256(verifier));
      const state = randStr(16);
      localStorage.setItem('sp_verifier', verifier);
      localStorage.setItem('sp_state', state);
      const p = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        state,
      });
      location.href = 'https://accounts.spotify.com/authorize?' + p.toString();
    },

    async exchangeCode(code) {
      const verifier = localStorage.getItem('sp_verifier');
      if (!verifier) return;
      const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier,
      });
      const r = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const d = await r.json();
      localStorage.removeItem('sp_verifier');
      localStorage.removeItem('sp_state');
      if (!r.ok) { console.error('[spotify] token exchange failed', d); return; }
      this.setToken(d.access_token, d.expires_in, d.refresh_token);
    },

    setToken(t, expSec, refresh) {
      this.token = t;
      this.expiresAt = Date.now() + (expSec - 60) * 1000;
      const saved = { access_token: t, expiresAt: this.expiresAt };
      localStorage.setItem('sp_tok', JSON.stringify(saved));
      if (refresh) localStorage.setItem('sp_refresh', refresh);
      this.notify();
    },

    logout() {
      this.token = null;
      this.expiresAt = 0;
      localStorage.removeItem('sp_tok');
      localStorage.removeItem('sp_refresh');
      if (this.player) { try { this.player.disconnect(); } catch {} }
      this.player = null;
      this.deviceId = null;
      this.notify();
    },

    async tryRefresh() {
      const refresh = localStorage.getItem('sp_refresh');
      if (!refresh) return null;
      if (this.refreshing) return this.refreshing;
      this.refreshing = (async () => {
        try {
          const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh,
            client_id: SPOTIFY_CLIENT_ID,
          });
          const r = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          });
          const d = await r.json();
          if (!r.ok) {
            localStorage.removeItem('sp_refresh');
            localStorage.removeItem('sp_tok');
            return null;
          }
          this.setToken(d.access_token, d.expires_in, d.refresh_token);
          return d.access_token;
        } catch { return null; }
      })();
      const t = await this.refreshing;
      this.refreshing = null;
      return t;
    },

    async getToken() {
      if (this.token && Date.now() < this.expiresAt) return this.token;
      return this.tryRefresh();
    },

    async api(path, opts = {}) {
      const t = await this.getToken();
      if (!t) throw new Error('not_logged_in');
      const r = await fetch('https://api.spotify.com/v1' + path, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + t },
      });
      if (r.status === 401) {
        await this.tryRefresh();
        return this.api(path, opts);
      }
      if (r.status === 204) return null;
      return r.json();
    },

    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    notify() { this.listeners.forEach((f) => { try { f(); } catch {} }); },

    ensureSDK() {
      if (window.Spotify?.Player) { this.setupPlayer(); return; }
      if (document.getElementById('spotify-sdk-js')) return;
      window.onSpotifyWebPlaybackSDKReady = () => this.setupPlayer();
      const s = document.createElement('script');
      s.id = 'spotify-sdk-js';
      s.src = 'https://sdk.scdn.co/spotify-player.js';
      document.head.appendChild(s);
    },

    async setupPlayer() {
      const t = await this.getToken();
      if (!t || !window.Spotify?.Player) return;
      if (this.player) return;

      this.player = new window.Spotify.Player({
        name: 'Intellectual OS',
        getOAuthToken: async (cb) => cb(await this.getToken()),
        volume: 0.7,
      });

      this.player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        this.notify();
      });
      this.player.addListener('not_ready', () => { this.deviceId = null; });
      this.player.addListener('player_state_changed', () => this.notify());
      this.player.addListener('initialization_error', ({ message }) => console.error('[spotify init]', message));
      this.player.addListener('authentication_error', ({ message }) => console.error('[spotify auth]', message));
      this.player.addListener('account_error', ({ message }) => console.error('[spotify account]', message));

      this.player.connect();
    },

    async playUris(uris, contextUri) {
      const t = await this.getToken();
      if (!t || !this.deviceId) return;
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify(contextUri ? { context_uri: contextUri, offset: { position: 0 } } : { uris }),
      });
    },

    togglePlay()  { this.player?.togglePlay(); },
    next()        { this.player?.nextTrack(); },
    previous()    { this.player?.previousTrack(); },
    seek(ms)      { this.player?.seek(ms); },

    async getState() { return this.player ? this.player.getCurrentState() : null; },
  };

  window.Spotify_Client = Spotify;

  // ============================================================
  //  MUSIC APP — replaces whatever 'music' / 'spotify' app existed.
  // ============================================================
  const MUSIC_APP_ID = 'spotify';

  function ensureMusicApp() {
    // register in APPS if it isn't
    if (window.APPS && !window.APPS[MUSIC_APP_ID]) {
      window.APPS[MUSIC_APP_ID] = {
        title: 'Spotify',
        icon: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
        internal: true,
        pinned: true,
      };
    }
  }

  // Render the music app UI into a window iframe document OR into the win-body
  // directly. Easier to render into win-body so we share Spotify state with
  // the parent.
  function renderMusicApp(win) {
    const body = win.querySelector('.win-body');
    if (!body) return;
    // kill any existing iframe content and render our UI directly
    body.innerHTML = `<div id="spotify-app-root"></div>`;
    const root = body.querySelector('#spotify-app-root');

    const paint = async () => {
      const token = await Spotify.getToken();
      if (!token) { root.innerHTML = loginHTML(); wireLogin(root); return; }
      root.innerHTML = shellHTML();
      loadPlaylists(root);
      wireNowPlaying(root);
    };

    const unsub = Spotify.onChange(paint);
    win.addEventListener('remove', () => unsub());
    paint();
  }

  function loginHTML() {
    return `
      <div class="sp-login-screen">
        <h2>Sign in with Spotify</h2>
        <p>Connect your Spotify Premium account to stream your library right inside Intellectual OS.</p>
        <button class="sp-btn" id="sp-login-btn">Continue to Spotify</button>
      </div>`;
  }

  function wireLogin(root) {
    const b = root.querySelector('#sp-login-btn');
    if (b) b.onclick = () => Spotify.login();
  }

  function shellHTML() {
    return `
      <aside class="sp-sidebar">
        <h3>Library</h3>
        <div id="sp-lib"></div>
        <h3>Playlists</h3>
        <div id="sp-playlists"><div class="sp-pl" style="color:#666">Loading…</div></div>
      </aside>
      <main class="sp-main">
        <div class="sp-topbar">
          <div id="sp-title" style="font-size:20px;font-weight:800">Liked Songs</div>
          <button class="sp-btn ghost" id="sp-logout">Log out</button>
        </div>
        <div class="sp-tracklist" id="sp-tracks"><div style="color:#666;padding:20px">Pick a playlist on the left.</div></div>
        <div class="sp-nowbar">
          <div class="sp-now-track">
            <img id="sp-now-art" src="" alt="">
            <div class="sp-now-info">
              <div class="t" id="sp-now-title">Nothing playing</div>
              <div class="a" id="sp-now-artist"></div>
            </div>
          </div>
          <div class="sp-controls">
            <button id="sp-prev"><i class="fas fa-backward-step"></i></button>
            <button class="play" id="sp-play"><i class="fas fa-play"></i></button>
            <button id="sp-next"><i class="fas fa-forward-step"></i></button>
          </div>
          <div style="position:relative">
            <canvas class="sp-viz" id="sp-viz"></canvas>
            <div class="sp-progress">
              <span id="sp-cur">0:00</span>
              <div class="bar" id="sp-bar"><div class="fill" id="sp-fill"></div></div>
              <span id="sp-tot">0:00</span>
            </div>
          </div>
        </div>
      </main>`;
  }

  async function loadPlaylists(root) {
    try {
      const lib = root.querySelector('#sp-lib');
      lib.innerHTML =
        `<div class="sp-pl active" data-kind="liked">❤ Liked Songs</div>` +
        `<div class="sp-pl" data-kind="top">🔥 Top Tracks</div>`;

      const data = await Spotify.api('/me/playlists?limit=50');
      const list = root.querySelector('#sp-playlists');
      list.innerHTML = (data?.items || []).map((p) =>
        `<div class="sp-pl" data-kind="playlist" data-id="${p.id}" data-uri="${p.uri}" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</div>`
      ).join('') || '<div class="sp-pl" style="color:#666">No playlists</div>';

      root.querySelectorAll('.sp-pl').forEach((el) => {
        el.onclick = () => {
          root.querySelectorAll('.sp-pl').forEach((x) => x.classList.remove('active'));
          el.classList.add('active');
          const k = el.dataset.kind;
          if (k === 'liked') loadLiked(root);
          else if (k === 'top') loadTop(root);
          else if (k === 'playlist') loadPlaylist(root, el.dataset.id, el.dataset.uri, el.textContent);
        };
      });

      const logout = root.querySelector('#sp-logout');
      if (logout) logout.onclick = () => Spotify.logout();

      loadLiked(root);
    } catch (e) {
      console.error('[spotify] playlists', e);
    }
  }

  async function loadLiked(root) {
    root.querySelector('#sp-title').textContent = 'Liked Songs';
    const d = await Spotify.api('/me/tracks?limit=50');
    renderTracks(root, (d?.items || []).map((x) => x.track), null);
  }

  async function loadTop(root) {
    root.querySelector('#sp-title').textContent = 'Top Tracks';
    const d = await Spotify.api('/me/top/tracks?limit=50');
    renderTracks(root, d?.items || [], null);
  }

  async function loadPlaylist(root, id, uri, name) {
    root.querySelector('#sp-title').textContent = name;
    const d = await Spotify.api(`/playlists/${id}/tracks?limit=100`);
    renderTracks(root, (d?.items || []).map((x) => x.track).filter(Boolean), uri);
  }

  function renderTracks(root, tracks, contextUri) {
    const list = root.querySelector('#sp-tracks');
    if (!tracks?.length) { list.innerHTML = '<div style="color:#666;padding:20px">No tracks.</div>'; return; }
    list.innerHTML = tracks.map((t, i) => {
      const art = t.album?.images?.at(-1)?.url || '';
      const artists = (t.artists || []).map((a) => a.name).join(', ');
      return `<div class="sp-track" data-idx="${i}">
        <span>${i + 1}</span>
        <img src="${art}" alt="">
        <div><div class="tr-name">${escapeHTML(t.name)}</div><div class="tr-artist">${escapeHTML(artists)}</div></div>
        <div class="tr-artist">${fmtMs(t.duration_ms)}</div>
        <span><i class="fas fa-play"></i></span>
      </div>`;
    }).join('');
    list.querySelectorAll('.sp-track').forEach((el) => {
      el.ondblclick = () => play(tracks, +el.dataset.idx, contextUri);
      el.onclick = (e) => { if (e.detail === 2) return; };
    });
  }

  async function play(tracks, idx, contextUri) {
    if (!Spotify.deviceId) {
      alert('Spotify player is still connecting. Try again in a second (Premium account required).');
      return;
    }
    if (contextUri) {
      const t = await Spotify.getToken();
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${Spotify.deviceId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_uri: contextUri, offset: { position: idx } }),
      });
    } else {
      await Spotify.playUris(tracks.slice(idx).map((x) => x.uri));
    }
  }

  function wireNowPlaying(root) {
    const el = (id) => root.querySelector(id);
    el('#sp-play').onclick = () => Spotify.togglePlay();
    el('#sp-next').onclick = () => Spotify.next();
    el('#sp-prev').onclick = () => Spotify.previous();
    el('#sp-bar').onclick = async (e) => {
      const st = await Spotify.getState();
      if (!st) return;
      const r = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - r.left) / r.width;
      Spotify.seek(Math.max(0, Math.min(st.duration, Math.round(pct * st.duration))));
    };

    const canvas = el('#sp-viz');
    const vc = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 40;

    const tick = async () => {
      if (!root.isConnected) return;
      const st = await Spotify.getState();
      if (st && !st.paused) {
        const t = st.track_window?.current_track;
        if (t) {
          el('#sp-now-art').src = t.album?.images?.[0]?.url || '';
          el('#sp-now-title').textContent = t.name || '';
          el('#sp-now-artist').textContent = (t.artists || []).map((a) => a.name).join(', ');
        }
        el('#sp-cur').textContent = fmtMs(st.position);
        el('#sp-tot').textContent = fmtMs(st.duration);
        el('#sp-fill').style.width = ((st.position / st.duration) * 100).toFixed(1) + '%';
        el('#sp-play').innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        el('#sp-play').innerHTML = '<i class="fas fa-play"></i>';
      }
      drawViz(vc, canvas, st && !st.paused);
      requestAnimationFrame(tick);
    };
    tick();
  }

  let vizT = 0;
  function drawViz(cx, canvas, playing) {
    const w = canvas.width = canvas.parentElement.clientWidth || 200;
    const h = canvas.height;
    cx.clearRect(0, 0, w, h);
    if (!playing) return;
    vizT += 0.08;
    cx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
    const bars = 40;
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const n = Math.sin(vizT + i * 0.4) * 0.5 + Math.sin(vizT * 2.3 + i * 0.7) * 0.5 + 1;
      const bh = Math.max(2, n * (h * 0.4));
      cx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
    }
  }

  function fmtMs(ms) {
    if (!ms || !isFinite(ms)) return '0:00';
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Hook window creation — when a window for the music app opens, render our UI
  const origOpenWindow = window.openWindow;
  if (typeof origOpenWindow === 'function') {
    window.openWindow = function (id) {
      const result = origOpenWindow.apply(this, arguments);
      if (id === MUSIC_APP_ID || id === 'music') {
        const win = document.getElementById('win-' + id);
        if (win) setTimeout(() => renderMusicApp(win), 30);
      }
      return result;
    };
  }

  // ============================================================
  //  BOOT
  // ============================================================
  function boot() {
    ensureMusicApp();
    WM.init();
    Dock.init();
    QS.init();
    Spotify.init();

    // handle OAuth query flags
    const sp = new URLSearchParams(location.search);
    if (sp.get('spotify') === 'error') {
      console.warn('[spotify] login error:', sp.get('reason'));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
