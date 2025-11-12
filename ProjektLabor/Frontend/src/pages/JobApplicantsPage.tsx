import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '../components/Card'
import { Alert } from '../components/Alert'
import { Centered, Loading } from '../components/Centered'
import { Button } from '../components/Button'
import { api } from '../lib/api'
import { useState } from 'react'
import Badge from '../components/Badge'
import { formatDate } from '../lib/format'
import toast from 'react-hot-toast'
import { toMessage } from '../lib/errors'

type Application = {
  id: number
  jobId: number
  userId: string
  applicantName?: string
  applicantEmail?: string
  resumeId?: string
  appliedAt: string
  status: 'received' | 'inReview' | 'rejected' | 'accepted' | string
}

const STATUS_OPTIONS = [
//   { value: 'received', label: 'Beérkezett' },
//   { value: 'inReview', label: 'Folyamatban' },
  { value: 'accepted', label: 'Elfogadva' },
  { value: 'rejected', label: 'Elutasítva' },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' }> = {
    // received: { label: 'Beérkezett', variant: 'blue' },
    // inReview: { label: 'Folyamatban', variant: 'purple' },
    accepted: { label: 'Elfogadva', variant: 'green' },
    rejected: { label: 'Elutasítva', variant: 'red' },
  }
  const s = map[status] ?? { label: status, variant: 'gray' as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['job-applications', id, page],
    enabled: !!id,
    queryFn: async () => (await api.get<{ items: Application[]; total: number }>(`/api/v1/jobs/${id}/applications`, { params: { page, pageSize } })).data
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: { appId: number; status: string }) => {
      await api.patch(`/api/v1/applications/${payload.appId}`, { status: payload.status })
    },
    onSuccess: () => {
      toast.success('Státusz frissítve')
      qc.invalidateQueries({ queryKey: ['job-applications', id] })
    },
    onError: (err: unknown) => toast.error(toMessage(err))
  })

  const openResume = async (resumeId?: string) => {
    if (!resumeId) return
    try {
      const res = await api.get(`/api/upload/${resumeId}`, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(res.data)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (err) {
      toast.error(toMessage(err))
    }
  }

  if (isLoading) return <Loading />
  if (error) return <Centered><Alert type="error">Hiba történt</Alert></Centered>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Jelentkezők</h1>
        <Button variant="link" onClick={() => navigate(-1)}>Vissza</Button>
      </div>

      {!data?.items?.length ? (
        <Centered><div className="text-gray-500">Ehhez az álláshoz még nincs jelentkező.</div></Centered>
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
                    <th className="py-2 pr-4">Jelentkező</th>
                    <th className="py-2 pr-4">Dátum</th>
                    <th className="py-2 pr-4">Státusz</th>
                    <th className="py-2 pr-4">CV</th>
                    <th className="py-2 pr-0 text-right">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(app => (
                    <tr key={app.id} className="border-b">
                      <td className="py-2 pr-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{app.applicantName ?? 'Név nélkül'}</span>
                          <span className="text-xs text-gray-600">{app.applicantEmail ?? app.userId}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">{formatDate(app.appliedAt)}</td>
                      <td className="py-2 pr-4"><StatusBadge status={app.status} /></td>
                      <td className="py-2 pr-4">
                        {app.resumeId ? (
                          <Button variant="secondary" onClick={() => openResume(app.resumeId)}>Megnyitás</Button>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-2 pr-0">
                        <div className="flex items-center justify-end gap-2">
                          <div className="inline-flex items-center gap-1">
                            {STATUS_OPTIONS.map(opt => (
                              <Button
                                key={opt.value}
                                variant={app.status === opt.value ? 'primary' : 'secondary'}
                                onClick={() => updateMutation.mutate({ appId: app.id, status: opt.value })}
                                disabled={updateMutation.isPending || app.status === opt.value}
                              >{opt.label}</Button>
                            ))}
                          </div>
                          {app.applicantEmail && (
                            <Button
                              variant="link"
                              onClick={() => { navigator.clipboard.writeText(app.applicantEmail!); toast.success('Email másolva a vágólapra'); }}
                            >Email másolása</Button>
                          )}
                        </div>
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
