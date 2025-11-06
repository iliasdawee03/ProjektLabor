import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { useAuth } from '../auth/useAuth'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import CategorySelect from '../components/CategorySelect'
import Badge from '../components/Badge'
import toast from 'react-hot-toast'
import { toMessage } from '../lib/errors'
import { formatDate, truncate } from '../lib/format'

export default function CompanyJobsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  

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
    onError: (err: unknown) => toast.error(toMessage(err))
  })

  if (!user?.roles?.includes('Company')) {
    return <Centered><Alert type="error">Csak cégként érhető el!</Alert></Centered>;
  }
  if (isLoading) return <Loading />;
  if (error) return <Centered><Alert type="error">Hiba történt</Alert></Centered>;

  const myJobs = (data?.items ?? []).filter(j => j.companyId === user.id)
  const filtered = myJobs.filter(j =>
    (!q || j.title.toLowerCase().includes(q.toLowerCase()) || j.description.toLowerCase().includes(q.toLowerCase())) &&
    (!category || j.category === category)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Saját álláshirdetések</h1>
        <AppLink href="/jobs/create" variant="primary">Új állás feladása</AppLink>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-80 w-full">
          <input
            placeholder="Keresés..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="sm:w-56 w-full">
          <CategorySelect
            label="Kategória"
            includeAllOption
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(job => (
            <Card key={job.id} className={job.isArchived ? 'opacity-60' : ''}>
              <CardHeader className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-base">{job.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {job.location && <span>{job.location}</span>}
                    {job.postedAt && <span>• {formatDate(job.postedAt)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {job.category && <Badge variant="purple">{job.category}</Badge>}
                  {job.isArchived && <Badge variant="yellow">Archivált</Badge>}
                </div>
              </CardHeader>
              <div className="p-4">
                <p className="line-clamp-3 text-sm text-gray-700">{truncate(job.description, 240)}</p>
                <div className="mt-3 flex gap-2 justify-end">
                  <AppLink href={`/jobs/${job.id}`} variant="primary">Részletek</AppLink>
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Centered><div className="text-gray-500">Nincs találat a megadott szűrők alapján.</div></Centered>
      )}
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
