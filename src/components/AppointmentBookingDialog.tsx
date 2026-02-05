import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Appointment, Provider, ProviderAvailability, Task } from '@/lib/types'
import { CalendarBlank, Clock, User } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { WorkflowEngine } from '@/lib/workflow-engine'
import { cn } from '@/lib/utils'

interface AppointmentBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export function AppointmentBookingDialog({ open, onOpenChange, patientId }: AppointmentBookingDialogProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [availability] = useKV<ProviderAvailability[]>('provider-availability', [])
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])

  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [location, setLocation] = useState<string>('Main Office')

  const availableProviders = (providers || []).filter(p => p.availabilityStatus === 'available')

  const getAvailableTimeSlotsForDate = (date: Date | undefined): string[] => {
    if (!date || !selectedProvider) return []

    const dayOfWeek = date.getDay()
    const providerAvailability = (availability || []).filter(
      a => a.providerId === selectedProvider && a.dayOfWeek === dayOfWeek && a.isAvailable
    )

    const bookedSlots = (appointments || [])
      .filter(apt => 
        apt.providerId === selectedProvider && 
        isSameDay(new Date(apt.dateTime), date) &&
        apt.status !== 'cancelled'
      )
      .map(apt => format(new Date(apt.dateTime), 'HH:mm'))

    const availableSlots = providerAvailability
      .map(a => a.startTime)
      .filter(time => !bookedSlots.includes(time))

    return availableSlots.sort()
  }

  const isDayAvailable = (date: Date): boolean => {
    if (!selectedProvider) return false
    
    const dayOfWeek = date.getDay()
    const hasAvailability = (availability || []).some(
      a => a.providerId === selectedProvider && a.dayOfWeek === dayOfWeek && a.isAvailable
    )
    
    return hasAvailability && date >= new Date()
  }

  const handleBookAppointment = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime || !reason) {
      toast.error('Please fill in all fields')
      return
    }

    const appointmentDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':')
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      patientId,
      providerId: selectedProvider,
      dateTime: appointmentDateTime.toISOString(),
      location,
      reason,
      status: 'scheduled',
    }

    setAppointments((current) => [...(current || []), newAppointment])

    const confirmationTask = await WorkflowEngine.processAppointmentBooking(
      newAppointment,
      providers || []
    )

    if (confirmationTask) {
      setTasks((current) => [...(current || []), confirmationTask])
    }

    toast.success('Appointment booked successfully', {
      description: `${format(appointmentDateTime, 'EEEE, MMMM d')} at ${selectedTime}`,
    })

    setSelectedProvider('')
    setSelectedDate(undefined)
    setSelectedTime('')
    setReason('')
    setLocation('Main Office')
    onOpenChange(false)
  }

  const selectedProviderData = availableProviders.find(p => p.id === selectedProvider)
  const availableTimeSlots = getAvailableTimeSlotsForDate(selectedDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarBlank className="w-5 h-5" />
            Book New Appointment
          </DialogTitle>
          <DialogDescription>
            Select a provider, date, and time for your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Select Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {provider.name} - {provider.specialty}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider && (
            <>
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => !isDayAvailable(date)}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.length === 0 ? (
                      <div className="col-span-4 text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2" weight="duotone" />
                        <p>No available times for this date</p>
                      </div>
                    ) : (
                      availableTimeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            selectedTime === time && 'bg-primary'
                          )}
                        >
                          {time}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Office">Main Office</SelectItem>
                    <SelectItem value="Telehealth">Telehealth (Video)</SelectItem>
                    <SelectItem value="Satellite Clinic">Satellite Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief description of your visit reason..."
                  rows={3}
                />
              </div>
            </>
          )}

          {selectedProvider && selectedDate && selectedTime && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 space-y-1">
              <p className="text-sm font-medium">Appointment Summary</p>
              <p className="text-sm text-muted-foreground">
                <strong>Provider:</strong> {selectedProviderData?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Date & Time:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Location:</strong> {location}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBookAppointment}
            disabled={!selectedProvider || !selectedDate || !selectedTime || !reason}
            className="bg-accent hover:bg-accent/90"
          >
            <CalendarBlank className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
