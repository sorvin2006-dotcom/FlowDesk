import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Users, TrendingUp, DollarSign, Calendar, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/hooks/useSubscription'
import { useUpcomingAppointments, useTodayAppointments, useAppointments } from '@/hooks/useAppointments'
import { useClients } from '@/hooks/useClients'
import { useSeedData } from '@/hooks/useSeedData'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/types'

const RU_MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const RU_MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const RU_WEEKDAYS_LONG_CAP = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']
const RU_DAY_ABBR = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] // Mon-Sun (index 0=Mon)

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланировано',
  completed: 'Выполнено',
  cancelled: 'Отменено',
  no_show: 'Не пришёл',
}

function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    let start: number | null = null
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      if (ref.current) ref.current.textContent = Math.round(eased * target).toLocaleString('ru-RU')
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return ref
}

function StatCard({ label, value, icon: Icon, suffix = '' }: {
  label: string; value: number; icon: React.ComponentType<{ className?: string }>; suffix?: string
}) {
  const countRef = useCountUp(value)
  return (
    <motion.div
      whileHover={{ translateY: -3, boxShadow: '0 8px 32px rgba(240,180,41,0.12)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.2)' }}>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="text-2xl font-extrabold text-gradient-gold">
        <span ref={countRef}>0</span>{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </motion.div>
  )
}

function MiniCalendar({ appointments }: { appointments: Appointment[] }) {
  const [calDate, setCalDate] = useState(new Date())
  const today = new Date()

  const year = calDate.getFullYear()
  const month = calDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Days with appointments this month
  const apptDays = new Set(
    appointments
      .filter(a => {
        const d = new Date(a.datetime)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map(a => new Date(a.datetime).getDate())
  )

  // Start from Monday: (getDay() + 6) % 7 gives Mon=0...Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">{RU_MONTHS[month]} {year}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => {
            const d = new Date(calDate)
            d.setMonth(d.getMonth() - 1)
            setCalDate(d)
          }}><ChevronLeft className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" onClick={() => {
            const d = new Date(calDate)
            d.setMonth(d.getMonth() + 1)
            setCalDate(d)
          }}><ChevronRight className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {RU_DAY_ABBR.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <div key={i} className={cn(
            'relative flex flex-col items-center justify-center h-7 w-full rounded-md text-xs font-medium',
            !day && 'opacity-0 pointer-events-none',
            day && isToday(day) && 'text-black font-bold',
            day && !isToday(day) && 'text-foreground hover:text-primary',
          )}
            style={day && isToday(day) ? { background: 'linear-gradient(135deg,#f0b429,#ff8c00)' } : undefined}
          >
            {day}
            {day && apptDays.has(day) && !isToday(day) && (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingAppointments()
  const { data: todayAppts } = useTodayAppointments()
  const { data: allAppts = [] } = useAppointments()
  const { data: clients } = useClients()
  const { seedIfEmpty } = useSeedData()
  const navigate = useNavigate()

  useEffect(() => { seedIfEmpty() }, [])

  const todayRevenue = todayAppts?.filter(a => a.status === 'completed').reduce((s, a) => s + Number(a.price), 0) ?? 0
  const todayCount = todayAppts?.length ?? 0
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const newClientsThisMonth = clients?.filter(c => new Date(c.created_at) >= monthStart).length ?? 0
  const completedAppts = allAppts.filter(a => a.status === 'completed')
  const avgCheck = completedAppts.length > 0
    ? Math.round(completedAppts.reduce((s, a) => s + Number(a.price), 0) / completedAppts.length)
    : 0

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 17 ? 'Добрый день' : 'Добрый вечер'

  const day = now.getDate()
  const monthName = RU_MONTHS_GEN[now.getMonth()]
  const weekdayName = RU_WEEKDAYS_LONG_CAP[now.getDay()]
  const dateStr = `${weekdayName}, ${day} ${monthName} ${now.getFullYear()}`

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        {profileLoading ? (
          <Skeleton className="h-9 w-56 mb-1" />
        ) : (
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {greeting}, <span className="text-gradient-gold">{profile?.name?.split(' ')[0] || 'пользователь'}!</span>
          </h1>
        )}
        <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Выручка сегодня" value={todayRevenue} icon={DollarSign} suffix=" ₽" />
        <StatCard label="Записей сегодня" value={todayCount} icon={Calendar} />
        <StatCard label="Новых клиентов" value={newClientsThisMonth} icon={Users} />
        <StatCard label="Средний чек" value={avgCheck} icon={TrendingUp} suffix=" ₽" />
      </div>

      {/* Main content: appointments list + mini calendar */}
      <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-5">
        {/* Upcoming appointments */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Ближайшие записи</h2>
            <Link to="/appointments" className="flex items-center gap-1 text-xs text-primary hover:underline">
              Все <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : upcoming && upcoming.length > 0 ? (
            <div className="space-y-0">
              {upcoming.slice(0, 5).map(a => <AppointmentRow key={a.id} appt={a} />)}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Нет предстоящих записей.<br />
              <button onClick={() => navigate('/appointments')} className="text-primary underline mt-1">Запланировать</button>
            </div>
          )}
        </motion.div>

        {/* Mini calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:w-[260px]">
          <MiniCalendar appointments={allAppts} />
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button className="h-12 gap-2 btn-gold-glow text-sm font-bold" style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
          onClick={() => navigate('/appointments')}>
          <Plus className="w-4 h-4" /> Новая запись
        </Button>
        <Button variant="outline" className="h-12 gap-2 border-border/60 text-sm"
          onClick={() => navigate('/clients')}>
          <Users className="w-4 h-4" /> Добавить клиента
        </Button>
      </div>
    </div>
  )
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const initials = appt.clients?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const dt = new Date(appt.datetime)
  const day = dt.getDate()
  const monthAbbr = RU_MONTHS_GEN[dt.getMonth()].slice(0, 3) + '.'
  const time = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-black"
        style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{appt.clients?.name || 'Клиент'}</p>
        <p className="text-xs text-muted-foreground truncate">{appt.services?.name || 'Услуга'}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium">{time}</p>
        <p className="text-xs text-muted-foreground">{day} {monthAbbr}</p>
      </div>
      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', `status-${appt.status}`)}>
        {STATUS_LABELS[appt.status]}
      </span>
    </div>
  )
}
