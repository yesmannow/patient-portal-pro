import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Appointment, Patient, VitalSigns } from '@/lib/types'
import { Heart, Thermometer, User, CheckCircle, Clock } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function NurseRoomingQueue() {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [vitalSigns, setVitalSigns] = useKV<VitalSigns[]>('vital-signs', [])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [vitalsDialogOpen, setVitalsDialogOpen] = useState(false)
  
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('')
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [temperature, setTemperature] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  const todayConfirmedAppointments = (appointments ?? [])
    .filter(apt => {
      const aptDate = new Date(apt.dateTime)
      const today = new Date()
      return aptDate.toDateString() === today.toDateString() && 
             (apt.status === 'confirmed' || apt.status === 'scheduled')
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const getPatient = (patientId: string) => {
    return (patients ?? []).find(p => p.id === patientId)
  }

  const hasVitals = (appointmentId: string) => {
    return (vitalSigns ?? []).some(v => v.appointmentId === appointmentId)
  }

  const openVitalsDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setVitalsDialogOpen(true)
    
    setBloodPressureSystolic('')
    setBloodPressureDiastolic('')
    setHeartRate('')
    setTemperature('')
    setWeight('')
    setHeight('')
  }

  const saveVitals = () => {
    if (!selectedAppointment) return

    const newVitals: VitalSigns = {
      id: `vitals-${Date.now()}`,
      patientId: selectedAppointment.patientId,
      appointmentId: selectedAppointment.id,
      bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      recordedAt: new Date().toISOString(),
      recordedBy: 'current-nurse',
    }

    setVitalSigns((current) => [...(current ?? []), newVitals])
    toast.success('Vital signs recorded successfully')
    setVitalsDialogOpen(false)
    setSelectedAppointment(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rooming Queue</h1>
        <p className="text-muted-foreground mt-1">Nurse Station - Record patient vitals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" weight="duotone" />
            Patients Ready for Rooming
          </CardTitle>
          <CardDescription>
            {todayConfirmedAppointments.length} patients scheduled today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayConfirmedAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
              <p className="text-muted-foreground">No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayConfirmedAppointments.map(apt => {
                const patient = getPatient(apt.patientId)
                const vitalsRecorded = hasVitals(apt.id)
                
                if (!patient) return null

                return (
                  <Card key={apt.id} className="border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" weight="duotone" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                  {patient.firstName} {patient.lastName}
                                </h3>
                                {vitalsRecorded && (
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                                    Vitals Recorded
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(apt.dateTime), 'h:mm a')} • {apt.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Dialog open={vitalsDialogOpen && selectedAppointment?.id === apt.id} onOpenChange={setVitalsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => openVitalsDialog(apt)}
                              variant={vitalsRecorded ? 'outline' : 'default'}
                            >
                              <Thermometer className="w-4 h-4 mr-2" />
                              {vitalsRecorded ? 'Update Vitals' : 'Record Vitals'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Record Vital Signs</DialogTitle>
                              <DialogDescription>
                                {patient.firstName} {patient.lastName} • {format(new Date(apt.dateTime), 'h:mm a')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="bp-systolic">BP Systolic</Label>
                                  <Input
                                    id="bp-systolic"
                                    type="number"
                                    placeholder="120"
                                    value={bloodPressureSystolic}
                                    onChange={(e) => setBloodPressureSystolic(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="bp-diastolic">BP Diastolic</Label>
                                  <Input
                                    id="bp-diastolic"
                                    type="number"
                                    placeholder="80"
                                    value={bloodPressureDiastolic}
                                    onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                                <Input
                                  id="heart-rate"
                                  type="number"
                                  placeholder="72"
                                  value={heartRate}
                                  onChange={(e) => setHeartRate(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="temperature">Temperature (°F)</Label>
                                <Input
                                  id="temperature"
                                  type="number"
                                  step="0.1"
                                  placeholder="98.6"
                                  value={temperature}
                                  onChange={(e) => setTemperature(e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="weight">Weight (lbs)</Label>
                                  <Input
                                    id="weight"
                                    type="number"
                                    placeholder="150"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="height">Height (in)</Label>
                                  <Input
                                    id="height"
                                    type="number"
                                    placeholder="68"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline" onClick={() => setVitalsDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={saveVitals}>
                                  Save Vitals
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
