import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Phone, X, User, Calendar, Flask, CreditCard, FileText } from '@phosphor-icons/react'
import { VoIPCall, Patient, Appointment, LabResult, PaymentCharge } from '@/lib/types'
import { format } from 'date-fns'

export function VoIPHandler() {
  const [activeCall, setActiveCall] = useState<VoIPCall | null>(null)
  const [patients] = useKV<Patient[]>('patients', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [labResults] = useKV<LabResult[]>('lab-results', [])
  const [charges] = useKV<PaymentCharge[]>('payment-charges', [])
  const [screenPopOpen, setScreenPopOpen] = useState(false)

  const matchedPatient = activeCall?.patientId 
    ? (patients ?? []).find(p => p.id === activeCall.patientId)
    : (patients ?? []).find(p => p.phone === activeCall?.phoneNumber)

  const upcomingAppointments = matchedPatient
    ? (appointments ?? [])
        .filter(a => a.patientId === matchedPatient.id && new Date(a.dateTime) > new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 3)
    : []

  const outstandingLabs = matchedPatient
    ? (labResults ?? []).filter(l => l.patientId === matchedPatient.id && l.status === 'pending')
    : []

  const outstandingBalance = matchedPatient
    ? (charges ?? [])
        .filter(c => c.patientId === matchedPatient.id)
        .reduce((sum, c) => sum + c.balanceDue, 0)
    : 0

  const simulateIncomingCall = (phoneNumber: string) => {
    const newCall: VoIPCall = {
      id: `call-${Date.now()}`,
      phoneNumber,
      patientId: (patients ?? []).find(p => p.phone === phoneNumber)?.id,
      callStartedAt: new Date().toISOString(),
      direction: 'inbound',
      status: 'active',
    }
    setActiveCall(newCall)
    setScreenPopOpen(true)
  }

  const endCall = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        callEndedAt: new Date().toISOString(),
        status: 'completed',
      })
      setScreenPopOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" weight="duotone" />
            VoIP Screen Pop Simulator
          </CardTitle>
          <CardDescription>
            Simulate incoming calls to see instant patient profile popups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Click a button below to simulate an incoming call and see the patient's clinical profile instantly:
          </p>
          <div className="flex flex-wrap gap-2">
            {(patients ?? []).slice(0, 5).map(patient => (
              <Button
                key={patient.id}
                onClick={() => simulateIncomingCall(patient.phone)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" weight="fill" />
                {patient.firstName} {patient.lastName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={screenPopOpen} onOpenChange={setScreenPopOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600 animate-pulse" weight="fill" />
                Incoming Call
              </DialogTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Active
              </Badge>
            </div>
            <DialogDescription>
              {activeCall?.phoneNumber || 'Unknown Number'}
            </DialogDescription>
          </DialogHeader>

          {matchedPatient ? (
            <div className="space-y-4 mt-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" weight="duotone" />
                    {matchedPatient.firstName} {matchedPatient.lastName}
                  </CardTitle>
                  <CardDescription>
                    DOB: {new Date(matchedPatient.dateOfBirth).toLocaleDateString()} • 
                    {matchedPatient.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{matchedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="secondary">{matchedPatient.patientStatus}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Condition</p>
                      <p className="font-medium">{matchedPatient.conditionType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred Contact</p>
                      <p className="font-medium">{matchedPatient.preferredContactMethod}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t">
                    {!matchedPatient.hipaaFormCompleted && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Missing HIPAA
                      </Badge>
                    )}
                    {!matchedPatient.intakeFormCompleted && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Missing Intake
                      </Badge>
                    )}
                    {outstandingBalance > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Balance: ${outstandingBalance.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" weight="duotone" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-2">
                      {upcomingAppointments.map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{apt.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(apt.dateTime), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <Badge 
                            variant={apt.status === 'confirmed' ? 'default' : 'secondary'}
                            className={apt.status === 'confirmed' ? 'bg-green-600' : ''}
                          >
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flask className="w-4 h-4" weight="duotone" />
                    Outstanding Labs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {outstandingLabs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No outstanding lab results</p>
                  ) : (
                    <div className="space-y-2">
                      {outstandingLabs.map(lab => (
                        <div key={lab.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{lab.testName}</p>
                            <p className="text-xs text-muted-foreground">
                              Ordered: {format(new Date(lab.orderedDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            {lab.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="destructive" onClick={endCall} className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  End Call
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" weight="duotone" />
              <p className="text-muted-foreground">Patient not found in system</p>
              <p className="text-sm text-muted-foreground mt-1">{activeCall?.phoneNumber}</p>
              <Button variant="destructive" onClick={endCall} className="mt-6">
                End Call
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
