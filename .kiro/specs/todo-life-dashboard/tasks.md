# Implementation Plan: Focus Timer & Quick Links

## Overview

Implement the Focus Timer (`#timer-card`) and Quick Links (`#links-card`) features using vanilla JavaScript inside a single IIFE in `js/script.js`, and all visual styling inside `css/style.css`. The HTML (`index.html`) is already written and must not be modified. The module-object pattern is used: `Toast`, `Storage`, `TimerModule`, and `LinksModule` are each factory IIFEs exposing a minimal public API, wired together in a `DOMContentLoaded` block.

---

## Tasks

- [x] 1. Write CSS foundation — design tokens, body, header, card, and button styles
  - [x] 1.1 Add `:root` design tokens and base body/header styles
    - Define all custom properties listed in the design (`--color-*`, `--space-*`, `--radius-*`, `--font-*`, `--transition-*`)
    - Set `body` background to `var(--color-bg)`, text color to `var(--color-text)`, and apply `var(--font-body)`
    - Style `.dashboard-header` (centered text, padding, border-bottom)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Add `.dashboard-grid`, `.card`, and input styles
    - `.dashboard-grid`: CSS Grid with `repeat(auto-fit, minmax(320px, 1fr))` and `var(--space-6)` gap
    - `.card`: surface background, border, border-radius, padding
    - `.card-title`: flex row, gap, font size, color
    - `.todo-input`: full-width, surface-2 background, border, border-radius, padding, color — shared by timer and links inputs
    - _Requirements: 1.1, 7.1_

  - [x] 1.3 Add `.btn` base and variant styles (`.btn-primary`, `.btn-secondary`, `.btn-ghost`)
    - Base `.btn`: `display: inline-flex`, padding, border-radius, font-weight, cursor, transition
    - `.btn:disabled`: opacity 0.4, cursor not-allowed
    - Variant colors and hover states as specified in design
    - `.btn-sm`: smaller padding for ghost buttons like "Clear completed"
    - _Requirements: 2.2, 2.4, 3.4_

- [ ] 2. Write CSS for the Focus Timer card
  - [ ] 2.1 Add `.timer-display`, `.timer-progress-bar`, `.timer-progress-fill`, and `.timer-label` styles
    - `.timer-display`: monospace font, `clamp(3rem, 8vw, 5rem)` size, centered, `var(--color-text)`
    - `.timer-progress-bar`: 6 px height, surface-2 background, border-radius, overflow hidden
    - `.timer-progress-fill`: 100% height, width starts at 0%, accent color background, `transition: width var(--transition-fast)`
    - `.timer-label`: centered, muted color, small font size, margin
    - _Requirements: 1.2, 1.3, 5.1, 5.3_

  - [ ] 2.2 Add `.timer-controls` and `.timer-presets` / `.preset-btn` styles
    - `.timer-controls`: flex row, gap, justify-center, margin-top
    - `.timer-presets`: flex row, gap, justify-center, margin-top
    - `.preset-btn`: surface-2 background, muted color, transparent border, border-radius, padding, font-size, cursor, transition
    - `.preset-btn.active`: accent border-color, full text color, rgba accent background
    - _Requirements: 4.5, 4.6_

- [ ] 3. Write CSS for the Quick Links card
  - [ ] 3.1 Add `.links-input-area`, `.links-grid`, `.link-card`, and anchor styles
    - `.links-input-area`: flex column, gap — stacks label input, URL input, and Add button
    - `.links-grid`: CSS Grid `repeat(auto-fill, minmax(140px, 1fr))`, gap, margin-top
    - `.link-card`: relative position, surface-2 background, border, border-radius, overflow hidden, hover lift transform and accent border-color, transition
    - `.link-card__anchor`: block, padding, no underline, text color, font-weight, text-overflow ellipsis
    - _Requirements: 7.1, 7.2_

  - [ ] 3.2 Add `.link-card__delete-btn` and empty-state styles
    - `.link-card__delete-btn`: absolute top-right, transparent background, no border, muted color, opacity 0 normally
    - Show delete button (opacity 1) on `.link-card:hover` and `:focus`
    - `.link-card__delete-btn:hover`: danger color
    - `.links-empty`: centered text, muted color, padding — for the empty-state placeholder paragraph
    - _Requirements: 7.3, 7.4, 9.3_

