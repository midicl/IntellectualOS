// Effects overlay — rain, snow, or off. Color + intensity configurable.
// Single canvas, single rAF loop, switches mode without restart.

const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

let mode = 'rain';            // 'rain' | 'snow' | 'off'
let color = '#003366';
let intensity = 1.0;          // 0.5–2.0 (drop count multiplier)
let running = false;

const FONT_SIZE = 16;
const RAIN_CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789$+=*<>{}[]/#'.split('');

let rainDrops = [];
let snowFlakes = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / FONT_SIZE);
    rainDrops = new Array(cols).fill(0).map(() => Math.random() * -50);
    const flakeCount = Math.floor(canvas.width * canvas.height / 9000 * intensity);
    snowFlakes = Array.from({ length: flakeCount }, () => spawnFlake());
    ctx.font = `${FONT_SIZE - 2}px JetBrains Mono, monospace`;
}
function spawnFlake() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.6,
        vy: 0.4 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.5,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.005 + Math.random() * 0.02,
    };
}
resize();
window.addEventListener('resize', resize);

function drawRain() {
    ctx.fillStyle = 'rgba(0, 1, 5, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    for (let i = 0; i < rainDrops.length; i++) {
        const ch = RAIN_CHARS[(Math.random() * RAIN_CHARS.length) | 0];
        const y = rainDrops[i] * FONT_SIZE;
        ctx.fillText(ch, i * FONT_SIZE, y);
        if (y > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
        rainDrops[i] += 0.6 * intensity;
    }
}

function drawSnow() {
    ctx.fillStyle = 'rgba(0, 1, 5, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    for (const f of snowFlakes) {
        f.sway += f.swaySpeed;
        f.x += f.vx + Math.cos(f.sway) * 0.4;
        f.y += f.vy;
        if (f.y > canvas.height + 4) {
            f.y = -4;
            f.x = Math.random() * canvas.width;
        }
        if (f.x < -4) f.x = canvas.width + 4;
        if (f.x > canvas.width + 4) f.x = -4;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function frame() {
    if (!running) return;
    if (mode === 'rain')      drawRain();
    else if (mode === 'snow') drawSnow();
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

export function setEffectMode(m) {
    mode = m;
    if (m === 'off') {
        stopRain();
    } else {
        if (m === 'snow' && color === '#003366') color = '#ffffff';
        else if (m === 'rain' && color === '#ffffff') color = '#003366';
        if (!running) startRain();
    }
}
export function setEffectColor(hex) { color = hex; }
export function setEffectIntensity(n) {
    intensity = Math.max(0.3, Math.min(3, Number(n) || 1));
    resize();
}
export function getEffectMode()  { return mode; }
export function getEffectColor() { return color; }
