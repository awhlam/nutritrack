import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StartScreen } from './StartScreen'

function renderScreen() {
  const onStart = vi.fn()
  const onManagePresets = vi.fn()
  const onHistory = vi.fn()
  render(<StartScreen onStart={onStart} onManagePresets={onManagePresets} onHistory={onHistory} />)
  return { onStart, onManagePresets, onHistory }
}

describe('StartScreen', () => {
  it('shows a Start button', () => {
    renderScreen()
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })

  it('does not start tracking on its own — only when Start is tapped', () => {
    const { onStart } = renderScreen()
    expect(onStart).not.toHaveBeenCalled()
  })

  it('tapping Start begins a session', () => {
    const { onStart } = renderScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(onStart).toHaveBeenCalled()
  })

  it('lets you edit presets before starting', () => {
    const { onManagePresets } = renderScreen()
    fireEvent.click(screen.getByText('⚙️ Edit Presets'))
    expect(onManagePresets).toHaveBeenCalled()
  })

  it('lets you view history before starting', () => {
    const { onHistory } = renderScreen()
    fireEvent.click(screen.getByText('History'))
    expect(onHistory).toHaveBeenCalled()
  })
})
