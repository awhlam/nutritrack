import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpdatePrompt } from './UpdatePrompt'
import { AppUpdateProvider } from '../hooks/useAppUpdate'

describe('UpdatePrompt', () => {
  it('renders nothing until an update is actually detected', () => {
    const { container } = render(
      <AppUpdateProvider>
        <UpdatePrompt />
      </AppUpdateProvider>,
    )
    expect(container.firstChild).toBeNull()
    expect(screen.queryByText(/new version/i)).toBeNull()
  })
})
