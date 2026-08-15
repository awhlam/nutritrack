import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ExportTextModal } from './ExportTextModal'

describe('ExportTextModal', () => {
  it('shows the export text', () => {
    render(<ExportTextModal text="NutriTrack\nsome log lines" onClose={vi.fn()} />)
    expect(screen.getByText(/NutriTrack/)).toBeTruthy()
  })

  it('copies the text to the clipboard and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<ExportTextModal text="the export text" onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('📋 Copy to Clipboard'))

    expect(writeText).toHaveBeenCalledWith('the export text')
    await waitFor(() => expect(screen.getByText('✓ Copied')).toBeTruthy())
  })

  it('shows a fallback message if the clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.assign(navigator, { clipboard: { writeText } })

    render(<ExportTextModal text="the export text" onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('📋 Copy to Clipboard'))

    await waitFor(() => expect(screen.getByText(/select the text below/)).toBeTruthy())
  })

  it('calls onClose when dismissed', () => {
    const onClose = vi.fn()
    render(<ExportTextModal text="x" onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})
