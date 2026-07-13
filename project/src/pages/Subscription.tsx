import { useEffect, useState } from 'react'
import { Check, Zap, ExternalLink, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProfile, useSubscription, useSubscriptionHistory } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

const PRO_FEATURES = [
  'Неограниченное количество клиентов',
  'Неограниченное количество приёмов',
  'Полная аналитика и отчёты',
  'Приоритетная поддержка',
  'Экспорт данных (скоро будет доступен)',
]

const FREE_FEATURES = [
  'До 10 клиентов',
  'До 20 приёмов в месяц',
  'Базовая панель управления',
  'Аналитика отсутствует.',
]

const PAYMENT_STATUS: Record<string, string> = {
  succeeded: 'Оплачено',
  failed: 'Отклонено',
  pending: 'Ожидание',
}

const RU_MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

function TermsContent() {
  return (
    <div className="space-y-5 text-sm leading-7 text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">1. Общие положения</h3>
        <p>Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между владельцем сервиса FlowDesk (далее — Администрация) и пользователем сервиса (далее — Пользователь).</p>
        <p className="mt-1">Используя сервис FlowDesk, Пользователь подтверждает своё согласие с условиями настоящего Соглашения.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">2. Описание сервиса</h3>
        <p>FlowDesk — это сервис для управления записями и клиентами. Сервис предоставляет инструменты для ведения базы клиентов, управления расписанием, учёта услуг и аналитики бизнеса.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">3. Подписка и оплата</h3>
        <p>Сервис предоставляет бесплатный пробный период продолжительностью 7 дней с момента регистрации.</p>
        <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)' }}>
          <p className="text-foreground font-medium">Оформляя подписку, пользователь соглашается на регулярные автоматические списания денежных средств в размере <span className="text-primary font-bold">490 рублей</span> каждый месяц до момента отмены подписки.</p>
        </div>
        <p className="mt-2">Подписка продлевается автоматически в начале каждого расчётного периода. Пользователь может отменить подписку в любой момент через личный кабинет.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">4. Отмена подписки</h3>
        <p>Пользователь имеет право отменить подписку в любой момент через настройки профиля или страницу управления подпиской.</p>
        <p className="mt-1">При отмене подписки доступ к платным функциям сохраняется до конца оплаченного периода. Новые списания после отмены производиться не будут.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">5. Возврат средств</h3>
        <p>Возврат средств за неиспользованный период подписки осуществляется по запросу пользователя в течение 14 дней с момента оплаты. Для оформления возврата свяжитесь с поддержкой через Telegram.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">6. Конфиденциальность</h3>
        <p>Администрация обязуется сохранять конфиденциальность персональных данных Пользователя и не передавать их третьим лицам без согласия Пользователя, за исключением случаев, предусмотренных законодательством.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">7. Ограничение ответственности</h3>
        <p>Администрация не несёт ответственности за любые убытки, понесённые Пользователем в результате использования или невозможности использования сервиса.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">8. Изменение условий</h3>
        <p>Администрация оставляет за собой право изменять условия настоящего Соглашения. О существенных изменениях Пользователь будет уведомлён по электронной почте или через интерфейс сервиса.</p>
      </section>
      <section>
        <h3 className="text-sm font-bold text-foreground mb-1">9. Контактная информация</h3>
        <p>По всем вопросам, связанным с работой сервиса и подпиской, обращайтесь:</p>
        <p className="mt-1">Telegram: <a href="https://t.me/flowdesk_bot" className="text-primary underline" target="_blank" rel="noreferrer">@flowdesk_support</a></p>
        <p className="text-xs mt-2">Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>
      </section>
    </div>
  )
}

