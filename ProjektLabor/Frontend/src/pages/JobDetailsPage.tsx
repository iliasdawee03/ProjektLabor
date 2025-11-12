import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'

import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { api } from '../lib/api'
import { useAuth } from '../auth/useAuth'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import toast from 'react-hot-toast'
import { toMessage } from '../lib/errors'
import Badge from '../components/Badge'
import { formatDate } from '../lib/format'


type Job = {
  id: string
  title: string
  description: string
  location?: string
  employmentType?: string
  createdAt?: string
  companyId?: string
  isArchived?: boolean
}
type MeDto = { id: string; email: string; fullName?: string; roles: string[]; resumePath?: string }
type MyApp = { id: number; jobId: number; appliedAt: string; status: 'received' | 'inReview' | 'rejected' | 'accepted' | string }

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: async () => (await api.get<Job>(`/api/v1/jobs/${id}`)).data
  })
  // Get current user info (for resumePath)
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<MeDto>('/api/v1/users/me')).data,
    enabled: !!user
  })

  // Check if already applied to this job
  const { data: myApps, isLoading: appsLoading } = useQuery({
    queryKey: ['my-app-for-job', id],
    enabled: !!user && !!id && user.roles.includes('JobSeeker'),
    queryFn: async () => (await api.get<{ items: MyApp[]; total: number }>(`/api/v1/applications/me`, { params: { page: 1, pageSize: 100 } })).data,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!id || !me?.resumePath) throw new Error('Nincs feltöltött önéletrajz!')
      await api.post(`/api/v1/jobs/${id}/applications`, { resumeId: me.resumePath })
    },
    onSuccess: () => {
      toast.success('Jelentkezés elküldve!')
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['my-applications'] })
      if (id) qc.invalidateQueries({ queryKey: ['my-app-for-job', id] })
    },
    onError: (err: unknown) => {
      toast.error(toMessage(err))
    }
  })

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Hiányzó azonosító')
      await api.delete(`/api/v1/jobs/${id}`)
    },
    onSuccess: () => {
      toast.success('Álláshirdetés archiválva')
      if (id) qc.invalidateQueries({ queryKey: ['job', id] })
      qc.invalidateQueries({ queryKey: ['company-jobs'] })
      navigate('/company/jobs')
    },
    onError: (err: unknown) => toast.error(toMessage(err))
  })

  if (isLoading || meLoading || appsLoading) return <Loading />;
  if (error || !data) return <Centered><Alert type="error">Nem található</Alert></Centered>;

  const isOwner = user?.roles?.includes('Company') && data.companyId === user.id
  const canApply = user && user.roles.includes('JobSeeker')
  const existing = myApps?.items?.find(a => String(a.jobId) === String(id))

  const statusBadge = (status?: string) => {
    if (!status) return null
    const map: Record<string, { label: string; variant: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' }> = {
      received: { label: 'Beérkezett', variant: 'blue' },
      inReview: { label: 'Folyamatban', variant: 'purple' },
      accepted: { label: 'Elfogadva', variant: 'green' },
      rejected: { label: 'Elutasítva', variant: 'red' },
    }
    const cfg = map[status] ?? { label: status, variant: 'gray' as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold">{data.title}</h1>
            <p className="text-sm text-gray-600">{`${data.location ?? ''} ${data.employmentType ? '• ' + data.employmentType : ''}`}</p>
          </div>
          <Button variant="link" className="text-sm" onClick={() => navigate(-1)}>Vissza</Button>
        </div>
      </CardHeader>
      <div className="p-4">
        {data.isArchived && (
          <div className="mb-3 text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm">Ez az álláshirdetés archiválva van.</div>
        )}
        <p className="whitespace-pre-wrap text-sm mb-2">{data.description}</p>
        <div className="flex gap-2 mb-4">
          {isOwner && (
            <>
              <Button
                variant="secondary"
                className="text-sm"
                onClick={() => navigate(`/jobs/${data.id}/edit`)}
                disabled={data.isArchived}
              >Szerkesztés</Button>
              <Button
                variant="primary"
                className="text-sm"
                onClick={() => navigate(`/jobs/${data.id}/applicants`)}
              >Jelentkezők</Button>
              {!data.isArchived && (
                <Button
                  variant="danger"
                  className="text-sm"
                  disabled={archiveMutation.status === 'pending'}
                  onClick={() => {
                    if (confirm('Biztosan archiválod ezt az állást?')) {
                      archiveMutation.mutate()
                    }
                  }}
                >Archiválás</Button>
              )}
            </>
          )}
        </div>
        {canApply && !data.isArchived && !existing && (
          <div className="mt-6">
            <Button
              variant="primary"
              className="gap-2"
              disabled={mutation.status === 'pending' || !me?.resumePath}
              onClick={() => mutation.mutate()}
            >
              {mutation.status === 'pending' ? 'Jelentkezés...' : 'Jelentkezem az állásra'}
            </Button>
            {!me?.resumePath && (
              <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mt-2">Előbb tölts fel önéletrajzot a profilodban!</div>
            )}
          </div>
        )}
        {canApply && !data.isArchived && existing && (
          <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {statusBadge(existing.status)}
                <span>Már jelentkeztél erre az állásra.</span>
              </div>
              <AppLink href="/applications/me" variant="secondary">Jelentkezéseim</AppLink>
            </div>
            <div className="mt-1 text-xs text-blue-900">Beküldve: {formatDate(existing.appliedAt)}</div>
          </div>
        )}
      </div>
    </Card>
  )
}

