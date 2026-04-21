---
session_id: SIZ-20260420-1200
date: 2026-04-20
time: 12:00 UTC
project: IntellectualOS
agent: SessionCloseoutAgent
current_phase: Phase 1 — Core OS Foundation
---

# Claude Context — IntellectualOS

## What This Project Is
IntellectualOS is a web-based desktop OS experience. It renders an interactive windowed desktop in the browser — blackhole canvas wallpaper, animated dock, glassmorphic windows, HUD, Firebase Auth, and Firestore-synced user profiles. No framework, no bundler: vanilla HTML/CSS/JS.

- **Local path:** `/home/itzzzshxdow/IntellectualOS/`
- **Remote:** `https://github.com/midicl/IntellectualOS.git` (org: midicl, co-owned with MID)
- **Branch:** `main`
- **Firebase project:** `intellectualos` (messagingSenderId: 184343097461) — do NOT use `intellectualos-d9ecf`
- **Primary files:** `index.html`, `script.js` (~5100+ lines), `style.css` (~2500+ lines)

## Current Phase
**Phase 1 — Core OS Foundation** — functionally and visually complete as of 2026-04-20.

Delivered:
- Firebase Auth (Google OAuth + email/password), display name, unique @username, base64 profile photo
- Blackhole canvas wallpaper (`__blackhole__` sentinel), animated accretion disk renderer
- Bottom HUD: `#sys-hud` (online count + FPS), `#sys-clock` (12-hour format, day + date)
- Dock: glassmorphic, macOS-style magnification (smoothstep bell curve), mouse-follow radial glow (`--lx`/`--ly` per item), spring hover (`cubic-bezier(0.34, 1.28, 0.64, 1)`)
- Windows: enter animation `scale(0.94)+translateY(14px)→scale(1)`, exit animation fades + scales over 230ms before DOM removal
- `.premium-glass` utility class: canonical glass treatment (feTurbulence noise, inset gradient border, ambient shadow)
- Firestore preference sync (debounced 2s), presence system (`presence/` collection + `onSnapshot`)
- Credits modal (owner: MID, developer: Shxdow)
- Original SVG data URI icons for first-party apps (Hub, Music, Games, Browser, Settings, AI)

## Key Architecture Decisions

### Animation Constraints
- Spring curves must stay tasteful. Confirmed range: `cubic-bezier(0.34, 1.28–1.32, 0.64, 1)`.
- Values above 1.4 in the second parameter read as "too bouncy" — director has explicitly rejected this.
- Smooth ease-out where no bounce is desired: `cubic-bezier(0.2, 0, 0, 1)`.
- Window enter: `cubic-bezier(0.16, 1, 0.3, 1)`.

### Window Lifecycle
- `openWindow`: double-rAF before adding `.active` to ensure CSS transitions fire.
- `closeWindow`: remove `.active` first, remove DOM node after 230ms timeout (allows exit animation to complete).
- Minimize: "suck into dock" using `getBoundingClientRect` to calculate target coordinates.

### Glass Surfaces
- Use `.premium-glass` utility class for all new glass surfaces. Do not duplicate its rules inline.
- Mouse-follow glow uses `--lx`/`--ly` per element (set via rAF-throttled `pointermove` event delegation).
- Global pointer position tracked as `--mx`/`--my` on `:root`.

### Performance Rules
- No `setInterval` polling where an observer can be used. `MutationObserver` is preferred.
- Blackhole `draw()` must pause when `document.hidden === true` (via `visibilitychange`).
- All rAF loops must restart on `visibilitychange` (visible) after being paused.

### CSS Variables
- `:root` vars are organized into 5 semantic groups. Named spring curve variables are defined there.
- Do not add ad-hoc `transition` values inline — reference the named curves from `:root`.

### Firebase
- Project: `intellectualos`, messagingSenderId: `184343097461`.
- Auth: shared instance — do not initialize a second Firebase app.
- Presence writes are currently blocked for unauthenticated users (Firestore rules not yet updated in console).
- `firebaserules.md` in the repo root contains the complete rules ready to paste into the Firebase console.

## Outstanding Blockers
1. **[Director action required]** Paste `firestore.rules` into Firebase console (project: `intellectualos`) to allow `presence/` writes and enable the online player count for all users.
2. **Technical debt:** `script.js` contains two duplicate IIFE blocks (most functions appear twice). A future consolidation pass is needed.

## What Claude Should Prioritize in Future Sessions
- Always check `firebaserules.md` before touching any Firestore security rule.
- When adding new interactive surfaces (windows, panels, menus), apply `.premium-glass` — do not reinvent glass styles.
- When adding new animations, validate the spring curve value against the acceptable range above.
- Phase 2 scope: building out the app shells (Hub, Music, Games, Browser, Settings, AI) inside the window system.
