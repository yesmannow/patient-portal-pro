import { AuthProvider, useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/LoginPage'
import { PatientDashboard } from '@/components/PatientDashboard'
import { ProviderDashboard } from '@/components/ProviderDashboard'
import { AppHeader } from '@/components/AppHeader'
import { Toaster } from '@/components/ui/sonner'

function AppContent() {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 md:px-6 py-8">
        {currentUser.role === 'patient' ? <PatientDashboard /> : <ProviderDashboard />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default App