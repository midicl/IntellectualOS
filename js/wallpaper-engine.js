// Canvas-based mesh-gradient wallpaper.
// Several large radial-gradient "orbs" drift around very slowly. Composited
// onto a single canvas using lighter blend mode so they bloom into each other.
// Smooth 30fps, GPU-accelerated, runs on integrated chips fine.

let canvas = null;
let ctx = null;
let raf = null;
let active = false;
let palette = ['#004cff', '#00a2ff', '#a855f7', '#ec4899', '#22d3ee'];
let parallax = { x: 0, y: 0 };

const ORB_COUNT = 5;
const orbs = [];

function makeOrbs(W, H) {
    orbs.length = 0;
    for (let i = 0; i < ORB_COUNT; i++) {
        orbs.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 280 + Math.random() * 280,
            color: palette[i % palette.length],
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: 0.0008 + Math.random() * 0.0014,
        });
    }
}

function resize() {
    if (!canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Cap DPR at 1.25 so HiDPI laptops don't melt their fans rendering 4× canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (orbs.length === 0) makeOrbs(W, H);
}

function step() {
    if (!active) return;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Black base — orbs are lighter-blended on top
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000105';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    for (const o of orbs) {
        o.phase += o.phaseSpeed;
        const sway = Math.sin(o.phase) * 60;
        o.x += o.vx;
        o.y += o.vy;
        // Bounce gently off edges
        if (o.x < -o.r * 0.4) o.vx = Math.abs(o.vx);
        if (o.x > W + o.r * 0.4) o.vx = -Math.abs(o.vx);
        if (o.y < -o.r * 0.4) o.vy = Math.abs(o.vy);
        if (o.y > H + o.r * 0.4) o.vy = -Math.abs(o.vy);

        // Parallax shift (subtle — 14px max from cursor)
        const px = o.x + parallax.x * 0.012;
        const py = o.y + parallax.y * 0.012 + sway;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, o.r);
        grad.addColorStop(0, o.color + 'dd');   // ~87% alpha at center
        grad.addColorStop(0.55, o.color + '33');
        grad.addColorStop(1, '#00000000');
        ctx.fillStyle = grad;
        ctx.fillRect(px - o.r, py - o.r, o.r * 2, o.r * 2);
    }

    raf = requestAnimationFrame(step);
}

export function startMeshWallpaper(opts = {}) {
    if (opts.palette) {
        palette = opts.palette;
        orbs.length = 0;   // rebuild on next resize
    }
    if (active) return;
    let layer = document.getElementById('wallpaper-canvas');
    if (!layer) {
        layer = document.createElement('canvas');
        layer.id = 'wallpaper-canvas';
        layer.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;will-change:transform';
        // Insert after the static gradient layer so the canvas paints on top of it
        const wp = document.getElementById('wallpaper-layer');
        if (wp) wp.after(layer); else document.body.prepend(layer);
    }
    canvas = layer;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    active = true;
    raf = requestAnimationFrame(step);
}

export function stopMeshWallpaper() {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    const layer = document.getElementById('wallpaper-canvas');
    if (layer) {
        layer.getContext('2d').clearRect(0, 0, layer.width, layer.height);
        layer.remove();
    }
    canvas = ctx = null;
}

export function setMeshPalette(colors) {
    if (!Array.isArray(colors) || !colors.length) return;
    palette = colors;
    orbs.length = 0;
    if (active) {
        const W = window.innerWidth, H = window.innerHeight;
        makeOrbs(W, H);
    }
}

export function setMeshParallax(x, y) {
    parallax.x = x;
    parallax.y = y;
}
