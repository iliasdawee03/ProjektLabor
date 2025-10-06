import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { useAuth } from '../auth/useAuth'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'

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

export default function JobsListPage() {
  const [q, setQ] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', q],
    queryFn: async () => (await api.get<{ items: Job[]; total: number }>(`/api/v1/jobs`, { params: { q } })).data
  })

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="w-80">
          <input
            placeholder="Keresés..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items?.map(job => {
          const isOwner = user?.roles?.includes('Company') && job.companyId === user.id
          return (
            <Card key={job.id} className={job.isArchived ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{job.title}</h3>
                  {job.isArchived && <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-0.5">Archivált</span>}
                </div>
              </CardHeader>
              <div className="p-4">
                <p className="text-xs text-gray-600">{`${job.location ?? ''} ${job.employmentType ? '• ' + job.employmentType : ''}`}</p>
                <p className="line-clamp-3 text-sm text-gray-700 mt-2">{job.description}</p>
                <div className="mt-3 flex gap-2 justify-end">
                  <AppLink href={`/jobs/${job.id}`} variant="primary" className="text-sm">Részletek</AppLink>
                  {isOwner && (
                    <Button
                      variant="secondary"
                      className="text-sm"
                      onClick={() => navigate(`/jobs/${job.id}/edit`)}
                      disabled={job.isArchived}
                    >Szerkesztés</Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
