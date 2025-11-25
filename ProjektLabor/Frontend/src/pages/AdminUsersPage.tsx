import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { Table } from '../components/Table'
import { Card, CardHeader } from '../components/Card'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import RolesDialog from '../components/RolesDialog'
import ConfirmDialog from '../components/ConfirmDialog'

type UserItem = { id: string; email: string; fullName?: string; roles: string[]; locked?: boolean }

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [editRolesFor, setEditRolesFor] = useState<UserItem | null>(null)
  const [lockFor, setLockFor] = useState<UserItem | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => (await api.get<{ items: UserItem[]; total: number }>(`/api/v1/users`, { params: roleFilter ? { role: roleFilter } : {} })).data
  })

  const updateRoles = useMutation({
    mutationFn: async (payload: { id: string; roles: string[] }) => (await api.patch(`/api/v1/users/${payload.id}/roles`, { roles: payload.roles })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] })
  })
  const lockToggle = useMutation({
    mutationFn: async (payload: { id: string; lock: boolean }) => (await api.patch(`/api/v1/users/${payload.id}/lock`, { lock: payload.lock })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] })
  })

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Admin – Felhasználók</h2>
        <p className="text-sm text-gray-600">Felhasználók listája</p>
      </CardHeader>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm">Szűrés szerep szerint:</label>
          <select className="border rounded px-2 py-1 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">(mind)</option>
            <option value="Admin">Admin</option>
            <option value="Company">Company</option>
            <option value="JobSeeker">JobSeeker</option>
          </select>
        </div>
        {isLoading && <Loading />}
        {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}
        {!isLoading && data && (
          <Table
            columns={[
              { key: 'email', label: 'Email' },
              { key: 'fullName', label: 'Név' },
              { key: 'roles', label: 'Szerepek' },
              { key: 'locked', label: 'Zárolt' },
              { key: 'actions', label: 'Műveletek' },
            ]}
            data={data.items.map(u => ({
              email: u.email,
              fullName: u.fullName ?? '-',
              roles: u.roles.join(', '),
              locked: u.locked ? 'Igen' : 'Nem',
              actions: (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setEditRolesFor(u)} disabled={updateRoles.isPending}>Szerepek</Button>
                  <Button variant={u.locked ? 'primary' : 'danger'} onClick={() => setLockFor(u)} disabled={lockToggle.isPending}>{u.locked ? 'Feloldás' : 'Zárolás'}</Button>
                </div>
              )
            }))}
          />
        )}
      </div>
      <RolesDialog
        open={!!editRolesFor}
        roles={editRolesFor?.roles ?? []}
        onClose={() => setEditRolesFor(null)}
        onSubmit={(roles) => {
          if (editRolesFor) updateRoles.mutate({ id: editRolesFor.id, roles })
        }}
      />
      <ConfirmDialog
        open={!!lockFor}
        onClose={() => setLockFor(null)}
        title={lockFor?.locked ? 'Zárolás feloldása' : 'Felhasználó zárolása'}
        description={lockFor?.locked ? 'Feloldod a felhasználói fiók zárolását?' : 'Biztosan zárolod a felhasználói fiókot?'}
        confirmText={lockFor?.locked ? 'Feloldás' : 'Zárolás'}
        destructive={!lockFor?.locked}
        onConfirm={() => {
          if (lockFor) lockToggle.mutate({ id: lockFor.id, lock: !lockFor.locked })
        }}
      />
   </Card>
  )
}
