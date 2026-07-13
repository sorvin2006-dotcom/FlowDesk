import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile, SubscriptionState } from '@/types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
  })
}

export function useSubscription(): SubscriptionState {
  const { data: profile } = useProfile()
  const now = new Date()

  if (!profile) {
    return { isPro: false, isTrial: false, isExpired: false, isFree: false, trialDaysLeft: 0, status: 'trial', subscriptionEndsAt: null, trialEndsAt: null }
  }

  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const subscriptionEndsAt = profile.subscription_ends_at ? new Date(profile.subscription_ends_at) : null

  const isPro = profile.subscription_status === 'active' && !!subscriptionEndsAt && subscriptionEndsAt > now
  const isTrial = profile.subscription_status === 'trial' && !!trialEndsAt && trialEndsAt > now
  const isExpired = !isPro && !isTrial && (profile.subscription_status === 'expired' || (profile.subscription_status === 'trial' && !!trialEndsAt && trialEndsAt <= now))
  const isFree = profile.subscription_status === 'free'

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return {
    isPro,
    isTrial,
    isExpired,
    isFree,
    trialDaysLeft,
    status: profile.subscription_status,
    subscriptionEndsAt: profile.subscription_ends_at,
    trialEndsAt: profile.trial_ends_at,
  }
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .update(values)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
