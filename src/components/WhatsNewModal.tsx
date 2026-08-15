import { Modal } from './Modal'
import { CHANGELOG } from '../lib/changelog'

interface WhatsNewModalProps {
  onClose: () => void
}

export function WhatsNewModal({ onClose }: WhatsNewModalProps) {
  return (
    <Modal title="What's New" onClose={onClose}>
      <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
        {CHANGELOG.map((entry) => (
          <div key={entry.version}>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="font-semibold text-white">v{entry.version}</span>
              <span className="text-xs text-slate-500">{entry.date}</span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  )
}
