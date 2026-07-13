import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/AppSidebar'
import { BottomNav } from '@/components/BottomNav'
import { TrialBanner } from '@/components/TrialBanner'
import { PaywallScreen } from '@/components/PaywallScreen'
import { AiAssistant } from '@/components/AiAssistant'
import { useSubscription } from '@/hooks/useSubscription'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function Layout({ children }: { children?: React.ReactNode }) {
  const sub = useSubscription()
  const qc = useQueryClient()

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        qc.invalidateQueries({ queryKey: ['profile'] })
      } catch (_) { /* ignore */ }
    }
    check()
  }, [qc])

  return (
    <div className="min-h-screen flex gradient-mesh">
      <AppSidebar />
      <div className="flex-1 flex flex-col md:ml-60 min-h-screen">
        <TrialBanner />
        <main className="flex-1 pb-20 md:pb-0">
          {children ?? <Outlet />}
        </main>
        <footer className="hidden md:block px-6 py-3 border-t border-border/30 text-xs text-muted-foreground text-center">
          © 2026 FlowDesk
        </footer>
      </div>
      <BottomNav />
      {sub.isExpired && <PaywallScreen />}
      <AiAssistant />
    </div>
  )
}
