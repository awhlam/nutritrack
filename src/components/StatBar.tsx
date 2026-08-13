import {
  carbsPerHour,
  formatDuration,
  formatRate,
  pendingCarbsCount,
  totalCarbs,
} from '../lib/format'
import type { Session } from '../lib/types'

interface StatBarProps {
  session: Session
  now: number
}

export function StatBar({ session, now }: StatBarProps) {
  const end = session.endedAt ?? now
  const duration = formatDuration(end - session.startedAt)
  const carbs = totalCarbs(session.entries)
  const perHour = carbsPerHour(session, end)
  const pending = pendingCarbsCount(session.entries)

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Elapsed" value={duration} />
        <Stat label="Total Carbs" value={`${Math.round(carbs)}g`} accent />
        <Stat label="Carbs / hr" value={formatRate(perHour)} />
      </div>
      {pending > 0 && (
        <p className="mt-1.5 text-center text-xs text-amber-400">
          {pending} {pending === 1 ? 'entry needs' : 'entries need'} a carb count — excluded from totals
        </p>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl bg-slate-800/60 py-3 text-center">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div
        className={`text-2xl font-bold ${accent ? 'text-emerald-400' : 'text-white'}`}
      >
        {value}
      </div>
    </div>
  )
}
