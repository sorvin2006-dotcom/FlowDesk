import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Briefcase, BarChart3, User, CreditCard, LogOut, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useProfile, useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { AboutButton } from '@/components/AboutModal'
import { toast } from 'sonner'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/clients', icon: Users, label: 'Клиенты' },
  { to: '/appointments', icon: Calendar, label: 'Запись на приём' },
  { to: '/services', icon: Briefcase, label: 'Услуги' },
  { to: '/analytics', icon: BarChart3, label: 'Аналитика' },
  { to: '/profile', icon: User, label: 'Профиль' },
  { to: '/subscription', icon: CreditCard, label: 'Подписка' },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { data: profile } = useProfile()
  const sub = useSubscription()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
    toast.success('Вы вышли из аккаунта')
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border/50 fixed left-0 top-0 z-40"
      style={{ background: 'var(--sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f0b429, #ff8c00)', boxShadow: '0 0 14px rgba(240,180,41,0.4)' }}>
          <Zap className="w-4 h-4 text-black" />
        </div>
        <span className="text-lg font-bold text-gradient-gold">FlowDesk</span>
      </div>

      {/* Profile mini */}
      {profile && (
        <div className="px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-primary/30" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                style={{ background: 'linear-gradient(135deg, #f0b429, #ff8c00)' }}>
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{profile.name || 'Пользователь'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.business_name || 'Мой бизнес'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active && 'drop-shadow-[0_0_5px_rgba(240,180,41,0.6)]')} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* Subscription badge */}
      <div className="px-3 pb-2">
        {sub.isTrial && (
          <div className="rounded-lg px-3 py-2 mb-2 text-xs text-center"
            style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
            <span className="text-muted-foreground">Осталось <span className="text-primary font-semibold">{sub.trialDaysLeft} {sub.trialDaysLeft === 1 ? 'день' : sub.trialDaysLeft < 5 ? 'дня' : 'дней'}</span> до окончания испытания.</span>
          </div>
        )}
        {sub.isPro && (
          <div className="rounded-lg px-3 py-2 mb-2 text-xs text-center"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="text-green-400 font-semibold">Pro активна</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <div className="flex justify-center pb-1">
          <AboutButton />
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Выйти
        </Button>
      </div>
    </aside>
  )
}
