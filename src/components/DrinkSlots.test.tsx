import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { DrinkSlots } from './DrinkSlots'
import type { Entry, Preset, Session } from '../lib/types'

const waterPreset: Preset = {
  id: 'preset-water',
  label: 'Water',
  carbs: 0,
  color: '#38bdf8',
  kind: 'drink',
}

const mixPreset: Preset = {
  id: 'preset-mix',
  label: 'Carb Mix',
  carbs: 60,
  color: '#3b82f6',
  kind: 'drink',
}

function drinkEntry(percent: number, slot: 0 | 1 = 0, fillId = 1): Entry {
  return {
    id: `e-${Math.random()}`,
    timestamp: 0,
    mileage: 0,
    label: 'Carb Mix',
    carbs: (percent / 100) * mixPreset.carbs,
    presetId: mixPreset.id,
    drink: { slot, fillId, percent },
  }
}

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    name: '',
    startedAt: 0,
    endedAt: null,
    currentMileage: 0,
    entries: [],
    drinkSlots: [
      { presetId: null, fillId: 0 },
      { presetId: null, fillId: 0 },
    ],
    ...overrides,
  }
}

function renderSlots(overrides: Partial<Session> = {}, presets: Preset[] = [waterPreset, mixPreset]) {
  const onAssign = vi.fn()
  const onCreateAndAssign = vi.fn()
  const onClear = vi.fn()
  const onLog = vi.fn()
  render(
    <DrinkSlots
      session={session(overrides)}
      drinkPresets={presets}
      onAssign={onAssign}
      onCreateAndAssign={onCreateAndAssign}
      onClear={onClear}
      onLog={onLog}
    />,
  )
  return { onAssign, onCreateAndAssign, onClear, onLog }
}

describe('DrinkSlots — unassigned slot', () => {
  it('prompts to add a drink for each empty slot', () => {
    renderSlots()
    expect(screen.getByText('Add Drink to Bottle 1')).toBeTruthy()
    expect(screen.getByText('Add Drink to Bottle 2')).toBeTruthy()
  })

  it('picking an existing drink assigns it to that slot', () => {
    const { onAssign } = renderSlots()
    fireEvent.click(screen.getByText('Add Drink to Bottle 1'))
    fireEvent.click(screen.getByText('Water'))
    expect(onAssign).toHaveBeenCalledWith(0, 'preset-water')
  })

  it('creating a new drink assigns it via onCreateAndAssign, not onAssign', () => {
    const { onCreateAndAssign, onAssign } = renderSlots()
    fireEvent.click(screen.getByText('Add Drink to Bottle 2'))
    fireEvent.click(screen.getByText('+ New drink'))
    fireEvent.change(screen.getByPlaceholderText('e.g. Carb Drink Mix'), {
      target: { value: 'Electrolyte Mix' },
    })
    fireEvent.change(screen.getByPlaceholderText('Total carbs in the full bottle (g)'), {
      target: { value: '45' },
    })
    fireEvent.click(screen.getByText('Create & Use'))
    expect(onCreateAndAssign).toHaveBeenCalledWith(1, { label: 'Electrolyte Mix', carbs: 45 })
    expect(onAssign).not.toHaveBeenCalled()
  })
})

describe('DrinkSlots — assigned slot', () => {
  it('logs the tapped quarter as an absolute target percent, not a delta', () => {
    const { onLog } = renderSlots({
      drinkSlots: [{ presetId: 'preset-mix', fillId: 1 }, { presetId: null, fillId: 0 }],
    })
    fireEvent.click(screen.getByTestId('drink-mark-0-25'))
    expect(onLog).toHaveBeenCalledWith(0, 25)
  })

  it('disables marks already reached and leaves later ones tappable', () => {
    renderSlots({
      drinkSlots: [{ presetId: 'preset-mix', fillId: 1 }, { presetId: null, fillId: 0 }],
      entries: [drinkEntry(50)],
    })
    expect((screen.getByTestId('drink-mark-0-25') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('drink-mark-0-50') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('drink-mark-0-75') as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getByTestId('drink-mark-0-100') as HTMLButtonElement).disabled).toBe(false)
    // Reached marks read as a checkmark instead of their fraction.
    expect(within(screen.getByTestId('drink-mark-0-25')).getByText('✓')).toBeTruthy()
  })

  it('logging past 50% requests the next mark directly, not a cumulative sum', () => {
    const { onLog } = renderSlots({
      drinkSlots: [{ presetId: 'preset-mix', fillId: 1 }, { presetId: null, fillId: 0 }],
      entries: [drinkEntry(50)],
    })
    fireEvent.click(screen.getByTestId('drink-mark-0-75'))
    expect(onLog).toHaveBeenCalledWith(0, 75)
  })

  it('shows a finished state at 100% with no tappable marks', () => {
    renderSlots({
      drinkSlots: [{ presetId: 'preset-mix', fillId: 1 }, { presetId: null, fillId: 0 }],
      entries: [drinkEntry(100)],
    })
    expect(screen.getByText(/Finished/)).toBeTruthy()
    expect(screen.queryByTestId('drink-mark-0-25')).toBeNull()
  })

  it('lets you enter an exact percent greater than the current one', () => {
    const { onLog } = renderSlots({
      drinkSlots: [{ presetId: 'preset-mix', fillId: 1 }, { presetId: null, fillId: 0 }],
      entries: [drinkEntry(20)],
    })
    fireEvent.click(screen.getByText('Enter exact %'))
    const input = screen.getByPlaceholderText('>20')
    const logButton = screen.getByText('Log').closest('button') as HTMLButtonElement

    fireEvent.change(input, { target: { value: '15' } })
    expect(logButton.disabled).toBe(true)

    fireEvent.change(input, { target: { value: '60' } })
    expect(logButton.disabled).toBe(false)
    fireEvent.click(logButton)
    expect(onLog).toHaveBeenCalledWith(0, 60)
  })

  it('clearing a slot calls onClear for that index', () => {
    const { onClear } = renderSlots({
      drinkSlots: [{ presetId: null, fillId: 0 }, { presetId: 'preset-water', fillId: 1 }],
    })
    fireEvent.click(screen.getByLabelText('Remove drink from Bottle 2'))
    expect(onClear).toHaveBeenCalledWith(1)
  })

  it('only counts entries from the current fill toward the shown percent', () => {
    renderSlots({
      drinkSlots: [{ presetId: 'preset-mix', fillId: 2 }, { presetId: null, fillId: 0 }],
      // A finished previous bottle (fillId 1) plus a fresh start on fillId 2.
      entries: [drinkEntry(100, 0, 1), drinkEntry(25, 0, 2)],
    })
    expect(screen.getByText(/^25% ·/)).toBeTruthy()
  })

  it('renders each bottle independently', () => {
    renderSlots({
      drinkSlots: [
        { presetId: 'preset-water', fillId: 1 },
        { presetId: 'preset-mix', fillId: 1 },
      ],
    })
    expect(screen.getByText('Water')).toBeTruthy()
    expect(screen.getByText('Carb Mix')).toBeTruthy()
  })
})
