// Intellectual AI — chat app. Talks to backend /ai, which proxies to whatever
// provider is configured via env vars on the server (OpenAI / Anthropic / Groq /
// OpenRouter). If nothing is configured, the backend returns a helpful stub.
import { createWindow } from './windows.js';

const SYSTEM_HINT = `You are "Intellectual AI", the built-in assistant for Intellectual OS — a
sleek cyberpunk web-shell with games, a browser, and a terminal. Keep answers
concise and on-brand: confident, slightly playful, technical when useful.`;

export function openAI() {
    const body = document.createElement('div');
    body.className = 'app-ai';

    body.innerHTML = `
        <div class="ai-header">
            <div class="ai-brand">
                <div class="ai-orb"></div>
                <div>
                    <div class="ai-title">INTELLECTUAL AI</div>
                    <div class="ai-sub" id="ai-status">Online · ready</div>
                </div>
            </div>
            <div class="ai-tools">
                <button class="ai-tool hover-target" id="ai-clear" title="Clear conversation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </button>
            </div>
        </div>

        <div class="ai-log" id="ai-log"></div>

        <form class="ai-composer" id="ai-form" autocomplete="off">
            <textarea class="ai-input hover-target" id="ai-input" rows="1" placeholder="Ask Intellectual AI…" spellcheck="false"></textarea>
            <button class="ai-send hover-target" id="ai-send" type="submit" title="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
        </form>
    `;

    const log = body.querySelector('#ai-log');
    const input = body.querySelector('#ai-input');
    const form = body.querySelector('#ai-form');
    const send = body.querySelector('#ai-send');
    const status = body.querySelector('#ai-status');
    const clearBtn = body.querySelector('#ai-clear');

    // Conversation state (in-memory; not persisted)
    const messages = [];

    // Welcome message
    addMessage('ai', `Hello — I'm Intellectual AI. Ask anything about the OS, or have me help with games, research, code, whatever you need.`);

    function addMessage(role, content, opts = {}) {
        const row = document.createElement('div');
        row.className = `ai-msg ${role}`;
        row.innerHTML = `
            ${role === 'ai' ? '<div class="ai-avatar"><div class="ai-orb small"></div></div>' : ''}
            <div class="ai-bubble">${opts.html ? content : renderMarkdownish(content)}</div>
        `;
        log.appendChild(row);
        log.scrollTop = log.scrollHeight;
        return row;
    }

    // Minimal markdown: **bold**, `code`, newlines
    function renderMarkdownish(text) {
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    function autosize() {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 160) + 'px';
    }
    input.addEventListener('input', autosize);

    // Enter to send, Shift+Enter for newline
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    });

    async function submit() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        autosize();

        addMessage('user', text);
        messages.push({ role: 'user', content: text });

        send.disabled = true;
        status.textContent = 'Thinking…';
        status.classList.add('thinking');

        // Typing indicator
        const typing = document.createElement('div');
        typing.className = 'ai-msg ai';
        typing.innerHTML = `<div class="ai-avatar"><div class="ai-orb small"></div></div><div class="ai-bubble typing"><span></span><span></span><span></span></div>`;
        log.appendChild(typing);
        log.scrollTop = log.scrollHeight;

        try {
            const res = await fetch('/ai', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'system', content: SYSTEM_HINT }, ...messages],
                }),
            });
            const data = await res.json().catch(() => ({}));
            typing.remove();

            if (!res.ok || !data.content) {
                addMessage('ai', data.error || data.hint || 'Something went wrong. Try again.');
                return;
            }
            addMessage('ai', data.content);
            messages.push({ role: 'assistant', content: data.content });
            if (data.provider) status.textContent = `${data.provider} · ready`;
        } catch (e) {
            typing.remove();
            addMessage('ai', `Network error: ${e.message}`);
        } finally {
            send.disabled = false;
            status.classList.remove('thinking');
            status.textContent = status.textContent.replace(/Thinking.*/, '').trim() || 'ready';
            input.focus();
        }
    }

    form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
    clearBtn.addEventListener('click', () => {
        messages.length = 0;
        log.innerHTML = '';
        addMessage('ai', 'Context cleared. What next?');
    });

    const win = createWindow({
        id: 'intellectual-ai',
        title: 'INTELLECTUAL · AI',
        icon: '❋',
        width: 720,
        height: 620,
        content: body,
    });

    setTimeout(() => input.focus(), 100);
    return win;
}
