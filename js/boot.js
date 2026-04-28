// Phase 1 — Boot sequence: typed kernel logs, rain, ENTER transition

import { startRain } from './rain.js';

const boot = document.getElementById('boot');
const logTarget = document.getElementById('log-target');
const enterBtn = document.getElementById('enter-btn');

const LOGS = [
    { t: 'ok',   line: 'BOOT_LOADER v4.0.2 // Intellectual Systems' },
    { t: 'ok',   line: 'LOADING_MICROCODE... patch 0x00A21F9B' },
    { t: 'ok',   line: 'CPU: Intel(R) Core(TM) i9-16900K @ 6.20GHz' },
    { t: 'ok',   line: 'RAM: 64GiB DDR5-7200 [ECC ENABLED]' },
    { t: 'ok',   line: 'GPU: RTX 5090 Ti // VRAM 32GiB' },
    { t: 'ok',   line: 'MOUNT /dev/sda1 → /          [ext4]' },
    { t: 'ok',   line: 'MOUNT /dev/sda2 → /home      [btrfs]' },
    { t: 'ok',   line: 'INIT_KERNEL_MODULES: net_core, crypto_aes, io_uring' },
    { t: 'info', line: 'LINKING_EXTERNAL_PROTOCOLS...' },
    { t: 'ok',   line: 'TLS_HANDSHAKE: primary_gateway → OK' },
    { t: 'ok',   line: 'TLS_HANDSHAKE: fallback_gateway → OK' },
    { t: 'ok',   line: 'WEBSHARE_POOL: 10 residential exits ready' },
    { t: 'info', line: 'BINDING discord.gg/intelligent' },
    { t: 'success', line: 'SUCCESS: discord.gg/intelligent' },
    { t: 'ok',   line: 'STEALTH_LAYER: active [mask=google_classroom]' },
    { t: 'ok',   line: 'WINDOW_COMPOSITOR: 60hz // vsync ON' },
    { t: 'ok',   line: 'GAMES_INDEX: 39 titles synchronized from gn-math' },
    { t: 'warn', line: 'NOTICE: content_filter DNS watchdog engaged' },
    { t: 'ok',   line: 'SYSTEM_STABLE.' },
    { t: 'success', line: 'BOOT_COMPLETE. Awaiting operator.' },
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
