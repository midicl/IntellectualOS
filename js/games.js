// Phase 4 — Infinity Game Engine (rewritten)
// Data source: gn-math.dev manifest (685+ games, live commit hash for CDN resolution)
//   manifest:  https://cdn.jsdelivr.net/gh/sealiee11/gnmathstuff@main/zones.json
//   covers:    https://cdn.jsdelivr.net/gh/freebuisness/covers@main/<id>.png
//   html:      https://cdn.jsdelivr.net/gh/freebuisness/html@<hash>/<slug>.html
//   hash:      https://gn-math.dev/commits (plain text, one commit SHA)

import { createWindow } from './windows.js';
import { sendEvent } from './app-bus.js';

const MANIFEST_URL = 'https://cdn.jsdelivr.net/gh/sealiee11/gnmathstuff@main/zones.json';
const COVERS_BASE  = 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main';
const HTML_BASE    = 'https://cdn.jsdelivr.net/gh/freebuisness/html';
const HASH_URL     = 'https://gn-math.dev/commits';

// In-memory cache
let manifest = null;
let commitHash = null;
let manifestLoaded = null;     // Promise

let lastError = null;
async function loadManifest(force = false) {
    if (manifestLoaded && !force) return manifestLoaded;
    if (force) { manifestLoaded = null; manifest = null; commitHash = null; }
    manifestLoaded = (async () => {
        try {
            const [zonesRes, hashRes] = await Promise.allSettled([
                fetch(MANIFEST_URL, { cache: 'default' }),
                fetch(HASH_URL, { cache: 'no-store' }),
            ]);
            if (zonesRes.status !== 'fulfilled' || !zonesRes.value.ok) {
                throw new Error(`Manifest fetch failed (${zonesRes.value?.status || zonesRes.reason?.message || 'network'})`);
            }
            const zones = await zonesRes.value.json();
            // Hash is best-effort — without it, games still launch via @main
            if (hashRes.status === 'fulfilled' && hashRes.value.ok) {
                commitHash = (await hashRes.value.text()).trim();
            }
            manifest = zones.filter((g) => Number(g.id) >= 0);
            manifest.forEach((g) => {
                g.cover = (g.cover || '').replace('{COVER_URL}', COVERS_BASE);
                g._slug = (g.url || '').replace('{HTML_URL}/', '').replace('.html', '');
            });
            lastError = null;
            return manifest;
        } catch (e) {
            console.error('[games] manifest load failed', e);
            lastError = e;
            manifest = [];
            return manifest;
        }
    })();
    return manifestLoaded;
}
export function getLastGamesError() { return lastError; }

function gameUrl(game) {
    if (!commitHash) return game.url?.replace('{HTML_URL}', `${HTML_BASE}@main`);
    return `${HTML_BASE}@${commitHash}/${game._slug}.html`;
}

// Tag → accent color (used on hover ring + chip)
const TAG_COLORS = {
    Action:      '#f97316',
    Adventure:   '#0ea5e9',
    Arcade:      '#22c55e',
    Card:        '#eab308',
    Casual:      '#ec4899',
    Clicker:     '#a78bfa',
    Endless:     '#14b8a6',
    Fighting:    '#dc2626',
    Horror:      '#ef4444',
    Multiplayer: '#6366f1',
    Platformer:  '#8b5cf6',
    Puzzle:      '#3b82f6',
    Racing:      '#06b6d4',
    Rhythm:      '#d946ef',
    RPG:         '#a855f7',
    Shooter:     '#dc2626',
    Shooting:    '#e11d48',
    Simulation:  '#10b981',
    Sports:      '#65a30d',
    Stealth:     '#475569',
    Strategy:    '#0891b2',
    Survival:    '#f59e0b',
    Default:     '#00a2ff',
};
const colorFor = (tag) => TAG_COLORS[tag] || TAG_COLORS.Default;

