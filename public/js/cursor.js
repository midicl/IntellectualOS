// Global crosshair cursor — instant tracking (no lerp), hover expand
const cursor = document.getElementById('cross-cursor');

// Direct transform via pointermove — no rAF smoothing because the lerp added lag.
// Browsers batch transforms automatically, so this is already 60fps-capped.
let x = window.innerWidth / 2, y = window.innerHeight / 2;
cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

function move(e) {
    x = e.clientX;
    y = e.clientY;
    // translate3d forces GPU compositing — cheaper than 2D translate
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
}

document.addEventListener('pointermove', move, { passive: true });
window.addEventListener('blur', () => { document.body.classList.remove('cursor-hover'); });

// Hover detection via event delegation
const HOVER_SEL = '.hover-target, button, a, input, select, textarea, [data-hover]';
document.addEventListener('pointerover', (e) => {
    if (e.target.closest?.(HOVER_SEL)) document.body.classList.add('cursor-hover');
});
document.addEventListener('pointerout', (e) => {
    const from = e.target.closest?.(HOVER_SEL);
    const to = e.relatedTarget?.closest?.(HOVER_SEL);
    if (from && !to) document.body.classList.remove('cursor-hover');
});

document.addEventListener('pointerdown', () => document.body.classList.add('cursor-click'));
document.addEventListener('pointerup',   () => document.body.classList.remove('cursor-click'));

// Iframe focus: our cursor disappears over iframes (browser takes over).
// When pointer re-enters the main document, we immediately re-place the cursor.
document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
