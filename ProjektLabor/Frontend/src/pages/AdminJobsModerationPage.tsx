import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { Card, CardHeader } from '../components/Card'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import TextPromptDialog from '../components/TextPromptDialog'

interface JobDto {
  id: number
  title: string
  company: string
  location: string
  description: string
  salaryMin?: number
  salaryMax?: number
  category: number
  postedAt: string
  approved: boolean
  moderationReason?: string
  companyId: string
}

export default function AdminJobsModerationPage() {
  const qc = useQueryClient()
  const [rejectForId, setRejectForId] = useState<number | null>(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => (await api.get<{ items: JobDto[]; total: number; page?: number; pageSize?: number }>(`/api/v1/jobs/pending?page=1&pageSize=100`)).data,
  })

  const approveMut = useMutation({
    mutationFn: async (id: number) => (await api.patch(`/api/v1/jobs/${id}/moderate`, { approved: true })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-jobs'] })
  })
  const rejectMut = useMutation({
    mutationFn: async (payload: { id: number; reason?: string }) => (await api.patch(`/api/v1/jobs/${payload.id}/moderate`, { approved: false, reason: payload.reason ?? '' })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-jobs'] })
  })

  const pending = (data?.items ?? []).filter(j => !j.approved)

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Admin – Moderáció</h2>
        <p className="text-sm text-gray-600">Jóváhagyásra vagy elutasításra váró álláshirdetések</p>
      </CardHeader>
      <div className="p-4">
        {isLoading && <Loading />}
        {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}
        {!isLoading && (
          pending.length === 0 ? (
            <Centered>Jelenleg nincs moderálásra váró hirdetés.</Centered>
          ) : (
            <Table
              columns={[
                { key: 'title', label: 'Cím' },
                { key: 'company', label: 'Cég' },
                { key: 'postedAt', label: 'Feladás ideje' },
                { key: 'reason', label: 'Indok (ha elutasítva)' },
                { key: 'actions', label: 'Műveletek' },
              ]}
              data={pending.map(j => ({
                title: j.title,
                company: j.company,
                postedAt: new Date(j.postedAt).toLocaleString(),
                reason: j.moderationReason ?? '-',
                actions: (
                  <div className="flex gap-2">
                    <Button onClick={() => approveMut.mutate(j.id)} disabled={approveMut.isPending}>Jóváhagyás</Button>
                    <Button
                      variant="secondary"
                      onClick={() => setRejectForId(j.id)}
                      disabled={rejectMut.isPending}
                    >Elutasítás</Button>
                  </div>
                )
              }))}
            />
          )
        )}
      </div>
      <TextPromptDialog
        open={rejectForId !== null}
        onClose={() => setRejectForId(null)}
        title="Elutasítás indoklása"
        label="Indok (opcionális)"
        placeholder="Ha szükséges, add meg röviden az okot"
        required={false}
        onSubmit={(val) => {
          if (rejectForId !== null) {
            rejectMut.mutate({ id: rejectForId, reason: val })
          }
        }}
      />
    </Card>
  )
}
