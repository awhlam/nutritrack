import { useState } from 'react'
import { Modal } from './Modal'
import { OptionalNutrientFields } from './OptionalNutrientFields'
import { applyTimeInput, timeInputValue } from '../lib/format'

interface CustomEntryModalProps {
  defaultMileage: number
  onSave: (data: {
    label: string
    carbs: number | null
    caffeine: number
    sodium: number
    timestamp: number
    mileage: number
  }) => void
  onClose: () => void
}

export function CustomEntryModal({
  defaultMileage,
  onSave,
  onClose,
}: CustomEntryModalProps) {
  const [label, setLabel] = useState('')
  const [carbs, setCarbs] = useState('')
  const [carbsPending, setCarbsPending] = useState(false)
  const [caffeine, setCaffeine] = useState('')
  const [sodium, setSodium] = useState('')
  const [timestamp, setTimestamp] = useState(() => Date.now())
  const [mileage, setMileage] = useState(String(defaultMileage.toFixed(1)))

  const carbsNum = parseFloat(carbs)
  const caffeineNum = caffeine.trim() === '' ? 0 : parseFloat(caffeine)
  const sodiumNum = sodium.trim() === '' ? 0 : parseFloat(sodium)
  const mileageNum = parseFloat(mileage)
  const valid =
    label.trim().length > 0 &&
    (carbsPending || (!Number.isNaN(carbsNum) && carbsNum >= 0)) &&
    !Number.isNaN(caffeineNum) &&
    caffeineNum >= 0 &&
    !Number.isNaN(sodiumNum) &&
    sodiumNum >= 0

  const handleSave = () => {
    if (!valid) return
    onSave({
      label: label.trim(),
      carbs: carbsPending ? null : carbsNum,
      caffeine: caffeineNum,
      sodium: sodiumNum,
      timestamp,
      mileage: Number.isNaN(mileageNum) ? defaultMileage : mileageNum,
    })
  }

  return (
    <Modal title="Custom Entry" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            What did you consume?
          </label>
          <input
            autoFocus
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Trail mix"
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-400">Carbs (g)</label>
            <button
              type="button"
              onClick={() => setCarbsPending((v) => !v)}
              className={`text-xs font-medium ${carbsPending ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {carbsPending ? '✓ ' : ''}I'll add carbs later
            </button>
          </div>
          <input
            type="number"
            inputMode="decimal"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="0"
            disabled={carbsPending}
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500 disabled:opacity-40"
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
              className="w-full rounded-xl bg-slate-800 px-3 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={handleSave}
          className="w-full rounded-xl bg-emerald-500 py-3 text-lg font-bold text-slate-950 disabled:opacity-40"
        >
          Log Entry
        </button>
      </div>
    </Modal>
  )
}
