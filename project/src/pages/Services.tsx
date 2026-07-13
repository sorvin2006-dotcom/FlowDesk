import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Briefcase, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useServices, useAddService, useUpdateService, useDeleteService } from '@/hooks/useServices'
import { toast } from 'sonner'
import type { Service } from '@/types'

function ServiceModal({ service, open, onClose }: { service?: Service; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: service?.name || '',
    duration_minutes: service?.duration_minutes || 30,
    price: service?.price || 0,
  })
  const add = useAddService()
  const update = useUpdateService()
  const loading = add.isPending || update.isPending
  const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Название услуги обязательно'); return }
    try {
      if (service) {
        await update.mutateAsync({ id: service.id, name: form.name, duration_minutes: Number(form.duration_minutes), price: Number(form.price) })
        toast.success('Услуга обновлена')
      } else {
        await add.mutateAsync({ name: form.name, duration_minutes: Number(form.duration_minutes), price: Number(form.price) })
        toast.success('Услуга добавлена')
      }
      onClose()
    } catch { toast.error('Произошла ошибка') }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{service ? 'Редактировать услугу' : 'Добавить услугу'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Название услуги *</Label>
            <Input placeholder="Например: Консультация" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Длительность (мин)</Label>
              <Input type="number" min="5" placeholder="30" value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Цена (₽)</Label>
              <Input type="number" min="0" placeholder="500" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}>
              {loading ? 'Сохранение…' : service ? 'Сохранить' : 'Добавить услугу'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ServicesPage() {
  const { data: services, isLoading } = useServices()
  const deleteService = useDeleteService()
  const [editService, setEditService] = useState<Service | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Услуги</h1>
          <p className="text-sm text-muted-foreground">{services?.length || 0} услуг</p>
        </div>
        <Button onClick={() => { setEditService(undefined); setModalOpen(true) }}
          className="gap-2 btn-gold-glow" style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}>
          <Plus className="w-4 h-4" /> Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : !services?.length ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground mb-2">Услуг пока нет.</p>
          <p className="text-sm text-muted-foreground mb-4">Добавьте услуги, которые вы предоставляете клиентам.</p>
          <Button variant="outline" className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Добавить первую услугу
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {services.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ translateY: -2 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{s.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{s.duration_minutes} мин
                    </span>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />{Number(s.price).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setEditService(s); setModalOpen(true) }}
                    className="text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(s.id)}
                    className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ServiceModal open={modalOpen} service={editService} onClose={() => setModalOpen(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить услугу?</AlertDialogTitle>
            <AlertDialogDescription>Услуга будет удалена. Существующие записи не будут затронуты.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!deleteId) return
              await deleteService.mutateAsync(deleteId)
              toast.success('Услуга удалена')
              setDeleteId(null)
            }} className="bg-destructive text-white">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
