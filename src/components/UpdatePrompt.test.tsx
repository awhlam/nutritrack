import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpdatePrompt } from './UpdatePrompt'

describe('UpdatePrompt', () => {
  it('renders nothing until an update is actually detected', () => {
    const { container } = render(<UpdatePrompt />)
    expect(container.firstChild).toBeNull()
    expect(screen.queryByText(/new version/i)).toBeNull()
  })
})
