import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Appointment, Patient } from '@/lib/types'
import { WorkflowEngine } from '@/lib/workflow-engine'
import { Clock, Phone, CheckCircle, Calendar } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function AppointmentConfirmationManager() {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)

  useEffect(() => {
    const checkConfirmations = async () => {
      await WorkflowEngine.check72HourConfirmations(
        appointments ?? [],
        (id, updates) => {
          setAppointments((current) =>
            (current ?? []).map(apt =>
              apt.id === id ? { ...apt, ...updates } : apt
            )
          )
        }
      )
    }
    
    checkConfirmations()
    const interval = setInterval(checkConfirmations, 60000)
    return () => clearInterval(interval)
  }, [appointments, setAppointments])

  const pendingConfirmations = (appointments ?? [])
    .filter(apt => apt.status === 'pending_confirmation')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const getPatient = (patientId: string) => {
    return (patients ?? []).find(p => p.id === patientId)
  }

  const getHoursUntilAppointment = (dateTime: string) => {
    const now = new Date()
    const aptTime = new Date(dateTime)
    return Math.floor((aptTime.getTime() - now.getTime()) / (1000 * 60 * 60))
  }

  const simulatePatientResponse = async (appointmentId: string, response: '1' | '2') => {
    setSelectedAppointment(appointmentId)
    
    setTimeout(async () => {
      const result = await WorkflowEngine.simulatePatientSMSResponse(
        appointmentId,
        response,
        appointments ?? [],
        (id, updates) => {
          setAppointments((current) =>
            (current ?? []).map(apt =>
              apt.id === id ? { ...apt, ...updates } : apt
            )
          )
        }
      )

      if (result.success) {
        if (response === '1') {
          toast.success('Patient confirmed appointment!', {
            description: 'Status updated to confirmed',
          })
        } else {
          toast.info('Patient requested reschedule', {
            description: 'Staff will follow up',
          })
        }
      } else {
        toast.error('Error processing response')
      }

      setSelectedAppointment(null)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" weight="duotone" />
            72-Hour Appointment Confirmations
          </CardTitle>
          <CardDescription>
            Automated SMS confirmation system - Patients within 72 hours of their appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingConfirmations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
              <p className="text-muted-foreground">No appointments pending confirmation</p>
              <p className="text-xs text-muted-foreground mt-1">
                System automatically sends SMS 72 hours before appointments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5" weight="duotone" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Simulated SMS Sent</p>
                    <p className="text-sm text-blue-700">
                      "Your appointment is in 72 hours. Reply 1 to Confirm or 2 to Reschedule"
                    </p>
                  </div>
                </div>
              </div>

              {pendingConfirmations.map(apt => {
                const patient = getPatient(apt.patientId)
                const hoursUntil = getHoursUntilAppointment(apt.dateTime)
                
                if (!patient) return null

                return (
                  <Card key={apt.id} className="border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              Awaiting Response
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {apt.reason}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Appointment Time</p>
                              <p className="font-medium">
                                {format(new Date(apt.dateTime), 'MMM d, yyyy • h:mm a')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Time Until</p>
                              <p className="font-medium text-accent">{hoursUntil} hours</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Phone</p>
                              <p className="font-medium">{patient.phone}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">SMS Sent</p>
                              <p className="font-medium">
                                {apt.confirmationSentAt
                                  ? format(new Date(apt.confirmationSentAt), 'h:mm a')
                                  : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => simulatePatientResponse(apt.id, '1')}
                            disabled={selectedAppointment === apt.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" weight="fill" />
                            Simulate "1" (Confirm)
                          </Button>
                          <Button
                            onClick={() => simulatePatientResponse(apt.id, '2')}
                            disabled={selectedAppointment === apt.id}
                            variant="outline"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Simulate "2" (Reschedule)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• System automatically checks for appointments within 72 hours</p>
          <p>• SMS sent to patient: "Reply 1 to Confirm or 2 to Reschedule"</p>
          <p>• Response "1": Appointment status → <span className="text-green-600 font-medium">Confirmed</span> (green in schedule)</p>
          <p>• Response "2": Staff notified to contact patient for rescheduling</p>
          <p>• Reduces no-shows and optimizes clinic schedule efficiency</p>
        </CardContent>
      </Card>
    </div>
  )
}
