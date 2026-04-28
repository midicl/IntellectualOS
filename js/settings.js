// Phase 2 — Stealth suite: cloaking, full-palette theming, wallpapers, persistence

const STORAGE_KEY = 'intellectual.config';

// 20 accent swatches. Each swatch becomes the full system color.
export const SWATCHES = [
    { name: 'Intel Blue', hex: '#004cff' },
    { name: 'Azure',      hex: '#00a2ff' },
    { name: 'Cyan',       hex: '#00e5ff' },
    { name: 'Teal',       hex: '#14b8a6' },
    { name: 'Mint',       hex: '#2dd4bf' },
    { name: 'Green',      hex: '#22c55e' },
    { name: 'Lime',       hex: '#84cc16' },
    { name: 'Yellow',     hex: '#facc15' },
    { name: 'Amber',      hex: '#f59e0b' },
    { name: 'Orange',     hex: '#f97316' },
    { name: 'Red',        hex: '#ef4444' },
    { name: 'Rose',       hex: '#f43f5e' },
    { name: 'Pink',       hex: '#ec4899' },
    { name: 'Magenta',    hex: '#d946ef' },
    { name: 'Purple',     hex: '#a855f7' },
    { name: 'Violet',     hex: '#7c3aed' },
    { name: 'Indigo',     hex: '#6366f1' },
    { name: 'Sky',        hex: '#0ea5e9' },
    { name: 'Slate',      hex: '#64748b' },
    { name: 'Platinum',   hex: '#e2e8f0' },
];

