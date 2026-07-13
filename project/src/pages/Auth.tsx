import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const ALLOWED_DOMAINS = new Set([
  'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru', 'internet.ru',
  'yandex.ru', 'ya.ru',
  'rambler.ru', 'lenta.ru', 'ro.ru', 'autorambler.ru',
])

function validateEmailDomain(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return 'Введите корректный email'
  if (!ALLOWED_DOMAINS.has(domain)) {
    return `Почта @${domain} не поддерживается. Используйте mail.ru, yandex.ru, rambler.ru.`
  }
  return null
}

export function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState({ email: '', password: '', name: '', business_name: '' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Заполните все поля'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) {
        toast.error(error.message.includes('Invalid login credentials') ? 'Неверный email или пароль' : error.message)
        return
      }
      qc.invalidateQueries()
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name) { toast.error('Заполните все обязательные поля'); return }
    if (form.password.length < 8) { toast.error('Пароль должен содержать не менее 8 символов'); return }

    const domainError = validateEmailDomain(form.email)
    if (domainError) { toast.error(domainError); return }

    setLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password, name: form.name, business_name: form.business_name }),
        }
      )
      const result = await res.json()
      if (result.error) { toast.error(result.error); return }
      if (result.session) {
        await supabase.auth.setSession(result.session)
        qc.invalidateQueries()
        toast.success('Добро пожаловать в FlowDesk! Ваш 7-дневный пробный период начался.')
        navigate('/')
      }
    } catch {
      toast.error('Ошибка регистрации. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.12, 0.07] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #f0b429, transparent)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, #ff8c00, transparent)', filter: 'blur(60px)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', boxShadow: '0 0 20px rgba(240,180,41,0.4)' }}>
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-2xl font-extrabold text-gradient-gold">FlowDesk</span>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex rounded-lg p-1 mb-6" style={{ background: 'oklch(0.13 0.012 265)' }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200"
                style={tab === t ? { background: 'oklch(0.22 0.012 265)', color: 'var(--foreground)' } : { color: 'var(--muted-foreground)' }}
              >
                {t === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN */}
            {tab === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@yandex.ru" className="pl-9" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pl-9 pr-9" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 font-bold btn-gold-glow" style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }} disabled={loading}>
                  {loading ? 'Вход…' : 'Войти'}
                </Button>
              </motion.form>
            )}

            {/* REGISTER */}
            {tab === 'register' && (
              <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Ваше имя <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" placeholder="Алексей" className="pl-9" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="business">Название бизнеса</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="business" placeholder="Моя компания" className="pl-9" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-email" type="email" placeholder="you@yandex.ru" className="pl-9" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
                  </div>
                  <p className="text-xs text-muted-foreground">mail.ru, yandex.ru, rambler.ru</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Пароль <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Мин. 8 символов" className="pl-9 pr-9" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Регистрируясь, вы соглашаетесь с{' '}
                  <a href="/terms" target="_blank" className="text-primary underline">Пользовательским соглашением</a>.
                  7 дней бесплатного пробного периода.
                </p>
                <Button type="submit" className="w-full h-11 font-bold btn-gold-glow" style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }} disabled={loading}>
                  {loading ? 'Регистрация…' : 'Создать аккаунт'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Профессиональное управление записями и клиентами
        </p>
      </motion.div>
    </div>
  )
}
