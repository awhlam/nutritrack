interface ToastProps {
  message: string | null
}

export function Toast({ message }: ToastProps) {
  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="pointer-events-auto rounded-full bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/30">
        {message}
      </div>
    </div>
  )
}
