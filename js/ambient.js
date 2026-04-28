// Ambient layer — cursor parallax + floating dust particles.
// Both are decorative; both auto-disable on prefers-reduced-motion.

import { setMeshParallax } from './wallpaper-engine.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Cursor parallax ─────────────────────────────────────────
// Tracks mouse, smoothly nudges the wallpaper layer via translate.
// Subtle — max ±14px. Adds depth without nausea.
let parallaxX = 0, parallaxY = 0;
let targetX = 0, targetY = 0;

function paraTick() {
    parallaxX += (targetX - parallaxX) * 0.08;
    parallaxY += (targetY - parallaxY) * 0.08;
    const layer = document.getElementById('wallpaper-layer');
    if (layer) layer.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
    setMeshParallax(parallaxX, parallaxY);
    requestAnimationFrame(paraTick);
}

export function initParallax() {
    if (REDUCED) return;
    document.addEventListener('pointermove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = ((e.clientX - cx) / cx) * 14;
        targetY = ((e.clientY - cy) / cy) * 14;
    }, { passive: true });
    requestAnimationFrame(paraTick);
}

// ── Dust particles ──────────────────────────────────────────
// Static DOM elements with CSS-only animation; ~40 dots drift up.
export function initDust() {
    if (REDUCED) return;
    if (document.getElementById('dust-layer')) return;
    const layer = document.createElement('div');
    layer.id = 'dust-layer';
    document.getElementById('desktop')?.appendChild(layer);

    const COUNT = 40;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
        const d = document.createElement('span');
        d.className = 'dust';
        const size = 1 + Math.random() * 2.5;
        d.style.cssText = `
            left:${Math.random() * 100}%;
            bottom:-${Math.random() * 30}px;
            width:${size}px; height:${size}px;
            opacity:${0.15 + Math.random() * 0.45};
            animation-duration:${24 + Math.random() * 24}s;
            animation-delay:-${Math.random() * 24}s;
            --drift:${(Math.random() - 0.5) * 60}px;
        `;
        fragment.appendChild(d);
    }
    layer.appendChild(fragment);
}

// ── Dock magnification ──────────────────────────────────────
// macOS-style: dock icons swell when the cursor is near, taper off with
// distance. Pure JS so it follows the actual cursor.
export function initDockMagnification() {
    if (REDUCED) return;
    const dock = document.getElementById('dock');
    if (!dock) return;

    const RADIUS = 110;        // px; effect range
    const MAX_SCALE = 1.55;    // peak size for an icon directly under the cursor
    const NEIGHBOR_FALLOFF = 0.4;

    let raf = null;
    let mouseX = -9999;
    let mouseY = -9999;
    let inside = false;

    function update() {
        const buttons = dock.querySelectorAll('.dock-btn');
        for (const btn of buttons) {
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = mouseX - cx;
            const dy = mouseY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let scale = 1;
            if (inside && dist < RADIUS) {
                const t = 1 - (dist / RADIUS);
                // Smooth easeOutQuad
                scale = 1 + (MAX_SCALE - 1) * t * t * NEIGHBOR_FALLOFF * 2.5;
                if (scale > MAX_SCALE) scale = MAX_SCALE;
            }
            btn.style.transform = `translateY(${scale > 1.05 ? -(scale - 1) * 16 : 0}px) scale(${scale})`;
        }
        raf = null;
    }

    function schedule() { if (!raf) raf = requestAnimationFrame(update); }

    dock.addEventListener('pointermove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY; inside = true; schedule();
    });
    dock.addEventListener('pointerenter', (e) => {
        mouseX = e.clientX; mouseY = e.clientY; inside = true; schedule();
    });
    dock.addEventListener('pointerleave', () => {
        inside = false;
        const buttons = dock.querySelectorAll('.dock-btn');
        buttons.forEach((b) => { b.style.transform = ''; });
    });
}
