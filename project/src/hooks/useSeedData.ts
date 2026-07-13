import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const DEFAULT_SERVICES: { name: string; duration_minutes: number; price: number }[] = []

const DEFAULT_CLIENTS = [
  { name: 'Александр Петров', phone: '+79161234501', notes: 'Постоянный клиент' },
  { name: 'Михаил Иванов', phone: '+79161234502', notes: '' },
  { name: 'Дмитрий Сидоров', phone: '+79161234503', notes: 'Предпочитает короткие варианты' },
  { name: 'Сергей Козлов', phone: '+79161234504', notes: '' },
  { name: 'Андрей Новиков', phone: '+79161234505', notes: 'Аллергия на некоторые продукты' },
  { name: 'Николай Морозов', phone: '+79161234506', notes: '' },
  { name: 'Владимир Волков', phone: '+79161234507', notes: 'VIP клиент' },
  { name: 'Павел Соколов', phone: '+79161234508', notes: '' },
  { name: 'Алексей Попов', phone: '+79161234509', notes: '' },
  { name: 'Роман Лебедев', phone: '+79161234510', notes: 'Нужен специалист' },
]

export function useSeedData() {
  const qc = useQueryClient()

  const seedIfEmpty = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existingServices } = await supabase.from('services').select('id').eq('user_id', user.id).limit(1)
    if (existingServices && existingServices.length > 0) return

    // Seed services (empty by default, user adds their own)
    const { data: services } = await supabase
      .from('services')
      .insert(DEFAULT_SERVICES.map(s => ({ ...s, user_id: user.id })))
      .select()

    // Seed clients
    const { data: clients } = await supabase
      .from('clients')
      .insert(DEFAULT_CLIENTS.map(c => ({ ...c, user_id: user.id })))
      .select()

    // Seed appointments (last 30 days)
    if (services && clients && services.length > 0) {
      const statuses = ['scheduled', 'completed', 'completed', 'completed', 'cancelled', 'no_show'] as const
      const appts = []
      for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 30)
        const hour = 9 + Math.floor(Math.random() * 9)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        date.setHours(hour, 0, 0, 0)
        const service = services[Math.floor(Math.random() * services.length)]
        const client = clients[Math.floor(Math.random() * clients.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        appts.push({
          user_id: user.id,
          client_id: client.id,
          service_id: service.id,
          datetime: date.toISOString(),
          price: service.price,
          status,
          notes: '',
        })
      }
      await supabase.from('appointments').insert(appts)
    }

    qc.invalidateQueries({ queryKey: ['services'] })
    qc.invalidateQueries({ queryKey: ['clients'] })
    qc.invalidateQueries({ queryKey: ['appointments'] })
  }

  return { seedIfEmpty }
}
