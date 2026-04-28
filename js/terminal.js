// Terminal app — Linux-style console with live clock, commands, powerline prompt
// Uses the currently-selected console theme (Settings → Console).
import { createWindow } from './windows.js';
import { openBrowser } from './browser.js';
import { getConfig, CONSOLE_THEMES } from './settings.js';

const VERSION = '1.1';
const BUILD = 'intel-kernel-6.20.0';

const ASCII_LOGO = String.raw`
    ___      __       ____          __            __
   /  _/__  / /____  / / /__  _____/ /___  ______/ /
   / // _ \/ __/ _ \/ / / _ \/ ___/ __/ / / / __  /
  _/ //  __/ /_/  __/ / /  __/ /__/ /_/ /_/ / /_/ /
 /___/\___/\__/\___/_/_/\___/\___/\__/\__,_/\__,_/
`;

function formatTime(d = new Date()) {
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function formatDate(d = new Date()) {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function openTerminal() {
    const body = document.createElement('div');
    body.className = 'app-terminal';

    const config = getConfig();
    const user = (config.email || 'guest').split('@')[0];
    const host = 'intellectual';

    body.innerHTML = `
        <div class="term-chrome">
            <div class="term-stats">
                <span class="stat"><span class="stat-k">USER</span> ${user}</span>
                <span class="stat"><span class="stat-k">HOST</span> ${host}</span>
                <span class="stat"><span class="stat-k">KERNEL</span> ${BUILD}</span>
            </div>
            <div class="term-clock" id="term-clock">${formatTime()}</div>
        </div>
        <div class="term-scroll" id="term-scroll">
            <pre class="term-banner">${ASCII_LOGO}</pre>
            <div class="term-line">Intellectual OS v${VERSION} — ${formatDate()}</div>
            <div class="term-line subtle">Type <span class="hl">help</span> for a list of commands.</div>
            <div class="term-line"></div>
        </div>
        <div class="term-prompt" id="term-prompt">
            <span class="pl-seg pl-user">${user}</span>
            <span class="pl-arrow">▶</span>
            <span class="pl-seg pl-host">${host}</span>
            <span class="pl-arrow">▶</span>
            <span class="pl-seg pl-dir">~</span>
            <span class="pl-arrow pl-end">▶</span>
            <input class="term-input hover-target" spellcheck="false" autocomplete="off" autofocus />
        </div>
    `;

    const scroll = body.querySelector('#term-scroll');
    const input = body.querySelector('.term-input');
    const clock = body.querySelector('#term-clock');

    // Live clock in the chrome
    const clockTick = setInterval(() => { clock.textContent = formatTime(); }, 1000);

    // Command history (up/down arrows)
    const history = [];
    let histIdx = -1;

    const COMMANDS = {
        help: () => out([
            '',
            'COMMANDS',
            '  help          This list',
            '  clear / cls   Clear the screen',
            '  date          Current date',
            '  time          Current time',
            '  whoami        Current user',
            '  neofetch      System info with logo',
            '  echo <text>   Print text',
            '  ls            List directory',
            '  uptime        Session uptime',
            '  games         Open the game library',
            '  browser <url> Open browser (optional URL)',
            '  ai            Open Intellectual AI',
            '  settings      Open Settings',
            '  discord       Open the discord invite',
            '  theme <name>  Show current console theme',
            '  exit          Close this window',
            '',
        ]),
        clear: () => { scroll.innerHTML = ''; },
        cls:   () => { scroll.innerHTML = ''; },
        date:  () => out([`${formatDate()}`]),
        time:  () => out([`${formatTime()}`]),
        whoami: () => out([user]),
        echo:  (args) => out([args.join(' ')]),
        uptime: () => out([`up ${Math.floor((Date.now() - START_TIME) / 1000)}s (terminal session)`]),
        ls:    () => out([
            'dr-xr-xr-x  bin/   browser',
            'dr-xr-xr-x  bin/   games',
            'dr-xr-xr-x  bin/   ai',
            'dr-xr-xr-x  bin/   settings',
            '-rw-r--r--  cfg/   intellectual.conf',
            '-rw-r--r--  log/   kernel.log',
            '-rw-r--r--  doc/   README.md',
        ]),
        neofetch: () => out([
            '',
            ...ASCII_LOGO.split('\n').map((l, i) => `${l}  ${NEOFETCH_LINES[i] || ''}`),
            '',
        ]),
        theme: () => {
            const t = CONSOLE_THEMES[config.consoleTheme] || CONSOLE_THEMES.intel;
            out([`Active theme: ${t.name}  (font: ${config.consoleFont})`,
                 `Change in Settings → Console.`]);
        },
        games:    () => { import('./games.js').then((m) => m.buildGamesPanel().then((p) => { createWindow({ id: 'games', title: 'INFINITY', icon: '◈', width: 1100, height: 720, content: p }); })); out(['Launching Infinity…']); },
        browser:  (args) => { openBrowser(args.join(' ') || ''); out([`Opening browser${args.length ? ' → ' + args.join(' ') : ''}`]); },
        ai:       () => { import('./ai.js').then((m) => m.openAI()); out(['Booting Intellectual AI…']); },
        settings: () => { import('./settings.js').then((m) => { const p = m.buildSettingsPanel(); createWindow({ id: 'settings', title: 'SETTINGS', icon: '⚙', width: 760, height: 560, content: p }); }); out(['Launching Settings…']); },
        discord:  () => { window.open('https://discord.gg/intelligent', '_blank', 'noopener'); out(['Opening discord.gg/intelligent …']); },
        exit:     () => { win.el.querySelector('.close').click(); },
    };

    const NEOFETCH_LINES = [
        '',
        `${user}@${host}`,
        '─────────────────',
        `OS     : Intellectual OS v${VERSION}`,
        `Kernel : ${BUILD}`,
        `Shell  : intsh 1.0`,
        `Uptime : running`,
        `Theme  : ${(CONSOLE_THEMES[config.consoleTheme] || CONSOLE_THEMES.intel).name}`,
        `Font   : ${config.consoleFont}`,
        `CPU    : Intel i9-16900K @ 6.20GHz`,
        `Games  : 685 in library`,
    ];

    const START_TIME = Date.now();

    function out(lines) {
        lines.forEach((l) => {
            const row = document.createElement('div');
            row.className = 'term-line';
            row.textContent = l;
            scroll.appendChild(row);
        });
        scroll.scrollTop = scroll.scrollHeight;
    }
    function echoCommand(cmd) {
        const row = document.createElement('div');
        row.className = 'term-line echo';
        row.innerHTML = `<span class="pl-mini">${user}@${host}:~$</span> ${escapeHtml(cmd)}`;
        scroll.appendChild(row);
    }
    function runCommand(raw) {
        const cmd = raw.trim();
        if (!cmd) return;
        history.push(cmd);
        histIdx = history.length;
        echoCommand(cmd);
        const [name, ...args] = cmd.split(/\s+/);
        const fn = COMMANDS[name.toLowerCase()];
        if (fn) fn(args);
        else out([`intsh: ${name}: command not found. Try \`help\`.`]);
        scroll.scrollTop = scroll.scrollHeight;
    }
    function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { runCommand(input.value); input.value = ''; }
        else if (e.key === 'ArrowUp') {
            if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
            else { histIdx = history.length; input.value = ''; }
            e.preventDefault();
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault(); scroll.innerHTML = '';
        } else if (e.key === 'c' && e.ctrlKey) {
            input.value = '';
        }
    });
    // Click anywhere in the scroll area → focus input
    body.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
        input.focus();
    });

    const win = createWindow({
        id: `terminal-${Date.now()}`,
        title: 'TERMINAL',
        icon: '❯',
        width: 820,
        height: 520,
        content: body,
        onBeforeClose: () => clearInterval(clockTick),
    });

    setTimeout(() => input.focus(), 100);
    return win;
}
