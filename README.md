# NutriTrack

A single-page web app for tracking nutrition consumption during runs and bike
rides — designed for big, glove/sweat-friendly buttons you can hit mid-activity.

<p align="center">
  <img src="docs/screenshots/tracker.png" alt="Tracker screen showing 2h 58m elapsed, 195g total carbs, 66g/hr, a mileage stepper, four large preset buttons and the entry log" width="270">
  <img src="docs/screenshots/edit-entry.png" alt="Editing a past entry's time and mileage" width="270">
  <img src="docs/screenshots/summary.png" alt="Finished session summary with export buttons and the full entry log" width="270">
</p>
<p align="center">
  <em>Logging mid-ride &middot; correcting a past entry &middot; the end-of-ride summary</em>
</p>

## Features

- **One-tap logging** — preset buttons for the nutrition you bring (e.g. "Energy Gel, 25g carbs"). Tapping one instantly logs the time and your current mileage.
- **Custom entries** — log anything unplanned with a label and carb count.
- **Mileage tracking** — a big +/− stepper in whole miles (tap the number to type an exact value), snapshotted onto each entry you log.
- **Live stats** — running totals for elapsed time, total carbs consumed, and carbs/hour, updated in real time.
- **Editable log** — every entry's time and mileage can be corrected after the fact; entries can also be deleted.
- **Preset manager** — add, edit, or delete your preset nutrition buttons.
- **History** — past activities are saved locally so you can review them later.
- **Export** — at the end of a session, export the log as a plain-text summary (`.txt`) or a shareable image (`.png`).

All data is stored locally in the browser (`localStorage`) — no account or
backend required.

### Presets and history

Set up a button for each thing you carry, with its carb count, then review past
activities from the history list.

<p align="center">
  <img src="docs/screenshots/presets.png" alt="Preset button manager listing Energy Gel, Banana, Chews and Sports Drink with edit and delete actions" width="330">
  <img src="docs/screenshots/history.png" alt="History list of four past activities with total carbs and carbs per hour" width="330">
</p>

### Export

"Export Image" renders a shareable summary card; on a phone it hands off to the
native share sheet, so it can go straight into Messages or Strava.

<p align="center">
  <img src="docs/screenshots/export-card.png" alt="Exported summary card with duration, total carbs, carbs per hour and a table of every entry" width="420">
</p>

<details>
<summary>"Export Text" produces the same log as plain text</summary>

```
NutriTrack
Monday, August 10, 2026

Duration:       2h 58m
Total Carbs:    195 g
Avg Carbs/hr:   66 g/hr
Entries:        7

Time       Mileage   Item                      Carbs
----------------------------------------------------------
7:12 AM    4 mi      Sports Drink              36g
7:28 AM    9 mi      Energy Gel                25g
7:47 AM    15 mi     Banana                    27g
8:03 AM    20 mi     Chews                     24g
8:22 AM    26 mi     Energy Gel                25g
8:39 AM    32 mi     Sports Drink              36g
8:58 AM    38 mi     Fig Bar                   22g

Logged with NutriTrack
```

</details>

## Development

```bash
npm install
npm run dev      # start local dev server
npm run build    # type-check and build for production
npm test         # run the test suite
npm run lint     # lint
```

## Tests

[Vitest](https://vitest.dev) covers the fueling math and formatting in
`src/lib/format.test.ts`, session/entry/preset state in
`src/hooks/useStore.test.ts`, and the mileage stepper and start screen in
`src/components/*.test.tsx`.

## Deployment

Pushes to `main` build and publish to GitHub Pages via
`.github/workflows/deploy.yml`. See [docs/DEPLOY.md](docs/DEPLOY.md) for the
one-time repo setup and for other hosts.

The app is installable — "Add to Home Screen" gives it its own icon and a
standalone window, and it keeps working with no signal once loaded.

## Tech stack

React + TypeScript + Vite + Tailwind CSS, with
[html-to-image](https://github.com/bubkoo/html-to-image) for PNG export and
[vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for offline support.
