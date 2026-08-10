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
  return entries.reduce((sum, e) => sum + e.carbs, 0)
}

const MIN_ELAPSED_FOR_RATE_MS = 60_000

export function carbsPerHour(session: Session, now: number): number | null {
  const elapsed = elapsedMs(session, now)
  if (elapsed < MIN_ELAPSED_FOR_RATE_MS) return null
  return totalCarbs(session.entries) / (elapsed / 3_600_000)
}

export function formatRate(perHour: number | null): string {
  return perHour === null ? '—' : `${Math.round(perHour)}g`
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
  const perHour = carbsPerHour(session, end)

  lines.push('NutriTrack')
  lines.push(dateStr)
  lines.push('')
  lines.push(`Duration:       ${duration}`)
  lines.push(`Total Carbs:    ${Math.round(carbs)} g`)
  lines.push(`Avg Carbs/hr:   ${perHour === null ? '—' : `${Math.round(perHour)} g/hr`}`)
  lines.push(`Entries:        ${session.entries.length}`)
  lines.push('')
  lines.push('Time       Mileage   Item                      Carbs')
  lines.push('-'.repeat(58))

  const sorted = [...session.entries].sort((a, b) => a.timestamp - b.timestamp)
  for (const e of sorted) {
    const time = formatClockTimeShort(e.timestamp).padEnd(10)
    const mile = formatMileage(e.mileage).padEnd(9)
    const label = e.label.padEnd(25).slice(0, 25)
    lines.push(`${time} ${mile} ${label} ${Math.round(e.carbs)}g`)
  }

  lines.push('')
  lines.push('Logged with NutriTrack')

  return lines.join('\n')
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
