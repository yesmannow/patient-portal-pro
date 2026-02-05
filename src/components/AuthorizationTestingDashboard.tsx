import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, PriorAuthorization, Appointment, Provider, ProviderAvailability } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { getAuthRequiringServices } from '@/lib/workflow-engine'
import { 
  CheckCircle, 
  XCircle, 
  Warning, 
  ShieldCheck, 
  User, 
  CalendarCheck,
  Activity,
  Clock,
  FlaskIcon as Flask
} from '@phosphor-icons/react'
import { AppointmentBookingTestDialog } from './AppointmentBookingTestDialog'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface TestResult {
  id: string
  testName: string
  passed: boolean
  message: string
  timestamp: string
}

export function AuthorizationTestingDashboard() {
  const [patients] = useKV<Patient[]>('test-patients', [])
  const [priorAuths] = useKV<PriorAuthorization[]>('test-prior-authorizations', [])
  const [appointments] = useKV<Appointment[]>('test-appointments', [])
  const [testResults, setTestResults] = useKV<TestResult[]>('test-results', [])
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  const authRequiringServices = getAuthRequiringServices()

  const runTest = (testName: string, condition: boolean, message: string) => {
    const result: TestResult = {
      id: `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      testName,
      passed: condition,
      message,
      timestamp: new Date().toISOString()
    }
    
    setTestResults(current => [result, ...current].slice(0, 20))
  }

  const getAuthStatusForPatient = (patient: Patient) => {
    const requiresAuth = authRequiringServices.find(s => s.conditionType === patient.conditionType)?.requiresAuth
    
    if (!requiresAuth) {
      return {
        required: false,
        status: 'not-required',
        message: 'No authorization required'
      }
    }

    const activeAuths = priorAuths.filter(
      auth => auth.patientId === patient.id && auth.status === 'active' && (auth.totalUnits - auth.usedUnits) > 0
    )

    if (activeAuths.length === 0) {
      return {
        required: true,
        status: 'missing',
        message: 'Missing active authorization'
      }
    }

    return {
      required: true,
      status: 'valid',
      message: `${activeAuths.length} active authorization(s)`,
      authorizations: activeAuths
    }
  }

  const conditionTypeStats = useMemo(() => {
    const stats = new Map()
    
    authRequiringServices.forEach(service => {
      const patientsWithType = patients.filter(p => p.conditionType === service.conditionType)
      stats.set(service.conditionType, {
        requiresAuth: service.requiresAuth,
        count: patientsWithType.length,
        withAuth: patientsWithType.filter(p => {
          const status = getAuthStatusForPatient(p)
          return status.status === 'valid' || !status.required
        }).length
      })
    })
    
    return stats
  }, [patients, priorAuths])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flask size={24} weight="bold" className="text-primary" />
            Authorization Requirement Rules
          </CardTitle>
          <CardDescription>
            Test validation of authorization requirements based on patient condition types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {authRequiringServices.map(service => {
              const stats = conditionTypeStats.get(service.conditionType)
              return (
                <div
                  key={service.conditionType}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={service.requiresAuth ? 'default' : 'secondary'}
                      className={service.requiresAuth ? 'bg-destructive text-destructive-foreground' : 'bg-info text-info-foreground'}
                    >
                      {service.requiresAuth ? (
                        <ShieldCheck size={14} weight="bold" className="mr-1" />
                      ) : (
                        <CheckCircle size={14} weight="bold" className="mr-1" />
                      )}
                      {service.requiresAuth ? 'Auth Required' : 'No Auth Required'}
                    </Badge>
                    <div>
                      <div className="font-medium mono text-sm">{service.conditionType}</div>
                      {stats && (
                        <div className="text-xs text-muted-foreground">
                          {stats.count} test patient{stats.count !== 1 ? 's' : ''} • {stats.withAuth} ready
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={24} weight="bold" className="text-primary" />
              Test Patients
            </CardTitle>
            <CardDescription>
              Select a patient to test appointment booking authorization workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No test patients available. Seed data will be loaded automatically.
                  </AlertDescription>
                </Alert>
              ) : (
                patients.map(patient => {
                  const authStatus = getAuthStatusForPatient(patient)
                  const isSelected = selectedPatientId === patient.id
                  
                  return (
                    <motion.div
                      key={patient.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <button
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold truncate">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <Badge variant="outline" className="mono text-xs">
                                {patient.conditionType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {authStatus.status === 'valid' && (
                                <Badge className="bg-success text-success-foreground">
                                  <CheckCircle size={12} weight="bold" className="mr-1" />
                                  Authorized
                                </Badge>
                              )}
                              {authStatus.status === 'missing' && (
                                <Badge className="bg-destructive text-destructive-foreground">
                                  <XCircle size={12} weight="bold" className="mr-1" />
                                  Missing Auth
                                </Badge>
                              )}
                              {authStatus.status === 'not-required' && (
                                <Badge className="bg-info text-info-foreground">
                                  <CheckCircle size={12} weight="bold" className="mr-1" />
                                  No Auth Needed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {authStatus.authorizations && authStatus.authorizations.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            {authStatus.authorizations.map(auth => {
                              const remaining = auth.totalUnits - auth.usedUnits
                              const progress = (auth.usedUnits / auth.totalUnits) * 100
                              
                              return (
                                <div key={auth.id} className="text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="mono text-muted-foreground">Auth #{auth.authNumber}</span>
                                    <span className="font-medium">
                                      {remaining}/{auth.totalUnits} units
                                    </span>
                                  </div>
                                  <Progress 
                                    value={progress} 
                                    className={`h-1.5 ${
                                      remaining <= 3 ? '[&>div]:bg-destructive' : 
                                      remaining <= 10 ? '[&>div]:bg-warning' : 
                                      '[&>div]:bg-success'
                                    }`}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>
            
            {selectedPatientId && (
              <div className="mt-4">
                <Button
                  onClick={() => setBookingDialogOpen(true)}
                  className="w-full"
                  size="lg"
                >
                  <CalendarCheck size={18} weight="bold" className="mr-2" />
                  Test Appointment Booking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={24} weight="bold" className="text-primary" />
              Test Results
            </CardTitle>
            <CardDescription>
              Recent authorization requirement validation tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No test results yet. Start testing by selecting a patient and booking an appointment.
                  </AlertDescription>
                </Alert>
              ) : (
                testResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Alert className={result.passed ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}>
                      <div className="flex items-start gap-3">
                        {result.passed ? (
                          <CheckCircle size={20} weight="bold" className="text-success mt-0.5" />
                        ) : (
                          <XCircle size={20} weight="bold" className="text-destructive mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{result.testName}</div>
                          <AlertDescription className="text-xs">
                            {result.message}
                          </AlertDescription>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {format(new Date(result.timestamp), 'HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  </motion.div>
                ))
              )}
            </div>
            
            {testResults.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setTestResults([])}
                  className="w-full"
                  size="sm"
                >
                  Clear Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AppointmentBookingTestDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        patientId={selectedPatientId}
        onTestComplete={runTest}
      />
    </div>
  )
}
