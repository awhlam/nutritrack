import { useState } from 'react'
import type { Preset } from '../lib/types'

interface PresetManagerProps {
  presets: Preset[]
  onAdd: (preset: Omit<Preset, 'id'>) => void
  onUpdate: (id: string, patch: Partial<Preset>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const COLORS = ['#f59e0b', '#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#14b8a6']

export function PresetManager({ presets, onAdd, onUpdate, onDelete, onClose }: PresetManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Preset Buttons</h1>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300"
        >
          Done
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {presets.map((preset) =>
          editingId === preset.id ? (
            <PresetForm
              key={preset.id}
              initial={preset}
              onSave={(data) => {
                onUpdate(preset.id, data)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={preset.id}
              className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: preset.color }}
                />
                <div>
                  <div className="font-medium text-white">{preset.label}</div>
                  <div className="text-xs text-slate-400">{preset.carbs}g carbs</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(preset.id)}
                  className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(preset.id)}
                  className="rounded-lg bg-red-500/15 px-3 py-1.5 text-sm text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {adding ? (
        <PresetForm
          onSave={(data) => {
            onAdd(data)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-xl border-2 border-dashed border-slate-600 py-3 text-sm font-semibold text-slate-300"
        >
          + Add preset button
        </button>
      )}
    </div>
  )
}

function PresetForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Preset
  onSave: (data: Omit<Preset, 'id'>) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [carbs, setCarbs] = useState(initial ? String(initial.carbs) : '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])

  const carbsNum = parseFloat(carbs)
  const valid = label.trim().length > 0 && !Number.isNaN(carbsNum) && carbsNum >= 0

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-slate-800/60 p-4">
      <input
        autoFocus
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Energy Gel"
        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
      />
      <input
        type="number"
        inputMode="decimal"
        value={carbs}
        onChange={(e) => setCarbs(e.target.value)}
        placeholder="Carbs per serving (g)"
        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
      />
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-slate-700 py-2 text-sm font-semibold text-slate-200"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!valid}
          onClick={() => onSave({ label: label.trim(), carbs: carbsNum, color })}
          className="flex-1 rounded-lg bg-emerald-500 py-2 text-sm font-bold text-slate-950 disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}
