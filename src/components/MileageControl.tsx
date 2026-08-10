import { useState } from 'react'
import { formatMileageNumber } from '../lib/format'

interface MileageControlProps {
  mileage: number
  onChange: (mileage: number) => void
}

export function MileageControl({ mileage, onChange }: MileageControlProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(mileage))

  const bump = (delta: number) => {
    onChange(Math.max(0, Math.round(mileage + delta)))
  }

  const startEdit = () => {
    setDraft(formatMileageNumber(mileage))
    setEditing(true)
  }

  const commit = () => {
    const n = parseFloat(draft)
    if (!Number.isNaN(n) && n >= 0) onChange(Math.round(n * 10) / 10)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-800/60 px-3 py-2">
      <button
        type="button"
        onClick={() => bump(-1)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 text-2xl font-bold text-slate-200 active:bg-slate-600"
        aria-label="Decrease mileage"
      >
        −
      </button>

      <div className="flex flex-col items-center">
        <span className="text-[11px] uppercase tracking-wide text-slate-400">
          Current Mileage
        </span>
        {editing ? (
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            step="0.1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className="w-24 rounded-lg bg-slate-900 text-center text-2xl font-bold text-white outline-none ring-2 ring-emerald-500"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="text-2xl font-bold text-white"
          >
            {formatMileageNumber(mileage)}{' '}
            <span className="text-base font-medium text-slate-400">mi</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => bump(1)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700 text-2xl font-bold text-slate-200 active:bg-slate-600"
        aria-label="Increase mileage"
      >
        +
      </button>
    </div>
  )
}
