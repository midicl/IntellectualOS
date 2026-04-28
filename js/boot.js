// Phase 1 — Boot sequence: typed kernel logs, rain, ENTER transition

import { startRain } from './rain.js';

const boot = document.getElementById('boot');
const logTarget = document.getElementById('log-target');
const enterBtn = document.getElementById('enter-btn');

const LOGS = [
    { t: 'ok',   line: 'boot v4.0.2 — intellectual systems, est. whenever' },
    { t: 'ok',   line: 'microcode patched (0x00A21F9B) — yes, again' },
    { t: 'ok',   line: 'cpu: i9-16900K @ 6.20GHz · cores hot, fans pretending' },
    { t: 'ok',   line: 'ram: 64 GiB DDR5-7200 ECC · plenty of room to overthink' },
    { t: 'ok',   line: 'gpu: RTX 5090 Ti · 32 GiB vram, mostly for tabs' },
    { t: 'ok',   line: 'mount / · ext4 · clean shutdown last time, somehow' },
    { t: 'ok',   line: 'mount /home · btrfs · snapshots: 47, regrets: 0' },
    { t: 'ok',   line: 'kernel modules: net_core, crypto_aes, io_uring' },
    { t: 'info', line: 'reaching out to the rest of the world…' },
    { t: 'ok',   line: 'tls handshake → primary gateway · clean' },
    { t: 'ok',   line: 'tls handshake → fallback gateway · also clean' },
    { t: 'ok',   line: 'webshare pool: 10 residential exits ready to lie about you' },
    { t: 'info', line: 'binding discord.gg/intelligent' },
    { t: 'success', line: 'connected — discord.gg/intelligent' },
    { t: 'ok',   line: 'stealth layer armed [mask = google classroom]' },
    { t: 'ok',   line: 'compositor: 60hz · vsync on · no tears tonight' },
    { t: 'ok',   line: 'games index: 685 titles synced from gn-math' },
    { t: 'warn', line: 'heads-up: content filter watchdog is awake' },
    { t: 'ok',   line: 'all systems within nominal sass tolerance' },
    { t: 'success', line: 'boot complete. waiting on you.' },
];

function writeLog({ t, line }) {
    const el = document.createElement('div');
    el.className = `line ${t === 'ok' ? 'ok' : t}`;
    el.innerHTML = `<span class="prompt">::</span><span class="text"></span>`;
    logTarget.appendChild(el);
    const textEl = el.querySelector('.text');
    return new Promise((resolve) => {
        let i = 0;
        const tick = () => {
            textEl.textContent += line[i++];
            if (i < line.length) setTimeout(tick, 8 + Math.random() * 10);
            else resolve();
        };
        tick();
        // autoscroll terminal
        logTarget.parentElement.scrollTop = logTarget.parentElement.scrollHeight;
    });
}

async function runLogs() {
    for (let i = 0; i < LOGS.length; i++) {
        await writeLog(LOGS[i]);
        // trim terminal so it stays compact (keep last 10 visible)
        const lines = logTarget.children;
        if (lines.length > 10) lines[0].remove();
        await new Promise((r) => setTimeout(r, 60 + Math.random() * 100));
    }
}

export async function startBoot() {
    // reveal ASCII + terminal
    boot.classList.add('ready');
    // small pause so the brand shows first
    await new Promise((r) => setTimeout(r, 550));
    await runLogs();
    // Rain starts after logs finish
    startRain();
    boot.classList.add('done');
}

export function onEnter(callback) {
    enterBtn.addEventListener('click', () => callback(), { once: true });
}

export async function bootFadeOut() {
    return new Promise((resolve) => {
        const blackout = document.getElementById('blackout');
        blackout.classList.add('on');
        setTimeout(() => {
            boot.style.display = 'none';
            resolve();
        }, 2000);
    });
}

export function bootFadeIn() {
    const blackout = document.getElementById('blackout');
    blackout.classList.remove('on');
}
