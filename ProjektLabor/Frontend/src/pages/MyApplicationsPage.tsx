import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import Badge from '../components/Badge'
import { formatDate } from '../lib/format'

type Application = {
  id: number
  jobId: number
  jobTitle?: string
  userId: string
  resumeId?: string
  appliedAt: string
  status: 'received' | 'inReview' | 'rejected' | 'accepted' | string
}


type BadgeVariant = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    received: { label: 'Beérkezett', variant: 'blue' },
    inReview: { label: 'Folyamatban', variant: 'purple' },
    accepted: { label: 'Elfogadva', variant: 'green' },
    rejected: { label: 'Elutasítva', variant: 'red' },
  }
  const s = map[status] ?? { label: status, variant: 'gray' }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-applications', page],
    queryFn: async () => (await api.get<{ items: Application[]; total: number }>(`/api/v1/applications/me`, { params: { page, pageSize } })).data
  })

  // A job címekhez most linket biztosítunk a részletekhez; ha kell, később joinolhatjuk a címeket is.

  if (isLoading) return <Loading />
  if (error) return <Centered><Alert type="error">Hiba történt</Alert></Centered>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Saját jelentkezések</h1>
      </div>

      {!data?.items?.length ? (
        <Centered><div className="text-gray-500">Még nincs jelentkezésed.</div></Centered>
      ) : (
        <Card>
          <CardHeader>
            <div className="font-medium">Összesen: {data.total}</div>
          </CardHeader>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Állás</th>
                    <th className="py-2 pr-4">Dátum</th>
                    <th className="py-2 pr-4">Státusz</th>
                    <th className="py-2 pr-4 text-right">Művelet</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(app => (
                    <tr key={app.id} className="border-b">
                      <td className="py-2 pr-4">
                        <span className="font-medium">{app.jobTitle ?? `#${app.jobId}`}</span>
                      </td>
                      <td className="py-2 pr-4">{formatDate(app.appliedAt)}</td>
                      <td className="py-2 pr-4"><StatusBadge status={app.status} /></td>
                      <td className="py-2 pr-0 text-right">
                        <AppLink href={`/jobs/${app.jobId}`} variant="primary">Megnyitás</AppLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.total > pageSize && (
              <div className="flex items-center justify-center gap-2 pt-3">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Előző</Button>
                <span className="text-sm text-gray-600">{page} / {Math.ceil(data.total / pageSize)}</span>
                <Button variant="secondary" disabled={page >= Math.ceil(data.total / pageSize)} onClick={() => setPage(p => p + 1)}>Következő</Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
