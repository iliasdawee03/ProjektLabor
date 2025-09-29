import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type MeDto = { id: string; email: string; fullName?: string; roles: string[] }

export default function ProfilePage() {
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get<MeDto>('/api/v1/users/me')).data })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ fullName?: string }>({
    values: { fullName: data?.fullName ?? '' },
  })

  const mutation = useMutation({
    mutationFn: async (payload: { fullName?: string }) => (await api.patch('/api/v1/users/me', payload)).data,
    onSuccess: async () => {
      toast.success('Profil frissítve')
      await qc.invalidateQueries({ queryKey: ['me'] })
    }
  })

  if (isLoading) return <div className="flex items-center justify-center p-10"><div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-label="Loading" /></div>
  if (error) return <div className="text-sm text-red-600">Hiba történt</div>

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Profil</h2>
          <p className="text-sm text-gray-600">Személyes adatok</p>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{data?.email}</div>
            </div>
            <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm text-gray-700">Teljes név</span>
                <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" {...register('fullName')} />
                {errors.fullName && <span className="text-xs text-red-600">{errors.fullName.message}</span>}
              </label>
              <button disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50">Mentés</button>
            </form>
            <div>
              <div className="text-sm text-gray-600">Szerepek</div>
              <div className="text-sm">{data?.roles?.join(', ')}</div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordCard />
    </div>
  )
}

function ChangePasswordCard() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<{ currentPassword: string; newPassword: string }>({})
  const mutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => api.post('/api/v1/users/change-password', payload),
    onSuccess: () => {
      toast.success('Jelszó módosítva')
      reset({ currentPassword: '', newPassword: '' })
    }
  })
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Jelszó módosítás</h2>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-3 max-w-sm">
          <label className="block space-y-1">
            <span className="text-sm text-gray-700">Jelenlegi jelszó</span>
            <input type="password" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" {...register('currentPassword', { required: 'Kötelező' })} />
            {errors.currentPassword && <span className="text-xs text-red-600">{errors.currentPassword.message}</span>}
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-gray-700">Új jelszó</span>
            <input type="password" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" {...register('newPassword', { required: 'Kötelező', minLength: { value: 6, message: 'Legalább 6 karakter' } })} />
            {errors.newPassword && <span className="text-xs text-red-600">{errors.newPassword.message}</span>}
          </label>
          <button disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-900 disabled:opacity-50">Módosítás</button>
        </form>
      </div>
    </div>
  )
}
