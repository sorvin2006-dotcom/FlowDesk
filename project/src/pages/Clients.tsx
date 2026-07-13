import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Phone, Trash2, Edit2, ChevronRight, Users, Lock, SlidersHorizontal, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { useClients, useAddClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import { useAppointments } from '@/hooks/useAppointments'
import { useSubscription } from '@/hooks/useSubscription'
import { toast } from 'sonner'
import type { Client } from '@/types'

const FREE_LIMIT = 10

type SortKey = 'created_desc' | 'name_asc' | 'last_visit_desc' | 'visits_desc'

const SORT_LABELS: Record<SortKey, string> = {
  created_desc: 'Сначала новые',
  name_asc: 'По имени А–Я',
  last_visit_desc: 'По последнему визиту',
  visits_desc: 'По количеству визитов',
}

function ClientCard({ client, lastVisit, visitCount, onEdit, onDelete, blurred }: {
  client: Client; lastVisit?: Date; visitCount: number; onEdit: () => void; onDelete: () => void; blurred?: boolean
}) {
  const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <motion.div
      whileHover={!blurred ? { translateY: -2 } : undefined}
      className={`glass-card rounded-xl p-4 relative ${blurred ? 'overflow-hidden' : ''}`}
    >
      {blurred && (
        <div className="absolute inset-0 rounded-xl z-10 flex items-center justify-center"
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(11,13,18,0.6)' }}>
          <div className="flex flex-col items-center gap-1">
            <Lock className="w-5 h-5 text-primary" />
            <span className="text-xs text-primary font-semibold">Только Pro</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-black"
          style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{client.name}</p>
          {client.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />{client.phone}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {visitCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {visitCount} {visitCount === 1 ? 'визит' : visitCount < 5 ? 'визита' : 'визитов'}
              </Badge>
            )}
            {lastVisit && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {lastVisit.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onEdit} className="text-muted-foreground hover:text-foreground">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Link to={`/clients/${client.id}`}>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

function ClientModal({ client, open, onClose }: { client?: Client; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: client?.name || '', phone: client?.phone || '', notes: client?.notes || '' })
  const add = useAddClient()
  const update = useUpdateClient()
  const loading = add.isPending || update.isPending
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Имя обязательно'); return }
    try {
      if (client) {
        await update.mutateAsync({ id: client.id, ...form })
        toast.success('Клиент обновлён')
      } else {
        await add.mutateAsync(form)
        toast.success('Клиент добавлен')
      }
      onClose()
    } catch { toast.error('Произошла ошибка') }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? 'Редактировать клиента' : 'Добавить клиента'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Имя *</Label>
            <Input placeholder="Полное имя" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Телефон</Label>
            <Input placeholder="+7 916 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Заметки</Label>
            <Textarea placeholder="Заметки о клиенте..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}>
              {loading ? 'Сохранение…' : client ? 'Сохранить' : 'Добавить клиента'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ClientsPage() {
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: appointments } = useAppointments()
  const deleteClient = useDeleteClient()
  const sub = useSubscription()

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const isLoading = clientsLoading

  // Build per-client appointment stats
  const clientStats = useMemo(() => {
    const map: Record<string, { count: number; lastDate?: Date }> = {}
    if (!appointments) return map
    for (const apt of appointments) {
      if (!apt.client_id) continue
      const existing = map[apt.client_id]
      const date = new Date(apt.datetime)
      if (!existing) {
        map[apt.client_id] = { count: 1, lastDate: date }
      } else {
        existing.count++
        if (!existing.lastDate || date > existing.lastDate) existing.lastDate = date
      }
    }
    return map
  }, [appointments])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null

    return (clients || []).filter(c => {
      if (q) {
        const matchName = c.name.toLowerCase().includes(q)
        const matchPhone = c.phone?.includes(q)
        const matchNotes = c.notes?.toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchNotes) return false
      }
      if (from || to) {
        const lastVisit = clientStats[c.id]?.lastDate
        if (!lastVisit) return false
        if (from && lastVisit < from) return false
        if (to && lastVisit > to) return false
      }
      return true
    })
  }, [clients, search, clientStats, dateFrom, dateTo])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name_asc') return a.name.localeCompare(b.name, 'ru')
      if (sortKey === 'last_visit_desc') {
        const da = clientStats[a.id]?.lastDate?.getTime() || 0
        const db = clientStats[b.id]?.lastDate?.getTime() || 0
        return db - da
      }
      if (sortKey === 'visits_desc') {
        return (clientStats[b.id]?.count || 0) - (clientStats[a.id]?.count || 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [filtered, sortKey, clientStats])

  const canSeeAll = sub.isPro || sub.isTrial
  const visibleClients = canSeeAll ? sorted : sorted.slice(0, FREE_LIMIT)
  const hiddenCount = canSeeAll ? 0 : Math.max(0, sorted.length - FREE_LIMIT)

  const hasFilters = !!dateFrom || !!dateTo || sortKey !== 'created_desc'
  const activeFilterCount = (dateFrom || dateTo ? 1 : 0) + (sortKey !== 'created_desc' ? 1 : 0)

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setSortKey('created_desc') }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Клиенты</h1>
          <p className="text-sm text-muted-foreground">{clients?.length || 0} всего</p>
        </div>
        <Button onClick={() => { setEditClient(undefined); setModalOpen(true) }}
          className="gap-2 btn-gold-glow" style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}>
          <Plus className="w-4 h-4" /> Добавить
        </Button>
      </div>

      {/* Search + filter row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, телефону, заметкам..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)} className="relative shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center text-black font-bold"
              style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active filters chips */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {sortKey !== 'created_desc' && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)' }}>
              {SORT_LABELS[sortKey]}
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)' }}>
              <Calendar className="w-3 h-3" />
              {dateFrom || '…'} – {dateTo || '…'}
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Сбросить
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">{search || hasFilters ? 'Клиентов не найдено.' : 'Клиентов пока нет.'}</p>
          {!search && !hasFilters && (
            <Button className="mt-4 gap-2" variant="outline" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" /> Добавить первого клиента
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleClients.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <ClientCard
                  client={c}
                  lastVisit={clientStats[c.id]?.lastDate}
                  visitCount={clientStats[c.id]?.count || 0}
                  onEdit={() => { setEditClient(c); setModalOpen(true) }}
                  onDelete={() => setDeleteId(c.id)}
                />
              </motion.div>
            ))}
            {hiddenCount > 0 && (
              <div className="glass-card rounded-xl p-6 text-center">
                <Lock className="w-8 h-8 mx-auto mb-2 text-primary/60" />
                <p className="text-sm font-semibold">{hiddenCount} ещё клиентов в Pro</p>
                <Link to="/subscription" className="text-xs text-primary underline">Перейдите на Pro →</Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      <ClientModal open={modalOpen} client={editClient} onClose={() => setModalOpen(false)} />

      {/* Filter sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Фильтры и сортировка</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Sort */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Сортировка</Label>
              <div className="space-y-1">
                {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSortKey(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      sortKey === key
                        ? 'font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    style={sortKey === key ? { background: 'rgba(240,180,41,0.12)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.25)' } : { background: 'transparent', border: '1px solid transparent' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Дата последнего визита</Label>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">С</Label>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">По</Label>
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={clearFilters}>Сбросить</Button>
              <Button className="flex-1" style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
                onClick={() => setFilterOpen(false)}>
                Применить
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Все записи этого клиента также будут затронуты.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!deleteId) return
              await deleteClient.mutateAsync(deleteId)
              toast.success('Клиент удалён')
              setDeleteId(null)
            }} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
