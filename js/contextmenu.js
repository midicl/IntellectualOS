// Custom right-click context menus.
// Usage:
//   import { registerContext, showMenu } from './contextmenu.js';
//   registerContext(targetEl, () => [{label, icon?, action, disabled?, separator?}, ...]);
//
// Or directly: showMenu(x, y, items).

let activeMenu = null;
const registry = new WeakMap();

function close() {
    if (activeMenu) {
        activeMenu.classList.add('closing');
        const m = activeMenu;
        setTimeout(() => m.remove(), 130);
        activeMenu = null;
    }
}

document.addEventListener('pointerdown', (e) => {
    if (activeMenu && !e.target.closest('.ctx-menu')) close();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
});
window.addEventListener('blur', close);
window.addEventListener('resize', close);

export function showMenu(x, y, items) {
    close();
    if (!items || !items.length) return;

    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.setAttribute('role', 'menu');

    items.forEach((it) => {
        if (it.separator) {
            menu.appendChild(Object.assign(document.createElement('div'), { className: 'ctx-sep' }));
            return;
        }
        const row = document.createElement('button');
        row.className = 'ctx-item' + (it.disabled ? ' disabled' : '') + (it.danger ? ' danger' : '');
        row.disabled = !!it.disabled;
        row.innerHTML = `
            <span class="ctx-icon">${it.icon || ''}</span>
            <span class="ctx-label">${it.label}</span>
            ${it.shortcut ? `<span class="ctx-key">${it.shortcut}</span>` : ''}
        `;
        if (!it.disabled) {
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                close();
                try { it.action?.(); } catch (err) { console.error(err); }
            });
        }
        menu.appendChild(row);
    });

    document.body.appendChild(menu);
    activeMenu = menu;

    // Position with viewport flip
    const r = menu.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;
    const px = (x + r.width  > W - 8) ? Math.max(8, x - r.width)  : x;
    const py = (y + r.height > H - 8) ? Math.max(8, y - r.height) : y;
    menu.style.left = `${px}px`;
    menu.style.top  = `${py}px`;
    menu.classList.add('opening');
    requestAnimationFrame(() => menu.classList.remove('opening'));
}

export function registerContext(el, builder) {
    if (!el) return;
    registry.set(el, builder);
    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const items = (typeof builder === 'function') ? builder(e) : builder;
        showMenu(e.clientX, e.clientY, items);
    });
}

export function closeMenu() { close(); }
