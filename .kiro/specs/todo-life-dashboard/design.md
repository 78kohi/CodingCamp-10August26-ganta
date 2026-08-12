# Design Document — Todo Life Dashboard

## Focus Timer & Quick Links

---

## Overview

This document describes the technical design for the **Focus Timer** and **Quick Links** features of the Life Dashboard. Both features live entirely in the browser: one HTML file, one CSS file, one JS file, zero dependencies, zero build step.

**Scope boundary:** This document covers only `#timer-card` (Focus Timer) and `#links-card` (Quick Links). The Header, Clock, Greeting, and To-Do List are ganta's responsibility and are intentionally omitted.

**Runtime environment:** Modern evergreen browsers (Chrome, Firefox, Edge, Safari). ES2020 features (optional chaining, nullish coalescing) are safe to use.

---

## Architecture

The application uses a **module-object pattern** inside a single IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope while keeping the code readable without a bundler.

```
js/script.js
├── Toast utility        — lightweight show/hide toast helper
├── Storage utility      — thin wrappers around localStorage with JSON parse/serialize
├── TimerModule          — all Focus Timer state and DOM logic
└── LinksModule          — all Quick Links state and DOM logic
```

Each module is a plain JavaScript object literal returned from a factory function. Modules expose only the methods needed by the event-wiring block at the bottom of the file; all state is closed over (private by convention).

```
┌─────────────────────────────────────────────────┐
│                   index.html                    │
│  #timer-card           #links-card              │
│  ↕ DOM reads/writes    ↕ DOM reads/writes       │
│                js/script.js                     │
│  ┌───────────┐ ┌────────────┐ ┌──────────────┐ │
│  │  Timer    │ │   Links    │ │    Toast      │ │
│  │  Module   │ │   Module   │ │   Utility     │ │
│  └─────┬─────┘ └─────┬──────┘ └──────────────┘ │
│        │             │                          │
│  ┌─────▼─────────────▼──────────────────────┐  │
│  │          Storage Utility                  │  │
│  │   localStorage  ("focusTimerState",       │  │
│  │                  "quickLinks")            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Event flow summary:**

1. User interacts with a button/input.
2. The DOM event listener (wired at the bottom of `script.js`) calls the relevant module method.
3. The module updates its internal state.
4. The module calls its own `render()` / DOM-update helpers to sync the view.
5. Where relevant, the module calls `Storage.save(key, data)`.
6. Toast notifications are triggered by modules via `Toast.show(message)`.

---

## Components and Interfaces

### Toast Utility

Manages the `#toast` element. Automatically hides after a timeout.

```js
const Toast = (() => {
  const el = document.getElementById('toast');
  let hideTimer = null;

  /**
   * Display a toast message for `duration` milliseconds (default 3000).
   * @param {string} message
   * @param {number} [duration=3000]
   */
  function show(message, duration = 3000) { ... }

  return { show };
})();
```

CSS classes used: `.toast`, `.toast.visible` (toggled to trigger the CSS transition).

---

### Storage Utility

Thin wrappers so modules never call `localStorage` directly, making it easy to mock in tests.

```js
const Storage = (() => {
  /**
   * @param {string} key
   * @param {*} value  — must be JSON-serializable
   */
  function save(key, value) { ... }

  /**
   * @param {string} key
   * @returns {*|null}  parsed value, or null on failure / missing key
   */
  function load(key) { ... }

  return { save, load };
})();
```

`load()` wraps `JSON.parse` in a try/catch and returns `null` on any failure, satisfying the "corrupted state → defaults" requirements (6.3, 10.3).

---

### TimerModule

Owns all Focus Timer state and its DOM subtree.

**Internal state shape:**

```js
{
  presetMinutes: 25,      // active preset (25 | 10 | 5)
  totalSeconds:  1500,    // presetMinutes * 60
  remaining:     1500,    // seconds left in current session
  isRunning:     false,   // true while interval is active
  intervalId:    null,    // return value of setInterval
}
```

**Public interface:**

