import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Button } from './Button'

type ReportDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { reason: string; details?: string }) => void
}

export default function ReportDialog({ open, onClose, onSubmit }: ReportDialogProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setReason('')
      setDetails('')
      setTouched(false)
    }
  }, [open])

  const canSubmit = reason.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Jelentés beküldése"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Mégse</Button>
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) { setTouched(true); return }
              onSubmit({ reason: reason.trim(), details: details.trim() })
              onClose()
            }}
          >Küldés</Button>
        </>
      )}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Miért tartod nem megfelelőnek? <span className="text-red-600">*</span></label>
          <textarea
            className="w-full min-h-[90px] rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Röviden írd le az okot"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={500}
          />
          {touched && reason.trim().length === 0 && (
            <div className="mt-1 text-xs text-red-700">A mező kitöltése kötelező.</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Részletek (opcionális)</label>
          <textarea
            className="w-full min-h-[90px] rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ha szeretnél, írhatsz részletesebb leírást is"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={2000}
          />
          <div className="mt-1 text-xs text-gray-500 text-right">{details.length}/2000</div>
        </div>
      </div>
    </Modal>
  )
}
