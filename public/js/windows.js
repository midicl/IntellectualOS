// Phase 5 — Window manager: drag, resize, snap (ghost preview), minimize/maximize, focus
// All movement uses rAF via direct transform updates for 60fps.

const layer = document.getElementById('window-layer');
const ghost = document.getElementById('ghost-preview');
const topbarH = 34;

let zCounter = 100;
let focused = null;
const windows = new Map(); // id -> winObj

export function focusWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    if (focused && focused !== w) focused.el.classList.remove('focused');
    w.el.classList.add('focused');
    w.el.style.zIndex = ++zCounter;
    focused = w;
}

export function closeWindow(id) {
    const w = windows.get(id);
    if (!w) return;
    w.onBeforeClose?.();
    w.el.style.transition = 'transform 0.3s var(--bezier), opacity 0.3s';
    w.el.style.transform += ' scale(0.92)';
    w.el.style.opacity = '0';
    setTimeout(() => {
        w.el.remove();
        windows.delete(id);
    }, 300);
}

export function listWindows() { return [...windows.values()]; }

function clampBounds(x, y, w, h) {
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;
    return {
        x: Math.max(-w + 80, Math.min(maxX, x)),
        y: Math.max(topbarH, Math.min(maxY, y)),
    };
}

export function createWindow({
    id,
    title = 'WINDOW',
    icon = '◇',
    width = 720,
    height = 460,
    x,
    y,
    content,                 // HTMLElement | string
    onBeforeClose,           // optional cleanup callback (RAM free for iframes)
    resizable = true,
} = {}) {
    if (!id) id = `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    if (windows.has(id)) { focusWindow(id); return windows.get(id); }

    // default cascade position
    const count = windows.size;
    x ??= 80 + count * 28;
    y ??= 80 + count * 28;

    const el = document.createElement('div');
    el.className = 'win';
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.zIndex = ++zCounter;
    el.dataset.id = id;

    el.innerHTML = `
        <header class="win-header" data-drag>
            <div class="title"><span class="icon">${icon}</span>${title}</div>
            <div class="win-ctrls">
                <button class="min hover-target" title="minimize">—</button>
                <button class="max hover-target" title="maximize">▢</button>
                <button class="close hover-target" title="close">✕</button>
            </div>
        </header>
        <div class="win-body"></div>
        ${resizable ? `
            <div class="resize-h n"  data-resize="n"></div>
            <div class="resize-h s"  data-resize="s"></div>
            <div class="resize-h e"  data-resize="e"></div>
            <div class="resize-h w"  data-resize="w"></div>
            <div class="resize-h ne" data-resize="ne"></div>
            <div class="resize-h nw" data-resize="nw"></div>
            <div class="resize-h se" data-resize="se"></div>
            <div class="resize-h sw" data-resize="sw"></div>
        ` : ''}
    `;

    const body = el.querySelector('.win-body');
    if (content instanceof HTMLElement) body.appendChild(content);
    else if (typeof content === 'string') body.innerHTML = content;

    layer.appendChild(el);

    // Position state (authoritative — transform is derived from these)
    let px = x, py = y, pw = width, ph = height;
    let preMaxState = null;

    const w = {
        id, el, body, title, icon,
        onBeforeClose,
        get x() { return px; }, get y() { return py; },
        get w() { return pw; }, get h() { return ph; },
        maximize, restore, minimize,
        setTitle(t) { el.querySelector('.title').innerHTML = `<span class="icon">${icon}</span>${t}`; },
    };
    windows.set(id, w);

    function applyTransform() {
        el.style.transform = `translate(${px}px, ${py}px)`;
    }
    function applySize() {
        el.style.width = `${pw}px`;
        el.style.height = `${ph}px`;
    }

    // ── focus on any pointer activity
    el.addEventListener('pointerdown', () => focusWindow(id));
    focusWindow(id);

    // ── close / min / max
    el.querySelector('.close').addEventListener('click', () => closeWindow(id));
    el.querySelector('.min').addEventListener('click', minimize);
    el.querySelector('.max').addEventListener('click', () => el.classList.contains('maximized') ? restore() : maximize());

    function maximize() {
        if (el.classList.contains('maximized')) return;
        preMaxState = { px, py, pw, ph };
        el.classList.add('maximized');
    }
    function restore() {
        if (!el.classList.contains('maximized')) return;
        el.classList.remove('maximized');
        if (preMaxState) {
            ({ px, py, pw, ph } = preMaxState);
            applyTransform(); applySize();
            preMaxState = null;
        }
    }
    function minimize() {
        el.classList.add('minimized');
        setTimeout(() => { el.classList.remove('minimized'); }, 1200);
    }

    // Double-click header toggles max
    el.querySelector('.win-header').addEventListener('dblclick', (e) => {
        if (e.target.closest('.win-ctrls')) return;
        el.classList.contains('maximized') ? restore() : maximize();
    });

    // ── Drag
    const header = el.querySelector('[data-drag]');
    let drag = null;

    header.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.win-ctrls')) return;
        if (el.classList.contains('maximized')) {
            // pull off maximized: restore at pointer
            const ratio = e.clientX / window.innerWidth;
            restore();
            px = e.clientX - pw * ratio;
            py = e.clientY - 20;
            applyTransform();
        }
        header.setPointerCapture(e.pointerId);
        drag = { startX: e.clientX, startY: e.clientY, origX: px, origY: py, pointerId: e.pointerId };
    });

    let rafPending = false;
    let queued = null;
    header.addEventListener('pointermove', (e) => {
        if (!drag) return;
        queued = { dx: e.clientX - drag.startX, dy: e.clientY - drag.startY, cx: e.clientX, cy: e.clientY };
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
                if (!drag || !queued) { rafPending = false; return; }
                px = drag.origX + queued.dx;
                py = drag.origY + queued.dy;
                ({ x: px, y: py } = clampBounds(px, py, pw, ph));
                applyTransform();
                updateSnapHint(queued.cx, queued.cy);
                rafPending = false;
            });
        }
    });
    header.addEventListener('pointerup', (e) => {
        if (!drag) return;
        header.releasePointerCapture(drag.pointerId);
        const snap = resolveSnap(queued?.cx ?? e.clientX, queued?.cy ?? e.clientY);
        hideSnap();
        drag = null;
        if (snap) applySnap(snap);
    });
    header.addEventListener('pointercancel', () => { drag = null; hideSnap(); });

    // ── Resize
    if (resizable) {
        el.querySelectorAll('[data-resize]').forEach((handle) => {
            const dir = handle.dataset.resize;
            let rs = null;
            handle.addEventListener('pointerdown', (e) => {
                if (el.classList.contains('maximized')) return;
                handle.setPointerCapture(e.pointerId);
                rs = { sx: e.clientX, sy: e.clientY, ox: px, oy: py, ow: pw, oh: ph, pid: e.pointerId };
                e.stopPropagation();
            });
            let rp = false, rq = null;
            handle.addEventListener('pointermove', (e) => {
                if (!rs) return;
                rq = { dx: e.clientX - rs.sx, dy: e.clientY - rs.sy };
                if (!rp) {
                    rp = true;
                    requestAnimationFrame(() => {
                        if (!rs || !rq) { rp = false; return; }
                        let nx = rs.ox, ny = rs.oy, nw = rs.ow, nh = rs.oh;
                        if (dir.includes('e')) nw = Math.max(360, rs.ow + rq.dx);
                        if (dir.includes('s')) nh = Math.max(240, rs.oh + rq.dy);
                        if (dir.includes('w')) { nw = Math.max(360, rs.ow - rq.dx); nx = rs.ox + (rs.ow - nw); }
                        if (dir.includes('n')) { nh = Math.max(240, rs.oh - rq.dy); ny = rs.oy + (rs.oh - nh); }
                        px = nx; py = ny; pw = nw; ph = nh;
                        applyTransform(); applySize();
                        rp = false;
                    });
                }
            });
            handle.addEventListener('pointerup', (e) => {
                if (!rs) return;
                handle.releasePointerCapture(rs.pid);
                rs = null;
            });
            handle.addEventListener('pointercancel', () => { rs = null; });
        });
    }

    // ── Snapping
    function resolveSnap(cx, cy) {
        const edge = 20;
        if (cy <= topbarH + 4) return 'max';
        if (cx <= edge) return 'left';
        if (cx >= window.innerWidth - edge) return 'right';
        return null;
    }
    function updateSnapHint(cx, cy) {
        const snap = resolveSnap(cx, cy);
        if (!snap) return hideSnap();
        const r = snapRect(snap);
        ghost.style.left = `${r.x}px`;
        ghost.style.top  = `${r.y}px`;
        ghost.style.width = `${r.w}px`;
        ghost.style.height = `${r.h}px`;
        ghost.classList.add('on');
    }
    function hideSnap() { ghost.classList.remove('on'); }
    function snapRect(type) {
        const W = window.innerWidth, H = window.innerHeight - topbarH;
        if (type === 'max')   return { x: 0, y: topbarH, w: W, h: H };
        if (type === 'left')  return { x: 0, y: topbarH, w: W / 2, h: H };
        if (type === 'right') return { x: W / 2, y: topbarH, w: W / 2, h: H };
    }
    function applySnap(type) {
        if (type === 'max') { maximize(); return; }
        const r = snapRect(type);
        px = r.x; py = r.y; pw = r.w; ph = r.h;
        applyTransform(); applySize();
    }

    return w;
}