```js
const TimerModule = (() => {
  // --- private state ---
  let state = { presetMinutes, totalSeconds, remaining, isRunning, intervalId };

  // --- private helpers ---
  function formatTime(seconds)  { ... }  // → "MM:SS"
  function calcProgress()       { ... }  // → 0–100 number
  function renderDisplay()      { ... }  // updates #timer-display, #timer-progress-fill, #timer-label
  function renderButtons()      { ... }  // enables/disables start/stop btns
  function renderPresets()      { ... }  // applies/removes .active on .preset-btn
  function tick()               { ... }  // called each second; decrements remaining
  function persistState()       { ... }  // Storage.save('focusTimerState', ...)

  // --- public API ---
  function init()               { ... }  // load from storage or defaults; render
  function start()              { ... }  // set isRunning, start interval
  function stop()               { ... }  // clear interval, isRunning=false, render
  function reset()              { ... }  // stop + restore remaining to totalSeconds
  function selectPreset(minutes){ ... }  // stop, update preset, reset, render

  return { init, start, stop, reset, selectPreset };
})();
```

**Key behavioral rules encoded in `tick()`:**
- Decrements `state.remaining` by 1.
- Calls `renderDisplay()`.
- If `remaining === 0`: clears interval, sets `isRunning = false`, calls `Toast.show('Focus session complete!')`, calls `renderButtons()`.

**`persistState()` is called from:**
- A `beforeunload` listener registered during `init()`.

**Restore-on-load logic (inside `init()`):**

```
raw = Storage.load('focusTimerState')
if raw is null or missing required fields → use defaults
else:
  restore presetMinutes, totalSeconds, remaining
  always restore isRunning = false  (req 6.4)
  call renderDisplay(), renderButtons(), renderPresets()
```

---

### LinksModule

Owns all Quick Links state and the `#links-grid` DOM subtree.

**Internal state shape:**

```js
/** @type {Array<{id: string, label: string, url: string}>} */
let links = [];
```

Each link record has a generated `id` (e.g., `Date.now().toString(36)` + random suffix) so delete operations can target the correct record without relying on DOM index.

**Public interface:**

```js
const LinksModule = (() => {
  let links = [];

  // --- private helpers ---
  function persist()         { ... }  // Storage.save('quickLinks', links)
  function renderGrid()      { ... }  // rebuilds #links-grid from links array
  function createCard(link)  { ... }  // → HTMLElement for one link card
  function showEmpty()       { ... }  // renders placeholder when links.length === 0

  // --- public API ---
  function init()            { ... }  // load from storage; renderGrid()
  function addLink(label, url) { ... } // validate → normalise URL → push → persist → renderGrid → toast
  function deleteLink(id)    { ... }  // filter links → persist → renderGrid → toast

  return { init, addLink, deleteLink };
})();
```

**`addLink` validation logic:**

```
label = label.trim()
url   = url.trim()
if label === '' or url === '' → Toast.show('Both fields are required.'); return
if !url.startsWith('http://') and !url.startsWith('https://') → url = 'https://' + url
id = generateId()
links.push({ id, label, url })
persist()
renderGrid()
clear inputs
Toast.show('Link added!')
```

**`createCard(link)` DOM structure:**

```html
<div class="link-card" data-id="<id>">
  <a href="<url>" target="_blank" rel="noopener noreferrer" class="link-card__anchor">
    <span class="link-card__label"><label></span>
  </a>
  <button class="link-card__delete-btn" aria-label="Delete <label>">×</button>
</div>
```

The delete button's `click` listener calls `LinksModule.deleteLink(id)`.

---

### Event Wiring (bottom of script.js)

