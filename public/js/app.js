// Entry point — state machine: boot → login → desktop

import './cursor.js';
import { startBoot, onEnter, bootFadeOut, bootFadeIn } from './boot.js';
import { loadConfig, saveConfig, getConfig, buildSettingsPanel } from './settings.js';
import { createWindow, listWindows } from './windows.js';
import { buildGamesPanel } from './games.js';
import { openBrowser } from './browser.js';
import { loginCheck, setEmail, startHeartbeat, sendEvent, fetchOnlineCount } from './app-bus.js';

// ── Init config first (paints accent color + cloak) ────────────
loadConfig();

// ── Clock ──────────────────────────────────────────────────────
function paintClock() {
    const el = document.getElementById('top-clock');
    if (!el) return;
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}`;
}
paintClock();
setInterval(paintClock, 20_000);

// ── Phase 1: Bootloader ────────────────────────────────────────
startBoot();

onEnter(async () => {
    sendEvent('boot-complete', '');
    await bootFadeOut();
    showLogin();
    bootFadeIn();
});

// ── Phase 2: Login ─────────────────────────────────────────────
const loginSection = document.getElementById('login');
const emailInput = document.getElementById('login-email');
const loginBtn = document.getElementById('login-submit');
const loginMsg = document.getElementById('login-msg');

function showLogin() {
    loginSection.classList.add('on');
    // Pre-fill if we already have an email
    const existing = getConfig().email;
    if (existing) emailInput.value = existing;
    emailInput.focus();
}

async function attemptLogin() {
    const em = emailInput.value.trim().toLowerCase();
    if (!em || !em.includes('@')) {
        loginMsg.textContent = 'Access key invalid.';
        loginMsg.classList.add('on');
        return;
    }
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying…';
    const r = await loginCheck(em);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Authenticate';
    if (r.ok === false && r.blacklisted) {
        loginMsg.textContent = 'Access revoked.';
        loginMsg.classList.add('on');
        return;
    }
    // Note: if backend is down we still proceed (offline mode)
    saveConfig({ email: em });
    setEmail(em);
    document.getElementById('top-user').textContent = em;
    sendEvent('login', '');
    startHeartbeat();
    fetchOnlineCount();
    enterDesktop();
}

loginBtn.addEventListener('click', attemptLogin);
emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });

// ── Desktop ────────────────────────────────────────────────────
function enterDesktop() {
    loginSection.classList.remove('on');
    setTimeout(() => { loginSection.style.display = 'none'; }, 600);
    document.getElementById('desktop').classList.add('on');
}

// Dock wiring — click opens app; active dot reflects any open windows of that app
document.querySelectorAll('#dock .dock-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const app = btn.dataset.app;
        if (app === 'browser') openBrowser();
        else if (app === 'games') openGames();
        else if (app === 'settings') openSettings();
    });
});

function openGames() {
    const panel = buildGamesPanel();
    createWindow({ id: 'games', title: 'INFINITY', icon: '◈', width: 1040, height: 680, content: panel });
    updateDockActive();
}
function openSettings() {
    const panel = buildSettingsPanel();
    createWindow({ id: 'settings', title: 'SETTINGS', icon: '⚙', width: 760, height: 560, content: panel });
    updateDockActive();
}

// Refresh dock active-state every 500ms (cheap; checks if app windows exist)
function updateDockActive() {
    const ids = new Set(listWindows().map((w) => w.id));
    document.querySelectorAll('#dock .dock-btn').forEach((btn) => {
        const app = btn.dataset.app;
        const has =
            (app === 'games'    && ids.has('games')) ||
            (app === 'settings' && ids.has('settings')) ||
            (app === 'browser'  && [...ids].some((id) => id.startsWith('browser-')));
        btn.classList.toggle('active', has);
    });
}
setInterval(updateDockActive, 500);

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openBrowser(); }
    if (e.key === 'g' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openGames(); }
    if (e.key === ',' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openSettings(); }
});

// Periodic online count refresh
setInterval(() => {
    if (getConfig().email) fetchOnlineCount();
}, 30_000);
