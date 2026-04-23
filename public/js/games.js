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

function glyphFor(name) {
    const map = { HORROR: '▲', ACTION: '▣', RPG: '◆', ARCADE: '●', RACING: '▷', SANDBOX: '⚙', RAGE: '☠', SURVIVE: '△', CASUAL: '○', STORY: '❋', PACK: '◉' };
    return map[name] || '◇';
}

export function buildGamesPanel() {
    const root = document.createElement('div');
    root.className = 'app-games';
    root.innerHTML = `
        <div class="games-header">
            <h2>Infinity · ${GAMES.length} titles</h2>
            <input class="games-search hover-target" placeholder="Search library…" />
        </div>
        <div class="games-grid" id="games-grid"></div>
    `;

    const grid = root.querySelector('#games-grid');
    const search = root.querySelector('.games-search');

    function render(filter = '') {
        const q = filter.trim().toLowerCase();
        grid.innerHTML = '';
        const filtered = q
            ? GAMES.filter((g) => g.name.toLowerCase().includes(q) || g.tag.toLowerCase().includes(q))
            : GAMES;
        filtered.forEach((g) => {
            const tile = document.createElement('button');
            tile.className = 'game-tile hover-target';
            tile.innerHTML = `
                <span class="glyph">${glyphFor(g.tag)} ${g.tag}</span>
                <div class="name">${g.name}</div>
                <div class="tag">LAUNCH →</div>
            `;
            tile.addEventListener('click', () => launchGame(g));
            grid.appendChild(tile);
        });
        if (!filtered.length) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-dim);font-family:var(--font-mono);padding:40px">No titles match "${filter}"</div>`;
        }
    }
    render();
    search.addEventListener('input', () => render(search.value));

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
