# NutriTrack

A single-page web app for tracking nutrition consumption during runs and bike
rides — designed for big, glove/sweat-friendly buttons you can hit mid-activity.

## Features

- **One-tap logging** — preset buttons for the nutrition you bring (e.g. "Energy Gel, 25g carbs"). Tapping one instantly logs the time and your current mileage.
- **Custom entries** — log anything unplanned with a label and carb count.
- **Live stats** — running totals for elapsed time, total carbs consumed, and carbs/hour, updated in real time.
- **Editable log** — every entry's time and mileage can be corrected after the fact; entries can also be deleted.
- **Preset manager** — add, edit, or delete your preset nutrition buttons.
- **History** — past runs/rides are saved locally so you can review them later.
- **Export** — at the end of a session, export the log as a plain-text summary (`.txt`) or a shareable image (`.png`).

All data is stored locally in the browser (`localStorage`) — no account or
backend required.

## Development

```bash
npm install
npm run dev      # start local dev server
npm run build    # type-check and build for production
```

## Tech stack

React + TypeScript + Vite + Tailwind CSS, with [html-to-image](https://github.com/bubkoo/html-to-image) for PNG export.
