# Requirements Document

## Introduction

This document specifies requirements for two features of the To-Do Life Dashboard web page: the **Focus Timer** and the **Quick Links** manager. The dashboard is a single-page, client-side application built with HTML, CSS, and Vanilla JavaScript. All data persists via the Browser Local Storage API. The Header, Clock, Greeting, and To-Do List sections are handled separately by the project collaborator (ganta) and are outside the scope of this document.

## Glossary

- **Dashboard**: The single-page web application described by `index.html`.
- **Focus_Timer**: The countdown timer component rendered inside `#timer-card`.
- **Quick_Links**: The link management component rendered inside `#links-card`.
- **LocalStorage**: The Browser Local Storage API (`window.localStorage`), used for client-side data persistence.
- **Preset**: One of the three fixed countdown durations offered by the Focus Timer (25 min, 10 min, 5 min).
- **Session**: A single countdown run from start until it reaches zero or is manually stopped/reset.
- **Link**: A user-defined record consisting of a label (display text) and a URL.
- **Toast**: The transient notification element (`#toast`) used to provide feedback to the user.
- **Progress_Bar**: The horizontal bar (`#timer-progress-fill`) that represents elapsed time as a visual proportion of the total session duration.

---

## Requirements

### Requirement 1: Focus Timer — Default State and Display

**User Story:** As a student, I want to see a ready-to-use 25-minute countdown timer when I open the dashboard, so that I can start a focus session immediately without any configuration.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display an initial countdown value of `25:00` (MM:SS format) when the page loads and no persisted timer state exists in LocalStorage.
2. THE Focus_Timer SHALL display the active Preset label (e.g., "Pomodoro · 25 min") below the countdown display at all times.
3. THE Focus_Timer SHALL render the Progress_Bar at 0% fill on initial load.
4. THE Focus_Timer SHALL render the Start button in an enabled state and the Stop button in a disabled state on initial load.

---

### Requirement 2: Focus Timer — Start, Stop, and Reset Controls

**User Story:** As a student, I want to start, stop, and reset the timer with dedicated buttons, so that I have full control over my focus session.

#### Acceptance Criteria

1. WHEN the Start button is clicked, THE Focus_Timer SHALL begin decrementing the countdown display by one second each second.
2. WHEN the Start button is clicked, THE Focus_Timer SHALL disable the Start button and enable the Stop button.
3. WHEN the Stop button is clicked while the timer is running, THE Focus_Timer SHALL pause the countdown at the current value without resetting it.
4. WHEN the Stop button is clicked, THE Focus_Timer SHALL enable the Start button and disable the Stop button.
5. WHEN the Reset button is clicked, THE Focus_Timer SHALL stop the countdown (if running) and restore the display to the full duration of the currently active Preset.
6. WHEN the Reset button is clicked, THE Focus_Timer SHALL reset the Progress_Bar fill to 0%.
7. WHEN the Reset button is clicked, THE Focus_Timer SHALL enable the Start button and disable the Stop button.

---

### Requirement 3: Focus Timer — Countdown Completion

**User Story:** As a student, I want the timer to notify me when my focus session ends, so that I know when to take a break.

#### Acceptance Criteria

1. WHEN the countdown reaches `00:00`, THE Focus_Timer SHALL stop decrementing automatically.
2. WHEN the countdown reaches `00:00`, THE Focus_Timer SHALL display the Toast notification with the message "Focus session complete!".
3. WHEN the countdown reaches `00:00`, THE Focus_Timer SHALL set the Progress_Bar fill to 100%.
4. WHEN the countdown reaches `00:00`, THE Focus_Timer SHALL enable the Start button and disable the Stop button, returning to a ready state for a new session.

---

### Requirement 4: Focus Timer — Preset Durations

**User Story:** As a student, I want to choose from preset durations (25 min, 10 min, 5 min), so that I can quickly switch between different types of focus intervals.

#### Acceptance Criteria

1. THE Focus_Timer SHALL offer exactly three Preset buttons: 25 min, 10 min, and 5 min.
2. WHEN a Preset button is clicked, THE Focus_Timer SHALL stop any running countdown and reset the display to the selected Preset's full duration.
3. WHEN a Preset button is clicked, THE Focus_Timer SHALL update the Preset label below the countdown display to reflect the selected Preset.
4. WHEN a Preset button is clicked, THE Focus_Timer SHALL reset the Progress_Bar fill to 0%.
5. WHEN a Preset button is clicked, THE Focus_Timer SHALL apply the `active` CSS class to the selected Preset button and remove it from all other Preset buttons.
6. THE Focus_Timer SHALL display the 25 min Preset button with the `active` class on initial page load.

---

### Requirement 5: Focus Timer — Progress Bar

**User Story:** As a student, I want a visual progress bar to show how much of my focus session has elapsed, so that I can track my progress at a glance.

