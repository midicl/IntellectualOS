---
session_id: SIZ-20260420-1200
date: 2026-04-20
time: 12:00 UTC
project: IntellectualOS
agent: SessionCloseoutAgent
current_phase: Phase 1 — Core OS Foundation
---

# Gemini Context — IntellectualOS

## What This Project Is
IntellectualOS is a web-based desktop OS experience rendered entirely in the browser. No framework, no bundler — vanilla HTML, CSS, and JavaScript. It includes an animated dock, glassmorphic windows, a blackhole canvas wallpaper, Firebase Auth, and Firestore-synced user profiles.

- **Local path:** `/home/itzzzshxdow/IntellectualOS/`
- **Remote:** `https://github.com/midicl/IntellectualOS.git` (org: midicl, co-owned with MID)
- **Branch:** `main`
- **Firebase project:** `intellectualos` (messagingSenderId: 184343097461)
- **Primary files:** `index.html`, `script.js` (~5100+ lines), `style.css` (~2500+ lines)

## Current Phase
**Phase 1 — Core OS Foundation** — functionally and visually complete as of 2026-04-20.

Delivered:
- Firebase Auth (Google OAuth + email/password), display name, unique @username, base64 profile photo
- Blackhole canvas wallpaper with animated accretion disk renderer
- Bottom HUD: online count + FPS (left), 12-hour clock + day/date (right)
- Dock: macOS-style magnification via smoothstep bell curve, mouse-follow radial glow, spring hover
- Windows: enter/exit animations with spring physics, "suck into dock" minimize
- `.premium-glass` utility class: canonical glass treatment for all surfaces
- Firestore preference sync (debounced 2s), presence system
- Credits modal (owner: MID, developer: Shxdow)
- Original SVG data URI icons for first-party apps

## Critical Rules — Read Before Making Any Changes

### Firebase
- Firebase project is `intellectualos` (messagingSenderId: `184343097461`).
- Do NOT change to `intellectualos-d9ecf` or any other project ID. This mistake has been made before.
- Read `firebaserules.md` in the repo root before touching any Firestore security rule.

### Animation
- Spring curve acceptable range: `cubic-bezier(0.34, 1.28–1.32, 0.64, 1)`.
- Do NOT use values above 1.4 in the second parameter. Director has explicitly rejected overly bouncy animations.
- Smooth ease-out (no bounce): `cubic-bezier(0.2, 0, 0, 1)`.
- Window enter: `cubic-bezier(0.16, 1, 0.3, 1)`.

### Window Lifecycle
- `openWindow`: must use double-rAF before adding `.active` or CSS transitions will not fire.
- `closeWindow`: remove `.active` first, remove DOM node after 230ms to allow the exit animation to complete. Do not remove the element immediately.

### Glass Surfaces
- Always use `.premium-glass` utility class for new glass surfaces. Do not write duplicate glass rules inline.
- Per-item mouse glow uses `--lx`/`--ly` CSS vars on each dock item (not global `--mx`/`--my`).

### Performance
- No `setInterval` polling — use `MutationObserver` or `IntersectionObserver`.
- Blackhole `draw()` must check `document.hidden` and stop when the tab is not visible.
- Restart rAF loops on `visibilitychange` (visible).

## Outstanding Blockers
1. **[Director action required]** Paste `firestore.rules` content into the Firebase console for the `intellectualos` project. This unblocks the online player count for unauthenticated users.
2. **Technical debt:** `script.js` has two duplicate IIFE blocks. Do not add new functions to both — if you need to add a function, note this debt and consolidate in a future dedicated pass.

## Phase 2 Scope (not yet started)
Build out the app shells inside the existing window system: Hub, Music, Games, Browser, Settings, AI.
