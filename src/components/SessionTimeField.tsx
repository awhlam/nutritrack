import { useState } from 'react'
import { applyTimeInput, formatClockTimeShort, timeInputValue } from '../lib/format'

interface SessionTimeFieldProps {
  label: string
  timestamp: number
  onChange: (timestamp: number) => void
  className?: string
}

export function SessionTimeField({ label, timestamp, onChange, className = '' }: SessionTimeFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => timeInputValue(timestamp))

  const startEdit = () => {
    setDraft(timeInputValue(timestamp))
    setEditing(true)
  }

  const commit = () => {
    onChange(applyTimeInput(timestamp, draft))
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="time"
        step={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className={`rounded-lg bg-slate-800 px-2 py-1 text-xs text-white outline-none ring-2 ring-emerald-500 ${className}`}
      />
    )
  }

  return (
    <button type="button" onClick={startEdit} className={`text-left text-xs text-slate-400 ${className}`}>
      {label} {formatClockTimeShort(timestamp)}
    </button>
  )
}
