// Desktop icon system — draggable, persistent, double-click to launch.
// Right-click on icon for context menu, right-click on empty desktop for desktop menu.

import { registerContext } from './contextmenu.js';
import { saveConfig, getConfig } from './settings.js';

const POSITION_KEY = 'intellectual.desktop.icons';

const ICON_DEFS = {
    browser:  { label: 'Browser',     icon: '◉', launcher: () => import('./browser.js').then((m) => m.openBrowser()) },
    games:    { label: 'Infinity',    icon: '◈', launcher: () => import('./games.js').then((m) => m.buildGamesPanel().then((p) => openWindow('games', 'INFINITY', '◈', p, 1100, 720))) },
    terminal: { label: 'Terminal',    icon: '❯', launcher: () => import('./terminal.js').then((m) => m.openTerminal()) },
    ai:       { label: 'Intellectual AI', icon: '❋', launcher: () => import('./ai.js').then((m) => m.openAI()) },
    spotify:  { label: 'Spotify',     icon: '♫', launcher: () => import('./spotify.js').then((m) => m.openSpotify()) },
    settings: { label: 'Settings',    icon: '⚙', launcher: () => import('./settings.js').then((m) => openWindow('settings', 'SETTINGS', '⚙', m.buildSettingsPanel(), 760, 560)) },
};

async function openWindow(id, title, icon, content, w, h) {
    const { createWindow } = await import('./windows.js');
    return createWindow({ id, title, icon, content, width: w, height: h });
}

function loadPositions() {
    try { return JSON.parse(localStorage.getItem(POSITION_KEY) || '{}'); } catch { return {}; }
}
function savePositions(positions) {
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(positions)); } catch {}
}

const ICON_W = 88;
const ICON_H = 96;
const PAD_TOP = 56;     // below topbar
const PAD_LEFT = 24;
const GRID_GAP = 12;

function defaultPosition(index) {
    const col = Math.floor(index / 6);
    const row = index % 6;
    return {
        x: PAD_LEFT + col * (ICON_W + GRID_GAP),
        y: PAD_TOP + row * (ICON_H + GRID_GAP),
    };
}

let layer = null;
let icons = new Map(); // id -> { el, position }
let positions = {};
let selected = null;

export function initDesktop() {
    layer = document.getElementById('desktop-icons');
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'desktop-icons';
        const desktop = document.getElementById('desktop');
        // Insert before #window-layer so windows still render on top
        desktop.insertBefore(layer, desktop.querySelector('#window-layer'));
    }
    positions = loadPositions();
    Object.entries(ICON_DEFS).forEach(([id, def], idx) => {
        const pos = positions[id] || defaultPosition(idx);
        positions[id] = pos;
        addIcon(id, def, pos);
    });

    // Click empty desktop to deselect
    layer.addEventListener('pointerdown', (e) => {
        if (e.target === layer) deselect();
    });

    // Right-click on empty desktop
    registerContext(layer, (e) => {
        if (e.target !== layer) return null;
        return [
            { icon: '◉', label: 'New Browser', action: () => ICON_DEFS.browser.launcher() },
            { icon: '◈', label: 'Open Games',  action: () => ICON_DEFS.games.launcher() },
            { icon: '❯', label: 'Open Terminal', action: () => ICON_DEFS.terminal.launcher() },
            { separator: true },
            { icon: '🖼', label: 'Change Wallpaper', action: () => openSettingsTab('wallpaper') },
            { icon: '🎨', label: 'Change Accent',    action: () => openSettingsTab('appearance') },
            { icon: '⚙', label: 'Settings', action: () => ICON_DEFS.settings.launcher() },
            { separator: true },
            { icon: '↻', label: 'Reload Page', action: () => location.reload(), shortcut: 'F5' },
            { icon: '↺', label: 'Reset Icon Layout', action: resetLayout },
        ];
    });
}

function deselect() {
    if (selected) {
        selected.classList.remove('selected');
        selected = null;
    }
}

function addIcon(id, def, pos) {
    const el = document.createElement('button');
    el.className = 'desk-icon hover-target';
    el.dataset.id = id;
    el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    el.innerHTML = `
        <div class="desk-glyph">${def.icon}</div>
        <div class="desk-label">${def.label}</div>
    `;
    layer.appendChild(el);
    icons.set(id, { el, position: pos });

    // Drag
    let drag = null;
    let didDrag = false;
    el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        deselect();
        el.classList.add('selected');
        selected = el;
        el.setPointerCapture(e.pointerId);
        drag = {
            ox: pos.x, oy: pos.y,
            sx: e.clientX, sy: e.clientY,
            pid: e.pointerId,
        };
        didDrag = false;
    });
    el.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (!didDrag && Math.hypot(dx, dy) < 4) return;
        didDrag = true;
        pos.x = drag.ox + dx;
        pos.y = drag.oy + dy;
        // Constrain to viewport
        pos.x = Math.max(8, Math.min(window.innerWidth - ICON_W - 8, pos.x));
        pos.y = Math.max(PAD_TOP - 16, Math.min(window.innerHeight - ICON_H - 100, pos.y));
        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    });
    el.addEventListener('pointerup', (e) => {
        if (!drag) return;
        el.releasePointerCapture(drag.pid);
        if (didDrag) {
            positions[id] = { x: pos.x, y: pos.y };
            savePositions(positions);
        }
        drag = null;
    });
    el.addEventListener('pointercancel', () => { drag = null; });

    // Double-click to launch
    el.addEventListener('dblclick', (e) => {
        e.preventDefault();
        def.launcher();
    });
    // Single click = select; Enter/Space launches
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); def.launcher(); }
    });

    // Right-click on icon
    registerContext(el, () => [
        { icon: def.icon, label: `Open ${def.label}`, action: def.launcher },
        { separator: true },
        { icon: '↺', label: 'Reset position', action: () => {
            const idx = Object.keys(ICON_DEFS).indexOf(id);
            const def2 = defaultPosition(idx);
            pos.x = def2.x; pos.y = def2.y;
            el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            positions[id] = def2;
            savePositions(positions);
        }},
    ]);
}

function resetLayout() {
    Object.entries(ICON_DEFS).forEach(([id, _], idx) => {
        const pos = defaultPosition(idx);
        positions[id] = pos;
        const ic = icons.get(id);
        if (ic) {
            ic.position = pos;
            ic.el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        }
    });
    savePositions(positions);
}

async function openSettingsTab(tab) {
    const { buildSettingsPanel } = await import('./settings.js');
    const panel = buildSettingsPanel();
    const { createWindow } = await import('./windows.js');
    createWindow({ id: 'settings', title: 'SETTINGS', icon: '⚙', width: 760, height: 560, content: panel });
    // Switch to the requested tab
    setTimeout(() => {
        const t = panel.querySelector(`[data-tab="${tab}"]`);
        if (t) t.click();
    }, 50);
}
