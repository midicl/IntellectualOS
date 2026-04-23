// Phase 2 — Stealth suite: cloaking, theme swatches, persistence

const STORAGE_KEY = 'intellectual.config';

// 20 accent swatches. Primary is first (--accent: #004cff).
export const SWATCHES = [
    { name: 'Intel Blue',    hex: '#004cff' },
    { name: 'Azure',         hex: '#00a2ff' },
    { name: 'Cyan',          hex: '#00e5ff' },
    { name: 'Teal',          hex: '#14b8a6' },
    { name: 'Green',         hex: '#22c55e' },
    { name: 'Lime',          hex: '#84cc16' },
    { name: 'Yellow',        hex: '#facc15' },
    { name: 'Amber',         hex: '#f59e0b' },
    { name: 'Orange',        hex: '#f97316' },
    { name: 'Red',           hex: '#ef4444' },
    { name: 'Pink',          hex: '#ec4899' },
    { name: 'Magenta',       hex: '#d946ef' },
    { name: 'Purple',        hex: '#a855f7' },
    { name: 'Indigo',        hex: '#6366f1' },
    { name: 'Violet',        hex: '#7c3aed' },
    { name: 'Rose',          hex: '#f43f5e' },
    { name: 'Emerald',       hex: '#10b981' },
    { name: 'Sky',           hex: '#0ea5e9' },
    { name: 'Slate',         hex: '#64748b' },
    { name: 'Platinum',      hex: '#e2e8f0' },
];