#### Acceptance Criteria

1. WHILE the countdown is running, THE Focus_Timer SHALL update the Progress_Bar fill percentage each second to reflect the proportion of elapsed time relative to the total session duration.
2. THE Focus_Timer SHALL calculate the fill percentage using the formula: `(elapsed_seconds / total_session_seconds) × 100`.
3. THE Focus_Timer SHALL keep the Progress_Bar fill width between 0% and 100% inclusive at all times.

---

### Requirement 6: Focus Timer — LocalStorage Persistence

**User Story:** As a student, I want my timer state to be saved automatically, so that if I accidentally close or refresh the tab, I can resume my session.

#### Acceptance Criteria

1. WHEN the page is unloaded (e.g., refresh or close), THE Focus_Timer SHALL save the current countdown value, the active Preset duration, and the running/paused state to LocalStorage under the key `focusTimerState`.
2. WHEN the page loads and a `focusTimerState` entry exists in LocalStorage, THE Focus_Timer SHALL restore the countdown display, active Preset, and Progress_Bar fill from the persisted state.
3. IF the persisted `focusTimerState` data is missing required fields or is unparseable, THEN THE Focus_Timer SHALL ignore the corrupted entry and load with default values (25-minute Preset, timer at `25:00`, Progress_Bar at 0%).
4. IF the timer was in a running state when the page was unloaded, THEN THE Focus_Timer SHALL restore it in a paused state on reload, requiring the user to manually press Start again.

---

### Requirement 7: Quick Links — Display

**User Story:** As a user, I want to see all my saved links displayed as clickable cards, so that I can quickly navigate to my favorite websites.

#### Acceptance Criteria

1. WHEN the page loads, THE Quick_Links SHALL read all saved Link records from LocalStorage under the key `quickLinks` and render one card per Link inside `#links-grid`.
2. EACH rendered link card SHALL display the Link's label as visible text and open the Link's URL in a new browser tab when clicked.
3. EACH rendered link card SHALL include a delete button that is visually distinct from the link label.
4. IF no Links are saved in LocalStorage, THEN THE Quick_Links SHALL display a placeholder message such as "No links yet. Add one above!" inside `#links-grid`.

---

### Requirement 8: Quick Links — Add a New Link

**User Story:** As a user, I want to add a new link with a label and URL, so that I can quickly access websites I visit frequently.

#### Acceptance Criteria

1. WHEN the Add button is clicked, THE Quick_Links SHALL read the values from the label input (`#link-name-input`) and the URL input (`#link-url-input`).
2. IF the label input is empty or the URL input is empty when the Add button is clicked, THEN THE Quick_Links SHALL display a Toast notification indicating that both fields are required, and SHALL NOT add the Link.
3. IF the URL value does not begin with `http://` or `https://` when the Add button is clicked, THEN THE Quick_Links SHALL prepend `https://` to the URL before saving.
4. WHEN a valid Link is added, THE Quick_Links SHALL append the new Link record to the saved list in LocalStorage under the key `quickLinks`.
5. WHEN a valid Link is added, THE Quick_Links SHALL render the new link card in `#links-grid` without requiring a page reload.
6. WHEN a valid Link is added, THE Quick_Links SHALL clear both input fields.
7. WHEN a valid Link is added, THE Quick_Links SHALL display a Toast notification with the message "Link added!".

---

### Requirement 9: Quick Links — Delete a Link

**User Story:** As a user, I want to delete a saved link, so that I can keep my Quick Links list organized and relevant.

#### Acceptance Criteria

1. WHEN the delete button on a link card is clicked, THE Quick_Links SHALL remove the corresponding Link record from the saved list in LocalStorage.
2. WHEN the delete button on a link card is clicked, THE Quick_Links SHALL remove the link card from `#links-grid` without requiring a page reload.
3. WHEN the last Link is deleted, THE Quick_Links SHALL display the empty-state placeholder message inside `#links-grid`.
4. WHEN a Link is deleted, THE Quick_Links SHALL display a Toast notification with the message "Link removed.".

---

### Requirement 10: Quick Links — LocalStorage Persistence

**User Story:** As a user, I want my saved links to persist across page loads, so that I do not have to re-enter them every time I open the dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL store all Link records as a JSON array in LocalStorage under the key `quickLinks`.
2. WHEN the page loads, THE Quick_Links SHALL parse the `quickLinks` entry from LocalStorage and render the stored links.
3. IF the `quickLinks` entry in LocalStorage is missing or unparseable, THEN THE Quick_Links SHALL treat the link list as empty and render the empty-state placeholder.
4. FOR ALL sequences of add and delete operations followed by a page reload, THE Quick_Links SHALL display exactly the set of Links that were present before the reload (round-trip persistence property).
