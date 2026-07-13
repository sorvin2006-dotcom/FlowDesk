import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/types'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data as Service[]
    },
  })
}

export function useAddService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: { name: string; duration_minutes: number; price: number }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('services')
        .insert({ ...values, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Service
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(values)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Service
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}
