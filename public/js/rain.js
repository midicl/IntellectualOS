// Digital rain overlay — deep blue (#003366), 0.4 opacity
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

let columns = 0;
let drops = [];
let running = false;
const FONT_SIZE = 16;
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789$+=*<>{}[]/#'.split('');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / FONT_SIZE);
    drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    ctx.font = `${FONT_SIZE - 2}px Fira Code, monospace`;
}
resize();
window.addEventListener('resize', resize);

function frame() {
    if (!running) return;
    ctx.fillStyle = 'rgba(0, 1, 5, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#003366';
    for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[(Math.random() * CHARS.length) | 0];
        const y = drops[i] * FONT_SIZE;
        ctx.fillText(ch, i * FONT_SIZE, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.6;
    }
    requestAnimationFrame(frame);
}

export function startRain() {
    if (running) return;
    running = true;
    canvas.classList.add('on');
    requestAnimationFrame(frame);
}
export function stopRain() {
    running = false;
    canvas.classList.remove('on');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
