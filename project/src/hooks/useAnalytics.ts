import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*, clients(*), services(*)')
        .order('datetime', { ascending: true })
      if (error) throw error

      const now = new Date()
      const sixMonthsAgo = new Date(now)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      // Revenue last 6 months
      const RU_MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
      const monthlyRevenue: Record<string, number> = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(d.getMonth() - i)
        const key = `${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`
        monthlyRevenue[key] = 0
      }

      let totalRevenue = 0
      let completedCount = 0
      const clientVisits: Record<string, { name: string; count: number; spent: number }> = {}
      const serviceCount: Record<string, { name: string; count: number }> = {}
      const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
      const clientReturnVisits: Record<string, number> = {}

      for (const appt of appointments ?? []) {
        if (appt.status === 'completed') {
          completedCount++
          const apptDate = new Date(appt.datetime)
          const key = `${RU_MONTHS[apptDate.getMonth()]} ${apptDate.getFullYear()}`
          if (key in monthlyRevenue) {
            monthlyRevenue[key] += Number(appt.price) || 0
          }
          totalRevenue += Number(appt.price) || 0
          dayCount[apptDate.getDay()]++

          if (appt.client_id) {
            const cName = appt.clients?.name || 'Unknown'
            if (!clientVisits[appt.client_id]) {
              clientVisits[appt.client_id] = { name: cName, count: 0, spent: 0 }
            }
            clientVisits[appt.client_id].count++
            clientVisits[appt.client_id].spent += Number(appt.price) || 0
            clientReturnVisits[appt.client_id] = (clientReturnVisits[appt.client_id] || 0) + 1
          }

          if (appt.service_id && appt.services) {
            const sName = appt.services.name
            if (!serviceCount[appt.service_id]) {
              serviceCount[appt.service_id] = { name: sName, count: 0 }
            }
            serviceCount[appt.service_id].count++
          }
        }
      }

      const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))

      const topServices = Object.values(serviceCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const topClients = Object.values(clientVisits)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5)

      const avgCheck = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0

      const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
      const favDay = days[Object.entries(dayCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] as unknown as number] || 'N/A'

      const repeatClients = Object.values(clientReturnVisits).filter(v => v > 1).length
      const repeatRate = Object.keys(clientReturnVisits).length > 0
        ? Math.round((repeatClients / Object.keys(clientReturnVisits).length) * 100)
        : 0

      return { revenueData, topServices, topClients, avgCheck, favDay, repeatRate, totalRevenue, completedCount }
    },
  })
}
