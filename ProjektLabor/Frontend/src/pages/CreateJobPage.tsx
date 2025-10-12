import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

import { Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { TextInput } from '../components/TextInput'
import { Textarea } from '../components/Textarea'
import { Alert } from '../components/Alert'
import { Centered, Loading } from '../components/Centered'
import toast from 'react-hot-toast'
import { useAuth } from '../auth/useAuth'
import CategorySelect from '../components/CategorySelect'
import { toMessage } from '../lib/errors'

interface FormValues {
  title: string
  description: string
  company: string
  location: string
  category: string
  salaryMin?: number
  salaryMax?: number
}

export default function CreateJobPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>()


  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await api.post('/api/v1/jobs', values)
    },
    onSuccess: () => {
      toast.success('Álláshirdetés sikeresen létrehozva!')
      qc.invalidateQueries({ queryKey: ['jobs'] })
      navigate('/company/jobs')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { status?: number } }
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        toast.error('Csak cégként lehet állást feladni!')
      } else {
        toast.error(toMessage(err))
      }
    }
  })

  if (!user?.roles?.includes('Company')) {
    return <Centered><Alert type="error">Csak cégként lehet állást feladni!</Alert></Centered>;
  }
  if (mutation.status === 'pending') return <Loading />;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Új álláshirdetés feladása</h1>
        </CardHeader>
        <div className="p-6">
          <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-4">
            <TextInput
              label="Cím*"
              {...register('title', { required: 'Kötelező' })}
              error={errors.title?.message}
            />
            <Textarea
              label="Leírás*"
              {...register('description', { required: 'Kötelező' })}
              error={errors.description?.message}
            />
            <TextInput
              label="Cég neve*"
              {...register('company', { required: 'Kötelező' })}
              error={errors.company?.message}
            />
            <TextInput
              label="Helyszín*"
              {...register('location', { required: 'Kötelező' })}
              error={errors.location?.message}
            />
            <CategorySelect
              label="Kategória*"
              defaultValue=""
              {...register('category', { required: 'Kötelező' })}
              error={errors.category?.message}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <TextInput
                  label="Minimum fizetés (Ft)"
                  type="number"
                  {...register('salaryMin', { valueAsNumber: true })}
                />
              </div>
              <div className="flex-1">
                <TextInput
                  label="Maximum fizetés (Ft)"
                  type="number"
                  {...register('salaryMax', { valueAsNumber: true })}
                />
              </div>
            </div>
            {/* Globális hibaüzenet, késöbb talán */}
            {/* {formError && <Alert type="error">{formError}</Alert>} */}
            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Mentés...' : 'Állás feladása'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
