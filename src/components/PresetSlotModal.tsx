import { useState } from 'react'
import { Modal } from './Modal'
import { OptionalNutrientFields } from './OptionalNutrientFields'
import { PRESET_COLORS } from '../lib/colors'

interface PresetSlotModalProps {
  onSave: (data: { label: string; carbs: number; caffeine: number; sodium: number; color: string }) => void
  onClose: () => void
}

export function PresetSlotModal({ onSave, onClose }: PresetSlotModalProps) {
  const [label, setLabel] = useState('')
  const [carbs, setCarbs] = useState('')
  const [caffeine, setCaffeine] = useState('')
  const [sodium, setSodium] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const carbsNum = parseFloat(carbs)
  const caffeineNum = caffeine.trim() === '' ? 0 : parseFloat(caffeine)
  const sodiumNum = sodium.trim() === '' ? 0 : parseFloat(sodium)
  const valid =
    label.trim().length > 0 &&
    !Number.isNaN(carbsNum) &&
    carbsNum >= 0 &&
    !Number.isNaN(caffeineNum) &&
    caffeineNum >= 0 &&
    !Number.isNaN(sodiumNum) &&
    sodiumNum >= 0

  const handleSave = () => {
    if (!valid) return
    onSave({ label: label.trim(), carbs: carbsNum, caffeine: caffeineNum, sodium: sodiumNum, color })
  }

  return (
    <Modal title="New Preset Button" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Label</label>
          <input
            autoFocus
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Rice Cake"
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-lg text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Carbs per serving (g)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="0"
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

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-white' : ''}`}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={handleSave}
          className="w-full rounded-xl bg-emerald-500 py-3 text-lg font-bold text-slate-950 disabled:opacity-40"
        >
          Add to Grid
        </button>
      </div>
    </Modal>
  )
}
