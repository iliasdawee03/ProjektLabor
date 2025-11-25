import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { Card, CardHeader } from '../components/Card'
import { Table } from '../components/Table'
import { Centered, Loading } from '../components/Centered'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import TextPromptDialog from '../components/TextPromptDialog'

type ReportItem = {
  id: number
  targetType: 'Job' | 'Application' | 'User' | number
  targetId: string
  reason: string
  details?: string
  createdByUserId: string
  createdAt: string
  status: 'Open' | 'Resolved' | 'Dismissed' | number
  resolvedAt?: string
  resolverUserId?: string
  resolutionNote?: string
}

export default function AdminReportsPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('Open')
  const [noteFor, setNoteFor] = useState<{ id: number; to: 'Resolved' | 'Dismissed' } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: async () => (await api.get<{ items: ReportItem[]; total: number }>(`/api/v1/reports`, { params: statusFilter ? { status: statusFilter } : {} })).data,
  })

  const update = useMutation({
    mutationFn: async (payload: { id: number; status: 'Open' | 'Resolved' | 'Dismissed'; note?: string }) => (await api.patch(`/api/v1/reports/${payload.id}`, { status: payload.status, note: payload.note ?? '' })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reports'] })
  })

  const toLabel = (s: ReportItem['status']) => s === 0 || s === 'Open' ? 'Nyitott' : (s === 1 || s === 'Resolved') ? 'Megoldva' : 'Elutasítva'
  const ttLabel = (t: ReportItem['targetType']) => t === 0 || t === 'Job' ? 'Állás' : (t === 1 || t === 'Application') ? 'Jelentkezés' : 'Felhasználó'

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Admin – Jelentések</h2>
        <p className="text-sm text-gray-600">Felhasználói jelentések kezelése</p>
      </CardHeader>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm">Állapot szűrő:</label>
          <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">(mind)</option>
            <option value="Open">Nyitott</option>
            <option value="Resolved">Megoldva</option>
            <option value="Dismissed">Elutasítva</option>
          </select>
        </div>
        {isLoading && <Loading />}
        {error && <Centered><Alert type="error">Hiba történt</Alert></Centered>}
        {!isLoading && data && (
          <Table
            columns={[
              { key: 'when', label: 'Beküldve' },
              { key: 'target', label: 'Cél' },
              { key: 'reason', label: 'Ok' },
              { key: 'status', label: 'Állapot' },
              { key: 'actions', label: 'Műveletek' },
            ]}
            data={data.items.map(r => {
              const isOpen = (r.status === 'Open' || r.status === 0)
              return ({
                when: new Date(r.createdAt).toLocaleString(),
                target: `${ttLabel(r.targetType)} #${r.targetId}`,
                reason: r.reason,
                status: toLabel(r.status),
                actions: (
                  <div className="flex gap-2">
                    <Button onClick={() => setNoteFor({ id: r.id, to: 'Resolved' })} disabled={!isOpen || update.isPending}>Megoldva</Button>
                    <Button variant="secondary" onClick={() => setNoteFor({ id: r.id, to: 'Dismissed' })} disabled={!isOpen || update.isPending}>Elutasítás</Button>
                  </div>
                )
              })
            })}
          />
        )}
      </div>
      <TextPromptDialog
        open={!!noteFor}
        onClose={() => setNoteFor(null)}
        title={noteFor?.to === 'Resolved' ? 'Megoldás megjegyzés (opcionális)' : 'Elutasítás indoka (opcionális)'}
        label="Megjegyzés"
        placeholder="Rövid indoklás (opcionális)"
        onSubmit={(val) => { if (noteFor) update.mutate({ id: noteFor.id, status: noteFor.to, note: val }) }}
      />
    </Card>
  )
}
