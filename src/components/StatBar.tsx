import {
  caffeinePerHour,
  carbsPerHour,
  formatCaffeine,
  formatDuration,
  formatRate,
  formatSodium,
  pendingCarbsCount,
  sodiumPerHour,
  totalCaffeine,
  totalCarbs,
  totalSodium,
} from '../lib/format'
import type { Session } from '../lib/types'

interface StatBarProps {
  session: Session
  now: number
}

interface NutrientCard {
  label: string
  value: string
  rate: string
  accent?: boolean
}

export function StatBar({ session, now }: StatBarProps) {
  const end = session.endedAt ?? now
  const duration = formatDuration(end - session.startedAt)
  const carbs = totalCarbs(session.entries)
  const caffeine = totalCaffeine(session.entries)
  const sodium = totalSodium(session.entries)
  const pending = pendingCarbsCount(session.entries)

  // Caffeine/sodium cards only show up once you're actually tracking them.
  // Total and rate live together in one compact card per nutrient, rather
  // than separate cards for each — keeps it dense even with all three.
  const nutrientCards: NutrientCard[] = [
    {
      label: 'Carbs',
      value: `${Math.round(carbs)}g`,
      rate: `${formatRate(carbsPerHour(session, end), 'g')}/hr`,
      accent: true,
    },
    caffeine > 0 && {
      label: 'Caffeine',
      value: formatCaffeine(caffeine),
      rate: `${formatRate(caffeinePerHour(session, end), 'mg')}/hr`,
    },
    sodium > 0 && {
      label: 'Sodium',
      value: formatSodium(sodium),
      rate: `${formatRate(sodiumPerHour(session, end), 'mg')}/hr`,
    },
  ].filter((c): c is NutrientCard => c !== false)

  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5">
        <Stat label="Elapsed" value={duration} />
        {nutrientCards.map((c) => (
          <Stat key={c.label} label={c.label} value={c.value} rate={c.rate} accent={c.accent} />
        ))}
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
  rate,
  accent,
}: {
  label: string
  value: string
  rate?: string
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
      {rate && <div className="whitespace-nowrap text-[10px] text-slate-500">{rate}</div>}
    </div>
  )
}
