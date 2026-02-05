import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Appointment, Patient, PaymentCharge } from '@/lib/types'
import { Calendar, Clock, User, CreditCard, FileText, CheckCircle } from '@phosphor-icons/react'
import { format } from 'date-fns'

export function FrontDeskSchedule() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [charges] = useKV<PaymentCharge[]>('payment-charges', [])

  const todayAppointments = (appointments ?? [])
    .filter(apt => {
      const aptDate = new Date(apt.dateTime)
      const today = new Date()
      return aptDate.toDateString() === today.toDateString()
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const getPatientBalance = (patientId: string) => {
    return (charges ?? [])
      .filter(c => c.patientId === patientId)
      .reduce((sum, c) => sum + c.balanceDue, 0)
  }

  const getPatient = (patientId: string) => {
    return (patients ?? []).find(p => p.id === patientId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-600 text-white'
      case 'pending_confirmation':
        return 'bg-yellow-600 text-white'
      case 'scheduled':
        return 'bg-blue-600 text-white'
      case 'completed':
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Today's Schedule</h1>
        <p className="text-muted-foreground mt-1">Front Desk - Hover over patient names for quick info</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" weight="duotone" />
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <CardDescription>{todayAppointments.length} appointments scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(apt => {
                const patient = getPatient(apt.patientId)
                const balance = getPatientBalance(apt.patientId)
                
                if (!patient) return null

                return (
                  <HoverCard key={apt.id} openDelay={200}>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border">
                        <div className="flex items-center justify-center w-20 text-center">
                          <div>
                            <p className="text-2xl font-bold">{format(new Date(apt.dateTime), 'h:mm')}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(apt.dateTime), 'a')}</p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <Badge className={getStatusColor(apt.status)}>
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                        </div>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" side="right">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" weight="duotone" />
                            <h4 className="font-semibold">
                              {patient.firstName} {patient.lastName}
                            </h4>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                              DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">
                              Phone: {patient.phone}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Balance Due</span>
                            <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${balance.toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              {patient.hipaaFormCompleted ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                                  <span className="text-green-600">HIPAA Complete</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4 text-red-600" />
                                  <span className="text-red-600 font-medium">Missing HIPAA Form</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {patient.intakeFormCompleted ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" weight="fill" />
                                  <span className="text-green-600">Intake Complete</span>
                                </>
                              ) : (
                                <>
                                  <FileText className="w-4 h-4 text-red-600" />
                                  <span className="text-red-600 font-medium">Missing Intake Form</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Visit Reason</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.reason}</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
