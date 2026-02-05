import { useKV } from '@github/spark/hooks'
import { Patient, PriorAuthorization, Appointment, Provider, ProviderAvailability } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { TestTube } from '@phosphor-icons/react'
import { AuthorizationTestingDashboard } from '@/components/AuthorizationTestingDashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10" style={{
        background: 'linear-gradient(135deg, oklch(0.99 0 0) 0%, oklch(0.97 0.01 250) 100%)'
      }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <TestTube size={28} weight="bold" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.03em' }}>
                Authorization Testing System
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Validate appointment booking authorization requirements by condition type
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <AuthorizationTestingDashboard />
      </main>

      <Toaster />
    </div>
  )
}
