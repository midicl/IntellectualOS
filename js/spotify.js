// Spotify app — OAuth PKCE login, search, playback control via Web Playback SDK.
// Premium account required for in-browser playback (Spotify's restriction).
// Free accounts can still browse/search and use "Open in Spotify" deep links.
import { createWindow } from './windows.js';

const STORAGE_KEY = 'intellectual.spotify';
const SCOPES = [
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-library-read',
    'user-top-read',
    'playlist-read-private',
    'streaming',
];

// Default Spotify Client ID (PKCE flow — public client IDs are safe to commit).
// Override via <meta name="spotify-client-id">, window.SPOTIFY_CLIENT_ID, or
// localStorage('intellectual.spotifyClientId') to point at a different app.
const DEFAULT_CLIENT_ID = '8bf66c5fcfb14208964e9c82f0100e97';

function getClientId() {
    const meta = document.querySelector('meta[name="spotify-client-id"]');
    if (meta?.content) return meta.content;
    if (window.SPOTIFY_CLIENT_ID) return window.SPOTIFY_CLIENT_ID;
    try {
        const stored = localStorage.getItem('intellectual.spotifyClientId');
        if (stored) return stored;
    } catch {}
    return DEFAULT_CLIENT_ID;
}

const REDIRECT_URI = window.location.origin + '/';

// ── PKCE helpers ────────────────────────────────────────────
function randomString(length = 64) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charCodeAt(b % 62) - 0).map((c) => String.fromCharCode(c)).join('').slice(0, length);
}
async function sha256base64url(input) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', data);
    let s = '';
    new Uint8Array(buf).forEach((b) => s += String.fromCharCode(b));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function loadAuth() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}
function saveAuth(a) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch {}
}
function clearAuth() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

async function startLogin() {
    const clientId = getClientId();
    if (!clientId) {
        alert('No Spotify Client ID configured. See instructions in the login panel.');
        return;
    }
    const verifier = randomString(64);
    const challenge = await sha256base64url(verifier);
    sessionStorage.setItem('intellectual.spotifyVerifier', verifier);
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(' '),
        code_challenge_method: 'S256',
        code_challenge: challenge,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

// On page load, check if Spotify just redirected back with ?code=...
export async function handleAuthCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code) return false;
    const verifier = sessionStorage.getItem('intellectual.spotifyVerifier');
    const clientId = getClientId();
    if (!verifier || !clientId) return false;

    try {
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code, redirect_uri: REDIRECT_URI,
                client_id: clientId, code_verifier: verifier,
            }),
        });
        const data = await res.json();
        if (!data.access_token) throw new Error(data.error_description || 'token exchange failed');
        saveAuth({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + (data.expires_in * 1000) - 30_000,
        });
        sessionStorage.removeItem('intellectual.spotifyVerifier');
        // Clean the URL so this doesn't repeat on refresh
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        return true;
    } catch (e) {
        console.warn('[spotify] auth callback failed', e);
        return false;
    }
}

async function refreshIfNeeded() {
    const auth = loadAuth();
    if (!auth) return null;
    if (Date.now() < auth.expiresAt) return auth.accessToken;
    const clientId = getClientId();
    if (!clientId || !auth.refreshToken) { clearAuth(); return null; }
    try {
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: auth.refreshToken,
                client_id: clientId,
            }),
        });
        const data = await res.json();
        if (!data.access_token) { clearAuth(); return null; }
        saveAuth({
            accessToken: data.access_token,
            refreshToken: data.refresh_token || auth.refreshToken,
            expiresAt: Date.now() + (data.expires_in * 1000) - 30_000,
        });
        return data.access_token;
    } catch { clearAuth(); return null; }
}

