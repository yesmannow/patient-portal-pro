import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Appointment, PriorAuthorization, Task, Provider } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { reconcileAuthUnits } from '@/lib/workflow-engine'
import { CheckCircle, Warning } from '@phosphor-icons/react'

interface AppointmentConfirmationManagerProps {
  appointment: Appointment
  onClose: () => void
}

export function AppointmentConfirmationManager({ appointment, onClose }: AppointmentConfirmationManagerProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [priorAuths, setPriorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [loading, setLoading] = useState(false)

  const linkedAuth = priorAuths.find(auth => auth.id === appointment.linkedPriorAuthId)

  const handleCompleteAppointment = async () => {
    setLoading(true)

    const updateAppointment = (id: string, updates: Partial<Appointment>) => {
      setAppointments(current => 
        current.map(apt => apt.id === id ? { ...apt, ...updates } : apt)
      )
    }

    const updatePriorAuth = (id: string, updates: Partial<PriorAuthorization>) => {
      setPriorAuths(current =>
        current.map(auth => auth.id === id ? { ...auth, ...updates } : auth)
      )
    }

    const createTask = (task: Task) => {
      setTasks(current => [...current, task])
    }

    updateAppointment(appointment.id, { status: 'completed' })

    if (appointment.linkedPriorAuthId) {
      const result = await reconcileAuthUnits(
        appointment.id,
        appointments,
        priorAuths,
        providers,
        updateAppointment,
        updatePriorAuth,
        createTask
      )

      if (result.error) {
        toast.error(`Failed to reconcile units: ${result.error}`)
      } else {
        if (result.newTask) {
          toast.warning('Authorization units depleted!', {
            description: 'An urgent task has been created for the billing team.',
            duration: 5000,
          })
        } else {
          toast.success('Appointment completed and authorization unit deducted', {
            description: `${linkedAuth ? linkedAuth.totalUnits - (result.updatedAuth?.usedUnits || 0) : 0} units remaining`,
          })
        }
      }
    } else {
      toast.success('Appointment marked as completed')
    }

    setLoading(false)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Appointment</DialogTitle>
          <DialogDescription>
            Mark this appointment as completed and update linked authorization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Appointment Status:</span>
                <Badge>{appointment.status}</Badge>
              </div>
              
              {appointment.requiresAuthorization && linkedAuth && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Authorization:</span>
                    <span className="text-sm">{linkedAuth.authNumber}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Units:</span>
                    <span className="text-sm">
                      {linkedAuth.usedUnits} / {linkedAuth.totalUnits} used
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">After Completion:</span>
                    <span className="text-sm font-semibold">
                      {linkedAuth.usedUnits + 1} / {linkedAuth.totalUnits} used
                    </span>
                  </div>

                  {(linkedAuth.usedUnits + 1) >= linkedAuth.totalUnits && (
                    <div className="rounded-lg border-2 border-warning-severe bg-warning-severe/10 p-3">
                      <div className="flex items-start gap-2">
                        <Warning size={20} weight="fill" className="text-warning-severe mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-warning-severe-foreground">
                            Authorization Units Depleted
                          </p>
                          <p className="text-warning-severe-foreground/80 mt-1">
                            This will use the last available unit. An urgent task will be created for the billing team to request a new authorization.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(linkedAuth.usedUnits + 1) / linkedAuth.totalUnits > 0.9 && (linkedAuth.usedUnits + 1) < linkedAuth.totalUnits && (
                    <div className="rounded-lg border border-warning-moderate bg-warning-moderate/10 p-3">
                      <div className="flex items-start gap-2">
                        <Warning size={18} weight="fill" className="text-warning-moderate mt-0.5" />
                        <p className="text-sm text-warning-moderate-foreground">
                          Warning: Over 90% of units will be used after completion
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!appointment.linkedPriorAuthId && appointment.requiresAuthorization && (
                <div className="rounded-lg border border-warning-minor bg-warning-minor/10 p-3">
                  <p className="text-sm text-warning-minor-foreground">
                    No authorization linked to this appointment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteAppointment}
            disabled={loading || appointment.status === 'completed'}
            className="gap-2"
          >
            <CheckCircle size={18} weight="bold" />
            {loading ? 'Processing...' : 'Complete Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
