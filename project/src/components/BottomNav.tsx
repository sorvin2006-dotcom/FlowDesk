import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Briefcase, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/clients', icon: Users, label: 'Клиенты' },
  { to: '/appointments', icon: Calendar, label: 'Записи' },
  { to: '/services', icon: Briefcase, label: 'Услуги' },
  { to: '/analytics', icon: BarChart3, label: 'Аналитика' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/50"
      style={{ background: 'rgba(13, 15, 20, 0.92)', backdropFilter: 'blur(16px)' }}>
      <div className="flex items-center justify-around px-2 pb-safe">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 px-3 min-h-[48px] transition-all duration-200',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(240,180,41,0.7)]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