export const CLOAKS = {
    off:       { title: 'Intellectual OS', icon: 'default' },
    classroom: { title: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
    drive:     { title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    docs:      { title: 'Untitled document - Google Docs', icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023q4.ico' },
    gmail:     { title: 'Inbox (1) - Gmail', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico' },
    wikipedia: { title: 'Wikipedia', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' },
    nyt:       { title: 'The New York Times - Breaking News', icon: 'https://www.nytimes.com/favicon.ico' },
    khan:      { title: 'Khan Academy | Free Online Courses', icon: 'https://cdn.kastatic.org/images/favicon.ico' },
};

// Curated wallpapers. `preset` maps to a CSS gradient/pattern; `custom` stores a data URL.
export const WALLPAPERS = [
    { id: 'aurora',   name: 'Aurora',    preview: 'radial-gradient(ellipse at 20% 10%, #004cff33, transparent 55%), radial-gradient(ellipse at 80% 90%, #00a2ff22, transparent 60%), #000105' },
    { id: 'void',     name: 'Void',      preview: '#000' },
    { id: 'grid',     name: 'Grid',      preview: 'repeating-linear-gradient(0deg, transparent 0 47px, #004cff22 47px 48px), repeating-linear-gradient(90deg, transparent 0 47px, #004cff22 47px 48px), #000105' },
    { id: 'cyber',    name: 'Cyber',     preview: 'linear-gradient(180deg, #000 0%, #0a0420 60%, #2b0a4a 100%)' },
    { id: 'nebula',   name: 'Nebula',    preview: 'radial-gradient(ellipse at 30% 70%, #7c3aed55, transparent 50%), radial-gradient(ellipse at 70% 30%, #ec489955, transparent 50%), #0a051a' },
    { id: 'horizon',  name: 'Horizon',   preview: 'linear-gradient(180deg, #000 0%, #001230 50%, #ff006055 90%, #000 100%)' },
    { id: 'matrix',   name: 'Matrix',    preview: 'radial-gradient(ellipse at center, #00330055, transparent 60%), #000502' },
    { id: 'sunset',   name: 'Sunset',    preview: 'linear-gradient(180deg, #1a0a2e 0%, #4a1040 50%, #c73866 100%)' },
];

// Console / terminal themes — affect boot screen + any .terminal-surface element.
// Each theme defines CSS vars consumed by the terminal styles.
export const CONSOLE_THEMES = {
    intel:    { name: 'Intel',      fg: '#cbd5e1', accent: '#00a2ff', bg: 'rgba(0,2,8,0.92)',  prompt: '#00a2ff', ok: '#22c55e', warn: '#fbbf24', font: 'JetBrains Mono' },
    matrix:   { name: 'Matrix',     fg: '#7ee787', accent: '#22c55e', bg: 'rgba(0,8,2,0.96)',  prompt: '#22c55e', ok: '#86efac', warn: '#fbbf24', font: 'JetBrains Mono' },
    amber:    { name: 'Amber CRT',  fg: '#fbbf24', accent: '#f97316', bg: 'rgba(10,5,0,0.96)', prompt: '#f97316', ok: '#fde68a', warn: '#ef4444', font: 'JetBrains Mono' },
    crimson:  { name: 'Crimson',    fg: '#fecaca', accent: '#ef4444', bg: 'rgba(8,0,0,0.95)',  prompt: '#ef4444', ok: '#fca5a5', warn: '#fbbf24', font: 'JetBrains Mono' },
    vapor:    { name: 'Vaporwave',  fg: '#fce7f3', accent: '#ec4899', bg: 'rgba(8,0,12,0.95)', prompt: '#d946ef', ok: '#86efac', warn: '#fbbf24', font: 'Chakra Petch' },
    mono:     { name: 'Mono',       fg: '#e2e8f0', accent: '#94a3b8', bg: 'rgba(12,12,14,0.96)', prompt: '#cbd5e1', ok: '#94a3b8', warn: '#d4d4d8', font: 'Fira Code' },
    ibm:      { name: 'IBM 3270',   fg: '#7dd3fc', accent: '#38bdf8', bg: 'rgba(0,5,15,0.97)', prompt: '#38bdf8', ok: '#7dd3fc', warn: '#fbbf24', font: 'JetBrains Mono' },
    paper:    { name: 'Paper',      fg: '#1e293b', accent: '#334155', bg: 'rgba(245,245,244,0.96)', prompt: '#1e293b', ok: '#15803d', warn: '#a16207', font: 'JetBrains Mono' },
};
export const CONSOLE_FONTS = [
    'JetBrains Mono', 'Fira Code', 'Chakra Petch', 'Inter',
];

const DEFAULTS = {
    accent: '#004cff',
    cloak: 'off',
    email: '',
    wallpaper: 'aurora',
    customWallpaper: null,
    wallpaperAnimated: true,
    consoleTheme: 'intel',
    consoleFont: 'JetBrains Mono',
    consoleScanlines: true,
    // Effects overlay
    effectMode: 'rain',          // 'rain' | 'snow' | 'off'
    effectColor: '#003366',
    effectIntensity: 1.0,
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
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch (e) {
        if (String(e.name).includes('Quota')) alert('Storage full — custom wallpaper may be too large.');
    }
    applyConfig();
    listeners.forEach((fn) => fn(config));
}

export function onConfigChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function getConfig() { return { ...config }; }

// ── color derivation ────────────────────────────────────────
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }) {
    const h = (v) => v.toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
}
function lighten({ r, g, b }, amt) {
    return {
        r: Math.round(r + (255 - r) * amt),
        g: Math.round(g + (255 - g) * amt),
        b: Math.round(b + (255 - b) * amt),
    };
}
function rgba({ r, g, b }, a) { return `rgba(${r}, ${g}, ${b}, ${a})`; }

function applyPalette(hex) {
    const rgb = hexToRgb(hex);
    const light = lighten(rgb, 0.35);
    const lightHex = rgbToHex(light);
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--intel-blue', lightHex);
    root.style.setProperty('--accent-soft',  rgba(rgb, 0.35));
    root.style.setProperty('--accent-faint', rgba(rgb, 0.12));
    root.style.setProperty('--border',        rgba(rgb, 0.2));
    root.style.setProperty('--border-strong', rgba(light, 0.4));
    root.style.setProperty('--glow',        `0 0 24px ${rgba(rgb, 0.35)}`);
    root.style.setProperty('--glow-strong', `0 0 40px ${rgba(rgb, 0.55)}`);
}

// ── wallpaper application ───────────────────────────────────
function applyWallpaper() {
    const layer = document.getElementById('wallpaper-layer');
    if (!layer) return;
    layer.classList.remove('wp-aurora','wp-cyber','wp-nebula','wp-horizon','wp-matrix','wp-grid','wp-void','wp-sunset','wp-custom','wp-anim');
    if (config.wallpaper === 'custom' && config.customWallpaper) {
        layer.style.background = `center/cover no-repeat url("${config.customWallpaper}"), #000`;
        layer.classList.add('wp-custom');
        return;
    }
    const w = WALLPAPERS.find((x) => x.id === config.wallpaper);
    layer.style.background = w ? w.preview : '#000105';
    if (w) layer.classList.add(`wp-${w.id}`);
    if (config.wallpaperAnimated) layer.classList.add('wp-anim');
}

// ── effects (rain / snow) ───────────────────────────────────
async function applyEffect() {
    try {
        const r = await import('./rain.js');
        r.setEffectColor(config.effectColor);
        r.setEffectIntensity(config.effectIntensity);
        r.setEffectMode(config.effectMode);
    } catch {}
}

function applyConsole() {
    const t = CONSOLE_THEMES[config.consoleTheme] || CONSOLE_THEMES.intel;
    const root = document.documentElement;
    root.style.setProperty('--con-fg', t.fg);
    root.style.setProperty('--con-accent', t.accent);
    root.style.setProperty('--con-bg', t.bg);
    root.style.setProperty('--con-prompt', t.prompt);
    root.style.setProperty('--con-ok', t.ok);
    root.style.setProperty('--con-warn', t.warn);
    root.style.setProperty('--con-font', `'${config.consoleFont || t.font}', 'JetBrains Mono', monospace`);
    document.body.classList.toggle('con-scanlines', !!config.consoleScanlines);
}

function applyConfig() {
    applyPalette(config.accent);
    applyWallpaper();
    applyConsole();
    applyEffect();

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

// ── Settings panel UI ───────────────────────────────────────
export function buildSettingsPanel() {
    const root = document.createElement('div');
    root.className = 'app-settings';
    root.innerHTML = `
        <nav class="settings-nav">
            <button class="tab on hover-target" data-tab="stealth">Stealth</button>
            <button class="tab hover-target" data-tab="appearance">Accent</button>
            <button class="tab hover-target" data-tab="wallpaper">Wallpaper</button>
            <button class="tab hover-target" data-tab="effects">Effects</button>
            <button class="tab hover-target" data-tab="console">Console</button>
            <button class="tab hover-target" data-tab="persistence">Data</button>
            <button class="tab hover-target" data-tab="about">About</button>
        </nav>
        <div class="settings-panel">
            <div data-panel="stealth">
                <h3>Stealth / Cloaking</h3>
                <p>Disguise the tab so a casual glance shows something else. Icon and title change live.</p>
                <div class="row">
                    <div>
                        <div class="label">Tab Cloak</div>
                        <div class="desc">What the tab should impersonate.</div>
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
                        <div class="desc">Tap <b>\`</b> (backtick) to swap the cloak on/off instantly.</div>
                    </div>
                    <button class="btn-ghost hover-target" id="test-panic">Test</button>
                </div>
            </div>

            <div data-panel="appearance" hidden>
                <h3>Accent Color</h3>
                <p>Each swatch derives the full system palette — borders, glows, focus rings all shift together.</p>
                <div class="swatches" id="swatches"></div>
                <div class="row" style="margin-top:18px">
                    <div>
                        <div class="label">Custom Hex</div>
                        <div class="desc">Any color you want. Full palette derives automatically.</div>
                    </div>
                    <input type="color" id="color-picker" class="hover-target" style="width:42px;height:42px;border:1px solid var(--border);border-radius:10px;background:transparent;padding:0;cursor:none" />
                </div>
            </div>

            <div data-panel="wallpaper" hidden>
                <h3>Wallpaper</h3>
                <p>Choose a preset or upload your own. Custom wallpapers are stored locally.</p>
                <div class="wallpaper-grid" id="wallpaper-grid"></div>
                <div class="row" style="margin-top:20px">
                    <div>
                        <div class="label">Upload Custom</div>
                        <div class="desc">JPG/PNG. Compressed to fit browser storage (~5MB limit).</div>
                    </div>
                    <button class="btn-primary hover-target" id="wallpaper-upload">Choose Image</button>
                </div>
                <input type="file" id="wallpaper-file" accept="image/*" style="display:none" />
            </div>

            <div data-panel="effects" hidden>
                <h3>Atmospheric Effects</h3>
                <p>The stuff falling from the top of your screen. Rain by default, snow if you're feeling festive, or off if you want quiet.</p>
                <div class="row">
                    <div>
                        <div class="label">Mode</div>
                        <div class="desc">Pick what's drifting through the air.</div>
                    </div>
                    <div class="seg-toggle">
                        <button data-mode="rain">Rain</button>
                        <button data-mode="snow">Snow</button>
                        <button data-mode="off">Off</button>
                    </div>
                </div>
                <div class="row">
                    <div>
                        <div class="label">Color</div>
                        <div class="desc">Tint of the falling particles. Snow looks best in light tones; rain in dark blues or greens.</div>
                    </div>
                    <input type="color" id="fx-color" class="hover-target" style="width:42px;height:42px;border:1px solid var(--border);border-radius:10px;background:transparent;padding:0;cursor:none" />
                </div>
                <div class="row">
                    <div>
                        <div class="label">Intensity</div>
                        <div class="desc">How heavy the storm is. Lower if your battery hates you.</div>
                    </div>
                    <input type="range" id="fx-int" min="0.3" max="2.5" step="0.1" class="hover-target" style="width:160px;accent-color:var(--accent)" />
                </div>
                <div class="row">
                    <div>
                        <div class="label">Animated wallpaper</div>
                        <div class="desc">Slow ambient motion on the desktop background.</div>
                    </div>
                    <button class="toggle hover-target" id="wp-anim"></button>
                </div>
            </div>

            <div data-panel="console" hidden>
                <h3>Console Theme</h3>
                <p>Changes the boot terminal and any console-styled surface.</p>
                <div class="console-themes" id="con-themes"></div>
                <div class="row" style="margin-top:22px">
                    <div>
                        <div class="label">Font</div>
                        <div class="desc">Monospaced for ASCII alignment, display for expressive branding.</div>
                    </div>
                    <select class="select-native hover-target" id="con-font"></select>
                </div>
                <div class="row">
                    <div>
                        <div class="label">CRT Scanlines</div>
                        <div class="desc">Adds subtle horizontal scanline texture over terminal surfaces.</div>
                    </div>
                    <button class="toggle hover-target" id="con-scan"></button>
                </div>
                <div class="console-preview" id="con-preview">
                    <div class="line"><span class="p">::</span> BOOT_LOADER v4.0.2 // INTELLECTUAL SYSTEMS</div>
                    <div class="line ok"><span class="p">::</span> CPU: Intel(R) Core(TM) i9-16900K @ 6.20GHz</div>
                    <div class="line warn"><span class="p">::</span> NOTICE: filter watchdog engaged</div>
                    <div class="line ok"><span class="p">::</span> SYSTEM_STABLE.</div>
                </div>
            </div>

            <div data-panel="persistence" hidden>
                <h3>Config Persistence</h3>
                <p>Settings live in <code>localStorage</code>. Back them up or move them to another device.</p>
                <div class="row">
                    <div>
                        <div class="label">Export</div>
                        <div class="desc">Download current config as JSON.</div>
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

    // Tab switching
    const tabs = root.querySelectorAll('[data-tab]');
    const panels = root.querySelectorAll('[data-panel]');
    tabs.forEach((t) => t.addEventListener('click', () => {
        tabs.forEach((x) => x.classList.remove('on'));
        t.classList.add('on');
        panels.forEach((p) => { p.hidden = p.dataset.panel !== t.dataset.tab; });
    }));

    // Stealth
    const cloakSel = root.querySelector('#cloak-select');
    cloakSel.value = config.cloak;
    cloakSel.addEventListener('change', () => saveConfig({ cloak: cloakSel.value }));
    root.querySelector('#test-panic').addEventListener('click', triggerPanic);

    // Appearance
    const sw = root.querySelector('#swatches');
    const colorPicker = root.querySelector('#color-picker');
    SWATCHES.forEach((c) => {
        const s = document.createElement('button');
        s.className = 'swatch hover-target';
        s.style.background = c.hex;
        s.style.color = c.hex;
        s.title = c.name;
        s.dataset.hex = c.hex;
        if (c.hex.toLowerCase() === config.accent.toLowerCase()) s.classList.add('on');
        s.addEventListener('click', () => selectColor(c.hex));
        sw.appendChild(s);
    });
    colorPicker.value = config.accent;
    colorPicker.addEventListener('input', () => selectColor(colorPicker.value));
    function selectColor(hex) {
        sw.querySelectorAll('.swatch').forEach((x) => x.classList.toggle('on', x.dataset.hex?.toLowerCase() === hex.toLowerCase()));
        colorPicker.value = hex;
        saveConfig({ accent: hex });
    }

    // Wallpapers
    const wpGrid = root.querySelector('#wallpaper-grid');
    const wpFile = root.querySelector('#wallpaper-file');
    renderWallpaperGrid();
    function renderWallpaperGrid() {
        wpGrid.innerHTML = '';
        WALLPAPERS.forEach((w) => {
            const tile = document.createElement('button');
            tile.className = 'wallpaper-tile hover-target' + (config.wallpaper === w.id ? ' on' : '');
            tile.style.background = w.preview;
            tile.innerHTML = `<span class="wp-label">${w.name}</span>`;
            tile.addEventListener('click', () => {
                saveConfig({ wallpaper: w.id });
                renderWallpaperGrid();
            });
            wpGrid.appendChild(tile);
        });
        if (config.customWallpaper) {
            const tile = document.createElement('button');
            tile.className = 'wallpaper-tile hover-target' + (config.wallpaper === 'custom' ? ' on' : '');
            tile.style.background = `center/cover no-repeat url("${config.customWallpaper}")`;
            tile.innerHTML = `<span class="wp-label">Custom</span><span class="wp-remove" title="Remove">✕</span>`;
            tile.addEventListener('click', (e) => {
                if (e.target.classList.contains('wp-remove')) {
                    e.stopPropagation();
                    saveConfig({ customWallpaper: null, wallpaper: config.wallpaper === 'custom' ? 'aurora' : config.wallpaper });
                    renderWallpaperGrid();
                    return;
                }
                saveConfig({ wallpaper: 'custom' });
                renderWallpaperGrid();
            });
            wpGrid.appendChild(tile);
        }
    }
    root.querySelector('#wallpaper-upload').addEventListener('click', () => wpFile.click());
    wpFile.addEventListener('change', () => {
        const f = wpFile.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { alert('Too large — max 5MB.'); return; }
        const r = new FileReader();
        r.onload = () => {
            compressImage(r.result, 1920, 1080, 0.82).then((dataUrl) => {
                saveConfig({ customWallpaper: dataUrl, wallpaper: 'custom' });
                renderWallpaperGrid();
            });
        };
        r.readAsDataURL(f);
    });

    // Effects
    const fxColor = root.querySelector('#fx-color');
    const fxInt = root.querySelector('#fx-int');
    const wpAnim = root.querySelector('#wp-anim');
    const segs = root.querySelectorAll('.seg-toggle [data-mode]');
    function paintEffectsTab() {
        segs.forEach((b) => b.classList.toggle('on', b.dataset.mode === config.effectMode));
        fxColor.value = config.effectColor;
        fxInt.value = config.effectIntensity;
        wpAnim.classList.toggle('on', !!config.wallpaperAnimated);
    }
    paintEffectsTab();
    segs.forEach((b) => b.addEventListener('click', () => {
        saveConfig({ effectMode: b.dataset.mode });
        paintEffectsTab();
    }));
    fxColor.addEventListener('input', () => saveConfig({ effectColor: fxColor.value }));
    fxInt.addEventListener('input', () => saveConfig({ effectIntensity: Number(fxInt.value) }));
    wpAnim.addEventListener('click', () => {
        const on = !wpAnim.classList.contains('on');
        saveConfig({ wallpaperAnimated: on });
        paintEffectsTab();
    });

    // Console theme
    const conThemes = root.querySelector('#con-themes');
    const conFont = root.querySelector('#con-font');
    const conScan = root.querySelector('#con-scan');
    Object.entries(CONSOLE_THEMES).forEach(([id, t]) => {
        const tile = document.createElement('button');
        tile.className = 'console-theme hover-target' + (config.consoleTheme === id ? ' on' : '');
        tile.style.setProperty('--ct-bg', t.bg);
        tile.style.setProperty('--ct-fg', t.fg);
        tile.style.setProperty('--ct-accent', t.accent);
        tile.innerHTML = `
            <div class="ct-preview">
                <span class="ct-p">::</span>
                <span class="ct-text">${t.name}</span>
            </div>
            <div class="ct-label">${t.name}</div>
        `;
        tile.addEventListener('click', () => {
            saveConfig({ consoleTheme: id, consoleFont: t.font });
            conThemes.querySelectorAll('.console-theme').forEach((x) => x.classList.remove('on'));
            tile.classList.add('on');
            conFont.value = t.font;
        });
        conThemes.appendChild(tile);
    });
    CONSOLE_FONTS.forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f; opt.textContent = f;
        conFont.appendChild(opt);
    });
    conFont.value = config.consoleFont;
    conFont.addEventListener('change', () => saveConfig({ consoleFont: conFont.value }));
    if (config.consoleScanlines) conScan.classList.add('on');
    conScan.addEventListener('click', () => {
        const on = !conScan.classList.contains('on');
        conScan.classList.toggle('on', on);
        saveConfig({ consoleScanlines: on });
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

function compressImage(dataUrl, maxW, maxH, quality) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            const ratio = Math.min(maxW / width, maxH / height, 1);
            width *= ratio; height *= ratio;
            const c = document.createElement('canvas');
            c.width = width; c.height = height;
            c.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
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
                saveConfig(JSON.parse(r.result));
                alert('Config imported.');
            } catch (e) { alert('Invalid config file: ' + e.message); }
        };
        r.readAsText(file);
    };
    input.click();
}

function triggerPanic() {
    const cloak = CLOAKS[config.cloak] || CLOAKS.classroom;
    document.title = cloak.title;
    if (cloak.icon !== 'default') document.getElementById('favicon').href = cloak.icon;
}

document.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.target.matches('input, textarea')) {
        saveConfig({ cloak: config.cloak === 'off' ? 'classroom' : 'off' });
    }
});
