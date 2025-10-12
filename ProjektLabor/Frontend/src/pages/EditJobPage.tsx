import React from 'react'
import CategorySelect from '../components/CategorySelect'

import { Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { TextInput } from '../components/TextInput'
import { Textarea } from '../components/Textarea'
import { Alert } from '../components/Alert'
import { Centered, Loading } from '../components/Centered'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../auth/useAuth'
import { toMessage } from '../lib/errors'

interface FormValues {
  title: string
  description: string
  location: string
  category: string
  salaryMin?: number
  salaryMax?: number
}

export default function EditJobPage() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: async () => (await api.get<Job>(`/api/v1/jobs/${id}`)).data
  })

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>()

  // Pre-fill form when data loads
  React.useEffect(() => {
    if (data) {
      setValue('title', data.title)
      setValue('description', data.description)
      setValue('location', data.location)
      setValue('category', data.category)
      setValue('salaryMin', data.salaryMin)
      setValue('salaryMax', data.salaryMax)
    }
  }, [data, setValue])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await api.patch(`/api/v1/jobs/${id}`, { ...data, ...values })
    },
    onSuccess: () => {
      toast.success('Álláshirdetés frissítve!')
      qc.invalidateQueries({ queryKey: ['job', id] })
      qc.invalidateQueries({ queryKey: ['company-jobs'] })
      navigate('/company/jobs')
    },
    onError: (err: unknown) => {
      toast.error(toMessage(err))
    }
  })

  // Only allow company user who owns the job to edit
  if (!user?.roles?.includes('Company')) {
    return <Centered><Alert type="error">Csak cégként szerkesztheted az álláshirdetést!</Alert></Centered>;
  }
  if (isLoading) return <Loading />;
  if (error || !data) return <Centered><Alert type="error">Nem található vagy nincs jogosultság</Alert></Centered>;
  if (data.companyId !== user.id) {
    return <Centered><Alert type="error">Nincs jogosultságod ezt az álláshirdetést szerkeszteni.</Alert></Centered>;
  }

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Álláshirdetés szerkesztése</h1>
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => navigate(-1)}
            >Vissza</Button>
          </div>
        </CardHeader>
        <div className="p-6">
          {data.isArchived && (
            <div className="mb-4 text-yellow-800 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm">
              Ez az álláshirdetés archiválva van, nem szerkeszthető.
            </div>
          )}
          <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <TextInput
              label="Cím*"
              {...register('title', { required: 'Kötelező' })}
              error={errors.title?.message}
              disabled={data.isArchived}
            />
            <Textarea
              label="Leírás*"
              {...register('description', { required: 'Kötelező' })}
              error={errors.description?.message}
              disabled={data.isArchived}
            />
            <TextInput
              label="Helyszín*"
              {...register('location', { required: 'Kötelező' })}
              error={errors.location?.message}
              disabled={data.isArchived}
            />
            <CategorySelect
              label="Kategória*"
              defaultValue={data.category}
              disabled={data.isArchived}
              {...register('category', { required: 'Kötelező' })}
              error={errors.category?.message}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <TextInput
                  label="Minimum fizetés (Ft)"
                  type="number"
                  {...register('salaryMin', { valueAsNumber: true })}
                  disabled={data.isArchived}
                />
              </div>
              <div className="flex-1">
                <TextInput
                  label="Maximum fizetés (Ft)"
                  type="number"
                  {...register('salaryMax', { valueAsNumber: true })}
                  disabled={data.isArchived}
                />
              </div>
            </div>
            {mutation.isError && (
              <Alert type="error">{toMessage(mutation.error)}</Alert>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting || mutation.isPending || data.isArchived}
              >
                {mutation.isPending ? 'Mentés...' : 'Mentés'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(-1)}
              >Mégse</Button>
            </div>
          </form>
        </div>
      </Card>
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
