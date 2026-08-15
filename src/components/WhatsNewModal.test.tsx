import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { WhatsNewModal } from './WhatsNewModal'
import { CHANGELOG } from '../lib/changelog'

describe('WhatsNewModal', () => {
  it('lists every changelog version', () => {
    render(<WhatsNewModal onClose={vi.fn()} />)
    for (const entry of CHANGELOG) {
      expect(screen.getByText(`v${entry.version}`)).toBeTruthy()
    }
  })

  it('lists the changes for the newest version', () => {
    render(<WhatsNewModal onClose={vi.fn()} />)
    for (const change of CHANGELOG[0].changes) {
      expect(screen.getByText(change)).toBeTruthy()
    }
  })

  it('calls onClose when dismissed', () => {
    const onClose = vi.fn()
    render(<WhatsNewModal onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})
