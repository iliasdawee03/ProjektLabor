import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Button, AppLink } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import CategorySelect from '../components/CategorySelect'
import Badge from '../components/Badge'
import { formatDate, truncate } from '../lib/format'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import { useAuth } from '../auth/useAuth'

type Job = {
  id: string
  title: string
  description: string
  location?: string
  employmentType?: string
  createdAt?: string
  companyId?: string
  category?: string | number
}

function FeaturedJobs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => (await api.get<{ items: Job[]; total: number }>(`/api/v1/jobs`, { params: { page: 1, pageSize: 6 } })).data
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Friss állások</h2>
        <AppLink href="/jobs" variant="secondary">Összes állás</AppLink>
      </div>
      {isLoading && <Loading />}
      {error && <Centered><Alert type="error">Nem sikerült betölteni a friss állásokat.</Alert></Centered>}
      {data?.items?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map(job => (
            <Card key={job.id}>
              <CardHeader>
                <div>
                  <h3 className="text-base font-semibold">{job.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {job.location && <span>{job.location}</span>}
                    {job.employmentType && <span>• {job.employmentType}</span>}
                    {job.createdAt && <span>• {formatDate(job.createdAt)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {job.category !== undefined && job.category !== null && (
                    <Badge variant="purple">{String(job.category)}</Badge>
                  )}
                </div>
              </CardHeader>
              <div className="p-4">
                <p className="line-clamp-3 text-sm text-gray-700">{truncate(job.description, 200)}</p>
                <div className="mt-3 flex gap-2 justify-end">
                  <AppLink href={`/jobs/${job.id}`} variant="primary" className="text-sm">Részletek</AppLink>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && <div className="text-sm text-gray-500">Nincs megjeleníthető állás.</div>
      )}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('')
  const { user } = useAuth()

  const gotoJobs = () => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (category) params.set('type', category)
    const query = params.toString()
    navigate(query ? `/jobs?${query}` : '/jobs')
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
  <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-10 text-white shadow-lg ring-1 ring-black/10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Találd meg a következő álomállásodat
          </h1>
          <p className="mt-3 text-white/90 max-w-2xl">
            Böngéssz friss, ellenőrzött hirdetések között és jelentkezz pár kattintással.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr,200px,auto]">
            <input
              placeholder="Pozíció, kulcsszó, város…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full rounded-md border border-white/30 bg-white text-gray-900 placeholder-gray-500 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <div className="sm:w-56 w-full">
              <CategorySelect
                label="Kategória"
                includeAllOption
                value={category}
                onChange={e => setCategory(e.target.value)}
                labelClassName="text-white/90"
                className="bg-white text-gray-900 border-white/30"
              />
            </div>
            <Button
              variant="secondary"
              onClick={gotoJobs}
              className="bg-white text-blue-700 hover:bg-white/90 border border-white/30"
            >
              Keresés
            </Button>
          </div>

          <div className="mt-4 text-xs text-white/80">
            Tipp: Használd a fenti keresőt, majd finomíts a találatokat az Állások oldalon.
          </div>
        </div>
      </section>

     

      {/* Featured jobs */}
      <section className="mx-auto max-w-6xl">
        <FeaturedJobs />
      </section>

      {/* Dual CTA */}
      <section className="mx-auto max-w-6xl grid gap-4 md:grid-cols-2">
        <Card className="border border-gray-200">
          <CardHeader>
            <div>
              <h3 className="text-base font-semibold">Álláskeresőknek</h3>
              <p className="mt-1 text-sm text-gray-600">Hozz létre profilt, tölts fel önéletrajzot és jelentkezz egyszerűen.</p>
            </div>
          </CardHeader>
          <div className="p-4 flex gap-2">
            <AppLink href="/jobs" variant="primary">Böngészés</AppLink>
            {!user && <AppLink href="/register" variant="secondary">Regisztráció</AppLink>}
          </div>
        </Card>
        <Card className="border border-gray-200">
          <CardHeader>
            <div>
              <h3 className="text-base font-semibold">Cégeknek</h3>
              <p className="mt-1 text-sm text-gray-600">Adj fel hirdetést és találj gyorsan releváns jelentkezőket.</p>
            </div>
          </CardHeader>
          <div className="p-4 flex gap-2">
            {user?.roles?.includes('Company') ? (
              <>
                <AppLink href="/jobs/create" variant="primary">Új állás feladása</AppLink>
                <AppLink href="/company/jobs" variant="secondary">Hirdetéseim</AppLink>
              </>
            ) : (
              <>
                <AppLink href="/profile" variant="primary">Céges jogosultság igénylése</AppLink>
                <AppLink href="/login" variant="secondary">Bejelentkezés</AppLink>
              </>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
