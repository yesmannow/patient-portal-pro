import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/LoginPage'
import { PatientDashboard } from '@/components/PatientDashboard'
import { PatientProfile } from '@/components/PatientProfile'
import { ProviderDashboard } from '@/components/ProviderDashboard'
import { AppHeader } from '@/components/AppHeader'
import { Toaster } from '@/components/ui/sonner'

type PatientView = 'dashboard' | 'profile'

function AppContent() {
  const { currentUser } = useAuth()
  const [patientView, setPatientView] = useState<PatientView>('dashboard')

  if (!currentUser) {
    return <LoginPage />
  }

  const renderPatientContent = () => {
    switch (patientView) {
      case 'profile':
        return <PatientProfile />
      case 'dashboard':
      default:
        return <PatientDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        currentView={currentUser.role === 'patient' ? patientView : undefined}
        onNavigate={currentUser.role === 'patient' ? setPatientView : undefined}
      />
      <main className="container mx-auto px-4 md:px-6 py-8">
        {currentUser.role === 'patient' ? renderPatientContent() : <ProviderDashboard />}
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