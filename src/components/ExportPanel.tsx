import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { ExportCard } from './ExportCard'
import { ExportTextModal } from './ExportTextModal'
import { buildTextExport } from '../lib/format'
import type { Session } from '../lib/types'

interface ExportPanelProps {
  session: Session
}

function fileBaseName(session: Session) {
  const d = new Date(session.startedAt)
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
  return `nutritrack-${stamp}`
}

export function ExportPanel({ session }: ExportPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showText, setShowText] = useState(false)

  const exportImage = async () => {
    if (!cardRef.current) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#020617',
        pixelRatio: 2,
      })

      const filename = `${fileBaseName(session)}.png`

      if (navigator.canShare && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], filename, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'NutriTrack Summary' })
          setBusy(false)
          return
        }
      }

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      setError('Could not generate image export.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowText(true)}
          className="flex-1 rounded-xl bg-slate-800 py-3 text-base font-semibold text-white active:bg-slate-700"
        >
          📄 Export Text
        </button>
        <button
          type="button"
          onClick={exportImage}
          disabled={busy}
          className="flex-1 rounded-xl bg-slate-800 py-3 text-base font-semibold text-white active:bg-slate-700 disabled:opacity-50"
        >
          {busy ? 'Generating…' : '🖼️ Export Image'}
        </button>
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}

      <div className="pointer-events-none fixed left-[-9999px] top-0 opacity-100">
        <ExportCard ref={cardRef} session={session} />
      </div>

      {showText && (
        <ExportTextModal text={buildTextExport(session)} onClose={() => setShowText(false)} />
      )}
    </div>
  )
}
