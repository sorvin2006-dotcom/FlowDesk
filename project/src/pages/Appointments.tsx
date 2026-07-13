import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Trash2, Lock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAppointments, useAddAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Appointment } from '@/types'

// Russian day abbreviations indexed by getDay() (0=Sun)
const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const RU_MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const RU_WEEKDAY_LONG = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'rgba(59,130,246,0.25)',
  completed: 'rgba(34,197,94,0.25)',
  cancelled: 'rgba(239,68,68,0.25)',
  no_show: 'rgba(249,115,22,0.25)',
}
const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланировано',
  completed: 'Выполнено',
  cancelled: 'Отменено',
  no_show: 'Не пришёл',
}
const MONTHLY_FREE_LIMIT = 20

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate)
  // Monday-first: offset from Monday
  const day = baseDate.getDay()
  const offset = day === 0 ? 6 : day - 1
  start.setDate(baseDate.getDate() - offset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

type ApptFormData = {
  client_id: string; service_id: string; date: string; time: string; price: string; status: string; notes: string
}

function ApptForm({ initial, onSubmit, loading, clients, services }: {
  initial?: Partial<ApptFormData>; onSubmit: (d: ApptFormData) => void;
  loading: boolean; clients: { id: string; name: string }[]; services: { id: string; name: string; price: number }[]
}) {
  const now = new Date()
  const [form, setForm] = useState<ApptFormData>({
    client_id: initial?.client_id || '',
    service_id: initial?.service_id || '',
    date: initial?.date || now.toISOString().split('T')[0],
    time: initial?.time || '10:00',
    price: initial?.price || '',
    status: initial?.status || 'scheduled',
    notes: initial?.notes || '',
  })
  const set = (k: keyof ApptFormData, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Клиент *</Label>
        <Select value={form.client_id} onValueChange={v => set('client_id', v)}>
          <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
          <SelectContent>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Услуга</Label>
        <Select value={form.service_id} onValueChange={v => {
          const svc = services.find(s => s.id === v)
          set('service_id', v)
          if (svc) set('price', String(svc.price))
        }}>
          <SelectTrigger><SelectValue placeholder="Выберите услугу" /></SelectTrigger>
          <SelectContent>
            {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {s.price} ₽</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Дата *</Label>
          <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Время *</Label>
          <Input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Стоимость (₽)</Label>
        <Input type="number" placeholder="0" value={form.price} onChange={e => set('price', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Статус</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Заметки</Label>
        <Textarea rows={2} placeholder="Дополнительные заметки..." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <Button
        className="w-full font-bold btn-gold-glow"
        style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
        disabled={loading || !form.client_id || !form.date || !form.time}
        onClick={() => onSubmit(form)}
      >
        {loading ? 'Сохранение…' : 'Сохранить запись'}
      </Button>
    </div>
  )
}

export function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments()
  const { data: clients = [] } = useClients()
  const { data: services = [] } = useServices()
  const addAppt = useAddAppointment()
  const updateAppt = useUpdateAppointment()
  const deleteAppt = useDeleteAppointment()
  const sub = useSubscription()

  const [weekBase, setWeekBase] = useState(new Date())
  const [view, setView] = useState<'week' | 'day'>('week')
  const [addOpen, setAddOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const weekDates = getWeekDates(weekBase)
  const today = new Date()

  const thisMonthAppts = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return (appointments || []).filter(a => new Date(a.datetime) >= monthStart)
  }, [appointments])

  const isMonthLimitReached = !sub.isPro && !sub.isTrial && thisMonthAppts.length >= MONTHLY_FREE_LIMIT

  const handleAdd = async (form: ApptFormData) => {
    if (isMonthLimitReached) { toast.error('Достигнут месячный лимит. Перейдите на Pro →'); return }
    try {
      const datetime = new Date(`${form.date}T${form.time}`).toISOString()
      await addAppt.mutateAsync({
        client_id: form.client_id,
        service_id: form.service_id || null,
        datetime,
        price: Number(form.price) || 0,
        status: form.status as Appointment['status'],
        notes: form.notes,
      })
      toast.success('Запись создана')
      setAddOpen(false)
    } catch { toast.error('Не удалось создать запись') }
  }

  const handleUpdate = async (form: ApptFormData) => {
    if (!selectedAppt) return
    try {
      const datetime = new Date(`${form.date}T${form.time}`).toISOString()
      await updateAppt.mutateAsync({
        id: selectedAppt.id,
        client_id: form.client_id,
        service_id: form.service_id || null,
        datetime,
        price: Number(form.price) || 0,
        status: form.status as Appointment['status'],
        notes: form.notes,
      })
      toast.success('Запись обновлена')
      setEditOpen(false)
      setSelectedAppt(null)
    } catch { toast.error('Не удалось обновить запись') }
  }

  const getApptInitial = (appt: Appointment): Partial<ApptFormData> => {
    const dt = new Date(appt.datetime)
    return {
      client_id: appt.client_id,
      service_id: appt.service_id || '',
      date: dt.toISOString().split('T')[0],
      time: dt.toTimeString().slice(0, 5),
      price: String(appt.price),
      status: appt.status,
      notes: appt.notes,
    }
  }

  const dayAppts = (date: Date) =>
    (appointments || []).filter(a => isSameDay(new Date(a.datetime), date))
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  const rangeLabel = view === 'week'
    ? `${weekDates[0].getDate()} ${RU_MONTHS_GEN[weekDates[0].getMonth()]} — ${weekDates[6].getDate()} ${RU_MONTHS_GEN[weekDates[6].getMonth()]}`
    : `${RU_WEEKDAY_LONG[weekBase.getDay()]}, ${weekBase.getDate()} ${RU_MONTHS_GEN[weekBase.getMonth()]}`

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Запись на приём</h1>
          <p className="text-sm text-muted-foreground">всего {appointments?.length || 0}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 btn-gold-glow"
          style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}>
          <Plus className="w-4 h-4" /> Новый
        </Button>
      </div>

      {isMonthLimitReached && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Lock className="w-4 h-4 text-red-400 shrink-0" />
          <span>Достигнут месячный лимит ({MONTHLY_FREE_LIMIT}). <Link to="/subscription" className="text-primary underline">Перейти на Pro →</Link></span>
        </div>
      )}

      {/* View toggle & navigation */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex rounded-lg p-1" style={{ background: 'oklch(0.18 0.012 265)' }}>
          {(['week', 'day'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
              style={view === v ? { background: 'oklch(0.25 0.012 265)', color: 'white' } : { color: 'var(--muted-foreground)' }}>
              {v === 'week' ? 'Неделя' : 'День'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => {
            const d = new Date(weekBase)
            d.setDate(d.getDate() - (view === 'week' ? 7 : 1))
            setWeekBase(d)
          }}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium px-2">{rangeLabel}</span>
          <Button variant="outline" size="icon-sm" onClick={() => {
            const d = new Date(weekBase)
            d.setDate(d.getDate() + (view === 'week' ? 7 : 1))
            setWeekBase(d)
          }}><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setWeekBase(new Date())}>Сегодня</Button>
        </div>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">{[...Array(7)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : view === 'week' ? (
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map(date => {
            const appts = dayAppts(date)
            const isToday = isSameDay(date, today)
            return (
              <div key={date.toISOString()} className="rounded-xl overflow-hidden"
                style={{ background: isToday ? 'rgba(240,180,41,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isToday ? 'rgba(240,180,41,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                <div className={cn('py-1.5 px-2 text-center text-xs font-semibold',
                  isToday ? 'text-primary' : 'text-muted-foreground')}>
                  <div>{DAYS_RU[date.getDay()]}</div>
                  <div className={cn('text-base font-bold', isToday && 'text-primary')}>{date.getDate()}</div>
                </div>
                <div className="px-1 pb-1 space-y-1 min-h-[80px]">
                  {appts.map(a => (
                    <button key={a.id} onClick={() => { setSelectedAppt(a); setEditOpen(true) }}
                      className="w-full text-left rounded-md px-1.5 py-1 text-xs transition-opacity hover:opacity-80"
                      style={{ background: STATUS_COLORS[a.status] }}>
                      <div className="font-medium truncate">{a.clients?.name || '?'}</div>
                      <div className="opacity-70">{new Date(a.datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-xl p-4">
          {dayAppts(weekBase).length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Записей на этот день нет.
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppts(weekBase).map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: STATUS_COLORS[a.status], border: `1px solid ${STATUS_COLORS[a.status]}` }}
                  onClick={() => { setSelectedAppt(a); setEditOpen(true) }}>
                  <div className="text-sm font-bold w-14 shrink-0 text-center">
                    {new Date(a.datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{a.clients?.name}</p>
                    <p className="text-xs opacity-70">{a.services?.name} · {a.price} ₽</p>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', `status-${a.status}`)}>{STATUS_LABELS[a.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg" style={{ background: 'oklch(0.16 0.012 265)', borderLeft: '1px solid var(--border)' }}>
          <SheetHeader className="mb-4"><SheetTitle>Новая запись</SheetTitle></SheetHeader>
          <ApptForm clients={clients} services={services} loading={addAppt.isPending} onSubmit={handleAdd} />
        </SheetContent>
      </Sheet>

      {/* Edit sheet */}
      {selectedAppt && (
        <Sheet open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) setSelectedAppt(null) }}>
          <SheetContent className="overflow-y-auto w-full sm:max-w-lg" style={{ background: 'oklch(0.16 0.012 265)', borderLeft: '1px solid var(--border)' }}>
            <SheetHeader className="mb-4"><SheetTitle>Редактировать запись</SheetTitle></SheetHeader>
            <ApptForm clients={clients} services={services} loading={updateAppt.isPending}
              initial={getApptInitial(selectedAppt)} onSubmit={handleUpdate} />
            <Button variant="outline" className="w-full mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => { setDeleteId(selectedAppt.id); setEditOpen(false) }}>
              <Trash2 className="w-4 h-4 mr-2" /> Удалить запись
            </Button>
          </SheetContent>
        </Sheet>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!deleteId) return
              await deleteAppt.mutateAsync(deleteId)
              toast.success('Запись удалена')
              setDeleteId(null)
              setSelectedAppt(null)
            }} className="bg-destructive text-white">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
