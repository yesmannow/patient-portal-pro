import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Appointment, Patient, ConfirmationSMS } from '@/lib/types'
import { WorkflowEngine } from '@/lib/workflow-engine'
import { Robot, CheckCircle, Clock, PhoneOutgoing, Calendar, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function AutomationDashboard() {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [confirmationMessages, setConfirmationMessages] = useKV<ConfirmationSMS[]>('confirmation-sms', [])
  const [isProcessing, setIsProcessing] = useState(false)

  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    const seventyTwoHoursFromNow = new Date(now.getTime() + (72 * 60 * 60 * 1000))
    
    return (appointments || []).filter(apt => {
      const aptDate = new Date(apt.dateTime)
      return aptDate > now && aptDate <= seventyTwoHoursFromNow && apt.status === 'scheduled'
    })
  }, [appointments])

  const pendingConfirmations = useMemo(() => {
    return (confirmationMessages || []).filter(msg => msg.status === 'pending')
  }, [confirmationMessages])

  const confirmedAppointments = useMemo(() => {
    return (confirmationMessages || []).filter(msg => msg.status === 'confirmed')
  }, [confirmationMessages])

  const handleRunAutomation = async () => {
    setIsProcessing(true)
    
    const confirmationsToSend = await WorkflowEngine.trigger72HourConfirmation(
      appointments || [],
      patients || []
    )

    const newMessages: ConfirmationSMS[] = confirmationsToSend.map(conf => ({
      id: `sms-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      appointmentId: conf.appointmentId,
      patientId: (appointments || []).find(a => a.id === conf.appointmentId)?.patientId || '',
      phoneNumber: conf.phoneNumber,
      message: `Hi ${conf.patientName}, your appointment is scheduled for ${new Date(conf.dateTime).toLocaleString()}. Reply 1 to Confirm or 2 to Reschedule.`,
      sentAt: new Date().toISOString(),
      status: 'pending'
    }))

    if (newMessages.length > 0) {
      setConfirmationMessages(current => [...(current || []), ...newMessages])
      
      setAppointments(current => 
        (current || []).map(apt => {
          const hasMessage = newMessages.find(m => m.appointmentId === apt.id)
          return hasMessage ? { ...apt, confirmationSentAt: new Date().toISOString() } : apt
        })
      )

      toast.success(`${newMessages.length} confirmation SMS sent`)
    } else {
      toast.info('No appointments requiring confirmation at this time')
    }

    setIsProcessing(false)
  }

  const handleSimulateResponse = async (smsId: string, response: '1' | '2') => {
    const sms = (confirmationMessages || []).find(m => m.id === smsId)
    if (!sms) return

    const result = await WorkflowEngine.simulatePatientSMSResponse(
      sms.appointmentId,
      response,
      appointments || [],
      (id, updates) => {
        setAppointments(current => 
          (current || []).map(apt => apt.id === id ? { ...apt, ...updates } : apt)
        )
      }
    )

    if (result.success) {
      setConfirmationMessages(current =>
        (current || []).map(msg =>
          msg.id === smsId
            ? {
                ...msg,
                responseReceived: response,
                respondedAt: new Date().toISOString(),
                status: response === '1' ? 'confirmed' : 'rescheduled'
              }
            : msg
        )
      )
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const getPatientName = (patientId: string) => {
    const patient = (patients || []).find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'
  }

  const getAppointmentDetails = (appointmentId: string) => {
    return (appointments || []).find(a => a.id === appointmentId)
  }

  const stats = useMemo(() => ({
    totalUpcoming: upcomingAppointments.length,
    pendingConfirmation: pendingConfirmations.length,
    confirmed: confirmedAppointments.length,
    automationRate: confirmationMessages.length > 0
      ? Math.round((confirmedAppointments.length / confirmationMessages.length) * 100)
      : 0
  }), [upcomingAppointments, pendingConfirmations, confirmedAppointments, confirmationMessages])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Robot className="w-10 h-10 text-primary" weight="duotone" />
              72-Hour Smart Automation
            </h1>
            <p className="text-muted-foreground mt-2">Automated appointment confirmation system</p>
          </div>
          <Button 
            size="lg" 
            onClick={handleRunAutomation}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ArrowsClockwise className="w-5 h-5 mr-2 animate-spin" weight="duotone" />
                Processing...
              </>
            ) : (
              <>
                <PhoneOutgoing className="w-5 h-5 mr-2" weight="duotone" />
                Run Automation
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUpcoming}</div>
              <p className="text-xs text-muted-foreground mt-1">Next 72 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingConfirmation}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">Patient confirmed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
              <Robot className="h-4 w-4 text-purple-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.automationRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Confirmation success</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Automation Log</CardTitle>
            <CardDescription>SMS confirmation messages and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({pendingConfirmations.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({confirmedAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({(confirmationMessages || []).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {pendingConfirmations.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                        <p className="text-muted-foreground">No pending confirmations</p>
                      </div>
                    ) : (
                      pendingConfirmations.map(sms => {
                        const appointment = getAppointmentDetails(sms.appointmentId)
                        return (
                          <Card key={sms.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <PhoneOutgoing className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                    <span className="font-semibold">{getPatientName(sms.patientId)}</span>
                                    <Badge className="bg-amber-600 text-white">Pending</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {sms.phoneNumber}
                                  </p>
                                  <div className="p-3 bg-muted/30 rounded-lg mb-3">
                                    <p className="text-sm">{sms.message}</p>
                                  </div>
                                  {appointment && (
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Appointment: {new Date(appointment.dateTime).toLocaleString()}</span>
                                      <span>•</span>
                                      <span>Sent: {new Date(sms.sentAt).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleSimulateResponse(sms.id, '1')}
                                >
                                  Simulate "1" (Confirm)
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleSimulateResponse(sms.id, '2')}
                                >
                                  Simulate "2" (Reschedule)
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="confirmed" className="mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {confirmedAppointments.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                        <p className="text-muted-foreground">No confirmed appointments yet</p>
                      </div>
                    ) : (
                      confirmedAppointments.map(sms => {
                        const appointment = getAppointmentDetails(sms.appointmentId)
                        return (
                          <Card key={sms.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                                    <span className="font-semibold">{getPatientName(sms.patientId)}</span>
                                    <Badge className="bg-green-600 text-white">Confirmed</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {sms.phoneNumber}
                                  </p>
                                  {appointment && (
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Appointment: {new Date(appointment.dateTime).toLocaleString()}</span>
                                      <span>•</span>
                                      <span>Confirmed: {sms.respondedAt && new Date(sms.respondedAt).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {(confirmationMessages || []).length === 0 ? (
                      <div className="text-center py-12">
                        <Robot className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                        <p className="text-muted-foreground">No automation messages yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Click "Run Automation" to start</p>
                      </div>
                    ) : (
                      (confirmationMessages || []).map(sms => {
                        const appointment = getAppointmentDetails(sms.appointmentId)
                        const statusConfig = {
                          pending: { color: 'bg-amber-600', label: 'Pending' },
                          confirmed: { color: 'bg-green-600', label: 'Confirmed' },
                          rescheduled: { color: 'bg-blue-600', label: 'Rescheduled' },
                          failed: { color: 'bg-red-600', label: 'Failed' }
                        }
                        const config = statusConfig[sms.status]
                        
                        return (
                          <Card key={sms.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <PhoneOutgoing className="w-4 h-4 text-muted-foreground" weight="duotone" />
                                    <span className="font-semibold">{getPatientName(sms.patientId)}</span>
                                    <Badge className={`${config.color} text-white`}>{config.label}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {sms.phoneNumber}
                                  </p>
                                  {appointment && (
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Appointment: {new Date(appointment.dateTime).toLocaleString()}</span>
                                      <span>•</span>
                                      <span>Sent: {new Date(sms.sentAt).toLocaleString()}</span>
                                      {sms.respondedAt && (
                                        <>
                                          <span>•</span>
                                          <span>Response: {sms.responseReceived === '1' ? 'Confirmed' : 'Reschedule Requested'}</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
