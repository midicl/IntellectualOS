// Tiny event bridge to the backend (index.js HTTP bridge on :3000)
// Browser sends heartbeats + events so the Discord bot logs them.

import { getConfig } from './settings.js';

const API = '';  // same-origin — backend served by same host (or proxy in dev)

let email = null;
let heartbeatTimer = null;

export function setEmail(e) {
    email = (e || '').trim().toLowerCase() || null;
}

async function post(path, body) {
    try {
        const r = await fetch(API + path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        return await r.json().catch(() => ({}));
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

export async function loginCheck(em) {
    return post('/login-check', { email: em });
}

export function sendEvent(type, detail = '') {
    if (!email) return;
    post('/event', { email, type, detail });
}

export function startHeartbeat() {
    if (heartbeatTimer || !email) return;
    const ping = () => post('/heartbeat', { email })
        .then((r) => { if (r?.online !== undefined) updateOnlineCount(r.online); });
    ping();
    heartbeatTimer = setInterval(ping, 25_000);
}
export function stopHeartbeat() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
}

export async function fetchOnlineCount() {
    try {
        const r = await fetch(API + '/online');
        const d = await r.json();
        updateOnlineCount(d.online ?? 0);
        return d;
    } catch { return { online: 0 }; }
}

function updateOnlineCount(n) {
    const el = document.getElementById('top-online-n');
    if (el) el.textContent = n;
}
