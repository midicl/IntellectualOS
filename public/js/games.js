// Phase 4 — Infinity Game Engine
// Deduped list from nathanpikelny6-oss/web-port + yf7kv9jmms-tech/miami + genizy/web-port.
// All games hosted at https://gn-math.github.io/<slug>/

import { createWindow } from './windows.js';
import { sendEvent } from './app-bus.js';

const HOST = 'https://gn-math.github.io';

export const GAMES = [
    { name: 'Amanda The Adventurer',   slug: 'amanda-the-adventurer',  tag: 'HORROR' },
    { name: "Andy's Apple Farm",       slug: 'andys-apple-farm',       tag: 'HORROR' },
    { name: "Baldi's Basics Plus",     slug: 'baldi-plus',             tag: 'HORROR' },
    { name: "Baldi's Basics Remaster", slug: 'baldi-remaster',         tag: 'HORROR' },
    { name: 'Bendy & The Ink Machine', slug: 'bendy',                  tag: 'HORROR' },
    { name: 'Bergentruck 201x',        slug: 'bergentruck',            tag: 'RPG' },
    { name: 'Bloodmoney',              slug: 'bloodmoney',             tag: 'ACTION' },
    { name: 'Buckshot Roulette',       slug: 'buckshot-roulette',      tag: 'ACTION' },
    { name: "Class of '09",            slug: 'class-of-09',            tag: 'STORY' },
    { name: 'Cuphead',                 slug: 'cuphead',                tag: 'ARCADE' },
    { name: 'Dead Plate',              slug: 'dead-plate',             tag: 'HORROR' },
    { name: 'Deadseat',                slug: 'deadseat',               tag: 'HORROR' },
    { name: 'Deltatraveler',           slug: 'deltatraveler',          tag: 'RPG' },
    { name: 'Do NOT Take This Cat Home', slug: 'donottakethiscathome', tag: 'HORROR' },
    { name: 'Fears to Fathom',         slug: 'fears-to-fathom/home-alone', tag: 'HORROR' },
    { name: 'FNAF',                    slug: 'fnaf',                   tag: 'HORROR' },
    { name: 'Getting Over It',         slug: 'getting-over-it',        tag: 'RAGE' },
    { name: 'Happy Sheepies',          slug: 'happy-sheepies',         tag: 'CASUAL' },
    { name: 'Hotline Miami',           slug: 'hotline-miami',          tag: 'ACTION' },
    { name: 'Kindergarten',            slug: 'kindergarten',           tag: 'STORY' },
    { name: "Lacey's Flash Games",     slug: 'lacysflashgames',        tag: 'PACK' },
    { name: 'Milkman Karlson',         slug: 'milkman-karlson',        tag: 'ARCADE' },
    { name: 'OMORI',                   slug: 'omori-fixed',            tag: 'RPG' },
    { name: 'People Playground',       slug: 'people-playground',      tag: 'SANDBOX' },
    { name: 'Pizza Tower',             slug: 'pizza-tower',            tag: 'ARCADE' },
    { name: 'RAFT',                    slug: 'raft',                   tag: 'SURVIVE' },
    { name: 'R.E.P.O',                 slug: 'repo',                   tag: 'HORROR' },
    { name: 'Slender: The 8 Pages',    slug: 'slender',                tag: 'HORROR' },
    { name: 'Sonic.exe',               slug: 'sonic.exe',              tag: 'HORROR' },
    { name: 'Speed Stars',             slug: 'speed-stars',            tag: 'RACING' },
    { name: 'Tattletail',              slug: 'tattletail',             tag: 'HORROR' },
    { name: "That's Not My Neighbor",  slug: 'thats-not-my-neighbor',  tag: 'HORROR' },
    { name: 'The Man in the Window',   slug: 'the-man-in-the-window',  tag: 'HORROR' },
    { name: 'Ultrakill',               slug: 'ultrakill',              tag: 'ACTION' },
    { name: 'Undertale Yellow',        slug: 'undertale-yellow',       tag: 'RPG' },
    { name: 'Web Fishing',             slug: 'web-fishing',            tag: 'CASUAL' },
    { name: 'Witch Heart',             slug: 'witch-heart',            tag: 'RPG' },
    { name: 'Yandere Simulator',       slug: 'yandere-simulator',      tag: 'SANDBOX' },
    { name: 'Yume Nikki',              slug: 'yume-nikki',             tag: 'RPG' },
];

const CATEGORIES = {
    HORROR:  { color: '#ef4444', glyph: '▲' },
    ACTION:  { color: '#f97316', glyph: '▣' },
    RPG:     { color: '#a855f7', glyph: '◆' },
    ARCADE:  { color: '#22c55e', glyph: '●' },
    RACING:  { color: '#0ea5e9', glyph: '▷' },
    SANDBOX: { color: '#eab308', glyph: '⚙' },
    RAGE:    { color: '#dc2626', glyph: '☠' },
    SURVIVE: { color: '#14b8a6', glyph: '△' },
    CASUAL:  { color: '#ec4899', glyph: '○' },
    STORY:   { color: '#6366f1', glyph: '❋' },
    PACK:    { color: '#94a3b8', glyph: '◉' },
};

