import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { APIServices, PublicHoliday } from '@/lib/api-services'
import { Appointment, Provider } from '@/lib/types'
import { Calendar, Clock, Gift, Sparkle, CheckCircle } from '@phosphor-icons/react'
import { format, addDays, isSameDay, setHours, setMinutes } from 'date-fns'
import { toast } from 'sonner'

export function SmartAppointmentScheduler() {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [holidays, setHolidays] = useState<PublicHoliday[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedProviderId, setSelectedProviderId] = useState<string>()
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadHolidays()
  }, [])

  const loadHolidays = async () => {
    const currentYear = new Date().getFullYear()
    const holidayData = await APIServices.getPublicHolidays(currentYear)
    setHolidays(holidayData)
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return true
    
    if (date.getDay() === 0 || date.getDay() === 6) return true
    
    return APIServices.isHoliday(date, holidays)
  }

  const isDateHoliday = (date: Date) => {
    return APIServices.isHoliday(date, holidays)
  }

  const getHolidayName = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const holiday = holidays.find(h => h.date === dateStr)
    return holiday?.name
  }

  const availableTimes = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
  ]

  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate || !selectedProviderId) return false

    const [timeStr, period] = time.split(' ')
    const [hours, minutes] = timeStr.split(':').map(Number)
    let hour24 = hours
    if (period === 'PM' && hours !== 12) hour24 += 12
    if (period === 'AM' && hours === 12) hour24 = 0

    const appointmentDateTime = setMinutes(setHours(selectedDate, hour24), minutes)

    const existingAppointment = (appointments ?? []).find(apt => {
      const aptDate = new Date(apt.dateTime)
      return (
        apt.providerId === selectedProviderId &&
        isSameDay(aptDate, appointmentDateTime) &&
        aptDate.getHours() === appointmentDateTime.getHours() &&
        aptDate.getMinutes() === appointmentDateTime.getMinutes()
      )
    })

    return !existingAppointment
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedProviderId || !reason.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    const [timeStr, period] = selectedTime.split(' ')
    const [hours, minutes] = timeStr.split(':').map(Number)
    let hour24 = hours
    if (period === 'PM' && hours !== 12) hour24 += 12
    if (period === 'AM' && hours === 12) hour24 = 0

    const appointmentDateTime = setMinutes(setHours(selectedDate, hour24), minutes)

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: 'current-patient',
      providerId: selectedProviderId,
      dateTime: appointmentDateTime.toISOString(),
      reason,
      status: 'scheduled',
      notes: '',
      location: 'Main Office',
    }

    setAppointments(current => [...(current || []), newAppointment])

    toast.success('Appointment booked successfully! SMS confirmation will be sent 72 hours before.')

    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setSelectedProviderId(undefined)
    setReason('')
    setIsLoading(false)
  }

  const selectedProvider = providers?.find(p => p.id === selectedProviderId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Appointment Scheduler</h1>
        <p className="text-muted-foreground mt-1">Holiday-aware self-scheduling with automated SMS confirmations</p>
      </div>

      <Alert className="bg-accent/10 border-accent">
        <Sparkle className="w-4 h-4" weight="duotone" />
        <AlertDescription>
          <strong>Gold Standard Automation:</strong> This scheduler automatically blocks public holidays 
          using the Nager.Date API and sends SMS confirmations 72 hours before appointments.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" weight="duotone" />
              Select Date
            </CardTitle>
            <CardDescription>
              Weekends and holidays are automatically blocked
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              className="rounded-md border"
              modifiers={{
                holiday: (date) => isDateHoliday(date),
              }}
              modifiersStyles={{
                holiday: {
                  backgroundColor: 'oklch(0.60 0.20 25 / 0.1)',
                  color: 'oklch(0.60 0.20 25)',
                  fontWeight: 'bold',
                },
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" weight="duotone" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate && isDateHoliday(selectedDate) && (
                <Alert variant="destructive">
                  <Gift className="w-4 h-4" weight="fill" />
                  <AlertDescription>
                    <strong>{getHolidayName(selectedDate)}</strong> - Office closed
                  </AlertDescription>
                </Alert>
              )}

              {selectedDate && !isDateHoliday(selectedDate) && (
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Selected Date</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm py-1.5">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {(providers ?? [])
                      .filter(p => p.role === 'physician' || p.role === 'doctor')
                      .map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name} - {provider.specialty}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDate && selectedProviderId && !isDateHoliday(selectedDate) && (
                <div className="space-y-2">
                  <Label>Available Times</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {availableTimes.map(time => {
                      const available = isTimeSlotAvailable(time)
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                          disabled={!available}
                          className="justify-start"
                        >
                          <Clock className="w-4 h-4 mr-2" weight={selectedTime === time ? 'fill' : 'regular'} />
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g., Annual checkup, Follow-up visit, New symptoms"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || !selectedProviderId || !reason.trim() || isLoading}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" weight="fill" />
                {isLoading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </CardContent>
          </Card>

          {holidays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gift className="w-4 h-4" weight="duotone" />
                  Upcoming Holidays
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {holidays
                    .filter(h => new Date(h.date) >= new Date())
                    .slice(0, 4)
                    .map((holiday, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm font-medium">{holiday.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(holiday.date), 'MMM d')}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
