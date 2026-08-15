import { formatCarbs, formatClockTimeShort, formatMileage, formatOptionalExtras } from '../lib/format'
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
            className="flex w-full items-center justify-between gap-3 py-2 text-left active:bg-slate-800/50"
          >
            <div className="flex flex-col">
              <span className="font-medium text-white">{entry.label}</span>
              <span className="text-xs text-slate-400">
                {formatClockTimeShort(entry.timestamp)} · {formatMileage(entry.mileage)}
                {entry.drink && ` · +${entry.drink.percent}%`}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  entry.carbs === null
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-slate-800 text-emerald-400'
                }`}
              >
                {entry.carbs === null ? 'Add carbs' : formatCarbs(entry.carbs)}
              </span>
              {formatOptionalExtras(entry.caffeine, entry.sodium) && (
                <span className="text-[10px] text-slate-500">
                  {formatOptionalExtras(entry.caffeine, entry.sodium)}
                </span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
