// Phase 3 — Intellectual Browser: URL bar, shield status, iframe loader, history
import { createWindow } from './windows.js';
import { sendEvent } from './app-bus.js';

// Iframe-friendly URLs (no X-Frame-Options blockers)
const QUICK = [
    { name: 'Google',     url: 'https://www.google.com/webhp?igu=1',           icon: '◉' },
    { name: 'Wikipedia',  url: 'https://en.wikipedia.org/wiki/Main_Page',      icon: '📖' },
    { name: 'Maps',       url: 'https://www.openstreetmap.org/',               icon: '◇' },
    { name: 'Archive',    url: 'https://archive.org/',                         icon: '▤' },
    { name: 'Hacker News',url: 'https://news.ycombinator.com/',                icon: '▲' },
    { name: 'MDN Docs',   url: 'https://developer.mozilla.org/en-US/',         icon: '◈' },
    { name: 'Khan',       url: 'https://www.khanacademy.org/',                 icon: '⟐' },
    { name: 'Quizlet',    url: 'https://quizlet.com/',                         icon: '❖' },
];

function normalize(input) {
    let v = input.trim();
    if (!v) return '';
    if (!v.includes('://')) {
        // Treat space-containing or non-domain input as a search query
        if (!/^[a-z0-9][a-z0-9-.]*\.[a-z]{2,}/i.test(v) || v.includes(' ')) {
            return `https://duckduckgo.com/?q=${encodeURIComponent(v)}&kae=d&kp=-2`;
        }
        v = 'https://' + v;
    }
    return v;
}

// Refuse to load the site inside itself — that's what was causing the "takes you
// to the loading screen" bug when the backend proxy fetched our own origin.
function isSelfReferential(target) {
    try {
        const u = new URL(target);
        if (u.host === window.location.host) return true;
        if (['localhost', '127.0.0.1', '0.0.0.0'].includes(u.hostname)) return true;
    } catch { return true; }
    return false;
}

function proxyUrl(target) {
    return `/proxy?url=${encodeURIComponent(target)}`;
}

