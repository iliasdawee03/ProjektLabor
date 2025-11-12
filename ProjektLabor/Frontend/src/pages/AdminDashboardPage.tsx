import { useState } from 'react'
import AdminUsersPage from './AdminUsersPage'
import AdminJobsModerationPage from './AdminJobsModerationPage'
import AdminCompanyRequestsPage from './AdminCompanyRequestsPage'
import AdminReportsPage from './AdminReportsPage'

export default function AdminDashboardPage() {
  const tabs: Array<{ key: 'users' | 'moderation' | 'company-requests' | 'reports'; label: string }> = [
    { key: 'users', label: 'Felhasználók' },
    { key: 'moderation', label: 'Moderáció' },
    { key: 'company-requests', label: 'Cégkérelmek' },
    { key: 'reports', label: 'Jelentések' },
  ]
  const [tab, setTab] = useState<'users' | 'moderation' | 'company-requests' | 'reports'>('users')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`px-3 py-2 rounded-md text-sm ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'users' && <AdminUsersPage />}
        {tab === 'moderation' && <AdminJobsModerationPage />}
        {tab === 'company-requests' && <AdminCompanyRequestsPage />}
        {tab === 'reports' && <AdminReportsPage />}
      </div>
    </div>
  )
}
