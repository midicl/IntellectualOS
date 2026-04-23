// Phase 3 — Intellectual Browser: URL bar, shield status, iframe loader, history
import { createWindow } from './windows.js';
import { sendEvent } from './app-bus.js';

const QUICK = [
    { name: 'Google',    url: 'https://www.google.com/webhp?igu=1' },
    { name: 'YouTube',   url: 'https://www.youtube.com/embed/' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page' },
    { name: 'Maps',      url: 'https://www.openstreetmap.org/' },
    { name: 'Duck',      url: 'https://duckduckgo.com/' },
    { name: 'Reddit',    url: 'https://old.reddit.com/' },
];

function normalize(input) {
    let v = input.trim();
    if (!v) return '';
    // search if no dot / no scheme
    if (!v.includes('://')) {
        if (!/\.[a-z]{2,}/i.test(v)) {
            return `https://duckduckgo.com/?q=${encodeURIComponent(v)}`;
        }
        v = 'https://' + v;
    }
    return v;
}

function proxyUrl(target) {
    // Backend route (index.js /proxy) returns the upstream HTML through a Webshare exit.
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

            <div class="url-wrap">
                <div class="shield direct" title="Direct">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 4v6c0 5-3.5 9.2-8 10-4.5-.8-8-5-8-10V6l8-4z"/></svg>
                </div>
                <input class="url hover-target" placeholder="Enter URL or search…" />
            </div>

            <div class="mode-toggle" title="Toggle routing through Webshare proxy pool">
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
    const modeDirect = body.querySelector('.mode-direct');
    const modeProxy = body.querySelector('.mode-proxy');

    let iframe = null;
    let mode = 'direct';        // 'direct' | 'proxy'
    let history = [];
    let histIdx = -1;
    let currentTitle = 'NEW TAB';

    function renderEmpty() {
        if (iframe) { iframe.remove(); iframe = null; }
        view.innerHTML = `
            <div class="browser-empty">
                <h2>INTELLECTUAL · BROWSER</h2>
                <div class="hint">TYPE A URL, OR PICK A SHORTCUT</div>
                <div class="quick">
                    ${QUICK.map((q) => `<a href="#" data-url="${q.url}" class="hover-target">${q.name}</a>`).join('')}
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

        urlInput.value = target;
        const src = mode === 'proxy' ? proxyUrl(target) : target;

        // Destroy previous iframe (free RAM)
        if (iframe) { try { iframe.src = 'about:blank'; } catch {} iframe.remove(); iframe = null; }
        view.innerHTML = '';

        iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.referrerPolicy = 'no-referrer';
        iframe.setAttribute('allowfullscreen', '');
        iframe.allow = 'autoplay; fullscreen; clipboard-read; clipboard-write';
        iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation';
        view.appendChild(iframe);

        setStatus(mode === 'proxy' ? 'proxied' : 'direct');

        const status = document.createElement('div');
        status.className = 'browser-status on';
        status.textContent = `Loading ${target}`;
        view.appendChild(status);

        let loaded = false;
        const failTimer = setTimeout(() => { if (!loaded) showError('Timeout — the site did not respond.'); }, 15_000);

        iframe.addEventListener('load', () => {
            loaded = true;
            clearTimeout(failTimer);
            status.classList.remove('on');
            setTimeout(() => status.remove(), 300);
            try {
                // Many sites block framing; this will throw. We fall back to the URL host.
                const t = iframe.contentDocument?.title;
                currentTitle = t || new URL(target).hostname;
            } catch {
                currentTitle = new URL(target).hostname;
            }
            win.setTitle(currentTitle.toUpperCase().slice(0, 40));
        });

        iframe.addEventListener('error', () => showError('iframe error'));

        if (pushHistory) {
            history = history.slice(0, histIdx + 1);
            history.push(target);
            histIdx = history.length - 1;
        }
        updateNav();
        sendEvent('browse', target);
    }

    function showError(detail) {
        if (iframe) { iframe.remove(); iframe = null; }
        view.innerHTML = `
            <div class="browser-error">
                <h2>CONNECTION REFUSED</h2>
                <div class="detail">ROUTING VIA BACKUP…</div>
                <div class="detail">${detail}</div>
                <button class="hover-target">Retry via ${mode === 'direct' ? 'proxy' : 'direct'}</button>
            </div>
        `;
        setStatus('error');
        view.querySelector('button').addEventListener('click', () => {
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

    // Events
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigate(urlInput.value);
    });
    backBtn.addEventListener('click', () => { if (histIdx > 0) { histIdx--; navigate(history[histIdx], { pushHistory: false }); } });
    fwdBtn.addEventListener('click', () => { if (histIdx < history.length - 1) { histIdx++; navigate(history[histIdx], { pushHistory: false }); } });
    reloadBtn.addEventListener('click', () => { if (iframe) iframe.src = iframe.src; else if (urlInput.value) navigate(urlInput.value, { pushHistory: false }); });
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
