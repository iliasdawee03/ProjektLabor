import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { TextInput } from '../components/TextInput'
import { Alert } from '../components/Alert'
import { Centered, Loading } from '../components/Centered'
import CVUpload from '../components/CVUpload'

type MeDto = { id: string; email: string; fullName?: string; roles: string[]; resumePath?: string }



export default function ProfilePage() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get<MeDto>('/api/v1/users/me')).data })
  const profileForm = useForm<{ fullName?: string }>({
    values: { fullName: data?.fullName ?? '' },
  })
  const profileMutation = useMutation({
    mutationFn: async (payload: { fullName?: string }) => (await api.patch('/api/v1/users/me', payload)).data,
    onSuccess: async () => {
      toast.success('Profil frissítve')
      await qc.invalidateQueries({ queryKey: ['me'] })
    }
  })
  if (isLoading) return <Loading />;
  if (error) return <Centered><Alert type="error">Hiba történt</Alert></Centered>;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Profil</h2>
          <p className="text-sm text-gray-600">Személyes adatok</p>
        </CardHeader>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{data?.email}</div>
            </div>
            <form onSubmit={profileForm.handleSubmit(v => profileMutation.mutate(v))} className="space-y-3">
              <TextInput
                label="Teljes név"
                {...profileForm.register('fullName')}
                error={profileForm.formState.errors.fullName?.message}
                disabled={profileForm.formState.isSubmitting}
              />
              {/* {formError && <Alert type="error">{formError}</Alert>} */}
              <Button type="submit" variant="primary" disabled={profileForm.formState.isSubmitting}>Mentés</Button>
            </form>
            <div>
              <div className="text-sm text-gray-600">Szerepek</div>
              <div className="text-sm">{data?.roles?.join(', ')}</div>
            </div>
            <CVUpload
              resumePath={data?.resumePath}
              onUpload={() => qc.invalidateQueries({ queryKey: ['me'] })}
              label="Önéletrajz feltöltése"
              className="mt-4"
            />
          </div>
        </div>
      </Card>
      <Card>
        <ChangePasswordCard />
      </Card>
    </div>
  )
}

  function ChangePasswordCard() {
    const qc = useQueryClient()
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{
      currentPassword: string
      newPassword: string
    }>()
    const mutation = useMutation({
      mutationFn: async (payload: { currentPassword: string; newPassword: string }) =>
        (await api.post('/api/v1/users/change-password', payload)).data,
      onSuccess: async () => {
        toast.success('Jelszó módosítva')
        reset()
        await qc.invalidateQueries({ queryKey: ['me'] })
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Hiba történt')
      }
    })
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Jelszó módosítás</h2>
        </CardHeader>
        <div className="p-4">
          <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-3 max-w-sm">
            <TextInput
              label="Jelenlegi jelszó"
              type="password"
              {...register('currentPassword', { required: 'Kötelező' })}
              error={errors.currentPassword?.message}
              disabled={isSubmitting}
            />
            <TextInput
              label="Új jelszó"
              type="password"
              {...register('newPassword', { required: 'Kötelező', minLength: { value: 6, message: 'Legalább 6 karakter' } })}
              error={errors.newPassword?.message}
              disabled={isSubmitting}
            />
            {/* {formError && <Alert type="error">{formError}</Alert>} */}
            <Button type="submit" variant="secondary" className="bg-gray-800 hover:bg-gray-900 text-white" disabled={isSubmitting}>Módosítás</Button>
          </form>
        </div>
      </Card>
    )
  }