export const CLOAKS = {
    off:       { title: 'Intellectual OS', icon: 'default' },
    classroom: { title: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
    drive:     { title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    docs:      { title: 'Untitled document - Google Docs', icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico' },
    nyt:       { title: 'The New York Times - Breaking News', icon: 'https://www.nytimes.com/favicon.ico' },
    wikipedia: { title: 'Wikipedia', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
};

const DEFAULTS = {
    accent: '#004cff',
    cloak: 'off',
    email: '',
};

let config = { ...DEFAULTS };
const listeners = new Set();

export function loadConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) config = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {}
    applyConfig();
    return config;
}

export function saveConfig(patch = {}) {
    config = { ...config, ...patch };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
    applyConfig();
    listeners.forEach((fn) => fn(config));
}

export function onConfigChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getConfig() { return { ...config }; }

function applyConfig() {
    // Accent color → CSS vars
    const root = document.documentElement;
    root.style.setProperty('--accent', config.accent);
    root.style.setProperty('--accent-soft', hexToRgba(config.accent, 0.35));
    root.style.setProperty('--accent-faint', hexToRgba(config.accent, 0.12));

    // Cloaking
    const cloak = CLOAKS[config.cloak] || CLOAKS.off;
    document.getElementById('page-title').textContent = cloak.title;
    if (config.cloak !== 'off' && cloak.icon !== 'default') {
        document.getElementById('favicon').href = cloak.icon;
    } else {
        document.getElementById('favicon').href =
            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
            "<rect width='64' height='64' rx='14' fill='%23000105'/>" +
            `<path d='M14 32h36M32 14v36' stroke='${encodeURIComponent(config.accent)}' stroke-width='2'/></svg>`;
    }
}

function hexToRgba(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// ── Settings window content ──────────────────────────────────
export function buildSettingsPanel() {
    const root = document.createElement('div');
    root.className = 'app-settings';
    root.innerHTML = `
        <nav class="settings-nav">
            <button class="tab on hover-target" data-tab="stealth">Stealth</button>
            <button class="tab hover-target" data-tab="appearance">Appearance</button>
            <button class="tab hover-target" data-tab="persistence">Data</button>
            <button class="tab hover-target" data-tab="about">About</button>
        </nav>
        <div class="settings-panel">
            <div data-panel="stealth">
                <h3>Stealth / Cloaking</h3>
                <p>Disguise the browser tab so a casual glance shows something else. Icon and title change live.</p>
                <div class="row">
                    <div>
                        <div class="label">Tab Cloak</div>
                        <div class="desc">Select what the tab should impersonate.</div>
                    </div>
                    <select class="select-native hover-target" id="cloak-select">
                        ${Object.entries(CLOAKS).map(([k, v]) =>
                            `<option value="${k}">${v.title}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="row">
                    <div>
                        <div class="label">Panic Key</div>
                        <div class="desc">Tap <b>\`</b> (backtick) to instantly swap in the chosen cloak.</div>
                    </div>
                    <button class="btn-ghost hover-target" id="test-panic">Test</button>
                </div>
            </div>

            <div data-panel="appearance" hidden>
                <h3>Accent Color</h3>
                <p>20 swatches. The system glow, focus rings, and boot logs inherit this.</p>
                <div class="swatches" id="swatches"></div>
            </div>

            <div data-panel="persistence" hidden>
                <h3>Config Persistence</h3>
                <p>Your settings live in <code>localStorage</code>. Back them up or move them to another device.</p>
                <div class="row">
                    <div>
                        <div class="label">Export</div>
                        <div class="desc">Download the current config as JSON.</div>
                    </div>
                    <button class="btn-primary hover-target" id="cfg-export">Download</button>
                </div>
                <div class="row">
                    <div>
                        <div class="label">Import</div>
                        <div class="desc">Restore from a previously exported file.</div>
                    </div>
                    <button class="btn-ghost hover-target" id="cfg-import">Choose File</button>
                </div>
                <div class="row">
                    <div>
                        <div class="label">Reset</div>
                        <div class="desc">Wipe config and return to defaults. You'll be logged out.</div>
                    </div>
                    <button class="btn-ghost hover-target" id="cfg-reset">Reset</button>
                </div>
            </div>

            <div data-panel="about" hidden>
                <h3>Intellectual OS</h3>
                <p>v1.1 // Ultra-modern glassmorphism shell.<br/>Games indexed via <code>gn-math.github.io</code>. Proxy pool: Webshare residential ×10.</p>
                <div class="hstack">
                    <a class="btn-ghost hover-target" href="https://discord.gg/intelligent" target="_blank" rel="noopener">Discord</a>
                </div>
            </div>
        </div>
    `;

    // Tabs
    const tabs = root.querySelectorAll('[data-tab]');
    const panels = root.querySelectorAll('[data-panel]');
    tabs.forEach((t) => t.addEventListener('click', () => {
        tabs.forEach((x) => x.classList.remove('on'));
        t.classList.add('on');
        panels.forEach((p) => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    }));

    // Cloak
    const cloakSel = root.querySelector('#cloak-select');
    cloakSel.value = config.cloak;
    cloakSel.addEventListener('change', () => saveConfig({ cloak: cloakSel.value }));
    root.querySelector('#test-panic').addEventListener('click', triggerPanic);

    // Swatches
    const sw = root.querySelector('#swatches');
    SWATCHES.forEach((c) => {
        const s = document.createElement('button');
        s.className = 'swatch hover-target';
        s.style.background = c.hex;
        s.style.color = c.hex;
        s.title = c.name;
        if (c.hex.toLowerCase() === config.accent.toLowerCase()) s.classList.add('on');
        s.addEventListener('click', () => {
            sw.querySelectorAll('.swatch').forEach((x) => x.classList.remove('on'));
            s.classList.add('on');
            saveConfig({ accent: c.hex });
        });
        sw.appendChild(s);
    });

    // Persistence
    root.querySelector('#cfg-export').addEventListener('click', exportConfig);
    root.querySelector('#cfg-import').addEventListener('click', importConfig);
    root.querySelector('#cfg-reset').addEventListener('click', () => {
        if (!confirm('Reset all settings?')) return;
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    });

    return root;
}

function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'intellectual-config.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = () => {
            try {
                const parsed = JSON.parse(r.result);
                saveConfig(parsed);
                alert('Config imported.');
            } catch (e) { alert('Invalid config file: ' + e.message); }
        };
        r.readAsText(file);
    };
    input.click();
}

// Panic / cloak quick-toggle (backtick)
let originalCloak = null;
function triggerPanic() {
    const cloak = CLOAKS[config.cloak] || CLOAKS.classroom;
    // briefly flash to show it worked
    document.title = cloak.title;
    document.getElementById('favicon').href = cloak.icon !== 'default' ? cloak.icon : document.getElementById('favicon').href;
}

document.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.target.matches('input, textarea')) {
        const current = config.cloak;
        if (current === 'off') saveConfig({ cloak: 'classroom' });
        else { originalCloak = current; saveConfig({ cloak: 'off' }); }
    }
});
