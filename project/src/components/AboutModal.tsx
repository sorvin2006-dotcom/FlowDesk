import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Zap, Users, BarChart3, Calendar, Shield, HeartHandshake, X } from 'lucide-react'

const FEATURES = [
  { icon: Users, title: 'База клиентов', desc: 'Ведите полную историю каждого клиента — визиты, расходы, заметки.' },
  { icon: Calendar, title: 'Умное расписание', desc: 'Управляйте записями, не пропускайте клиентов и планируйте день эффективно.' },
  { icon: BarChart3, title: 'Аналитика', desc: 'Следите за выручкой, загруженностью и ростом бизнеса в реальном времени.' },
  { icon: Shield, title: 'Безопасность', desc: 'Все данные шифруются и хранятся надёжно — только вы видите свою базу.' },
]

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" style={{ background: 'oklch(0.14 0.012 265)', border: '1px solid var(--border)', padding: 0, overflow: 'hidden' }}>
        {/* Hero */}
        <div className="relative px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.08), rgba(255,140,0,0.04))' }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', boxShadow: '0 0 30px rgba(240,180,41,0.4)' }}>
            <Zap className="w-8 h-8 text-black" />
          </motion.div>
          <h2 className="text-2xl font-extrabold text-gradient-gold mb-2">FlowDesk</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Профессиональное приложение для управления записями и клиентами.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl p-3 space-y-1.5"
                style={{ background: 'oklch(0.18 0.012 265)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold">{title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div className="rounded-xl p-4"
            style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Наша миссия</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Мы создали FlowDesk, чтобы вы могли сосредоточиться на работе, а не на рутинной организации.
              Простой интерфейс, мощные инструменты, доступная цена.
            </p>
          </div>

          {/* Version + contact */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>FlowDesk v1.0 · © 2026</span>
            <a href="https://t.me/flowdesk_support" target="_blank" rel="noreferrer"
              className="text-primary hover:opacity-80 transition-opacity">
              Написать нам
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AboutButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        О приложении
      </button>
      <AboutModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
