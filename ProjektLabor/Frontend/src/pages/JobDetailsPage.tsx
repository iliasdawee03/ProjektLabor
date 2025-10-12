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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!id || !me?.resumePath) throw new Error('Nincs feltöltött önéletrajz!')
      await api.post(`/api/v1/jobs/${id}/applications`, { resumeId: me.resumePath })
    },
    onSuccess: () => {
      toast.success('Jelentkezés elküldve!')
      qc.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err: unknown) => {
      toast.error(toMessage(err))
    }
  })

  if (isLoading || meLoading) return <Loading />;
  if (error || !data) return <Centered><Alert type="error">Nem található</Alert></Centered>;

  const isOwner = user?.roles?.includes('Company') && data.companyId === user.id
  const canApply = user && user.roles.includes('JobSeeker')

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
              <AppLink href="/company/jobs" variant="primary" className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100">Saját állások</AppLink>
            </>
          )}
        </div>
        {canApply && !data.isArchived && (
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
      </div>
    </Card>
  )
}

