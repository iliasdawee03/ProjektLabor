import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function AdminUsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<{ items: { id: string; email: string; fullName?: string; roles: string[] }[]; total: number }>('/api/v1/users')).data
  })

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Admin – Felhasználók</h2>
        <p className="text-sm text-gray-600">Felhasználók listája</p>
      </div>
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Loading" />
          </div>
        )}
        {error && <div className="text-sm text-red-600">Hiba történt</div>}
        {!isLoading && data && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Név</th>
                  <th className="py-2 pr-4">Szerepek</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.fullName ?? '-'}</td>
                    <td className="py-2 pr-4">{u.roles.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
