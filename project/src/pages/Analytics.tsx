import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Lock, TrendingUp, Users, Star, Trophy, Medal, Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useSubscription } from '@/hooks/useSubscription'

const GOLD = '#f0b429'

export function AnalyticsPage() {
  const { data, isLoading } = useAnalytics()
  const sub = useSubscription()

  if (!sub.isPro && !sub.isTrial) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-6">Аналитика</h1>
        <div className="rounded-2xl p-8 text-center relative overflow-hidden glass-card">
          <div className="absolute inset-0 blur-md opacity-30 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(240,180,41,0.1), transparent)' }} />
          <Lock className="w-12 h-12 mx-auto mb-4 text-primary opacity-60" />
          <h2 className="text-xl font-bold mb-2">Аналитика — только Pro</h2>
          <p className="text-muted-foreground text-sm mb-5">Перейдите на Pro для доступа к полной аналитике, графикам выручки и отчётам.</p>
          <Link to="/subscription" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-black btn-gold-glow"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
            Перейти на Pro →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6">Аналитика</h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : (
          <>
            <motion.div whileHover={{ translateY: -2 }} className="glass-card rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-gradient-gold">{data?.avgCheck?.toLocaleString('ru-RU')} ₽</div>
              <div className="text-xs text-muted-foreground mt-0.5">Средний чек</div>
            </motion.div>
            <motion.div whileHover={{ translateY: -2 }} className="glass-card rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-gradient-gold">{data?.favDay || '—'}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Загруженный день</div>
            </motion.div>
            <motion.div whileHover={{ translateY: -2 }} className="glass-card rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-gradient-gold">{data?.repeatRate}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Постоянные клиенты</div>
            </motion.div>
          </>
        )}
      </div>

      {/* Revenue chart */}
      <div className="glass-card rounded-xl p-4 mb-5">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Выручка (последние 6 месяцев)
        </h2>
        {isLoading ? <Skeleton className="h-44" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.revenueData} barSize={28}>
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                tickFormatter={v => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'oklch(0.18 0.012 265)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 8, color: 'white', fontSize: 12 }}
                formatter={(v) => [`${Number(v).toLocaleString('ru-RU')} ₽`, 'Выручка'] as [string, string]}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {data?.revenueData?.map((_, i) => (
                  <Cell key={i} fill={i === (data.revenueData.length - 1) ? GOLD : 'rgba(240,180,41,0.4)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top services */}
        <div className="glass-card rounded-xl p-4">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Лучшие услуги
          </h2>
          {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div> : (
            <div className="space-y-2">
              {data?.topServices?.map((s, i) => {
                const max = data.topServices[0]?.count || 1
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-primary font-semibold ml-2 shrink-0">{s.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(240,180,41,0.15)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(s.count / max) * 100}%`, background: 'linear-gradient(90deg,#f0b429,#ff8c00)' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {!data?.topServices?.length && <p className="text-sm text-muted-foreground">Данных пока нет</p>}
            </div>
          )}
        </div>

        {/* Top clients */}
        <div className="glass-card rounded-xl p-4">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Лучшие клиенты
          </h2>
          {isLoading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div> : (
            <div className="space-y-2.5">
              {data?.topClients?.map((c, i) => {
                const Icon = i === 0 ? Trophy : i === 1 ? Medal : i === 2 ? Award : null
                const colors = ['#f0b429', '#94a3b8', '#cd7c2f']
                return (
                  <div key={c.name} className="flex items-center gap-2.5">
                    {Icon
                      ? <Icon className="w-4 h-4 shrink-0" style={{ color: colors[i] }} />
                      : <span className="text-xs text-muted-foreground w-4 text-center">{i + 1}</span>}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.count} {c.count === 1 ? 'визит' : c.count < 5 ? 'визита' : 'визитов'}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0">{c.spent.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )
              })}
              {!data?.topClients?.length && <p className="text-sm text-muted-foreground">Данных пока нет</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
