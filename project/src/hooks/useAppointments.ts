import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types'

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(*), services(*)')
        .order('datetime', { ascending: true })
      if (error) throw error
      return data as Appointment[]
    },
  })
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(*), services(*)')
        .gte('datetime', new Date().toISOString())
        .order('datetime', { ascending: true })
        .limit(5)
      if (error) throw error
      return data as Appointment[]
    },
  })
}

export function useTodayAppointments() {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(*), services(*)')
        .gte('datetime', today.toISOString())
        .lt('datetime', tomorrow.toISOString())
        .order('datetime', { ascending: true })
      if (error) throw error
      return data as Appointment[]
    },
  })
}

export function useAddAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'clients' | 'services'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...values, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(values)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Appointment
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
