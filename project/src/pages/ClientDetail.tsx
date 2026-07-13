import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, FileText, Calendar, Edit2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useClient, useClientAppointments, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import { toast } from 'sonner'
import type { Appointment } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'status-scheduled',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  no_show: 'status-no_show',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланировано',
  completed: 'Выполнено',
  cancelled: 'Отменено',
  no_show: 'Не пришёл',
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useClient(id!)
  const { data: appointments, isLoading: apptLoading } = useClientAppointments(id!)
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [formInit, setFormInit] = useState(false)

  if (client && !formInit) {
    setForm({ name: client.name, phone: client.phone || '', notes: client.notes || '' })
    setFormInit(true)
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Имя обязательно'); return }
    try {
      await updateClient.mutateAsync({ id: id!, ...form })
      toast.success('Клиент обновлён')
      setEditOpen(false)
    } catch { toast.error('Не удалось обновить клиента') }
  }

  const handleDelete = async () => {
    try {
      await deleteClient.mutateAsync(id!)
      toast.success('Клиент удалён')
      navigate('/clients')
    } catch { toast.error('Не удалось удалить клиента') }
  }

  const initials = client?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const totalSpent = appointments?.reduce((sum, a: Appointment & { services?: { price?: number } }) =>
    sum + (a.price || Number(a.services?.price) || 0), 0) || 0

  const completedVisits = appointments?.filter((a: Appointment) => a.status === 'completed').length || 0

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/clients')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
        <ArrowLeft className="w-4 h-4" /> Клиенты
      </button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : client ? (
        <>
          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold mb-0.5">{client.name}</h1>
                {client.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                  </p>
                )}
                {client.notes && (
                  <p className="text-sm text-muted-foreground flex items-start gap-1.5 mt-1">
                    <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {client.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} className="text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteOpen(true)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/30">
              <div className="text-center">
                <p className="text-lg font-extrabold text-gradient-gold">{appointments?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Всего визитов</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-gradient-gold">{completedVisits}</p>
                <p className="text-xs text-muted-foreground">Выполнено</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-gradient-gold">{totalSpent.toLocaleString('ru-RU')} ₽</p>
                <p className="text-xs text-muted-foreground">Всего потрачено</p>
              </div>
            </div>
          </motion.div>

          {/* Appointment history */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> История визитов
              </h2>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"
                onClick={() => navigate('/appointments')}>
                <Plus className="w-3 h-3" /> Новая запись
              </Button>
            </div>

            {apptLoading ? (
              <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
            ) : !appointments?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">Записей пока нет</p>
            ) : (
              <div className="space-y-2">
                {(appointments as (Appointment & { services?: { name?: string; price?: number } })[]).map(appt => (
                  <div key={appt.id} className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-sm font-medium">{appt.services?.name || 'Услуга'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appt.datetime).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        {new Date(appt.datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {appt.price != null && (
                        <span className="text-sm font-semibold text-primary">{Number(appt.price).toLocaleString('ru-RU')} ₽</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[appt.status] || ''}`}>
                        {STATUS_LABELS[appt.status] || appt.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-center py-12">Клиент не найден</p>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Редактировать клиента</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Полное имя *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Имя клиента" />
            </div>
            <div className="space-y-1.5">
              <Label>Телефон</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+7 000 000 0000" />
            </div>
            <div className="space-y-1.5">
              <Label>Заметки</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Аллергии, предпочтения..." rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={updateClient.isPending} style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}>
                {updateClient.isPending ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>
              Это навсегда удалит {client?.name} и его данные. Существующие записи не будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
