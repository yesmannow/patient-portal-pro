import { BillingDashboard } from '@/components/BillingDashboard'
import { Toaster } from '@/components/ui/sonner'
import { Receipt } from '@phosphor-icons/react'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Receipt size={24} weight="bold" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                Billing Portal
              </h1>
              <p className="text-sm text-muted-foreground">Payment & Authorization Management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <BillingDashboard />
      </main>

      <Toaster />
    </div>
  )
}
