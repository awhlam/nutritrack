import { carbsPerHour, formatDuration, formatRate, totalCarbs } from '../lib/format'
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

  return (
    <div className="grid grid-cols-3 gap-2">
      <Stat label="Elapsed" value={duration} />
      <Stat label="Total Carbs" value={`${Math.round(carbs)}g`} accent />
      <Stat label="Carbs / hr" value={formatRate(perHour)} />
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