async function spotifyFetch(path, opts = {}) {
    const token = await refreshIfNeeded();
    if (!token) throw new Error('Not authenticated');
    const url = path.startsWith('http') ? path : 'https://api.spotify.com/v1' + path;
    const res = await fetch(url, {
        ...opts,
        headers: {
            'authorization': `Bearer ${token}`,
            'content-type': 'application/json',
            ...(opts.headers || {}),
        },
    });
    if (res.status === 204) return null;
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Spotify ${res.status}: ${txt.slice(0, 160)}`);
    }
    return res.json();
}

// ── Web Playback SDK loader ─────────────────────────────────
let playerSDKReady = null;
function loadPlaybackSDK() {
    if (playerSDKReady) return playerSDKReady;
    playerSDKReady = new Promise((resolve) => {
        if (window.Spotify) return resolve(window.Spotify);
        window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify);
        const s = document.createElement('script');
        s.src = 'https://sdk.scdn.co/spotify-player.js';
        document.head.appendChild(s);
    });
    return playerSDKReady;
}

// ── UI ──────────────────────────────────────────────────────
function fmtMs(ms) {
    const s = Math.floor((ms || 0) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export async function openSpotify() {
    const body = document.createElement('div');
    body.className = 'app-spotify';
    body.style.position = 'relative';

    const win = createWindow({
        id: 'spotify',
        title: 'SPOTIFY',
        icon: '♫',
        width: 1040,
        height: 720,
        content: body,
    });

    const token = await refreshIfNeeded();
    if (!token) {
        renderLogin(body);
        return win;
    }
    renderApp(body, win);
    return win;
}

function renderLogin(body) {
    const clientId = getClientId();
    body.innerHTML = `
        <div class="sp-header">
            <div class="sp-brand"><span class="sp-mark">♫</span>SPOTIFY</div>
        </div>
        <div class="sp-body">
            <div class="sp-login">
                <h2>SIGN IN</h2>
                <p>Log into Spotify to listen to any music you desire — search, browse playlists, control playback. <strong>Premium</strong> required for in-browser playback (Spotify's rule).</p>
                <button class="hover-target" id="sp-login-btn" ${!clientId ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
                    Continue with Spotify
                </button>
                <div class="hint">${clientId ? 'You\'ll be redirected to spotify.com to authorize.' : 'NO CLIENT ID CONFIGURED'}</div>
                ${clientId ? '' : `
                <div class="config">
                    <strong style="color:#fff">Setup (~2 min):</strong><br/><br/>
                    1. Go to <a href="https://developer.spotify.com/dashboard" target="_blank" style="color:var(--sp-green-bright,#1ed760)">developer.spotify.com/dashboard</a> → Create app<br/>
                    2. Add Redirect URI: <code style="color:#fff">${REDIRECT_URI}</code><br/>
                    3. Copy your Client ID, then run in the Terminal app:<br/>
                    &nbsp;&nbsp;<code style="color:#fff">localStorage.setItem('intellectual.spotifyClientId','YOUR_ID')</code><br/>
                    4. Reload, click Sign In.
                </div>`}
            </div>
        </div>
    `;
    body.querySelector('#sp-login-btn')?.addEventListener('click', startLogin);
}

async function renderApp(body, win) {
    body.innerHTML = `
        <div class="sp-header">
            <div class="sp-brand"><span class="sp-mark">♫</span>SPOTIFY</div>
            <input class="sp-search hover-target" placeholder="Search songs, artists, albums…" />
            <div class="sp-user" id="sp-user">…</div>
        </div>
        <div class="sp-body" id="sp-content">
            <div class="sp-section"><h3>Loading…</h3></div>
        </div>
        <div class="sp-player">
            <div class="now-playing">
                <div class="art" id="np-art"></div>
                <div class="info">
                    <div class="name" id="np-name">Nothing playing</div>
                    <div class="artist" id="np-artist">—</div>
                </div>
            </div>
            <div class="controls">
                <div class="btns">
                    <button class="ctl hover-target" id="np-prev" title="Previous"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                    <button class="ctl play hover-target" id="np-play" title="Play/Pause"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
                    <button class="ctl hover-target" id="np-next" title="Next"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-9.5 6l8.5 6V6z"/></svg></button>
                </div>
                <div class="progress">
                    <span id="np-pos">0:00</span>
                    <div class="bar"><div class="fill" id="np-fill" style="width:0%"></div></div>
                    <span id="np-dur">0:00</span>
                </div>
            </div>
            <div class="right">
                <span id="np-device">No device</span>
                <div class="vol"><div class="fill"></div></div>
            </div>
        </div>
    `;

    const content = body.querySelector('#sp-content');
    const search = body.querySelector('.sp-search');
    const userBadge = body.querySelector('#sp-user');

    // Profile
    try {
        const me = await spotifyFetch('/me');
        userBadge.textContent = (me.display_name || me.id || '').toUpperCase();
    } catch (e) {
        if (String(e).includes('401')) { clearAuth(); renderLogin(body); return; }
        userBadge.textContent = 'OFFLINE';
    }

    // Web Playback SDK device
    let deviceId = null;
    let player = null;
    try {
        const Spotify = await loadPlaybackSDK();
        player = new Spotify.Player({
            name: 'Intellectual OS',
            getOAuthToken: async (cb) => { const t = await refreshIfNeeded(); cb(t); },
            volume: 0.6,
        });
        player.addListener('ready', ({ device_id }) => {
            deviceId = device_id;
            body.querySelector('#np-device').textContent = 'Intellectual OS';
        });
        player.addListener('not_ready', () => { deviceId = null; });
        player.addListener('player_state_changed', renderPlayerState);
        player.addListener('initialization_error', ({ message }) => console.warn('[spotify] init', message));
        player.addListener('authentication_error', ({ message }) => console.warn('[spotify] auth', message));
        player.addListener('account_error', () => {
            body.querySelector('#np-device').textContent = 'Premium required';
        });
        await player.connect();
    } catch (e) {
        console.warn('[spotify] playback SDK failed', e);
    }

    function renderPlayerState(state) {
        if (!state) return;
        const track = state.track_window?.current_track;
        if (!track) return;
        body.querySelector('#np-name').textContent = track.name;
        body.querySelector('#np-artist').textContent = track.artists.map((a) => a.name).join(', ');
        const art = body.querySelector('#np-art');
        const img = track.album?.images?.[0]?.url;
        art.innerHTML = img ? `<img src="${img}">` : '';
        body.querySelector('#np-pos').textContent = fmtMs(state.position);
        body.querySelector('#np-dur').textContent = fmtMs(state.duration);
        body.querySelector('#np-fill').style.width = (state.duration ? (state.position / state.duration) * 100 : 0) + '%';
        const pl = body.querySelector('#np-play svg path');
        if (state.paused) pl.setAttribute('d', 'M8 5v14l11-7z');
        else pl.setAttribute('d', 'M6 5h4v14H6zm8 0h4v14h-4z');
    }

    body.querySelector('#np-play').addEventListener('click', () => player?.togglePlay());
    body.querySelector('#np-prev').addEventListener('click', () => player?.previousTrack());
    body.querySelector('#np-next').addEventListener('click', () => player?.nextTrack());

    // Default home view
    renderHome();

    // Search
    let searchTimer = null;
    search.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const q = search.value.trim();
        if (!q) return renderHome();
        searchTimer = setTimeout(() => doSearch(q), 250);
    });

    async function renderHome() {
        content.innerHTML = `<div class="sp-section"><h3>Loading library…</h3></div>`;
        try {
            const [topTracks, playlists, recent] = await Promise.all([
                spotifyFetch('/me/top/tracks?limit=12&time_range=short_term').catch(() => ({ items: [] })),
                spotifyFetch('/me/playlists?limit=12').catch(() => ({ items: [] })),
                spotifyFetch('/me/player/recently-played?limit=12').catch(() => ({ items: [] })),
            ]);
            content.innerHTML = '';
            if (recent.items?.length) {
                content.appendChild(sectionRows('Recently Played', recent.items.map((it) => it.track).filter(Boolean)));
            }
            if (topTracks.items?.length) {
                content.appendChild(sectionRows('Your Top Tracks', topTracks.items));
            }
            if (playlists.items?.length) {
                content.appendChild(sectionCards('Your Playlists', playlists.items.map((p) => ({
                    name: p.name, sub: p.owner?.display_name || '',
                    img: p.images?.[0]?.url, uri: p.uri, openUrl: p.external_urls?.spotify,
                }))));
            }
            if (!content.children.length) {
                content.innerHTML = `<div class="sp-section"><h3>Welcome</h3><p style="color:#94a3a0">Search for music up top.</p></div>`;
            }
        } catch (e) {
            content.innerHTML = `<div class="sp-section"><h3>Error</h3><p style="color:#94a3a0">${e.message}</p></div>`;
        }
    }

    async function doSearch(q) {
        content.innerHTML = `<div class="sp-section"><h3>Searching “${q}”…</h3></div>`;
        try {
            const data = await spotifyFetch(`/search?q=${encodeURIComponent(q)}&type=track,artist,album&limit=12`);
            content.innerHTML = '';
            if (data.tracks?.items?.length) content.appendChild(sectionRows('Tracks', data.tracks.items));
            if (data.albums?.items?.length) content.appendChild(sectionCards('Albums', data.albums.items.map((a) => ({
                name: a.name, sub: a.artists.map((x) => x.name).join(', '),
                img: a.images?.[0]?.url, uri: a.uri, openUrl: a.external_urls?.spotify,
            }))));
            if (data.artists?.items?.length) content.appendChild(sectionCards('Artists', data.artists.items.map((a) => ({
                name: a.name, sub: 'Artist', img: a.images?.[0]?.url, uri: a.uri, openUrl: a.external_urls?.spotify,
            }))));
            if (!content.children.length) {
                content.innerHTML = `<div class="sp-section"><h3>No results</h3></div>`;
            }
        } catch (e) {
            content.innerHTML = `<div class="sp-section"><h3>Error</h3><p style="color:#94a3a0">${e.message}</p></div>`;
        }
    }

    function sectionRows(title, tracks) {
        const sec = document.createElement('div');
        sec.className = 'sp-section';
        sec.innerHTML = `<h3>${title}</h3><div class="sp-list"></div>`;
        const list = sec.querySelector('.sp-list');
        tracks.forEach((t) => {
            const row = document.createElement('div');
            row.className = 'sp-row hover-target';
            row.innerHTML = `
                <div class="art">${t.album?.images?.[2]?.url ? `<img src="${t.album.images[2].url}">` : ''}</div>
                <div class="info">
                    <div class="name">${escape(t.name)}</div>
                    <div class="artist">${escape(t.artists.map((a) => a.name).join(', '))}</div>
                </div>
                <div class="duration">${fmtMs(t.duration_ms)}</div>
                <button class="play-btn hover-target" title="Play"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
            `;
            row.querySelector('.play-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                playUri(t.uri, t.external_urls?.spotify);
            });
            row.addEventListener('click', () => playUri(t.uri, t.external_urls?.spotify));
            list.appendChild(row);
        });
        return sec;
    }

    function sectionCards(title, items) {
        const sec = document.createElement('div');
        sec.className = 'sp-section';
        sec.innerHTML = `<h3>${title}</h3><div class="sp-grid"></div>`;
        const grid = sec.querySelector('.sp-grid');
        items.forEach((it) => {
            const card = document.createElement('button');
            card.className = 'sp-card hover-target';
            card.innerHTML = `
                <div class="art">${it.img ? `<img src="${it.img}">` : ''}</div>
                <div class="name">${escape(it.name)}</div>
                <div class="artist">${escape(it.sub)}</div>
            `;
            card.addEventListener('click', () => playUri(it.uri, it.openUrl, true));
            grid.appendChild(card);
        });
        return sec;
    }

    async function playUri(uri, openUrl, isContext = false) {
        if (!deviceId) {
            // Free account or SDK not connected — fall back to opening on Spotify
            if (openUrl) window.open(openUrl, '_blank', 'noopener');
            else if (uri) {
                const id = uri.split(':').pop();
                window.open(`https://open.spotify.com/${uri.split(':')[1]}/${id}`, '_blank', 'noopener');
            }
            return;
        }
        try {
            const body = isContext ? { context_uri: uri } : { uris: [uri] };
            await spotifyFetch(`/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
        } catch (e) {
            console.warn('[spotify] play failed', e);
            if (openUrl) window.open(openUrl, '_blank', 'noopener');
        }
    }

    function escape(s) { return String(s || '').replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

    // Disconnect playback when window closes
    win.onBeforeClose = () => { try { player?.disconnect(); } catch {} };
}
