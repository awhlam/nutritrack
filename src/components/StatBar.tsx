import {
  carbsPerHour,
  formatCaffeine,
  formatDuration,
  formatRate,
  formatSodium,
  pendingCarbsCount,
  totalCaffeine,
  totalCarbs,
  totalSodium,
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
  const caffeine = totalCaffeine(session.entries)
  const sodium = totalSodium(session.entries)
  const perHour = carbsPerHour(session, end)
  const pending = pendingCarbsCount(session.entries)

  // Caffeine/sodium only show up once you're actually tracking them — added
  // as full stat cards (not a smaller caption) so they're just as visible as
  // carbs, right at the top alongside it.
  const extraStats = [
    caffeine > 0 && { label: 'Caffeine', value: formatCaffeine(caffeine) },
    sodium > 0 && { label: 'Sodium', value: formatSodium(sodium) },
  ].filter((s): s is { label: string; value: string } => s !== false)

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        <Stat label="Elapsed" value={duration} />
        <Stat label="Carbs" value={`${Math.round(carbs)}g`} accent />
        <Stat label="Carbs/hr" value={formatRate(perHour)} />
      </div>
      {extraStats.length > 0 && (
        <div className={`mt-1.5 grid gap-1.5 ${extraStats.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {extraStats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}
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
    <div className="rounded-2xl bg-slate-800/60 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div
        className={`whitespace-nowrap text-lg font-bold ${accent ? 'text-emerald-400' : 'text-white'}`}
      >
        {value}
      </div>
    </div>
  )
}
