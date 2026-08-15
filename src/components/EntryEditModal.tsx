import { useState } from 'react'
import { Modal } from './Modal'
import { OptionalNutrientFields } from './OptionalNutrientFields'
import { applyTimeInput, timeInputValue } from '../lib/format'
import type { Entry } from '../lib/types'

interface EntryEditModalProps {
  entry: Entry
  onSave: (patch: {
    timestamp: number
    mileage: number | null
    carbs: number | null
    caffeine: number
    sodium: number
  }) => void
  onDelete: () => void
  onClose: () => void
}

export function EntryEditModal({ entry, onSave, onDelete, onClose }: EntryEditModalProps) {
  const [timestamp, setTimestamp] = useState(entry.timestamp)
  const [mileage, setMileage] = useState(
    entry.mileage === null ? '' : String(entry.mileage),
  )
  const [carbs, setCarbs] = useState(entry.carbs === null ? '' : String(entry.carbs))
  const [caffeine, setCaffeine] = useState(entry.caffeine ? String(entry.caffeine) : '')
  const [sodium, setSodium] = useState(entry.sodium ? String(entry.sodium) : '')

  const handleSave = () => {
    const mileageNum = parseFloat(mileage)
    const carbsNum = parseFloat(carbs)
    const caffeineNum = parseFloat(caffeine)
    const sodiumNum = parseFloat(sodium)
    onSave({
      timestamp,
      mileage: mileage.trim() === '' || Number.isNaN(mileageNum) ? null : mileageNum,
      carbs: carbs.trim() === '' || Number.isNaN(carbsNum) ? null : carbsNum,
      caffeine: caffeine.trim() === '' || Number.isNaN(caffeineNum) ? 0 : caffeineNum,
      sodium: sodium.trim() === '' || Number.isNaN(sodiumNum) ? 0 : sodiumNum,
    })
  }

  return (
    <Modal title={`Edit: ${entry.label}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Carbs (g){entry.carbs === null ? ' — not entered yet' : ''}
          </label>
          <input
            autoFocus={entry.carbs === null}
            type="number"
            inputMode="decimal"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="?"
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
          />
        </div>

        <OptionalNutrientFields
          caffeine={caffeine}
          onCaffeineChange={setCaffeine}
          caffeineLabel="Caffeine (mg)"
          sodium={sodium}
          onSodiumChange={setSodium}
          sodiumLabel="Sodium (mg)"
        />

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
