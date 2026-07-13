import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, LogOut, CreditCard, User, Building2, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useProfile, useUpdateProfile, useSubscription } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function ProfilePage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const sub = useSubscription()

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Initialise local state once profile loads
  const [initialised, setInitialised] = useState(false)
  if (profile && !initialised) {
    setName(profile.name || '')
    setBusinessName(profile.business_name || '')
    setPhone(profile.phone || '')
    setCity(profile.city || '')
    setInitialised(true)
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, business_name: businessName, phone, city })
      toast.success('Профиль сохранён')
    } catch {
      toast.error('Ошибка при сохранении профиля')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile.mutateAsync({ avatar_url: publicUrl })
      toast.success('Аватар обновлён')
    } catch {
      toast.error('Ошибка загрузки фото')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
    toast.success('Вы вышли из аккаунта')
  }

  if (isLoading) return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-extrabold mb-6">Профиль</h1>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/30"
            style={{ background: 'linear-gradient(135deg, #f0b429, #ff8c00)' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-black">
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'linear-gradient(135deg, #f0b429, #ff8c00)' }}>
            <Camera className="w-3.5 h-3.5 text-black" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Fields */}
      <div className="glass-card rounded-xl p-5 space-y-4 mb-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><User className="w-3.5 h-3.5" /> Имя</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="w-3.5 h-3.5" /> Название бизнеса</Label>
          <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Мой бизнес" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" /> Телефон</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 000 000 0000" />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Город</Label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Москва" />
        </div>
        <Button className="w-full btn-gold-glow"
          style={{ background: 'linear-gradient(135deg,#f0b429,#ff8c00)', color: '#000' }}
          onClick={handleSave} disabled={updateProfile.isPending}>
          Сохранить изменения
        </Button>
      </div>

      {/* Subscription mini */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Подписка</span>
          </div>
          <button onClick={() => navigate('/subscription')} className="text-xs text-primary flex items-center gap-0.5 hover:opacity-80 transition-opacity">
            Управлять <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="mt-2">
          {sub.isPro && (
            <Badge style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
              Pro активна
            </Badge>
          )}
          {sub.isTrial && (
            <Badge style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)' }}>
              Пробный период — {sub.trialDaysLeft} дн. осталось
            </Badge>
          )}
          {(sub.isExpired || sub.isFree) && (
            <Badge variant="secondary">Бесплатный план</Badge>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-end text-xs text-muted-foreground mb-4">
        <span>FlowDesk v1.0</span>
      </div>

      <Button variant="outline" className="w-full gap-2 border-border/50" onClick={handleSignOut}>
        <LogOut className="w-4 h-4" /> Выйти
      </Button>
    </div>
  )
}
