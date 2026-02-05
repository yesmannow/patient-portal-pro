import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProviderAvailability, Provider } from '@/lib/types'
import { CalendarBlank, Clock, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProviderAvailabilityManagerProps {
  providerId: string
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export function ProviderAvailabilityManager({ providerId }: ProviderAvailabilityManagerProps) {
  const [availability, setAvailability] = useKV<ProviderAvailability[]>('provider-availability', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [editMode, setEditMode] = useState(false)
  const [tempAvailability, setTempAvailability] = useState<ProviderAvailability[]>([])

  const provider = (providers || []).find(p => p.id === providerId)
  const providerAvailability = (availability || []).filter(a => a.providerId === providerId)

  const startEdit = () => {
    setTempAvailability(providerAvailability)
    setEditMode(true)
  }

  const cancelEdit = () => {
    setTempAvailability([])
    setEditMode(false)
  }

  const saveAvailability = () => {
    const otherProvidersAvailability = (availability || []).filter(a => a.providerId !== providerId)
    setAvailability([...otherProvidersAvailability, ...tempAvailability])
    setEditMode(false)
    setTempAvailability([])
    toast.success('Availability updated successfully')
  }

  const toggleTimeSlot = (dayOfWeek: number, startTime: string) => {
    const endTime = `${(parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
    
    const existingIndex = tempAvailability.findIndex(
      a => a.dayOfWeek === dayOfWeek && a.startTime === startTime
    )

    if (existingIndex >= 0) {
      setTempAvailability(tempAvailability.filter((_, i) => i !== existingIndex))
    } else {
      const newSlot: ProviderAvailability = {
        id: `avail-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        providerId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTempAvailability([...tempAvailability, newSlot])
    }
  }

  const isSlotAvailable = (dayOfWeek: number, startTime: string) => {
    const slots = editMode ? tempAvailability : providerAvailability
    return slots.some(a => a.dayOfWeek === dayOfWeek && a.startTime === startTime && a.isAvailable)
  }

  const getAvailableHoursForDay = (dayOfWeek: number) => {
    const slots = editMode ? tempAvailability : providerAvailability
    return slots.filter(a => a.dayOfWeek === dayOfWeek && a.isAvailable).length
  }

  const totalAvailableHours = daysOfWeek.reduce((total, _, index) => {
    return total + getAvailableHoursForDay(index)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Set Availability</h2>
          <p className="text-muted-foreground mt-1">
            Manage your weekly schedule for patient appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button onClick={saveAvailability} className="bg-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={startEdit} className="bg-primary">
              <Clock className="w-4 h-4 mr-2" />
              Edit Availability
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weekly Hours</CardTitle>
            <CalendarBlank className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvailableHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Available for appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Active</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {daysOfWeek.filter((_, i) => getAvailableHoursForDay(i) > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">of 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {provider?.availabilityStatus === 'available' ? 'Open' : 'Unavailable'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current scheduling status</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            {editMode ? 'Click time slots to toggle availability' : 'Your current availability schedule'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {daysOfWeek.map((day, dayIndex) => (
              <div key={day} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-[120px]">
                    <p className="font-semibold">{day}</p>
                    <p className="text-xs text-muted-foreground">
                      {getAvailableHoursForDay(dayIndex)} hours available
                    </p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {timeSlots.map((time) => {
                      const available = isSlotAvailable(dayIndex, time)
                      return (
                        <button
                          key={`${dayIndex}-${time}`}
                          onClick={() => editMode && toggleTimeSlot(dayIndex, time)}
                          disabled={!editMode}
                          className={cn(
                            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                            available
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                            editMode && 'cursor-pointer',
                            !editMode && 'cursor-default'
                          )}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editMode && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-start gap-2">
                <CalendarBlank className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Quick Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click any time slot to toggle availability. Each slot represents a 1-hour appointment window.
                    Changes will be saved when you click "Save Changes".
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
