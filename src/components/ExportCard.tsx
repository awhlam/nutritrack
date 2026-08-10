import { forwardRef } from 'react'
import {
  carbsPerHour,
  formatClockTimeShort,
  formatDuration,
  formatMileage,
  formatRate,
  totalCarbs,
} from '../lib/format'
import type { Session } from '../lib/types'

interface ExportCardProps {
  session: Session
}

export const ExportCard = forwardRef<HTMLDivElement, ExportCardProps>(
  function ExportCard({ session }, ref) {
    const end = session.endedAt ?? Date.now()
    const carbs = totalCarbs(session.entries)
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
          <div className="text-sm text-slate-400">{dateStr}</div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <CardStat label="Duration" value={formatDuration(end - session.startedAt)} />
          <CardStat label="Total Carbs" value={`${Math.round(carbs)}g`} accent />
          <CardStat label="Carbs/hr" value={formatRate(perHour)} />
        </div>

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
                  {e.label}{' '}
                  <span className="text-slate-500">{formatMileage(e.mileage)}</span>
                </span>
                <span className="shrink-0 font-semibold text-emerald-400">
                  {Math.round(e.carbs)}g
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
