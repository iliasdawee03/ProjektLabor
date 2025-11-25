import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { useAuth } from '../auth/useAuth'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import CategorySelect from '../components/CategorySelect'
import Badge from '../components/Badge'
import { formatDate, truncate } from '../lib/format'
import { useDebounce } from '../lib/useDebounce'

type Job = {
  id: string
  title: string
  description: string
  location?: string
  employmentType?: string
  createdAt?: string
  companyId?: string
  category?: string | number
  isArchived?: boolean
}

function CompanySnippet({ companyId }: { companyId?: string }) {
  const { user } = useAuth()
  const { data } = useQuery({
    queryKey: ['company-profile', companyId],
    enabled: !!user && !!companyId,
    queryFn: async () => (await api.get<{ id: number; userId: string; name: string; website?: string; contactEmail?: string; contactPhone?: string }>(`/api/v1/company-profiles/${companyId}`)).data
  })
  if (!user || !data) return null
  return (
    <div className="mt-2 text-xs text-gray-700">
      <div className="font-medium text-gray-900">{data.name || 'Cég'}</div>
      <div className="flex flex-col gap-0.5">
        {data.website && <div>Web: <a href={data.website} target="_blank" rel="noreferrer" className="text-blue-700 underline">{data.website}</a></div>}
        {data.contactEmail && <div>Email: {data.contactEmail}</div>}
        {data.contactPhone && <div>Telefon: {data.contactPhone}</div>}
      </div>
    </div>
  )
}

export default function JobsListPage() {
  const CATEGORY_LABELS = ['Informatika', 'Pénzügy', 'Értékesítés', 'Gyártás', 'Oktatás'] as const
  const formatCategory = (c: unknown) => {
    if (typeof c === 'number') return CATEGORY_LABELS[c] ?? String(c)
    if (typeof c === 'string') return c
    return ''
  }
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = useMemo(() => searchParams.get('q') ?? '', [searchParams])
  const initialType = useMemo(() => searchParams.get('type') ?? '', [searchParams])
  const initialPage = useMemo(() => {
    const p = parseInt(searchParams.get('page') ?? '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);
  const [q, setQ] = useState(initialQ)
  const [category, setCategory] = useState<string>(initialType)
  const [page, setPage] = useState(initialPage)
  const pageSize = 12
  const qDebounced = useDebounce(q, 300)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', qDebounced, category, page],
    queryFn: async () => (
      await api.get<{ items: Job[]; total: number }>(`/api/v1/jobs`, {
        params: { q: qDebounced || undefined, type: category || undefined, page, pageSize }
      })
    ).data
  })

  // Sync filters to URL params when they change
  useEffect(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (category) params.set('type', category)
    if (page > 1) params.set('page', String(page))
    setSearchParams(params, { replace: true })
  }, [q, category, page, setSearchParams])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-80 w-full">
          <input
            placeholder="Keresés..."
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1) }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="sm:w-56 w-full">
          <CategorySelect
            label="Kategória"
            includeAllOption
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}

      {data?.items?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map(job => {
            const isOwner = user?.roles?.includes('Company') && job.companyId === user.id
            return (
              <Card key={job.id} className={job.isArchived ? 'opacity-60' : ''}>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{job.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      {job.location && <span>{job.location}</span>}
                      {job.employmentType && <span>• {job.employmentType}</span>}
                      {job.createdAt && <span>• {formatDate(job.createdAt)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* category badge if available via job.employmentType or future category */}
                    {job.category !== undefined && job.category !== null && (
                      <Badge variant="purple">{formatCategory(job.category)}</Badge>
                    )}
                    {job.isArchived && <Badge variant="yellow">Archivált</Badge>}
                  </div>
                </CardHeader>
                <div className="p-4">
                  <CompanySnippet companyId={job.companyId} />
                  <p className="line-clamp-3 text-sm text-gray-700">{truncate(job.description, 240)}</p>
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
      ) : (
        !isLoading && <Centered><div className="text-gray-500">Nincs találat a megadott szűrők alapján.</div></Centered>
      )}

      {/* simple pagination */}
      {data?.total && data.total > pageSize && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Előző</Button>
          <span className="text-sm text-gray-600">{page} / {Math.ceil(data.total / pageSize)}</span>
          <Button variant="secondary" disabled={page >= Math.ceil(data.total / pageSize)} onClick={() => setPage(p => p + 1)}>Következő</Button>
        </div>
      )}
    </div>
  )
}
