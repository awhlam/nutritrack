import { useState } from 'react'
import { StatBar } from './StatBar'
import { EntryList } from './EntryList'
import { EntryEditModal } from './EntryEditModal'
import { ExportPanel } from './ExportPanel'
import { activityLabel } from '../lib/format'
import type { Entry, Session } from '../lib/types'

interface SessionDetailProps {
  session: Session
  now: number
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
  onDeleteSession: () => void
  onClose: () => void
}

export function SessionDetail({
  session,
  now,
  onUpdateEntry,
  onDeleteEntry,
  onDeleteSession,
  onClose,
}: SessionDetailProps) {
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {session.activity === 'run' ? '🏃' : '🚴'} {activityLabel(session.activity)}
          </h1>
          <p className="text-xs text-slate-400">
            {new Date(session.startedAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300"
        >
          Done
        </button>
      </div>

      <StatBar session={session} now={now} />

      <ExportPanel session={session} />

      <div className="flex-1">
        <h2 className="mb-1 mt-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Log
        </h2>
        <EntryList entries={session.entries} onSelect={setEditingEntry} />
      </div>

      <button
        type="button"
        onClick={onDeleteSession}
        className="rounded-xl bg-red-500/10 py-3 text-sm font-semibold text-red-400 active:bg-red-500/20"
      >
        Delete this session
      </button>

      {editingEntry && (
        <EntryEditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={(patch) => {
            onUpdateEntry(editingEntry.id, patch)
            setEditingEntry(null)
          }}
          onDelete={() => {
            onDeleteEntry(editingEntry.id)
            setEditingEntry(null)
          }}
        />
      )}
    </div>
  )
}
