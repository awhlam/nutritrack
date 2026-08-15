export interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

// Newest first. Bump the version and add an entry here for any user-facing
// change — this list is what CURRENT_VERSION and the in-app "What's New"
// screen are built from.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.6.0',
    date: '2026-08-15',
    changes: [
      'Track sodium alongside carbs and caffeine — collapsed behind a single optional toggle in every form, so setup stays quick',
      'Fixed elapsed time wrapping onto two lines on long sessions',
      'Added a pulsing indicator that shows when a session is actively being tracked',
      'New-version banner with a Refresh button, instead of updating silently in the background',
      'Version number and this changelog, viewable from the start screen',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-08-13',
    changes: [
      'Sessions now require tapping Start instead of beginning automatically, so presets can be reviewed first',
      'A session left inactive for 6 hours automatically ends',
      'Session start and end times are now editable, like entries already were',
      'Added caffeine tracking alongside carbs',
      'Tightened up button and card sizing throughout so more fits on screen',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-08-13',
    changes: ['Sessions can be named — shown in History, the summary screen, and both export formats'],
  },
  {
    version: '1.3.0',
    date: '2026-08-12',
    changes: [
      'Removed the start screen in favor of auto-starting a session (later reverted in 1.5.0)',
      'Item presets moved into tap-to-add slots in the main grid',
      'New default preset amounts: 30g Energy Gel, 50g Carb Drink Mix',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-08-12',
    changes: [
      'Two drink-bottle slots with quarter-increment progress tracking and no double-counting',
      'Custom entries can be logged with the carb count filled in later',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-08-09',
    changes: ['Fixed the top controls being hidden under the notch on home-screen installs'],
  },
  {
    version: '1.0.0',
    date: '2026-08-09',
    changes: [
      'Initial release: preset and custom nutrition logging, mileage tracking, live stats, history, and text/image export',
    ],
  },
]

export const CURRENT_VERSION = CHANGELOG[0].version
