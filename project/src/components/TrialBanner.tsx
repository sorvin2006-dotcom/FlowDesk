import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

export function TrialBanner() {
  const sub = useSubscription()

  if (sub.isPro || sub.isExpired || sub.isFree) return null
  if (!sub.isTrial) return null

  const isLastDay = sub.trialDaysLeft <= 1

  return (
    <div className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
      style={{
        background: isLastDay ? 'rgba(239,68,68,0.12)' : 'rgba(240,180,41,0.1)',
        borderBottom: isLastDay ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(240,180,41,0.2)',
      }}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: isLastDay ? '#f87171' : '#f0b429' }} />
        <span className={isLastDay ? 'text-red-300' : 'text-amber-300'}>
          {isLastDay
            ? 'Последний день пробного периода! Оформите подписку сегодня.'
            : `До конца испытания осталось ${sub.trialDaysLeft} ${sub.trialDaysLeft === 1 ? 'день' : sub.trialDaysLeft < 5 ? 'дня' : 'дней'}.`}
        </span>
      </div>
      <Link to="/subscription" className="text-xs font-semibold underline whitespace-nowrap"
        style={{ color: isLastDay ? '#f87171' : '#f0b429' }}>
        Подписаться →
      </Link>
    </div>
  )
}