export async function buildGamesPanel() {
    const root = document.createElement('div');
    root.className = 'app-games';
    root.innerHTML = `
        <div class="games-header">
            <div class="row">
                <div class="title-wrap">
                    <h2>Infinity</h2>
                    <span class="counter" id="counter">LOADING…</span>
                </div>
                <input class="games-search hover-target" placeholder="Search library…" spellcheck="false" />
            </div>
            <div class="games-chips" id="chips"></div>
        </div>
        <div class="games-grid" id="games-grid">
            <div class="games-empty">FETCHING MANIFEST…</div>
        </div>
    `;

    const grid = root.querySelector('#games-grid');
    const search = root.querySelector('.games-search');
    const chipsEl = root.querySelector('#chips');
    const counter = root.querySelector('#counter');

    let activeTag = 'ALL';
    let searchTerm = '';

    // Lazy-load the manifest the first time this panel opens
    const data = await loadManifest();

    if (!data.length) {
        const reason = lastError ? lastError.message : 'unknown';
        grid.innerHTML = `
            <div class="games-empty" style="line-height:2">
                <div style="color:#ef4444;font-weight:700;margin-bottom:8px">COULDN'T REACH GN-MATH NETWORK</div>
                <div style="font-size:11px;color:var(--text-dim)">${reason}</div>
                <div style="margin-top:14px;font-size:11px;color:var(--text-dim);max-width:520px;margin-left:auto;margin-right:auto">
                    Most likely jsdelivr or gn-math.dev is unreachable from this network — your school filter probably blocks one of them.
                    <br/><br/>Try:
                    <ul style="text-align:left;margin-top:8px;line-height:1.7">
                        <li>Switch to PROXY mode in the Browser app and visit <code>cdn.jsdelivr.net</code> to see if it loads</li>
                        <li>Check your wifi (open Settings → DNS/proxy)</li>
                        <li>Wait 30s and click retry — these CDNs flap occasionally</li>
                    </ul>
                </div>
                <button class="btn-primary hover-target" id="games-retry" style="margin-top:18px">Retry</button>
            </div>`;
        counter.textContent = 'OFFLINE';
        root.querySelector('#games-retry')?.addEventListener('click', async () => {
            grid.innerHTML = `<div class="games-empty">REFETCHING…</div>`;
            counter.textContent = 'LOADING…';
            const fresh = await loadManifest(true);
            if (fresh.length) {
                // Replace the panel content with a fresh build
                const newPanel = await buildGamesPanel();
                root.replaceWith(newPanel);
            } else {
                // Re-render the error
                const r = lastError ? lastError.message : 'unknown';
                grid.innerHTML = `<div class="games-empty"><div style="color:#ef4444">STILL UNREACHABLE</div><div style="font-size:11px;color:var(--text-dim);margin-top:6px">${r}</div></div>`;
            }
        });
        return root;
    }

    // Collect tag frequency (for chip ordering + counts)
    const tagCounts = {};
    data.forEach((g) => (g.tags || []).forEach((t) => tagCounts[t] = (tagCounts[t] || 0) + 1));
    const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([t]) => t);

    // Render chips
    ['ALL', ...tags].forEach((t) => {
        const chip = document.createElement('button');
        chip.className = 'games-chip hover-target' + (t === 'ALL' ? ' on' : '');
        chip.dataset.tag = t;
        const count = t === 'ALL' ? data.length : tagCounts[t];
        chip.innerHTML = `${t}<span class="count">${count}</span>`;
        if (t !== 'ALL') chip.style.setProperty('--cat-color', colorFor(t));
        chip.addEventListener('click', () => {
            chipsEl.querySelectorAll('.games-chip').forEach((c) => c.classList.remove('on'));
            chip.classList.add('on');
            activeTag = t;
            render();
        });
        chipsEl.appendChild(chip);
    });

    function render() {
        const q = searchTerm.trim().toLowerCase();
        const filtered = data.filter((g) => {
            if (activeTag !== 'ALL' && !(g.tags || []).includes(activeTag)) return false;
            if (!q) return true;
            return g.name.toLowerCase().includes(q) ||
                   (g.tags || []).some((t) => t.toLowerCase().includes(q)) ||
                   (g.author || '').toLowerCase().includes(q);
        });
        counter.textContent = `${filtered.length} / ${data.length}`;
        if (!filtered.length) {
            grid.innerHTML = `<div class="games-empty">NO TITLES FOUND</div>`;
            return;
        }
        // Virtualize-ish: only render first 300 at once — full list is 685, too many for one pass
        const slice = filtered.slice(0, 300);
        grid.innerHTML = '';
        const frag = document.createDocumentFragment();
        slice.forEach((g) => {
            const primaryTag = (g.tags || [])[0] || 'Default';
            const tile = document.createElement('button');
            tile.className = 'game-tile hover-target';
            tile.style.setProperty('--cat-color', colorFor(primaryTag));
            tile.innerHTML = `
                <div class="cover">
                    <img loading="lazy" decoding="async" alt="${g.name.replace(/"/g, '&quot;')}" />
                    <div class="cover-overlay">
                        <div class="play-btn">▶</div>
                    </div>
                </div>
                <div class="meta">
                    <div class="name">${g.name}</div>
                    <div class="sub">${(g.tags || []).slice(0, 2).join(' · ') || 'Untagged'}</div>
                </div>
            `;
            const img = tile.querySelector('img');
            img.src = g.cover;
            img.addEventListener('error', () => {
                img.style.display = 'none';
                tile.querySelector('.cover').classList.add('no-cover');
            });
            tile.addEventListener('click', () => launchGame(g));
            frag.appendChild(tile);
        });
        grid.appendChild(frag);
        if (filtered.length > 300) {
            const more = document.createElement('div');
            more.className = 'games-empty';
            more.innerHTML = `Showing 300 of ${filtered.length} — narrow with search or a filter.`;
            grid.appendChild(more);
        }
    }
    render();

    search.addEventListener('input', () => { searchTerm = search.value; render(); });

    return root;
}

