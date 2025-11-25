import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { toMessage } from '../lib/errors'
import { Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { TextInput } from '../components/TextInput'
import { Alert } from '../components/Alert'
import { Centered, Loading } from '../components/Centered'
import CVUpload from '../components/CVUpload'
import { Textarea } from '../components/Textarea'
import Modal from '../components/Modal'

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
            {data?.roles?.includes('JobSeeker') && (
              <CVUpload
                resumePath={data?.resumePath}
                onUpload={() => qc.invalidateQueries({ queryKey: ['me'] })}
                label="Önéletrajz feltöltése"
                className="mt-4"
              />
            )}
          </div>
        </div>
      </Card>
      <ChangePasswordCard />
      <CompanyRequestCard />
      {data?.roles?.includes('Company') && <CompanyProfileCard />}
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
      onError: (err: unknown) => {
        toast.error(toMessage(err))
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

  function CompanyRequestCard() {
    const qc = useQueryClient()
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get<MeDto>('/api/v1/users/me')).data })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, formState, reset } = useForm<{ companyName: string; website?: string; message?: string }>({})
    const mutation = useMutation({
      mutationFn: async (payload: { companyName: string; website?: string; message?: string }) => (await api.post('/api/v1/company-requests', payload)).data,
      onSuccess: async () => {
        toast.success('Kérelem elküldve')
        await qc.invalidateQueries({ queryKey: ['company-requests'] })
        setOpen(false)
        reset()
      },
      onError: (err: unknown) => toast.error(toMessage(err))
    })
  if (!me?.roles?.includes('JobSeeker')) return null
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Cég jogosultság igénylése</h2>
          <p className="text-sm text-gray-600">Ha céges álláshirdetéseket szeretnél feladni, kérj céges jogosultságot. Az adminisztrátor jóváhagyása után azonnal hirdethetsz.</p>
        </CardHeader>
        <div className="p-4 max-w-2xl">
          <div className="text-sm text-gray-700">
            <ul className="list-disc ml-5 space-y-1">
              <li>A céges szerepkörrel új állásokat adhatsz fel és kezelheted a jelentkezőket.</li>
              <li>A jóváhagyás általában pár percen belül megtörténik munkaidőben.</li>
              <li>Az igényléshez add meg a cég nevét és (opcionálisan) a weboldalt, üzenetet.</li>
            </ul>
          </div>
          <div className="mt-3">
            <Button variant="primary" onClick={() => setOpen(true)}>Cég jogosultság igénylése</Button>
          </div>
          <Modal open={open} onClose={() => setOpen(false)} title="Cég jogosultság igénylése">
            <form onSubmit={handleSubmit(v => mutation.mutate(v))} className="space-y-3">
              <TextInput label="Cég neve" {...register('companyName', { required: 'Kötelező' })} error={formState.errors.companyName?.message} disabled={mutation.isPending} />
              <TextInput label="Weboldal" {...register('website')} disabled={mutation.isPending} />
              <Textarea label="Üzenet" rows={4} {...register('message')} disabled={mutation.isPending} />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={mutation.isPending}>Mégse</Button>
                <Button type="submit" variant="primary" disabled={mutation.isPending}>Kérelem elküldése</Button>
              </div>
            </form>
          </Modal>
        </div>
      </Card>
    )
  }

  function CompanyProfileCard() {
    const qc = useQueryClient()
    type Profile = { id: number; userId: string; name: string; website?: string; contactEmail?: string; contactPhone?: string; about?: string; updatedAt: string }
    const { data, isLoading, error } = useQuery({ queryKey: ['company-profile', 'me'], queryFn: async () => (await api.get<Profile>('/api/v1/company-profiles/me')).data })
    const form = useForm<{ name?: string; website?: string; contactEmail?: string; contactPhone?: string; about?: string }>({
      values: { name: data?.name ?? '', website: data?.website ?? '', contactEmail: data?.contactEmail ?? '', contactPhone: data?.contactPhone ?? '', about: data?.about ?? '' }
    })
    const mutation = useMutation({
      mutationFn: async (payload: { name?: string; website?: string; contactEmail?: string; contactPhone?: string; about?: string }) => (await api.patch('/api/v1/company-profiles/me', payload)).data,
      onSuccess: async () => {
        toast.success('Cégprofil frissítve')
        await qc.invalidateQueries({ queryKey: ['company-profile', 'me'] })
      },
      onError: (err: unknown) => toast.error(toMessage(err))
    })
    if (isLoading) return <div className="p-4"><span className="text-sm text-gray-600">Betöltés...</span></div>
    if (error) return <div className="p-4"><Alert type="error">Nem sikerült betölteni a cégprofilt</Alert></div>
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Cégprofil</h2>
          <p className="text-sm text-gray-600">A hirdetéseid mellett megjelenő információk</p>
        </CardHeader>
        <div className="p-4 max-w-xl">
          <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-3">
            <TextInput label="Cég neve" {...form.register('name')} />
            <TextInput label="Weboldal" {...form.register('website')} />
            <TextInput label="Kapcsolattartó email" {...form.register('contactEmail')} />
            <TextInput label="Kapcsolattartó telefon" {...form.register('contactPhone')} />
            <Textarea label="Bemutatkozás" rows={5} {...form.register('about')} />
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" disabled={mutation.isPending}>Mentés</Button>
              {data?.updatedAt && <span className="text-xs text-gray-500">Utoljára frissítve: {new Date(data.updatedAt).toLocaleString()}</span>}
            </div>
          </form>
        </div>
      </Card>
    )
  }
