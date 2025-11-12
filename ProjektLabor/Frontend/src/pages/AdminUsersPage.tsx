import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Table } from '../components/Table'
import { Card, CardHeader } from '../components/Card'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'

export default function AdminUsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<{ items: { id: string; email: string; fullName?: string; roles: string[] }[]; total: number }>('/api/v1/users')).data
  })

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Admin – Felhasználók</h2>
        <p className="text-sm text-gray-600">Felhasználók listája</p>
      </CardHeader>
      <div className="p-4">
        {isLoading && <Loading />}
        {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}
        {!isLoading && data && (
          <Table
            columns={[
              { key: 'email', label: 'Email' },
              { key: 'fullName', label: 'Név' },
              { key: 'roles', label: 'Szerepek' },
            ]}
            data={data.items.map(u => ({
              email: u.email,
              fullName: u.fullName ?? '-',
              roles: u.roles.join(', '),
            }))}
          />
        )}
      </div>
   </Card>
  )
}
