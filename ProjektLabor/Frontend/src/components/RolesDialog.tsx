import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Button } from './Button'

type RolesDialogProps = {
  open: boolean
  roles: string[]
  onClose: () => void
  onSubmit: (roles: string[]) => void
}

const ALL_ROLES = ['Admin', 'Company', 'JobSeeker'] as const

export default function RolesDialog({ open, roles, onClose, onSubmit }: RolesDialogProps) {
  const [selected, setSelected] = useState<string[]>(roles)
  useEffect(() => {
    if (open) setSelected(roles)
  }, [open, roles])

  const toggle = (r: string) => setSelected(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Szerepek szerkesztése"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Mégse</Button>
          <Button variant="primary" onClick={() => { onSubmit(selected); onClose() }}>Mentés</Button>
        </>
      )}
    >
      <div className="space-y-2">
        {ALL_ROLES.map(r => (
          <label key={r} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={selected.includes(r)} onChange={() => toggle(r)} />
            {r}
          </label>
        ))}
      </div>
    </Modal>
  )
}
