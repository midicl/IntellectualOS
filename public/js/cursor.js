// Global crosshair cursor — tracks pointer, expands/glows on .hover-target
const cursor = document.getElementById('cross-cursor');

let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
let cx = tx, cy = ty;

document.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
});

// rAF smoothing — hardware-accelerated follow
function tick() {
    cx += (tx - cx) * 0.45;
    cy += (ty - cy) * 0.45;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Hover detection via event delegation
document.addEventListener('pointerover', (e) => {
    if (e.target.closest?.('.hover-target, button, a, input, [data-hover]')) {
        document.body.classList.add('cursor-hover');
    }
});
document.addEventListener('pointerout', (e) => {
    const from = e.target.closest?.('.hover-target, button, a, input, [data-hover]');
    const to = e.relatedTarget?.closest?.('.hover-target, button, a, input, [data-hover]');
    if (from && !to) document.body.classList.remove('cursor-hover');
});

document.addEventListener('pointerdown', () => document.body.classList.add('cursor-click'));
document.addEventListener('pointerup',   () => document.body.classList.remove('cursor-click'));
