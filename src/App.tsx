import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { VideoCamera, User, Info } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WaitingRoom } from '@/components/telehealth/WaitingRoom'
import { Telehealth } from '@/components/telehealth/Telehealth'
import type { TelehealthSession, AppointmentStatus } from '@/types/telehealth'
import type { RuleAlert, ClinicalContext } from '@/types/clinical'
import { evaluateRules } from '@/lib/clinicalRules'
import { getMockPatient } from '@/lib/mockPatientData'
import { ClinicalAlertsSidebar } from '@/components/clinical/ClinicalAlertsSidebar'

type ViewMode = 'demo-select' | 'waiting-room' | 'telehealth-session' | 'telehealth-with-alerts'

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('demo-select')
  const [isProvider, setIsProvider] = useState(false)
  const [isProviderPresent, setIsProviderPresent] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [sessions, setSessions] = useKV<TelehealthSession[]>('telehealth-sessions', [])
  const [clinicalAlerts, setClinicalAlerts] = useKV<RuleAlert[]>('clinical-alerts', [])
  const [showAlertsSidebar, setShowAlertsSidebar] = useState(false)

  const mockSession: TelehealthSession = {
    id: 'session-001',
    patientId: 'patient-001',
    patientName: 'Sarah Martinez',
    providerId: 'provider-001',
    providerName: 'Dr. Emily Chen',
    appointmentId: 'appt-001',
    status: 'active',
    startTime: new Date(),
    participants: []
  }

  const handleStartAsProvider = () => {
    setIsProvider(true)
    setIsProviderPresent(true)
    setViewMode('waiting-room')
  }

  const handleStartAsPatient = () => {
    setIsProvider(false)
    setViewMode('waiting-room')
    
    setTimeout(() => {
      setIsProviderPresent(true)
    }, 3000)
  }

  const handleJoinSession = (stream: MediaStream) => {
    setLocalStream(stream)
    setViewMode('telehealth-session')
    
    const patient = getMockPatient(mockSession.patientId)
    if (patient && isProvider) {
      const context: ClinicalContext = {
        sessionId: mockSession.id,
        encounterId: mockSession.appointmentId,
        providerId: mockSession.providerId,
        providerName: mockSession.providerName,
        timestamp: new Date()
      }
      
      const alerts = evaluateRules(patient, context)
      if (alerts.length > 0) {
        setClinicalAlerts((current) => [...alerts, ...current])
        setShowAlertsSidebar(true)
      }
    }
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setClinicalAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'acknowledged',
              acknowledgedAt: new Date(),
              acknowledgedBy: mockSession.providerName
            }
          : alert
      )
    )
  }

  const handleDismissAlert = (alertId: string) => {
    setClinicalAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'dismissed',
              dismissedAt: new Date(),
              dismissedBy: mockSession.providerName
            }
          : alert
      )
    )
  }

  const handleEndSession = (status: AppointmentStatus) => {
    const updatedSession = {
      ...mockSession,
      status: status === 'completed' ? 'completed' : status === 'no-show' ? 'no-show' : 'cancelled',
      endTime: new Date()
    }
    
    setSessions((current) => [updatedSession, ...current])
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    
    setLocalStream(null)
    setViewMode('demo-select')
    setIsProviderPresent(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {viewMode === 'demo-select' && (
        <>
          <header className="border-b border-border bg-gradient-to-br from-card via-secondary to-card sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                  <VideoCamera size={24} weight="bold" className="text-primary-foreground sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                    WebRTC Telehealth Suite
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                    Full-featured video conferencing with clinical workflows
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 sm:px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Choose Your Role</h2>
                <p className="text-muted-foreground mb-6">
                  Experience the telehealth platform with integrated Clinical Decision Rules (CDR) engine
                </p>
                <div className="max-w-2xl mx-auto bg-accent/10 border border-accent/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Info size={20} className="text-accent" weight="fill" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm mb-1">Clinical Intelligence Demo</h3>
                      <p className="text-xs text-muted-foreground">
                        This demo showcases real-time clinical alerts during telehealth sessions. When joining as a provider, 
                        the system evaluates patient data and triggers ONC-compliant alerts for preventive care gaps, 
                        chronic disease management, and medication safety.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:border-primary transition-colors cursor-pointer" onClick={handleStartAsProvider}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <User size={32} weight="bold" className="text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Provider View</CardTitle>
                    <CardDescription className="text-base">
                      Healthcare provider perspective
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <p>Real-time clinical decision support</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <p>ONC-compliant quality measure alerts</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <p>Clinical note-taking mode</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <p>Invite specialists to session</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                        <p>Full session controls</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4" size="lg">
                      Join as Provider
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:border-accent transition-colors cursor-pointer" onClick={handleStartAsPatient}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                      <User size={32} weight="bold" className="text-accent" />
                    </div>
                    <CardTitle className="text-2xl">Patient View</CardTitle>
                    <CardDescription className="text-base">
                      Patient/participant perspective
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                        <p>Smart waiting room with device check</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                        <p>Join when provider is ready</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                        <p>Video and audio controls</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                        <p>Simple, intuitive interface</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-accent hover:bg-accent/90" size="lg">
                      Join as Patient
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {sessions.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <Card key={session.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{session.patientName} with {session.providerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {session.startTime && new Date(session.startTime).toLocaleString()} • Status: {session.status}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {viewMode === 'waiting-room' && (
        <WaitingRoom
          patientName={mockSession.patientName}
          appointmentTime={new Date(mockSession.startTime || Date.now()).toLocaleTimeString()}
          providerName={mockSession.providerName}
          onJoinSession={handleJoinSession}
          isProviderPresent={isProviderPresent}
        />
      )}

      {viewMode === 'telehealth-session' && localStream && (
        <div className="flex h-screen">
          <div className="flex-1">
            <Telehealth
              session={mockSession}
              localStream={localStream}
              isProvider={isProvider}
              onEndSession={handleEndSession}
            />
          </div>
          {isProvider && (
            <ClinicalAlertsSidebar
              alerts={clinicalAlerts.filter(a => a.sessionId === mockSession.id || a.patientId === mockSession.patientId)}
              onAcknowledge={handleAcknowledgeAlert}
              onDismiss={handleDismissAlert}
              isCollapsed={!showAlertsSidebar}
              onToggleCollapse={() => setShowAlertsSidebar(!showAlertsSidebar)}
            />
          )}
        </div>
      )}

      <Toaster />
    </div>
  )
}
