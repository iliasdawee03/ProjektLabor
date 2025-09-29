import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

type Job = { id: string; title: string; description: string; location?: string; employmentType?: string; createdAt?: string }

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: async () => (await api.get<Job>(`/api/v1/jobs/${id}`)).data
  })

  if (isLoading) return <div className="flex items-center justify-center p-10"><div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Loading" /></div>
  if (error || !data) return <div className="text-sm text-red-600">Nem található</div>

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2">
        <h1 className="text-xl font-semibold">{data.title}</h1>
        <p className="text-sm text-gray-600">{`${data.location ?? ''} ${data.employmentType ? '• ' + data.employmentType : ''}`}</p>
      </div>
      <p className="whitespace-pre-wrap text-sm">{data.description}</p>
    </div>
  )
}
