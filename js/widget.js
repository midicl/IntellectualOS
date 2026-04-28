// Floating system widget — clock, system info, presence count.
// Sits in the top-right (under the topbar) and pulses subtly.

import { fetchOnlineCount } from './app-bus.js';

const SYS_FACTS = [
    'Intel i9-16900K @ 6.20GHz',
    '64 GiB DDR5-7200 ECC',
    'NVMe Gen5 ×4',
    'RTX 5090 Ti / 32GiB',
    '10 residential exits',
    '685 titles cached',
    '60 fps compositor',
];

let widget = null;

export function initWidget() {
    widget = document.createElement('div');
    widget.id = 'sys-widget';
    widget.innerHTML = `
        <div class="sw-clock-wrap">
            <div class="sw-time" id="sw-time">--:--</div>
            <div class="sw-date" id="sw-date">—</div>
        </div>
        <div class="sw-divider"></div>
        <div class="sw-stats">
            <div class="sw-row"><span class="sw-key">USERS</span><span class="sw-val" id="sw-online">0</span></div>
            <div class="sw-row"><span class="sw-key">UPTIME</span><span class="sw-val" id="sw-uptime">0m</span></div>
            <div class="sw-row"><span class="sw-key">FPS</span><span class="sw-val" id="sw-fps">60</span></div>
        </div>
        <div class="sw-fact" id="sw-fact">${SYS_FACTS[0]}</div>
    `;
    document.getElementById('desktop').appendChild(widget);

    paint();
    setInterval(paint, 1000);

    // Cycle facts every 5s
    let factIdx = 0;
    setInterval(() => {
        factIdx = (factIdx + 1) % SYS_FACTS.length;
        const el = widget.querySelector('#sw-fact');
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = SYS_FACTS[factIdx];
            el.style.opacity = '1';
        }, 250);
    }, 5000);

    // Lightweight FPS counter — only runs when the tab is visible, and only
    // touches the DOM once per second.
    let lastT = performance.now();
    let frames = 0;
    function fpsTick(now) {
        if (document.hidden) {
            lastT = now; frames = 0;
            requestAnimationFrame(fpsTick);
            return;
        }
        frames++;
        if (now - lastT >= 1000) {
            const fps = Math.round((frames * 1000) / (now - lastT));
            const el = widget.querySelector('#sw-fps');
            if (el) el.textContent = String(Math.min(fps, 60));
            frames = 0; lastT = now;
        }
        requestAnimationFrame(fpsTick);
    }
    requestAnimationFrame(fpsTick);

    // Refresh online count every 30s
    setInterval(refreshOnline, 30_000);
    refreshOnline();
}

const startedAt = Date.now();

function paint() {
    if (!widget) return;
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    widget.querySelector('#sw-time').textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    widget.querySelector('#sw-date').textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const upMin = Math.floor((Date.now() - startedAt) / 60_000);
    const upSec = Math.floor((Date.now() - startedAt) / 1000) % 60;
    const el = widget.querySelector('#sw-uptime');
    if (el) el.textContent = upMin > 0 ? `${upMin}m ${upSec}s` : `${upSec}s`;
}

async function refreshOnline() {
    try {
        const r = await fetchOnlineCount();
        const el = widget?.querySelector('#sw-online');
        if (el && r?.online !== undefined) el.textContent = String(r.online);
    } catch {}
}
