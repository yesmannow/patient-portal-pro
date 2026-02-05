import { useState } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/LoginPage'
import { PatientDashboard } from '@/components/PatientDashboard'
import { PatientProfile } from '@/components/PatientProfile'
import { PatientForms } from '@/components/PatientForms'
import { ProviderDashboard } from '@/components/ProviderDashboard'
import { TaskBoard } from '@/components/TaskBoard'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { FormBuilder } from '@/components/FormBuilder'
import { ResponseTemplateManager } from '@/components/ResponseTemplateManager'
import { ProviderAvailabilityManager } from '@/components/ProviderAvailabilityManager'
import { AppHeader } from '@/components/AppHeader'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { Patient, Provider } from '@/lib/types'

type PatientView = 'dashboard' | 'profile' | 'forms'
type ProviderView = 'dashboard' | 'tasks' | 'analytics' | 'forms' | 'templates' | 'availability'

function AppContent() {
  const { currentUser } = useAuth()
  const [patientView, setPatientView] = useState<PatientView>('dashboard')
  const [providerView, setProviderView] = useState<ProviderView>('dashboard')
  const [patients] = useKV<Patient[]>('patients', [])
  const [providers] = useKV<Provider[]>('providers', [])

  if (!currentUser) {
    return <LoginPage />
  }

  const currentPatient = patients?.find((p) => p.email === currentUser?.email)
  const currentProvider = providers?.find((p) => p.email === currentUser?.email)

  const renderPatientContent = () => {
    switch (patientView) {
      case 'profile':
        return <PatientProfile />
      case 'forms':
        return currentPatient ? <PatientForms patientId={currentPatient.id} /> : <div>Loading...</div>
      case 'dashboard':
      default:
        return <PatientDashboard />
    }
  }

  const renderProviderContent = () => {
    return (
      <Tabs value={providerView} onValueChange={(v) => setProviderView(v as ProviderView)} className="space-y-6">
        <TabsList className="grid w-full max-w-4xl grid-cols-6">
          <TabsTrigger value="dashboard">Cases</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-0">
          <ProviderDashboard />
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-0">
          <TaskBoard />
        </TabsContent>

        <TabsContent value="availability" className="space-y-0">
          {currentProvider ? (
            <ProviderAvailabilityManager providerId={currentProvider.id} />
          ) : (
            <div>Loading provider data...</div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-0">
          <AnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-0">
          <FormBuilder />
        </TabsContent>

        <TabsContent value="templates" className="space-y-0">
          <ResponseTemplateManager />
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        currentView={currentUser.role === 'patient' ? patientView : undefined}
        onNavigate={currentUser.role === 'patient' ? setPatientView : undefined}
      />
      <main className="container mx-auto px-4 md:px-6 py-8">
        {currentUser.role === 'patient' ? renderPatientContent() : renderProviderContent()}
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