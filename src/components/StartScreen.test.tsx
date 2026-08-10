import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StartScreen } from './StartScreen'

describe('StartScreen', () => {
  it('offers a single start button, with no activity type to choose', () => {
    render(<StartScreen onStart={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.queryByText(/run/i)).toBeNull()
    expect(screen.queryByText(/ride|bike/i)).toBeNull()
  })

  it('starts an activity when pressed', () => {
    const onStart = vi.fn()
    render(<StartScreen onStart={onStart} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
