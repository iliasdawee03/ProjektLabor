import { useQuery } from '@tanstack/react-query'
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
import { formatDate, truncate } from '../lib/format'

export default function CompanyJobsPage() {
  const { user } = useAuth()

  const navigate = useNavigate()
  const CATEGORY_LABELS = ['Informatika', 'Pénzügy', 'Értékesítés', 'Gyártás', 'Oktatás'] as const
  const formatCategory = (c: unknown) => {
    if (typeof c === 'number') return CATEGORY_LABELS[c] ?? String(c)
    if (typeof c === 'string') return c
    return ''
  }
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  

  const { data, isLoading, error } = useQuery({
    queryKey: ['company-jobs'],
    queryFn: async () => (await api.get<{ items: Job[]; total: number }>('/api/v1/jobs', { params: { pageSize: 100 } })).data,
    enabled: !!user?.roles?.includes('Company')
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
                  {job.category !== undefined && job.category !== null && (
                    <Badge variant="purple">{formatCategory(job.category)}</Badge>
                  )}
                  {job.isArchived && <Badge variant="yellow">Archivált</Badge>}
                </div>
              </CardHeader>
              <div className="p-4">
                <p className="line-clamp-3 text-sm text-gray-700">{truncate(job.description, 240)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >Részletek</Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/jobs/${job.id}/applicants`)}
                  >Jelentkezők</Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    disabled={job.isArchived}
                  >Szerkesztés</Button>
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
  category: string | number
  postedAt: string
  approved: boolean
  moderationReason?: string
  isArchived?: boolean
}
