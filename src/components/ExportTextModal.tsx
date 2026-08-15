import { useState } from 'react'
import { Modal } from './Modal'

interface ExportTextModalProps {
  text: string
  onClose: () => void
}

export function ExportTextModal({ text, onClose }: ExportTextModalProps) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setError(null)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy — select the text below and copy it manually.')
    }
  }

  return (
    <Modal title="Export Text" onClose={onClose}>
      <div className="space-y-3">
        <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-800 p-4 text-xs text-slate-200">
          {text}
        </pre>
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full rounded-xl bg-emerald-500 py-3 text-base font-bold text-slate-950 active:bg-emerald-400"
        >
          {copied ? '✓ Copied' : '📋 Copy to Clipboard'}
        </button>
      </div>
    </Modal>
  )
}
