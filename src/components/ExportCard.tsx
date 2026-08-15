import { forwardRef } from 'react'
import {
  carbsPerHour,
  formatCarbs,
  formatClockTimeShort,
  formatDuration,
  formatMileage,
  formatOptionalExtras,
  formatRate,
  totalCaffeine,
  totalCarbs,
  totalSodium,
} from '../lib/format'
import type { Session } from '../lib/types'

interface ExportCardProps {
  session: Session
}

export const ExportCard = forwardRef<HTMLDivElement, ExportCardProps>(
  function ExportCard({ session }, ref) {
    const end = session.endedAt ?? Date.now()
    const carbs = totalCarbs(session.entries)
    const caffeine = totalCaffeine(session.entries)
    const sodium = totalSodium(session.entries)
    const extras = formatOptionalExtras(caffeine, sodium)
    const perHour = carbsPerHour(session, end)
    const sorted = [...session.entries].sort((a, b) => a.timestamp - b.timestamp)
    const dateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return (
      <div
        ref={ref}
        className="w-[420px] bg-slate-950 p-6 font-sans text-white"
      >
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            NutriTrack
          </div>
          {session.name && <div className="text-lg font-bold text-white">{session.name}</div>}
          <div className="text-sm text-slate-400">{dateStr}</div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <CardStat label="Duration" value={formatDuration(end - session.startedAt)} />
          <CardStat label="Carbs" value={`${Math.round(carbs)}g`} accent />
          <CardStat label="Carbs/hr" value={formatRate(perHour)} />
        </div>
        {extras && <div className="mb-3 text-center text-xs text-slate-400">{extras}</div>}

        <div className="rounded-xl bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>Time</span>
            <span>Item</span>
            <span>Carbs</span>
          </div>
          {sorted.length === 0 ? (
            <div className="px-4 py-4 text-center text-sm text-slate-500">
              No entries logged.
            </div>
          ) : (
            sorted.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-2 border-b border-slate-800/60 px-4 py-2 text-sm last:border-b-0"
              >
                <span className="w-16 shrink-0 text-slate-400">
                  {formatClockTimeShort(e.timestamp)}
                </span>
                <span className="flex-1 truncate text-left text-white">
                  {e.label}
                  {e.drink && ` (+${e.drink.percent}%)`}{' '}
                  <span className="text-slate-500">{formatMileage(e.mileage)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span
                    className={`font-semibold ${e.carbs === null ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    {formatCarbs(e.carbs)}
                  </span>
                  {formatOptionalExtras(e.caffeine, e.sodium) && (
                    <span className="text-[10px] text-slate-500">
                      {formatOptionalExtras(e.caffeine, e.sodium)}
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          {session.entries.length} entries logged
        </div>
      </div>
    )
  },
)

function CardStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl bg-slate-900 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-lg font-bold ${accent ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}