export function SubscriptionPage() {
  const { isLoading } = useProfile()
  const sub = useSubscription()
  const { data: history } = useSubscriptionHistory()
  const location = useLocation()
  const qc = useQueryClient()
  const [payLoading, setPayLoading] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('payment') === 'success') {
      toast.success('Оплата получена! Подписка Pro активируется.')
      qc.invalidateQueries({ queryKey: ['profile'] })
    }
  }, [location.search, qc])

  const handlePay = async () => {
    setPayLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ user_id: session.user.id, return_url: `${window.location.origin}/subscription?payment=success` }),
        }
      )
      const result = await response.json()
      if (result.error) throw new Error(result.error)

      if (result.payment_url) {
        window.location.href = result.payment_url
      } else {
        throw new Error('Не удалось получить ссылку на оплату')
      }
    } catch (e) {
      toast.error((e as Error).message || 'Ошибка оплаты. Пожалуйста, попробуйте снова.')
      setPayLoading(false)
    }
  }

  const handleTelegram = () => {
    window.open('https://t.me/flowdesk_bot?text=Хочу+оформить+подписку+FlowDesk+Pro', '_blank')
  }

  if (isLoading) return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6">Подписка</h1>

      {/* Current status */}
      <div className="glass-card rounded-xl p-5 mb-5">
        <h2 className="text-base font-semibold mb-3">Текущий план</h2>
        {sub.isPro && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg text-gradient-gold">Pro</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>Активна</span>
            </div>
            {sub.subscriptionEndsAt && (
              <p className="text-sm text-muted-foreground">
                Активна до: <span className="text-foreground font-medium">
                  {new Date(sub.subscriptionEndsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </p>
            )}
          </div>
        )}
        {sub.isTrial && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">Пробный</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)' }}>
                Осталось {sub.trialDaysLeft} дн.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Пробный период завершится: <span className="text-foreground font-medium">{sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
            </p>
          </div>
        )}
        {(sub.isExpired || sub.isFree) && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-muted-foreground">Бесплатно</span>
            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--muted-foreground)' }}>Ограничено</span>
          </div>
        )}
      </div>

      {/* Plans comparison */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Free */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
          <div className="text-base font-bold mb-1">Бесплатно</div>
          <div className="text-2xl font-extrabold mb-4">0 ₽<span className="text-sm font-normal text-muted-foreground">/мес.</span></div>
          <ul className="space-y-1.5">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-xl p-4 relative overflow-hidden"
          style={{ background: 'rgba(240,180,41,0.06)', border: '1px solid rgba(240,180,41,0.25)' }}>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429' }}>Лучшее соотношение цены и качества</div>
          <div className="text-base font-bold mb-1 flex items-center gap-1.5 mt-5">
            <Zap className="w-4 h-4 text-primary" /> Про
          </div>
          <div className="text-2xl font-extrabold text-gradient-gold mb-4">490 ₽<span className="text-sm font-normal text-muted-foreground">/мес.</span></div>
          <ul className="space-y-1.5">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-3.5 h-3.5 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pay buttons */}
      {!sub.isPro && (
        <div className="space-y-3 mb-6">
          <Button className="w-full h-12 text-base font-bold btn-gold-glow"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
            onClick={handlePay} disabled={payLoading}>
            {payLoading ? 'Переход к оплате…' : 'Оплатить 490 ₽ через ЮKassa'}
          </Button>
          <Button variant="outline" className="w-full gap-2 border-border/60" onClick={handleTelegram}>
            <ExternalLink className="w-4 h-4" /> Оплата через Telegram
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Подписываясь, вы соглашаетесь на автоматическое ежемесячное списание средств в размере 490 ₽.{' '}
            <button onClick={() => setTermsOpen(true)} className="text-primary underline hover:opacity-80">
              Пользовательское соглашение
            </button>
          </p>
        </div>
      )}

      {/* Payment history */}
      {history && history.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> История платежей
          </h2>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                <div>
                  <p className="font-medium">{h.amount} ₽</p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const d = new Date(h.created_at)
                      return `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
                    })()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  h.status === 'succeeded' ? 'status-completed' : h.status === 'failed' ? 'status-cancelled' : 'status-scheduled'
                }`}>
                  {PAYMENT_STATUS[h.status] || h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms Dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-xl" style={{ background: 'oklch(0.16 0.012 265)', border: '1px solid var(--border)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Пользовательское соглашение
            </DialogTitle>
          </DialogHeader>
          <TermsContent />
        </DialogContent>
      </Dialog>
    </div>
  )
}
