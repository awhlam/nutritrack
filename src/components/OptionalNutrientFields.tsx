import { useId, useState } from 'react'

interface OptionalNutrientFieldsProps {
  caffeine: string
  onCaffeineChange: (value: string) => void
  caffeineLabel: string
  sodium: string
  onSodiumChange: (value: string) => void
  sodiumLabel: string
}

/**
 * Caffeine and sodium are secondary to carbs for most items, so they start
 * collapsed behind a single toggle rather than always taking up two more
 * fields — keeps preset/entry setup quick for the common case of "just carbs".
 */
export function OptionalNutrientFields({
  caffeine,
  onCaffeineChange,
  caffeineLabel,
  sodium,
  onSodiumChange,
  sodiumLabel,
}: OptionalNutrientFieldsProps) {
  const [expanded, setExpanded] = useState(caffeine.trim() !== '' || sodium.trim() !== '')
  const caffeineId = useId()
  const sodiumId = useId()

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-left text-xs font-medium text-slate-500 active:text-slate-300"
      >
        + Add caffeine / sodium (optional)
      </button>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label htmlFor={caffeineId} className="mb-1 block text-xs font-medium text-slate-400">
          {caffeineLabel}
        </label>
        <input
          id={caffeineId}
          type="number"
          inputMode="decimal"
          value={caffeine}
          onChange={(e) => onCaffeineChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label htmlFor={sodiumId} className="mb-1 block text-xs font-medium text-slate-400">
          {sodiumLabel}
        </label>
        <input
          id={sodiumId}
          type="number"
          inputMode="decimal"
          value={sodium}
          onChange={(e) => onSodiumChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
        />
      </div>
    </div>
  )
}
