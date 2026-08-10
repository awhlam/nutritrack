import {
  carbsPerHour,
  formatClockTimeShort,
  formatDuration,
  formatRate,
  totalCarbs,
} from '../lib/format'
import type { Session } from '../lib/types'

interface HistoryProps {
  sessions: Session[]
  onSelect: (session: Session) => void
  onClose: () => void
}

export function History({ sessions, onSelect, onClose }: HistoryProps) {
  const finished = [...sessions]
    .filter((s) => s.endedAt !== null)
    .sort((a, b) => b.startedAt - a.startedAt)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">History</h1>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300"
        >
          Done
        </button>
      </div>

      {finished.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Completed runs and rides will show up here.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {finished.map((session) => {
            const end = session.endedAt ?? Date.now()
            const rate = carbsPerHour(session, end)
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSelect(session)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3 text-left active:bg-slate-800"
                >
                  <div>
                    <div className="font-medium text-white">
                      {new Date(session.startedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatClockTimeShort(session.startedAt)} ·{' '}
                      {formatDuration(end - session.startedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-400">
                      {Math.round(totalCarbs(session.entries))}g
                    </div>
                    <div className="text-xs text-slate-500">
                      {rate === null ? '—' : `${formatRate(rate)}/hr`}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
