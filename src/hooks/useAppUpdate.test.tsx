import { useState } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppUpdateProvider } from './useAppUpdate'
import { useAppUpdate } from './appUpdateContext'

const registrationUpdate = vi.fn()

// Mirrors the real hook's behavior of registering exactly once per mount
// (via a lazy useState initializer), not on every re-render.
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options: { onRegisteredSW?: (url: string, registration: unknown) => void }) => {
    const [result] = useState(() => {
      options.onRegisteredSW?.('sw.js', { update: registrationUpdate })
      return {
        needRefresh: [false, vi.fn()] as [boolean, () => void],
        updateServiceWorker: vi.fn(),
      }
    })
    return result
  },
}))

function Probe() {
  const { checkForUpdate, checkStatus } = useAppUpdate()
  return (
    <button type="button" onClick={checkForUpdate}>
      {checkStatus}
    </button>
  )
}

describe('useAppUpdate', () => {
  beforeEach(() => {
    registrationUpdate.mockReset().mockResolvedValue(undefined)
  })

  it('checks for an update automatically as soon as the service worker registers', () => {
    render(
      <AppUpdateProvider>
        <Probe />
      </AppUpdateProvider>,
    )
    expect(registrationUpdate).toHaveBeenCalledTimes(1)
  })

  it('checks for an update on demand and reports up-to-date when none is found', async () => {
    render(
      <AppUpdateProvider>
        <Probe />
      </AppUpdateProvider>,
    )
    registrationUpdate.mockClear()

    fireEvent.click(screen.getByText('idle'))
    expect(registrationUpdate).toHaveBeenCalledTimes(1)
    expect(screen.getByText('checking')).toBeTruthy()

    await waitFor(() => expect(screen.getByText('up-to-date')).toBeTruthy(), { timeout: 2000 })
  }, 3000)
})
