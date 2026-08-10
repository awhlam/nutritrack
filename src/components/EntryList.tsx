import { formatClockTimeShort, formatMileage } from '../lib/format'
import type { Entry } from '../lib/types'

interface EntryListProps {
  entries: Entry[]
  onSelect: (entry: Entry) => void
}

export function EntryList({ entries, onSelect }: EntryListProps) {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp)

  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No entries logged yet.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-slate-800">
      {sorted.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            onClick={() => onSelect(entry)}
            className="flex w-full items-center justify-between gap-3 py-3 text-left active:bg-slate-800/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-white">{entry.label}</span>
              <span className="text-xs text-slate-400">
                {formatClockTimeShort(entry.timestamp)} · {formatMileage(entry.mileage)}
              </span>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-emerald-400">
              {Math.round(entry.carbs)}g
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