export function openBrowser(initialUrl = '') {
    const body = document.createElement('div');
    body.className = 'app-browser';

    body.innerHTML = `
        <div class="browser-bar">
            <button class="nav back hover-target" title="Back" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button class="nav fwd hover-target" title="Forward" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg>
            </button>
            <button class="nav reload hover-target" title="Reload">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
            <button class="nav home hover-target" title="Home">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10l9-7 9 7v11a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V10z"/></svg>
            </button>

            <div class="url-wrap">
                <div class="shield direct" title="Direct">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 4v6c0 5-3.5 9.2-8 10-4.5-.8-8-5-8-10V6l8-4z"/></svg>
                </div>
                <input class="url hover-target" placeholder="Search DuckDuckGo or enter URL…" spellcheck="false" />
            </div>

            <div class="mode-toggle" title="Route through Webshare proxy pool">
                <button class="mode-direct on hover-target">DIRECT</button>
                <button class="mode-proxy hover-target">PROXY</button>
            </div>
        </div>

        <div class="browser-view" id="view"></div>
    `;

    const view = body.querySelector('#view');
    const urlInput = body.querySelector('input.url');
    const shield = body.querySelector('.shield');
    const backBtn = body.querySelector('.back');
    const fwdBtn = body.querySelector('.fwd');
    const reloadBtn = body.querySelector('.reload');
    const homeBtn = body.querySelector('.home');
    const modeDirect = body.querySelector('.mode-direct');
    const modeProxy = body.querySelector('.mode-proxy');

    let iframe = null;
    let mode = 'direct';
    let history = [];
    let histIdx = -1;
    let currentTitle = 'NEW TAB';

    function renderEmpty() {
        if (iframe) { try { iframe.src = 'about:blank'; } catch {} iframe.remove(); iframe = null; }
        urlInput.value = '';
        setStatus('direct');
        view.innerHTML = `
            <div class="browser-empty">
                <h2>INTELLECTUAL · BROWSER</h2>
                <div class="hint">Type a URL or pick a shortcut below</div>
                <div class="quick">
                    ${QUICK.map((q) =>
                        `<a href="#" data-url="${q.url}" class="hover-target"><span class="qi">${q.icon}</span>${q.name}</a>`
                    ).join('')}
                </div>
            </div>
        `;
        view.querySelectorAll('.quick a').forEach((a) => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                navigate(a.dataset.url);
            });
        });
        win.setTitle('NEW TAB');
    }

    function setStatus(kind) {
        shield.classList.remove('direct', 'proxied', 'error');
        shield.classList.add(kind);
        shield.title = kind === 'proxied' ? 'Routed through Webshare' : kind === 'error' ? 'Failed' : 'Direct';
    }

    function navigate(rawUrl, { pushHistory = true } = {}) {
        const target = normalize(rawUrl);
        if (!target) return renderEmpty();

        if (isSelfReferential(target)) {
            showError(`Refusing to load ${target} — that's this site itself.`, { blockSelf: true });
            return;
        }

        urlInput.value = target;
        const src = mode === 'proxy' ? proxyUrl(target) : target;

        if (iframe) { try { iframe.src = 'about:blank'; } catch {} iframe.remove(); iframe = null; }
        view.innerHTML = '';

        iframe = document.createElement('iframe');
        iframe.referrerPolicy = 'no-referrer';
        iframe.setAttribute('allowfullscreen', '');
        iframe.allow = 'autoplay; fullscreen; clipboard-read; clipboard-write; camera; microphone; gamepad';
        iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads allow-modals';
        iframe.style.cssText = 'width:100%;height:100%;border:0;background:#fff;display:block';
        view.appendChild(iframe);
        iframe.src = src;

        setStatus(mode === 'proxy' ? 'proxied' : 'direct');

        const status = document.createElement('div');
        status.className = 'browser-status on';
        status.textContent = `Loading ${new URL(target).hostname}…`;
        view.appendChild(status);

        let loaded = false;
        const failTimer = setTimeout(() => { if (!loaded) showError('Timeout — the site did not respond in 15s.'); }, 15_000);

        iframe.addEventListener('load', () => {
            loaded = true;
            clearTimeout(failTimer);
            status.classList.remove('on');
            setTimeout(() => status.remove(), 300);
            try {
                const t = iframe.contentDocument?.title;
                currentTitle = t || new URL(target).hostname;
            } catch {
                currentTitle = new URL(target).hostname;
            }
            win.setTitle(currentTitle.toUpperCase().slice(0, 40));
        });
        iframe.addEventListener('error', () => showError('iframe failed to load.'));

        if (pushHistory) {
            history = history.slice(0, histIdx + 1);
            history.push(target);
            histIdx = history.length - 1;
        }
        updateNav();
        sendEvent('browse', target);
    }

    function showError(detail, { blockSelf = false } = {}) {
        if (iframe) { iframe.remove(); iframe = null; }
        const nextMode = mode === 'direct' ? 'PROXY' : 'DIRECT';
        view.innerHTML = `
            <div class="browser-error">
                <h2>${blockSelf ? 'BLOCKED' : 'CONNECTION REFUSED'}</h2>
                <div class="detail">${blockSelf ? 'Self-referential URL rejected.' : 'ROUTING VIA BACKUP…'}</div>
                <div class="detail">${detail}</div>
                ${blockSelf ? '' : `<button class="hover-target">Retry via ${nextMode}</button>`}
            </div>
        `;
        setStatus('error');
        const retry = view.querySelector('button');
        if (retry) retry.addEventListener('click', () => {
            setMode(mode === 'direct' ? 'proxy' : 'direct');
            navigate(urlInput.value, { pushHistory: false });
        });
    }

    function updateNav() {
        backBtn.disabled = histIdx <= 0;
        fwdBtn.disabled = histIdx >= history.length - 1;
    }

    function setMode(m) {
        mode = m;
        modeDirect.classList.toggle('on', m === 'direct');
        modeProxy.classList.toggle('on', m === 'proxy');
    }

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigate(urlInput.value);
    });
    urlInput.addEventListener('focus', () => urlInput.select());
    backBtn.addEventListener('click', () => { if (histIdx > 0) { histIdx--; navigate(history[histIdx], { pushHistory: false }); } });
    fwdBtn.addEventListener('click', () => { if (histIdx < history.length - 1) { histIdx++; navigate(history[histIdx], { pushHistory: false }); } });
    reloadBtn.addEventListener('click', () => {
        if (iframe && iframe.src) { const s = iframe.src; iframe.src = 'about:blank'; requestAnimationFrame(() => { iframe.src = s; }); }
        else if (urlInput.value) navigate(urlInput.value, { pushHistory: false });
    });
    homeBtn.addEventListener('click', renderEmpty);
    modeDirect.addEventListener('click', () => setMode('direct'));
    modeProxy.addEventListener('click', () => setMode('proxy'));

    const win = createWindow({
        id: `browser-${Date.now()}`,
        title: 'NEW TAB',
        icon: '◉',
        width: 1100,
        height: 700,
        content: body,
        onBeforeClose: () => {
            if (iframe) { try { iframe.src = 'about:blank'; } catch {} iframe.remove(); iframe = null; }
        },
    });

    if (initialUrl) navigate(initialUrl);
    else renderEmpty();

    return win;
}
