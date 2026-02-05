import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Appointment, Provider, Patient, PriorAuthorization } from '@/lib/types'
import { CalendarBlank, Clock, ShieldCheck, Warning, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { getAuthRequiringServices } from '@/lib/workflow-engine'

interface AppointmentBookingTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  onTestComplete: (testName: string, passed: boolean, message: string) => void
}

const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

export function AppointmentBookingTestDialog({ 
  open, 
  onOpenChange, 
  patientId,
  onTestComplete
}: AppointmentBookingTestDialogProps) {
  const [patients] = useKV<Patient[]>('test-patients', [])
  const [providers] = useKV<Provider[]>('test-providers', [])
  const [priorAuths] = useKV<PriorAuthorization[]>('test-prior-authorizations', [])
  const [appointments, setAppointments] = useKV<Appointment[]>('test-appointments', [])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedProviderId, setSelectedProviderId] = useState<string>('')
  const [selectedAuthId, setSelectedAuthId] = useState<string>('')

  const patient = useMemo(() => {
    return patients.find(p => p.id === patientId)
  }, [patients, patientId])

  const requiresAuthorization = useMemo(() => {
    if (!patient) return false
    const authServices = getAuthRequiringServices()
    const service = authServices.find(s => s.conditionType === patient.conditionType)
    return service?.requiresAuth || false
  }, [patient])

  const availableAuths = useMemo(() => {
    if (!requiresAuthorization || !patient) return []
    return priorAuths.filter(auth => 
      auth.patientId === patient.id && 
      auth.status === 'active' &&
      (auth.totalUnits - auth.usedUnits) > 0
    ).sort((a, b) => {
      const remainingA = a.totalUnits - a.usedUnits
      const remainingB = b.totalUnits - b.usedUnits
      return remainingB - remainingA
    })
  }, [priorAuths, patient, requiresAuthorization])

  const canBook = useMemo(() => {
    if (!selectedDate || !selectedTime || !selectedProviderId) return false
    if (!patient) return false
    
    if (requiresAuthorization) {
      return selectedAuthId !== '' && availableAuths.some(a => a.id === selectedAuthId)
    }
    
    return true
  }, [selectedDate, selectedTime, selectedProviderId, requiresAuthorization, selectedAuthId, availableAuths, patient])

  const handleBookAppointment = () => {
    if (!patient || !selectedDate || !selectedTime || !selectedProviderId) {
      toast.error('Please fill in all required fields')
      return
    }

    if (requiresAuthorization && !selectedAuthId) {
      const testName = 'Missing Authorization Block Test'
      const message = `Correctly blocked booking for ${patient.conditionType} patient without selected authorization`
      onTestComplete(testName, true, message)
      toast.error('Authorization required for this patient type')
      return
    }

    if (requiresAuthorization && selectedAuthId) {
      const selectedAuth = availableAuths.find(a => a.id === selectedAuthId)
      if (!selectedAuth) {
        const testName = 'Invalid Authorization Block Test'
        const message = `Correctly blocked booking with invalid authorization selection`
        onTestComplete(testName, true, message)
        toast.error('Selected authorization is not valid')
        return
      }

      if (selectedAuth.status !== 'active') {
        const testName = 'Inactive Authorization Block Test'
        const message = `Correctly blocked booking with ${selectedAuth.status} authorization`
        onTestComplete(testName, true, message)
        toast.error(`Authorization is ${selectedAuth.status}`)
        return
      }

      const remaining = selectedAuth.totalUnits - selectedAuth.usedUnits
      if (remaining <= 0) {
        const testName = 'Depleted Units Block Test'
        const message = `Correctly blocked booking with authorization that has no remaining units`
        onTestComplete(testName, true, message)
        toast.error('Selected authorization has no remaining units')
        return
      }
    }

    const dateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    dateTime.setHours(parseInt(hours), parseInt(minutes))

    const newAppointment: Appointment = {
      id: `apt-test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      patientId: patient.id,
      providerId: selectedProviderId,
      dateTime: dateTime.toISOString(),
      location: 'Test Facility',
      reason: 'Authorization Testing',
      status: 'scheduled',
      linkedPriorAuthId: selectedAuthId || undefined,
      requiresAuthorization
    }

    setAppointments(current => [...current, newAppointment])

    const testName = requiresAuthorization 
      ? 'Successful Authorization-Required Booking'
      : 'Successful Non-Authorization Booking'
    const message = requiresAuthorization
      ? `Successfully booked appointment for ${patient.conditionType} patient with authorization #${availableAuths.find(a => a.id === selectedAuthId)?.authNumber}`
      : `Successfully booked appointment for ${patient.conditionType} patient (no authorization required)`
    
    onTestComplete(testName, true, message)
    toast.success('Appointment booked successfully!')
    
    setSelectedDate(undefined)
    setSelectedTime('')
    setSelectedProviderId('')
    setSelectedAuthId('')
    onOpenChange(false)
  }

  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarBlank size={24} weight="bold" className="text-primary" />
            Test Appointment Booking
          </DialogTitle>
          <DialogDescription>
            Testing authorization workflow for {patient.firstName} {patient.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 rounded-lg border bg-muted/30">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-semibold">Patient Information</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {patient.firstName} {patient.lastName}
                </div>
              </div>
              <Badge variant="outline" className="mono">
                {patient.conditionType}
              </Badge>
            </div>
            
            <Alert className={requiresAuthorization ? 'border-destructive bg-destructive/5' : 'border-info bg-info/5'}>
              <div className="flex items-center gap-2">
                {requiresAuthorization ? (
                  <ShieldCheck size={18} weight="bold" className="text-destructive" />
                ) : (
                  <CheckCircle size={18} weight="bold" className="text-info" />
                )}
                <AlertDescription className="font-medium">
                  {requiresAuthorization 
                    ? 'Prior Authorization Required' 
                    : 'No Prior Authorization Required'}
                </AlertDescription>
              </div>
            </Alert>
          </div>

          {requiresAuthorization && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Authorization *</Label>
              {availableAuths.length === 0 ? (
                <Alert className="border-destructive bg-destructive/5">
                  <XCircle size={18} weight="bold" className="text-destructive" />
                  <AlertDescription className="ml-6">
                    <div className="font-semibold mb-1">No Active Authorizations Available</div>
                    <div className="text-sm">
                      This patient requires authorization but has no active authorizations with available units.
                      Booking will be blocked.
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {availableAuths.map(auth => {
                    const remaining = auth.totalUnits - auth.usedUnits
                    const progress = (auth.usedUnits / auth.totalUnits) * 100
                    const isSelected = selectedAuthId === auth.id
                    
                    return (
                      <button
                        key={auth.id}
                        onClick={() => setSelectedAuthId(auth.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold mono">Auth #{auth.authNumber}</span>
                              <Badge className="bg-success text-success-foreground">
                                Active
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {auth.serviceName || auth.serviceCode}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold mono">{remaining}/{auth.totalUnits}</div>
                            <div className="text-xs text-muted-foreground">units remaining</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Progress 
                            value={progress}
                            className={`h-2 ${
                              remaining <= 3 ? '[&>div]:bg-destructive' : 
                              remaining <= 10 ? '[&>div]:bg-warning' : 
                              '[&>div]:bg-success'
                            }`}
                          />
                          {remaining <= 3 && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <Warning size={12} weight="bold" />
                              Low units remaining
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          <div>Expires: {format(new Date(auth.endDate), 'MMM d, yyyy')}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Date *</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-lg border"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Time *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Provider *</Label>
                <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} - {provider.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBookAppointment}
            disabled={!canBook}
          >
            <CalendarBlank size={18} weight="bold" className="mr-2" />
            Book Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
