export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'free'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Profile {
  id: string
  user_id: string
  name: string
  business_name: string
  phone: string
  city: string
  avatar_url: string
  subscription_status: SubscriptionStatus
  trial_ends_at: string
  subscription_ends_at: string | null
  payment_id: string
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  phone: string
  notes: string
  created_at: string
}

export interface Service {
  id: string
  user_id: string
  name: string
  duration_minutes: number
  price: number
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  client_id: string
  service_id: string | null
  datetime: string
  price: number
  status: AppointmentStatus
  notes: string
  created_at: string
  clients?: Client
  services?: Service
}

export interface Subscription {
  id: string
  user_id: string
  payment_id: string
  amount: number
  status: 'pending' | 'succeeded' | 'failed'
  period_start: string | null
  period_end: string | null
  created_at: string
}

export interface SubscriptionState {
  isPro: boolean
  isTrial: boolean
  isExpired: boolean
  isFree: boolean
  trialDaysLeft: number
  status: SubscriptionStatus
  subscriptionEndsAt: string | null
  trialEndsAt: string | null
}