export function launchGame(game) {
    const url = gameUrl(game);
    const body = document.createElement('div');
    body.style.cssText = 'position:relative;width:100%;height:100%;background:#000';

    const loader = document.createElement('div');
    loader.className = 'game-loader';
    loader.innerHTML = `
        <div class="title">${game.name}</div>
        <div class="sub" id="loader-sub">AUTHENTICATING WITH GN-MATH BRIDGE…</div>
        <div class="bar"><div class="fill"></div></div>
        <div class="hint">Tap inside the frame after load if controls don't respond.</div>
    `;
    body.appendChild(loader);

    const fill = loader.querySelector('.fill');
    const sub = loader.querySelector('#loader-sub');
    let progress = 0;
    const steps = ['AUTHENTICATING…', 'STREAMING ASSETS…', 'COMPILING SHADERS…', 'HANDOFF TO KERNEL…'];
    const tick = setInterval(() => {
        progress = Math.min(progress + 7 + Math.random() * 12, 92);
        fill.style.width = progress + '%';
        sub.textContent = steps[Math.min(steps.length - 1, Math.floor(progress / 25))];
    }, 180);

    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = 'autoplay; fullscreen; gamepad; microphone; pointer-lock; cross-origin-isolated; clipboard-read; clipboard-write';
    iframe.referrerPolicy = 'no-referrer';
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'width:100%;height:100%;border:0;background:#000;display:block';
    body.appendChild(iframe);

    let loaded = false, showedError = false;
    const failTimer = setTimeout(() => { if (!loaded) showError('Timeout waiting for kernel handshake.'); }, 14_000);

    iframe.addEventListener('load', () => {
        loaded = true;
        clearInterval(tick);
        clearTimeout(failTimer);
        fill.style.width = '100%';
        setTimeout(() => loader.remove(), 320);
    });
    iframe.addEventListener('error', () => showError('Kernel refused the connection.'));

    function showError(detail) {
        if (showedError) return;
        showedError = true;
        clearInterval(tick);
        clearTimeout(failTimer);
        loader.remove();
        const err = document.createElement('div');
        err.className = 'browser-error';
        err.innerHTML = `
            <h2>CONNECTION REFUSED</h2>
            <div class="detail">ROUTING VIA BACKUP…</div>
            <div class="detail">${detail}</div>
            <button class="hover-target">Retry</button>
        `;
        err.querySelector('button').addEventListener('click', () => { err.remove(); iframe.src = url; });
        body.appendChild(err);
    }

    const w = createWindow({
        id: `game-${game.id}`,
        title: (game.name || 'GAME').toUpperCase(),
        icon: '▶',
        width: 1100,
        height: 720,
        content: body,
        onBeforeClose: () => {
            clearInterval(tick);
            clearTimeout(failTimer);
            if (iframe) { try { iframe.src = 'about:blank'; } catch {} iframe.remove(); iframe = null; }
        },
    });

    sendEvent('game-open', game.name);
    return w;
}