- [ ] 4. Write CSS for the Toast notification
  - [ ] 4.1 Add `.toast` and `.toast.visible` styles with slide-up animation
    - `.toast`: fixed bottom-center, `transform: translateX(-50%) translateY(20px)`, opacity 0, pointer-events none, z-index 100, surface background, border, border-radius, padding, box-shadow, transition for opacity and transform
    - `.toast.visible`: opacity 1, `transform: translateX(-50%) translateY(0)`
    - _Requirements: 3.2, 8.7, 9.4_

- [ ] 5. Implement the `Storage` utility in `js/script.js`
  - [ ] 5.1 Write `Storage` IIFE with `save()` and `load()` methods
    - Open the IIFE wrapper for the entire `script.js` file
    - `save(key, value)`: calls `JSON.stringify` then `localStorage.setItem`; wraps in try/catch, logs warning on quota error
    - `load(key)`: calls `localStorage.getItem`, wraps `JSON.parse` in try/catch, returns `null` on any failure or missing key
    - _Requirements: 6.1, 6.2, 6.3, 10.1, 10.2, 10.3_

  - [ ]* 5.2 Write property test for Storage round-trip (Property 7 and Property 14)
    - **Property 7: Timer state round-trip persistence**
    - **Validates: Requirements 6.1, 6.2**
    - **Property 14: Quick Links round-trip persistence**
    - **Validates: Requirements 10.1, 10.2, 10.4**
    - Use `fast-check`: generate a valid `focusTimerState` record and a valid `quickLinks` array; assert `load(key)` deep-equals the value passed to `save(key, value)`

- [ ] 6. Implement the `Toast` utility in `js/script.js`
  - [ ] 6.1 Write `Toast` IIFE with `show(message, duration)` method
    - Get `#toast` element by ID
    - `show()`: sets `el.textContent`, adds `.visible` class, clears any pending `hideTimer`, then sets a new `setTimeout` that removes `.visible` after `duration` ms (default 3000)
    - _Requirements: 3.2, 8.7, 9.4_

