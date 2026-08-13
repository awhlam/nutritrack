import { useState } from 'react'

interface SessionNameFieldProps {
  name: string
  onChange: (name: string) => void
  className?: string
}

const MAX_LENGTH = 60

export function SessionNameField({ name, onChange, className = '' }: SessionNameFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const startEdit = () => {
    setDraft(name)
    setEditing(true)
  }

  const commit = () => {
    onChange(draft.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        placeholder="Name this event"
        maxLength={MAX_LENGTH}
        className={`w-full rounded-lg bg-slate-800 px-3 py-1.5 text-white outline-none ring-2 ring-emerald-500 ${className}`}
      />
    )
  }

  return (
    <button type="button" onClick={startEdit} className={`text-left ${className}`}>
      {name ? (
        <span className="font-semibold text-white">{name}</span>
      ) : (
        <span className="text-slate-500">+ Name this event</span>
      )}
    </button>
  )
}