export function buildGamesPanel() {
    const root = document.createElement('div');
    root.className = 'app-games';

    // Distinct categories sorted by frequency for natural ordering
    const catCounts = {};
    GAMES.forEach((g) => { catCounts[g.tag] = (catCounts[g.tag] || 0) + 1; });
    const cats = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);

    root.innerHTML = `
        <div class="games-header">
            <div class="row">
                <h2>Infinity</h2>
                <input class="games-search hover-target" placeholder="Search library…" />
            </div>
            <div class="row" style="gap:12px">
                <div class="games-chips" id="chips"></div>
                <span class="counter" id="counter">${GAMES.length} TITLES</span>
            </div>
        </div>
        <div class="games-grid" id="games-grid"></div>
    `;

    const grid = root.querySelector('#games-grid');
    const search = root.querySelector('.games-search');
    const chipsEl = root.querySelector('#chips');
    const counter = root.querySelector('#counter');

    // Build chips
    let activeCat = 'ALL';
    const chipNames = ['ALL', ...cats];
    chipNames.forEach((cat) => {
        const chip = document.createElement('button');
        chip.className = 'games-chip hover-target' + (cat === 'ALL' ? ' on' : '');
        chip.dataset.cat = cat;
        const count = cat === 'ALL' ? GAMES.length : catCounts[cat];
        chip.innerHTML = `${cat}<span class="count">${count}</span>`;
        if (cat !== 'ALL') chip.style.setProperty('--cat-color', CATEGORIES[cat]?.color || 'var(--accent)');
        chip.addEventListener('click', () => {
            chipsEl.querySelectorAll('.games-chip').forEach((c) => c.classList.remove('on'));
            chip.classList.add('on');
            activeCat = cat;
            render();
        });
        chipsEl.appendChild(chip);
    });

    function render() {
        const q = search.value.trim().toLowerCase();
        grid.innerHTML = '';
        const filtered = GAMES.filter((g) => {
            if (activeCat !== 'ALL' && g.tag !== activeCat) return false;
            if (!q) return true;
            return g.name.toLowerCase().includes(q) || g.tag.toLowerCase().includes(q);
        });
        counter.textContent = `${filtered.length} / ${GAMES.length}`;

        if (!filtered.length) {
            grid.innerHTML = `<div class="games-empty">NO TITLES FOUND</div>`;
            return;
        }

        filtered.forEach((g) => {
            const cat = CATEGORIES[g.tag] || { color: 'var(--accent)', glyph: '◇' };
            const tile = document.createElement('button');
            tile.className = 'game-tile hover-target';
            tile.style.setProperty('--cat-color', cat.color);
            tile.innerHTML = `
                <div class="tile-top">
                    <span class="tag">${g.tag}</span>
                    <span class="glyph">${cat.glyph}</span>
                </div>
                <div class="name">${g.name}</div>
                <div class="play">LAUNCH</div>
            `;
            tile.addEventListener('click', () => launchGame(g));
            grid.appendChild(tile);
        });
    }
    render();
    search.addEventListener('input', render);

    return root;
}

export function launchGame(game) {
    const url = `${HOST}/${game.slug}/`;
    const body = document.createElement('div');
    body.style.cssText = 'position:relative;width:100%;height:100%;background:#000';

    // Loading bar
    const loader = document.createElement('div');
    loader.className = 'game-loader';
    loader.innerHTML = `
        <div class="title">${game.name}</div>
        <div class="bar"><div class="fill"></div></div>
        <div class="sub" id="loader-sub">NEGOTIATING STREAM…</div>
    `;
    body.appendChild(loader);

    // Fake loading progression while iframe actually loads
    const fill = loader.querySelector('.fill');
    const sub = loader.querySelector('#loader-sub');
    let progress = 0;
    const steps = ['NEGOTIATING STREAM…', 'AUTHORIZING BRIDGE…', 'STAGING ASSETS…', 'HANDOFF TO KERNEL…'];
    const tick = setInterval(() => {
        progress = Math.min(progress + 8 + Math.random() * 14, 92);
        fill.style.width = progress + '%';
        sub.textContent = steps[Math.min(steps.length - 1, Math.floor(progress / 25))];
    }, 180);

    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = 'autoplay; fullscreen; gamepad; microphone; pointer-lock; cross-origin-isolated';
    iframe.referrerPolicy = 'no-referrer';
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText = 'width:100%;height:100%;border:0;background:#000';
    body.appendChild(iframe);

    // Failure detection: if the iframe doesn't "load" within 12s, show error
    let errored = false;
    let showedError = false;
    const failTimer = setTimeout(() => {
        if (!loaded) showError('Timeout waiting for kernel handshake.');
    }, 12_000);

    let loaded = false;
    iframe.addEventListener('load', () => {
        loaded = true;
        clearInterval(tick);
        clearTimeout(failTimer);
        fill.style.width = '100%';
        setTimeout(() => loader.remove(), 350);
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
        err.querySelector('button').addEventListener('click', () => {
            err.remove();
            iframe.src = url;
        });
        body.appendChild(err);
    }

    const w = createWindow({
        id: `game-${game.slug}`,
        title: game.name.toUpperCase(),
        icon: '▶',
        width: 1024,
        height: 680,
        content: body,
        onBeforeClose: () => {
            // Phase 4: destroy iframe to free RAM
            clearInterval(tick);
            clearTimeout(failTimer);
            if (iframe) {
                try { iframe.src = 'about:blank'; } catch {}
                iframe.remove();
                iframe = null;
            }
        },
    });

    sendEvent('game-open', game.name);
    return w;
}
