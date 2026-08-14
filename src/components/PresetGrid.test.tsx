import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PresetGrid } from './PresetGrid'
import type { Preset } from '../lib/types'

const gel: Preset = {
  id: 'preset-gel',
  label: 'Energy Gel',
  carbs: 30,
  caffeine: 0,
  color: '#f59e0b',
  kind: 'item',
}

function renderGrid(presets: Preset[] = []) {
  const onLog = vi.fn()
  const onCreate = vi.fn()
  const onManage = vi.fn()
  render(<PresetGrid presets={presets} onLog={onLog} onCreate={onCreate} onManage={onManage} />)
  return { onLog, onCreate, onManage }
}

describe('PresetGrid', () => {
  it('pads a single preset with empty tappable slots up to four cells', () => {
    renderGrid([gel])
    expect(screen.getByText('Energy Gel')).toBeTruthy()
    expect(screen.getAllByText('Tap to add')).toHaveLength(3)
  })

  it('shows no empty slots once there are four or more presets', () => {
    const many = [gel, { ...gel, id: 'p2', label: 'Two' }, { ...gel, id: 'p3', label: 'Three' }, { ...gel, id: 'p4', label: 'Four' }]
    renderGrid(many)
    expect(screen.queryByText('Tap to add')).toBeNull()
  })

  it('pads all the way to four empty slots with no presets configured', () => {
    renderGrid([])
    expect(screen.getAllByText('Tap to add')).toHaveLength(4)
  })

  it('logs a configured preset on tap', () => {
    const { onLog } = renderGrid([gel])
    fireEvent.click(screen.getByText('Energy Gel'))
    expect(onLog).toHaveBeenCalledWith(gel)
  })

  it('does not render a Custom Entry cell — that lives outside the grid now', () => {
    renderGrid([gel])
    expect(screen.queryByText('Custom Entry')).toBeNull()
  })

  it('tapping an empty slot opens a form that creates a new preset', () => {
    const { onCreate } = renderGrid([gel])
    fireEvent.click(screen.getAllByText('Tap to add')[0])
    expect(screen.getByText('New Preset Button')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('e.g. Rice Cake'), { target: { value: 'Waffle' } })
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '21' } })
    fireEvent.click(screen.getByText('Add to Grid'))

    expect(onCreate).toHaveBeenCalledWith({
      label: 'Waffle',
      carbs: 21,
      caffeine: 0,
      color: expect.any(String),
    })
  })

  it('shows a caffeine badge on a tile only when the preset has caffeine', () => {
    renderGrid([gel, { ...gel, id: 'p2', label: 'Caffeinated Gel', caffeine: 25 }])
    expect(screen.getByText('+25mg caffeine')).toBeTruthy()
  })

  it('creating a preset with caffeine passes it through', () => {
    const { onCreate } = renderGrid([gel])
    fireEvent.click(screen.getAllByText('Tap to add')[0])
    fireEvent.change(screen.getByPlaceholderText('e.g. Rice Cake'), { target: { value: 'Waffle' } })
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '21' } })
    fireEvent.change(screen.getByPlaceholderText('0 (optional)'), {
      target: { value: '15' },
    })
    fireEvent.click(screen.getByText('Add to Grid'))
    expect(onCreate).toHaveBeenCalledWith({
      label: 'Waffle',
      carbs: 21,
      caffeine: 15,
      color: expect.any(String),
    })
  })

  it('opens the manager when asked', () => {
    const { onManage } = renderGrid([gel])
    fireEvent.click(screen.getByText('⚙️ Manage preset buttons'))
    expect(onManage).toHaveBeenCalled()
  })
})