```js
document.addEventListener('DOMContentLoaded', () => {
  TimerModule.init();
  LinksModule.init();

  // Timer controls
  document.getElementById('timer-start-btn').addEventListener('click', () => TimerModule.start());
  document.getElementById('timer-stop-btn') .addEventListener('click', () => TimerModule.stop());
  document.getElementById('timer-reset-btn').addEventListener('click', () => TimerModule.reset());

  // Preset buttons (event delegation)
  document.querySelector('.timer-presets').addEventListener('click', e => {
    const btn = e.target.closest('.preset-btn');
    if (btn) TimerModule.selectPreset(Number(btn.dataset.minutes));
  });

  // Quick Links form
  document.getElementById('link-add-btn').addEventListener('click', () => {
    const label = document.getElementById('link-name-input').value;
    const url   = document.getElementById('link-url-input').value;
    LinksModule.addLink(label, url);
  });

  // Support pressing Enter in the URL field to add
  document.getElementById('link-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('link-add-btn').click();
  });
});
```

---

## Data Models

### `focusTimerState` (LocalStorage key)

```json
{
  "presetMinutes": 25,
  "totalSeconds":  1500,
  "remaining":     843,
  "isRunning":     false
}
```

| Field | Type | Description |
|---|---|---|
| `presetMinutes` | `25 \| 10 \| 5` | The active preset (integer) |
| `totalSeconds` | `number` | `presetMinutes * 60` |
| `remaining` | `number` | Seconds remaining (0 ≤ remaining ≤ totalSeconds) |
| `isRunning` | `boolean` | Always stored as `false` (req 6.4) |

Validation on load: `presetMinutes` must be in `{25, 10, 5}`, `remaining` must be a number in `[0, totalSeconds]`. Any other shape → discard → defaults.

---

### `quickLinks` (LocalStorage key)

```json
[
  { "id": "k3x9m2", "label": "Gmail", "url": "https://mail.google.com" },
  { "id": "p7r1n5", "label": "GitHub", "url": "https://github.com" }
]
```

| Field | Type | Constraints |
|---|---|---|
| `id` | `string` | Non-empty, unique across the array |
| `label` | `string` | Non-empty, max 30 chars |
| `url` | `string` | Must start with `http://` or `https://` after normalisation |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Timer label always reflects active preset

*For any* preset selection from {25, 10, 5} minutes, the text content of `#timer-label` must match the label string associated with that preset (e.g., selecting 10 produces "Short Break · 10 min").

**Validates: Requirements 1.2, 4.3**

---

### Property 2: Countdown decrements by exactly one per tick

*For any* valid remaining time R (1 ≤ R ≤ totalSeconds), after exactly k ticks the display must show `formatTime(R − k)`, where 0 ≤ k ≤ R.

**Validates: Requirements 2.1**

---

### Property 3: Stop preserves countdown value

*For any* elapsed tick count k when stop is pressed, the displayed value must equal `formatTime(totalSeconds − k)` and must not change on subsequent ticks.

**Validates: Requirements 2.3**

---

### Property 4: Reset restores full preset duration

*For any* preset and any timer state (running, paused, or idle), after calling reset the displayed time must equal `formatTime(preset.totalSeconds)` and progress fill must equal 0%.

**Validates: Requirements 2.5, 2.6, 4.2, 4.4**

---

### Property 5: Progress bar is always clamped to [0, 100]

*For any* timer state (any remaining, any totalSeconds), the computed progress percentage — `(elapsed / totalSeconds) × 100` — must be a number in the closed interval [0, 100].

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 6: Exactly one preset button is active at all times

*For any* preset selection, exactly one `.preset-btn` element has the `active` CSS class, and it must be the button whose `data-minutes` matches the currently active preset.

**Validates: Requirements 4.5**

---

### Property 7: Timer state round-trip persistence

*For any* valid timer state object {presetMinutes, totalSeconds, remaining, isRunning: false}, serialising it to `focusTimerState` in localStorage and then deserialising it must produce an object that is value-equal to the original.

**Validates: Requirements 6.1, 6.2**

---

### Property 8: Corrupted timer state falls back to defaults

*For any* malformed value stored under `focusTimerState` (invalid JSON, missing fields, out-of-range values), `TimerModule.init()` must initialise with `presetMinutes = 25`, `remaining = 1500`, progress = 0%, start button enabled, stop button disabled.

**Validates: Requirements 6.3**

