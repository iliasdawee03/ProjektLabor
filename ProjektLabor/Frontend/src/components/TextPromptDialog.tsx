import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Button } from './Button'

type TextPromptDialogProps = {
  open: boolean
  title?: string
  label?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
  maxLength?: number
  onSubmit: (value: string) => void
  onClose: () => void
}

export default function TextPromptDialog({ open, title = 'Megjegyzés', label, placeholder, required, defaultValue = '', maxLength = 1000, onSubmit, onClose }: TextPromptDialogProps) {
  const [value, setValue] = useState(defaultValue)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(defaultValue)
      setTouched(false)
    }
  }, [open, defaultValue])

  const canSubmit = !required || value.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Mégse</Button>
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) { setTouched(true); return }
              onSubmit(value.trim())
              onClose()
            }}
          >Küldés</Button>
        </>
      )}
    >
      {label && <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-red-600"> *</span>}</label>}
      <textarea
        className="w-full min-h-[100px] rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
      />
      {required && touched && value.trim().length === 0 && (
        <div className="mt-1 text-xs text-red-700">Kötelező mező.</div>
      )}
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">{value.length}/{maxLength}</div>
      )}
    </Modal>
  )
}