- [ ] 7. Implement `TimerModule` in `js/script.js`
  - [ ] 7.1 Write `TimerModule` private state and pure helper functions
    - Declare `state` object with fields `presetMinutes`, `totalSeconds`, `remaining`, `isRunning`, `intervalId`
    - `formatTime(seconds)` → zero-padded `"MM:SS"` string
    - `calcProgress()` → `((totalSeconds − remaining) / totalSeconds) × 100`, clamped to [0, 100]
    - _Requirements: 1.1, 5.2, 5.3_

  - [ ]* 7.2 Write property tests for `formatTime` and `calcProgress` (Properties 2 and 5)
    - **Property 2: Countdown decrements by exactly one per tick**
    - **Validates: Requirements 2.1**
    - **Property 5: Progress bar is always clamped to [0, 100]**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Generate arbitrary integers for `remaining` and `k`; assert display and progress values

  - [ ] 7.3 Write `renderDisplay()`, `renderButtons()`, and `renderPresets()` helpers
    - `renderDisplay()`: sets `#timer-display` text content via `formatTime(state.remaining)`, sets `#timer-progress-fill` style width via `calcProgress() + '%'`, sets `#timer-label` text to the active preset label
    - `renderButtons()`: sets `timer-start-btn.disabled = state.isRunning`, `timer-stop-btn.disabled = !state.isRunning`
    - `renderPresets()`: iterates `.preset-btn` elements, adds `.active` to the one matching `state.presetMinutes`, removes it from the others
    - _Requirements: 1.2, 1.4, 2.2, 2.4, 4.5_

  - [ ]* 7.4 Write property test for preset label and active button (Properties 1 and 6)
    - **Property 1: Timer label always reflects active preset**
    - **Validates: Requirements 1.2, 4.3**
    - **Property 6: Exactly one preset button is active at all times**
    - **Validates: Requirements 4.5**
    - For each of {25, 10, 5} simulate a `selectPreset()` call and assert label text and exactly one `.active` class

  - [ ] 7.5 Write `tick()`, `persistState()`, and register `beforeunload` listener
    - `tick()`: decrement `state.remaining`, call `renderDisplay()`; if `remaining === 0` clear interval, set `isRunning = false`, call `renderButtons()`, call `Toast.show('Focus session complete!')`
    - `persistState()`: call `Storage.save('focusTimerState', { presetMinutes, totalSeconds, remaining, isRunning: false })`
    - In `init()`, register `window.addEventListener('beforeunload', persistState)`
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 6.1_

  - [ ] 7.6 Write public methods `init()`, `start()`, `stop()`, `reset()`, and `selectPreset(minutes)`
    - `init()`: load `focusTimerState` from Storage; validate fields (`presetMinutes` in {25,10,5}, `remaining` in [0,totalSeconds]); fall back to defaults on any failure; always set `isRunning = false`; call `renderDisplay()`, `renderButtons()`, `renderPresets()`
    - `start()`: set `isRunning = true`, start `setInterval(tick, 1000)`, call `renderButtons()`
    - `stop()`: clear interval, set `isRunning = false`, call `renderButtons()`
    - `reset()`: call `stop()`, restore `remaining = totalSeconds`, call `renderDisplay()`, call `renderButtons()`
    - `selectPreset(minutes)`: call `stop()`, update `presetMinutes` and `totalSeconds`, call `reset()`, call `renderPresets()`
    - Return `{ init, start, stop, reset, selectPreset }`
    - _Requirements: 2.1–2.7, 4.1–4.6, 6.2–6.4_

  - [ ]* 7.7 Write property tests for timer state persistence and corrupted state fallback (Properties 7 and 8)
    - **Property 7: Timer state round-trip persistence**
    - **Validates: Requirements 6.1, 6.2**
    - **Property 8: Corrupted timer state falls back to defaults**
    - **Validates: Requirements 6.3**
    - Generate valid state objects for P7; generate `fc.anything()` for P8 and assert default values after `init()`

- [ ] 8. Checkpoint — timer smoke test
  - Ensure all timer helper functions are defined, `TimerModule` initialises without errors, and the display shows `25:00` on a fresh load with no localStorage data.
  - Ask the user if anything looks wrong before proceeding.

