import type { Entry, Session } from './types'

export function formatClockTimeShort(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0
  const totalMinutes = Math.floor(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h <= 0) return `${m}m`
  return `${h}h ${m}m`
}

export function timeInputValue(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function applyTimeInput(ts: number, timeStr: string): number {
  const [hh = '0', mm = '0', ss = '0'] = timeStr.split(':')
  const d = new Date(ts)
  d.setHours(Number(hh), Number(mm), Number(ss), 0)
  return d.getTime()
}

export function formatMileage(mi: number | null): string {
  if (mi === null) return '—'
  return `${formatMileageNumber(mi)} mi`
}

/**
 * Mileage steps in whole miles, so render whole numbers plainly and only show a
 * decimal when one is actually present (hand-typed values, older sessions).
 */
export function formatMileageNumber(mi: number): string {
  return Number.isInteger(mi) ? String(mi) : mi.toFixed(1)
}

export function elapsedMs(session: Session, now: number): number {
  const end = session.endedAt ?? now
  return Math.max(0, end - session.startedAt)
}

export function totalCarbs(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + (e.carbs ?? 0), 0)
}

export function pendingCarbsCount(entries: Entry[]): number {
  return entries.filter((e) => e.carbs === null).length
}

export function formatCarbs(carbs: number | null): string {
  return carbs === null ? '?' : `${Math.round(carbs)}g`
}

export function totalCaffeine(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + e.caffeine, 0)
}

export function formatCaffeine(caffeine: number): string {
  return `${Math.round(caffeine)}mg`
}

export function totalSodium(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + e.sodium, 0)
}

export function formatSodium(sodium: number): string {
  return `${Math.round(sodium)}mg`
}

/**
 * Caffeine/sodium are optional per-item, so only mention the ones actually in
 * use rather than always showing "0mg" — keeps rows/cards uncluttered for the
 * common case where neither is tracked.
 */
export function formatOptionalExtras(caffeine: number, sodium: number): string {
  return [
    caffeine > 0 ? `${formatCaffeine(caffeine)} caffeine` : null,
    sodium > 0 ? `${formatSodium(sodium)} sodium` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ')
}

const MIN_ELAPSED_FOR_RATE_MS = 60_000

function ratePerHour(total: number, session: Session, now: number): number | null {
  const elapsed = elapsedMs(session, now)
  if (elapsed < MIN_ELAPSED_FOR_RATE_MS) return null
  return total / (elapsed / 3_600_000)
}

export function carbsPerHour(session: Session, now: number): number | null {
  return ratePerHour(totalCarbs(session.entries), session, now)
}

export function caffeinePerHour(session: Session, now: number): number | null {
  return ratePerHour(totalCaffeine(session.entries), session, now)
}

export function sodiumPerHour(session: Session, now: number): number | null {
  return ratePerHour(totalSodium(session.entries), session, now)
}

export function formatRate(perHour: number | null, unit: 'g' | 'mg' = 'g'): string {
  return perHour === null ? '—' : `${Math.round(perHour)}${unit}`
}

export function buildTextExport(session: Session): string {
  const lines: string[] = []
  const dateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const end = session.endedAt ?? Date.now()
  const duration = formatDuration(end - session.startedAt)
  const carbs = totalCarbs(session.entries)
  const caffeine = totalCaffeine(session.entries)
  const sodium = totalSodium(session.entries)
  const carbsRate = carbsPerHour(session, end)
  const caffeineRate = caffeinePerHour(session, end)
  const sodiumRate = sodiumPerHour(session, end)
  const pending = pendingCarbsCount(session.entries)

  lines.push(session.name ? `NutriTrack — ${session.name}` : 'NutriTrack')
  lines.push(dateStr)
  lines.push('')
  lines.push(`Duration:       ${duration}`)
  lines.push(`Total Carbs:    ${Math.round(carbs)} g${pending > 0 ? ' (excludes pending entries below)' : ''}`)
  if (caffeine > 0) lines.push(`Total Caffeine: ${Math.round(caffeine)} mg`)
  if (sodium > 0) lines.push(`Total Sodium:   ${Math.round(sodium)} mg`)
  lines.push(`Avg Carbs/hr:   ${carbsRate === null ? '—' : `${Math.round(carbsRate)} g/hr`}`)
  if (caffeine > 0) {
    lines.push(`Avg Caffeine/hr:${caffeineRate === null ? ' —' : ` ${Math.round(caffeineRate)} mg/hr`}`)
  }
  if (sodium > 0) {
    lines.push(`Avg Sodium/hr:  ${sodiumRate === null ? '—' : `${Math.round(sodiumRate)} mg/hr`}`)
  }
  lines.push(`Entries:        ${session.entries.length}`)
  lines.push('')
  lines.push('Time       Mileage   Item                      Carbs    Extras')
  lines.push('-'.repeat(62))

  const sorted = [...session.entries].sort((a, b) => a.timestamp - b.timestamp)
  for (const e of sorted) {
    const time = formatClockTimeShort(e.timestamp).padEnd(10)
    const mile = formatMileage(e.mileage).padEnd(9)
    const percentSuffix = e.drink ? ` (+${e.drink.percent}%)` : ''
    const label = `${e.label}${percentSuffix}`.padEnd(25).slice(0, 25)
    const carbsStr = formatCarbs(e.carbs).padEnd(8)
    const extras = formatOptionalExtras(e.caffeine, e.sodium)
    lines.push(`${time} ${mile} ${label} ${carbsStr} ${extras}`.trimEnd())
  }

  lines.push('')
  lines.push('Logged with NutriTrack')

  return lines.join('\n')
}
