import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { Card, CardHeader } from '../components/Card'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import TextPromptDialog from '../components/TextPromptDialog'

type Item = { id: number; userId: string; email: string; companyName: string; website?: string; message?: string; status: 'Pending' | 'Approved' | 'Rejected' | number; createdAt: string }

export default function AdminCompanyRequestsPage() {
  const qc = useQueryClient()
  const [rejectForId, setRejectForId] = useState<number | null>(null)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-company-requests'],
    // Only pending by default (status=0)
    queryFn: async () => (await api.get<{ items: Item[]; total: number }>(`/api/v1/company-requests?status=0&page=1&pageSize=100`)).data,
  })
  const decide = useMutation({
    mutationFn: async (payload: { id: number; status: 'Approved' | 'Rejected'; note?: string }) => {
      // Backend expects enum; JSON serialization prefers string names due to JsonStringEnumConverter
      return (await api.patch(`/api/v1/company-requests/${payload.id}`, { status: payload.status, note: payload.note ?? '' })).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-company-requests'] })
  })

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Admin – Cégkérelmek</h2>
        <p className="text-sm text-gray-600">Cég jogosultság igénylések elbírálása</p>
      </CardHeader>
      <div className="p-4">
        {isLoading && <Loading />}
        {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}
        {!isLoading && data && (
          <Table
            columns={[
              { key: 'email', label: 'Email' },
              { key: 'company', label: 'Cég' },
              { key: 'status', label: 'Állapot' },
              { key: 'createdAt', label: 'Beküldve' },
              { key: 'actions', label: 'Műveletek' },
            ]}
            data={(data.items ?? []).map(r => {
              const isPending = (r.status === 'Pending') || (r.status === 0)
              const isApproved = (r.status === 'Approved') || (r.status === 1)
              const label = isPending ? 'Folyamatban' : isApproved ? 'Jóváhagyva' : 'Elutasítva'
              return ({
              email: r.email,
              company: r.companyName,
              status: label,
              createdAt: new Date(r.createdAt).toLocaleString(),
              actions: (
                <div className="flex gap-2">
                  <Button onClick={() => decide.mutate({ id: r.id, status: 'Approved' })} disabled={decide.isPending || !isPending}>Jóváhagyás</Button>
                  <Button variant="secondary" onClick={() => setRejectForId(r.id)} disabled={decide.isPending || !isPending}>Elutasítás</Button>
                </div>
              )
            })}
          )}
          />
        )}
      </div>
      <TextPromptDialog
        open={rejectForId !== null}
        onClose={() => setRejectForId(null)}
        title="Kérelem elutasítása"
        label="Elutasítás indoka (opcionális)"
        placeholder="Ha szeretnél, adj meg rövid indoklást"
        onSubmit={(val) => {
          if (rejectForId !== null) {
            decide.mutate({ id: rejectForId, status: 'Rejected', note: val })
          }
        }}
      />
    </Card>
  )
}
