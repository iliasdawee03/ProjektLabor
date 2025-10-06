import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { useAuth } from '../auth/useAuth'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import toast from 'react-hot-toast'

export default function CompanyJobsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['company-jobs'],
    queryFn: async () => (await api.get<{ items: Job[]; total: number }>('/api/v1/jobs', { params: { pageSize: 100 } })).data,
    enabled: !!user?.roles?.includes('Company')
  })

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/jobs/${id}`)
    },
    onSuccess: () => {
      toast.success('Álláshirdetés archiválva')
      qc.invalidateQueries({ queryKey: ['company-jobs'] })
    },
    onError: () => toast.error('Nem sikerült archiválni')
  })

  if (!user?.roles?.includes('Company')) {
    return <Centered><Alert type="error">Csak cégként érhető el!</Alert></Centered>;
  }
  if (isLoading) return <Loading />;
  if (error) return <Centered><Alert type="error">Hiba történt</Alert></Centered>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Saját álláshirdetések</h1>
  <AppLink href="/jobs/create" variant="primary">Új állás feladása</AppLink>
      </div>
      <div className="space-y-4">
        {data?.items?.filter(j => j.companyId === user.id).map(job => (
          <Card key={job.id} className={`flex flex-col md:flex-row md:items-center md:justify-between gap-2 ${job.isArchived ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div>
                  <div className="font-semibold text-base">{job.title}</div>
                  <div className="text-xs text-gray-600">{job.location} • {job.category}</div>
                  {job.isArchived && <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5 ml-2">Archivált</span>}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    disabled={job.isArchived}
                  >Szerkesztés</Button>
                  <Button
                    variant="danger"
                    onClick={() => archiveMutation.mutate(job.id)}
                    disabled={job.isArchived || archiveMutation.isPending}
                  >Archiválás</Button>
                  <AppLink
                    href={`/jobs/${job.id}`}
                    variant="primary"
                    style={{ textDecoration: 'none' }}
                  >Részletek</AppLink>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {data?.items?.filter(j => j.companyId === user.id).length === 0 && (
          <Centered><div className="text-gray-500">Nincs saját álláshirdetésed.</div></Centered>
        )}
      </div>
    </div>
  )
}

type Job = {
  id: number
  title: string
  description: string
  company: string
  companyId: string
  location: string
  salaryMin?: number
  salaryMax?: number
  category: string
  postedAt: string
  approved: boolean
  moderationReason?: string
  isArchived?: boolean
}