---

### Property 9: Rendered link count matches stored link count

*For any* array of N valid link records stored in `quickLinks`, `LinksModule.init()` must render exactly N link cards in `#links-grid`.

**Validates: Requirements 7.1**

---

### Property 10: Each link card contains correct label and URL

*For any* link record {label, url}, the rendered card must contain the label as visible text and an `<a>` element with `href === url` and `target === "_blank"`.

**Validates: Requirements 7.2**

---

### Property 11: Empty input is always rejected

*For any* input pair where `label.trim() === ""` or `url.trim() === ""`, calling `addLink` must leave the links array unchanged and must not write a new entry to localStorage.

**Validates: Requirements 8.2**

---

### Property 12: URL normalisation always produces http(s):// prefix

*For any* URL string that does not begin with `http://` or `https://`, after normalisation the stored URL must begin with `https://`.

**Validates: Requirements 8.3**

---

### Property 13: Delete removes exactly the targeted link

*For any* array of N links (N ≥ 1) and any link at index i, after deleting that link by id the stored array must have length N − 1 and must not contain a record with the deleted link's id.

**Validates: Requirements 9.1, 9.2**

---

### Property 14: Quick Links round-trip persistence

*For any* sequence of add and delete operations applied to the links array, serialising the result to `quickLinks` in localStorage and then deserialising it must produce an array that is value-equal (same ids, labels, and URLs in the same order) to the pre-serialisation array.

**Validates: Requirements 10.1, 10.2, 10.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `focusTimerState` absent or unparseable | Silently fall back to 25-min defaults; no user-visible error |
| `focusTimerState` has out-of-range values | Same fallback as above |
| `quickLinks` absent or unparseable | Treat as empty array; render placeholder |
| `localStorage` quota exceeded on save | `Storage.save()` wraps `setItem` in try/catch; logs warning to console; no crash |
| Add link with empty label or URL | Toast("Both fields are required."); no state change |
| User pastes a URL without protocol | Prepend `https://`; save normally |

All error paths must leave the UI in a consistent, interactive state — no broken displays, no disabled controls.

---

## CSS Architecture

### Design Tokens

Custom properties defined on `:root`:

```css
:root {
  /* Palette */
  --color-bg:           #0f172a;   /* slate-900 */
  --color-surface:      #1e293b;   /* slate-800, card background */
  --color-surface-2:    #334155;   /* slate-700, input / button bg */
  --color-border:       #475569;   /* slate-600 */
  --color-text:         #f1f5f9;   /* slate-100 */
  --color-text-muted:   #94a3b8;   /* slate-400 */
  --color-accent:       #6366f1;   /* indigo-500, primary action */
  --color-accent-hover: #4f46e5;   /* indigo-600 */
  --color-danger:       #f87171;   /* red-400, delete button */
  --color-success:      #34d399;   /* emerald-400, toast success */

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Typography */
  --font-mono: 'Courier New', Courier, monospace;
  --font-body: system-ui, -apple-system, sans-serif;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

### Layout

`.dashboard-grid` uses CSS Grid:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-6);
  padding: var(--space-6);
}
```

Cards stack in a single column on narrow viewports and flow into two or three columns on wider screens.

### Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
```

### Timer Display

```css
.timer-display {
  font-family: var(--font-mono);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.05em;
  color: var(--color-text);
  line-height: 1;
  margin: var(--space-4) 0;
}
```

### Progress Bar

```css
.timer-progress-bar {
  height: 6px;
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.timer-progress-fill {
  height: 100%;
  width: 0%;                         /* controlled by JS: el.style.width */
  background: var(--color-accent);
  border-radius: var(--radius-sm);
  transition: width var(--transition-fast);
}
```

### Button Variants

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Variants */
.btn-primary   { background: var(--color-accent); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }

.btn-secondary { background: var(--color-surface-2); color: var(--color-text); }
.btn-secondary:hover:not(:disabled) { filter: brightness(1.15); }

.btn-ghost     { background: transparent; color: var(--color-text-muted); }
.btn-ghost:hover:not(:disabled) { color: var(--color-text); }
```

### Preset Buttons

```css
.preset-btn {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preset-btn.active {
  border-color: var(--color-accent);
  color: var(--color-text);
  background: rgba(99, 102, 241, 0.15);
}
```

### Link Cards

```css
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.link-card {
  position: relative;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.link-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.link-card__anchor {
  display: block;
  padding: var(--space-4) var(--space-3);
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card__delete-btn {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast), color var(--transition-fast);
}

.link-card:hover .link-card__delete-btn,
.link-card__delete-btn:focus {
  opacity: 1;
}

.link-card__delete-btn:hover {
  color: var(--color-danger);
}
```

### Toast

```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  color: var(--color-text);
  font-size: 0.875rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-base), transform var(--transition-base);
  z-index: 100;
}

.toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

---

## Testing Strategy

### Dual Testing Approach

Both unit/example tests and property-based tests are used:
- **Example tests** cover specific scenarios, UI state transitions, and edge cases where the correct output is a fixed, known value.
- **Property tests** cover universal invariants that must hold across the full input space.

### Property-Based Testing

The feature involves pure data-transformation logic (timer formatting, progress calculation, URL normalisation, JSON serialisation, link array operations) that is highly amenable to property-based testing.

**Library recommendation:** [fast-check](https://fast-check.dev/) (JavaScript, browser-compatible; can be loaded via CDN for test files).

Each property test must run a minimum of **100 iterations**.

Tag format for each test:
```
// Feature: todo-life-dashboard, Property <N>: <property title>
```

### Property Test Coverage

| Property | What to generate | What to assert |
|---|---|---|
| P1 — Label reflects preset | fc.oneof(fc.constant(25), fc.constant(10), fc.constant(5)) | label text matches preset definition |
| P2 — Decrement by 1 per tick | fc.integer({min:1, max:1500}), fc.nat for k | display === formatTime(R − k) |
| P3 — Stop preserves value | fc.integer for elapsed k | value unchanged after stop |
| P4 — Reset restores full duration | fc.oneof(25/10/5) + any state | display === preset:00, fill === 0% |
| P5 — Progress clamped [0,100] | fc.integer({min:0, max:1500}) for elapsed, any preset | 0 ≤ fill ≤ 100 |
| P6 — Exactly one active preset | fc.oneof(25/10/5) | exactly 1 `.active` btn, matching selection |
| P7 — Timer state round-trip | fc.record with valid fields | deserialise(serialise(state)) deep-equals state |
| P8 — Corrupted state → defaults | fc.anything() except valid state | defaults applied after init |
| P9 — Card count equals link count | fc.array(fc.record({label, url})) | card count === array length |
| P10 — Card label and URL correct | fc.record({label: fc.string(), url: fc.webUrl()}) | card contains label text, href, target |
| P11 — Empty input rejected | fc.tuple(emptyString, fc.string()) etc. | links array unchanged |
| P12 — URL normalisation | fc.string() not starting with http(s):// | stored URL starts with `https://` |
| P13 — Delete removes target | fc.array(link, {minLength:1}), fc.nat for index | length − 1, no matching id |
| P14 — Links round-trip | random add/delete sequences | deserialise(serialise(links)) deep-equals links |

### Unit / Example Tests

For each module, example tests should cover:
- Initial state on fresh load (no localStorage data)
- Start → stop → resume sequence
- Timer reaching 00:00 (mocked setInterval)
- Running state restored as paused on reload
- Link add → toast shown → inputs cleared
- Link delete → placeholder appears when last link removed
- Add with invalid URL (no protocol)
- Toast visibility timing

### Test File Structure (recommendation)

```
tests/
  timer.test.js    — TimerModule unit + property tests
  links.test.js    — LinksModule unit + property tests
  storage.test.js  — Storage utility round-trip tests
```

Run with a browser test runner (e.g., [Vitest](https://vitest.dev/) with jsdom) or directly in the browser using fast-check + a simple test harness.
