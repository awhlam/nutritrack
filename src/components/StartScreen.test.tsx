import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StartScreen } from './StartScreen'
import { CURRENT_VERSION } from '../lib/changelog'
import { AppUpdateProvider } from '../hooks/useAppUpdate'

function renderScreen() {
  const onStart = vi.fn()
  const onManagePresets = vi.fn()
  const onHistory = vi.fn()
  render(
    <AppUpdateProvider>
      <StartScreen onStart={onStart} onManagePresets={onManagePresets} onHistory={onHistory} />
    </AppUpdateProvider>,
  )
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

  it('shows the current version', () => {
    renderScreen()
    expect(screen.getByText(`v${CURRENT_VERSION} · What's New`)).toBeTruthy()
  })

  it('shows a Check for Updates button', () => {
    renderScreen()
    expect(screen.getByText('Check for Updates')).toBeTruthy()
  })

  it('tapping the version opens the changelog, and it does not start tracking', () => {
    const { onStart } = renderScreen()
    fireEvent.click(screen.getByText(`v${CURRENT_VERSION} · What's New`))
    expect(screen.getByText("What's New")).toBeTruthy()
    expect(screen.getByText(`v${CURRENT_VERSION}`)).toBeTruthy()
    expect(onStart).not.toHaveBeenCalled()
  })

  it('closing the changelog returns to the start screen', () => {
    renderScreen()
    fireEvent.click(screen.getByText(`v${CURRENT_VERSION} · What's New`))
    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByText("What's New")).toBeNull()
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })
})
