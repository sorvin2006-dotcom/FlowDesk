import { motion } from 'framer-motion'
import { Check, Zap, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const PRO_FEATURES = [
  'Неограниченное количество клиентов',
  'Неограниченное количество приёмов',
  'Полная аналитика и отчёты',
  'Приоритетная поддержка',
  'Экспорт данных (скоро)',
]

interface PaywallScreenProps {
  onStayFree?: () => void
}

export function PaywallScreen({ onStayFree }: PaywallScreenProps) {
  const { data: profile } = useProfile()
  const [loading, setLoading] = useState(false)
  const qc = useQueryClient()

  const handlePay = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ user_id: session.user.id, return_url: `${window.location.origin}/subscription?payment=success` }),
        }
      )
      const result = await response.json()
      if (result.payment_url) {
        window.location.href = result.payment_url
      } else {
        throw new Error(result.error || 'Payment creation failed')
      }
    } catch (err) {
      toast.error('Ошибка оплаты. Попробуйте снова.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTelegram = () => {
    window.open('https://t.me/flowdesk_bot?text=Хочу+оформить+подписку+FlowDesk+Pro', '_blank')
  }

  const handleStayFree = async () => {
    if (!profile) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ subscription_status: 'free' }).eq('user_id', user.id)
      qc.invalidateQueries({ queryKey: ['profile'] })
    }
    onStayFree?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(11,13,18,0.95)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'oklch(0.16 0.012 265)', border: '1px solid rgba(240,180,41,0.25)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', boxShadow: '0 0 24px rgba(240,180,41,0.4)' }}>
            <Zap className="w-7 h-7 text-black" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Пробный период завершён</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Оформите подписку, чтобы продолжить пользоваться FlowDesk и сохранить все данные.
          </p>
          <div className="rounded-xl p-5 mb-5 text-left"
            style={{ background: 'rgba(240,180,41,0.07)', border: '1px solid rgba(240,180,41,0.25)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Pro план</div>
                <div className="text-3xl font-extrabold">490 ₽<span className="text-lg font-normal text-muted-foreground">/мес.</span></div>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429' }}>
                Лучшая цена
              </div>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Button className="w-full h-12 text-base font-bold mb-3 btn-gold-glow"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
            onClick={handlePay} disabled={loading}>
            {loading ? 'Обработка…' : 'Оплатить 490 ₽'}
          </Button>
          <Button variant="outline" className="w-full h-10 mb-3 text-sm gap-2 border-border/50" onClick={handleTelegram}>
            <ExternalLink className="w-4 h-4" />
            Оплата через Telegram
          </Button>
          <button className="text-xs text-muted-foreground hover:text-foreground underline transition-colors" onClick={handleStayFree}>
            Остаться на бесплатном тарифе (ограниченные функции)
          </button>
        </div>
      </motion.div>
    </div>
  )
}
