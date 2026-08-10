import { useState } from 'react'
import { Modal } from './Modal'
import { applyTimeInput, timeInputValue } from '../lib/format'
import type { Entry } from '../lib/types'

interface EntryEditModalProps {
  entry: Entry
  onSave: (patch: { timestamp: number; mileage: number | null }) => void
  onDelete: () => void
  onClose: () => void
}

export function EntryEditModal({ entry, onSave, onDelete, onClose }: EntryEditModalProps) {
  const [timestamp, setTimestamp] = useState(entry.timestamp)
  const [mileage, setMileage] = useState(
    entry.mileage === null ? '' : String(entry.mileage),
  )

  const handleSave = () => {
    const mileageNum = parseFloat(mileage)
    onSave({
      timestamp,
      mileage: mileage.trim() === '' || Number.isNaN(mileageNum) ? null : mileageNum,
    })
  }

  return (
    <Modal title={`Edit: ${entry.label}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
          {entry.carbs}g carbs
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Time</label>
            <input
              type="time"
              step={1}
              value={timeInputValue(timestamp)}
              onChange={(e) => setTimestamp(applyTimeInput(timestamp, e.target.value))}
              className="w-full rounded-xl bg-slate-800 px-3 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Mileage
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="—"
              className="w-full rounded-xl bg-slate-800 px-3 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 rounded-xl bg-red-500/15 py-3 text-base font-semibold text-red-400 active:bg-red-500/25"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-emerald-500 py-3 text-base font-bold text-slate-950"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
