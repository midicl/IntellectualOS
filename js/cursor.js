// Global crosshair cursor — instant tracking (no lerp), hover expand,
// disappears cleanly when the pointer leaves the document or focus shifts to
// an iframe (where the browser draws its own cursor anyway).

const cursor = document.getElementById('cross-cursor');

let x = window.innerWidth / 2, y = window.innerHeight / 2;
let visible = true;
cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

function setVisible(v) {
    if (v === visible) return;
    visible = v;
    cursor.style.opacity = v ? '1' : '0';
}

function move(e) {
    x = e.clientX;
    y = e.clientY;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    setVisible(true);
}

document.addEventListener('pointermove', move, { passive: true });

// Hover detection
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

// Hide when pointer leaves the document entirely (top of viewport, off the side, etc.)
document.documentElement.addEventListener('mouseleave', () => setVisible(false));
document.documentElement.addEventListener('mouseenter', () => setVisible(true));

// Hide when an iframe captures focus (the browser will draw its own cursor over it)
window.addEventListener('blur', () => {
    document.body.classList.remove('cursor-hover', 'cursor-click');
    setVisible(false);
});
window.addEventListener('focus', () => setVisible(true));

// Visibility toggle: hide when the tab is in the background
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.remove('cursor-hover', 'cursor-click');
        setVisible(false);
    }
});

// Failsafe: if pointermove hasn't fired in 1.5s and the doc lacks focus, hide.
let lastMove = Date.now();
document.addEventListener('pointermove', () => { lastMove = Date.now(); });
setInterval(() => {
    if (Date.now() - lastMove > 1500 && !document.hasFocus()) setVisible(false);
}, 500);
