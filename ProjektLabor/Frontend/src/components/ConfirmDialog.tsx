import Modal from './Modal'
import { Button } from './Button'

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({ open, title = 'Megerősítés', description, confirmText = 'Igen', cancelText = 'Mégse', destructive, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
        </>
      )}
    >
      {description && <p className="text-sm text-gray-700">{description}</p>}
    </Modal>
  )
}
