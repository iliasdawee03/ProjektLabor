import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { Link } from 'react-router-dom'

type Job = { id: string; title: string; description: string; location?: string; employmentType?: string; createdAt?: string }

export default function JobsListPage() {
  const [q, setQ] = useState('')
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

      {isLoading && (
        <div className="flex items-center justify-center p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Loading" />
        </div>
      )}
      {error && <div className="text-sm text-red-600">Hiba történt</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.items?.map(job => (
          <div key={job.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2">
              <h3 className="text-base font-semibold">{job.title}</h3>
              <p className="text-xs text-gray-600">{`${job.location ?? ''} ${job.employmentType ? '• ' + job.employmentType : ''}`}</p>
            </div>
            <p className="line-clamp-3 text-sm text-gray-700">{job.description}</p>
            <div className="mt-3 text-right">
              <Link className="text-blue-600 text-sm" to={`/jobs/${job.id}`}>Részletek</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