- [ ] 9. Implement `LinksModule` in `js/script.js`
  - [ ] 9.1 Write `LinksModule` private state, `generateId()`, `persist()`, `showEmpty()`, and `renderGrid()` helpers
    - Declare `let links = []` as internal state
    - `generateId()`: returns `Date.now().toString(36) + Math.random().toString(36).slice(2, 6)`
    - `persist()`: call `Storage.save('quickLinks', links)`
    - `showEmpty()`: sets `#links-grid` innerHTML to a paragraph with class `links-empty` and text "No links yet. Add one above!"
    - `renderGrid()`: if `links.length === 0` call `showEmpty()` and return; otherwise build one `createCard(link)` per entry and replace `#links-grid` contents
    - _Requirements: 7.1, 7.4, 9.3, 10.1_

  - [ ]* 9.2 Write property test for rendered card count (Property 9)
    - **Property 9: Rendered link count matches stored link count**
    - **Validates: Requirements 7.1**
    - Generate `fc.array` of valid link records; seed `links` state; call `renderGrid()`; assert card count in DOM equals array length

  - [ ] 9.3 Write `createCard(link)` helper
    - Build the `.link-card` element with `data-id` attribute
    - Inside it: an `<a class="link-card__anchor">` with correct `href`, `target="_blank"`, `rel="noopener noreferrer"`, and the label as text
    - A `<button class="link-card__delete-btn">` with `aria-label="Delete <label>"` and `×` as text
    - Attach `click` listener on the delete button that calls `LinksModule.deleteLink(link.id)`
    - _Requirements: 7.2, 7.3, 9.1, 9.2_

  - [ ]* 9.4 Write property test for card label and URL correctness (Property 10)
    - **Property 10: Each link card contains correct label and URL**
    - **Validates: Requirements 7.2**
    - Generate `fc.record({label: fc.string({minLength:1}), url: fc.webUrl()})`; call `createCard()`; assert `anchor.href` and visible text

  - [ ] 9.5 Write public methods `init()`, `addLink(label, url)`, and `deleteLink(id)`
    - `init()`: load `quickLinks` from Storage; if result is not an array treat as `[]`; set `links`; call `renderGrid()`
    - `addLink(label, url)`: trim both inputs; if either empty call `Toast.show('Both fields are required.')` and return; if url lacks `http://`/`https://` prefix prepend `https://`; push `{id: generateId(), label, url}` to `links`; `persist()`; `renderGrid()`; clear inputs; `Toast.show('Link added!')`
    - `deleteLink(id)`: filter `links` to remove matching id; `persist()`; `renderGrid()`; `Toast.show('Link removed.')`
    - Return `{ init, addLink, deleteLink }`
    - _Requirements: 7.1–7.4, 8.1–8.7, 9.1–9.4, 10.1–10.4_

  - [ ]* 9.6 Write property tests for empty input rejection, URL normalisation, and delete correctness (Properties 11, 12, 13)
    - **Property 11: Empty input is always rejected**
    - **Validates: Requirements 8.2**
    - **Property 12: URL normalisation always produces http(s):// prefix**
    - **Validates: Requirements 8.3**
    - **Property 13: Delete removes exactly the targeted link**
    - **Validates: Requirements 9.1, 9.2**

- [ ] 10. Wire all event listeners in the `DOMContentLoaded` block
  - [ ] 10.1 Write the `DOMContentLoaded` event wiring block at the bottom of the IIFE
    - Call `TimerModule.init()` and `LinksModule.init()`
    - Wire `#timer-start-btn` → `TimerModule.start()`
    - Wire `#timer-stop-btn` → `TimerModule.stop()`
    - Wire `#timer-reset-btn` → `TimerModule.reset()`
    - Wire `.timer-presets` click with event delegation → `TimerModule.selectPreset(Number(btn.dataset.minutes))`
    - Wire `#link-add-btn` click → read `#link-name-input` and `#link-url-input` values → `LinksModule.addLink(label, url)`
    - Wire `#link-url-input` `keydown` → if `Enter` simulate click on `#link-add-btn`
    - Close the outer IIFE
    - _Requirements: 2.1, 2.3, 2.5, 4.2, 8.1, 8.6_

- [ ] 11. Final checkpoint — full integration pass
  - Ensure all tests pass, ask the user if questions arise.
  - Open `index.html` in a browser and verify:
    - Timer shows `25:00` on fresh load; Start/Stop/Reset work; preset buttons switch durations; progress bar fills during countdown; page refresh restores paused state
    - Quick Links: add a link with and without protocol, delete a link, empty state placeholder appears correctly, toast messages fire for all interactions

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The outer IIFE must wrap the entire `script.js` contents — open it in task 5.1 and close it in task 10.1
- All DOM queries within modules should be cached in `const` references at module scope to avoid repeated lookups
- Property tests use [fast-check](https://fast-check.dev/) loaded from CDN; they live in a separate `tests/` directory and do not affect production code
- Checkpoints in tasks 8 and 11 are gates: do not proceed past them with failing behavior

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "5.2", "6.1"] },
    { "id": 3, "tasks": ["7.1"] },
    { "id": 4, "tasks": ["7.2", "7.3", "9.1"] },
    { "id": 5, "tasks": ["7.4", "7.5", "9.2", "9.3"] },
    { "id": 6, "tasks": ["7.6", "9.4"] },
    { "id": 7, "tasks": ["7.7", "9.5"] },
    { "id": 8, "tasks": ["9.6", "10.1"] }
  ]
}
```
