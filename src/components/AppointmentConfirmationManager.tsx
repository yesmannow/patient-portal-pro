import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { reconcileAuthUnits } from '@/lib/workflow-engine'
import { CheckCircle, Warning } from '@phosphor-icons/react'
import { Appointment, PriorAuthorization, Task, Provider } from '@/lib/types'

interface AppointmentConfirmationManagerProps {
  appointment: Appointment
  onClose: () => void
}

export function AppointmentConfirmationManager({ appointment, onClose }: AppointmentConfirmationManagerProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [priorAuths, setPriorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [loading, setLoading] = useState(false)
  
  const linkedAuth = priorAuths?.find(auth => auth.id === appointment.linkedPriorAuthId)

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(current =>
      (current || []).map(apt => apt.id === id ? { ...apt, ...updates } : apt)
    )
  }

  const updatePriorAuth = (id: string, updates: Partial<PriorAuthorization>) => {
    setPriorAuths(current =>
      (current || []).map(auth => auth.id === id ? { ...auth, ...updates } : auth)
    )
  }

  const createTask = (task: Task) => {
    setTasks(current => [...(current || []), task])
  }

  const handleCompleteAppointment = async () => {
    setLoading(true)

    updateAppointment(appointment.id, { status: 'completed' })

    if (appointment.linkedPriorAuthId) {
      const result = await reconcileAuthUnits(
        appointment.id,
        appointments || [],
        priorAuths || [],
        providers || [],
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
          toast.success('Appointment completed and unit reconciled successfully')
        }
      }
    } else {
      toast.success('Appointment marked as completed')
    }

    setLoading(false)
    onClose()
  }

  const remainingUnits = linkedAuth ? linkedAuth.totalUnits - linkedAuth.usedUnits : 0
  const usagePercent = linkedAuth ? ((linkedAuth.usedUnits / linkedAuth.totalUnits) * 100).toFixed(0) : 0

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Appointment as Completed</DialogTitle>
          <DialogDescription>
            This will update the appointment status and reconcile prior authorization units if applicable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {linkedAuth && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Prior Authorization Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auth #:</span>
                  <span className="text-sm font-mono">{linkedAuth.authNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Service:</span>
                  <span className="text-sm">{linkedAuth.serviceName || linkedAuth.serviceCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Units Remaining:</span>
                  <Badge variant={remainingUnits <= 3 ? 'destructive' : 'default'}>
                    {remainingUnits} / {linkedAuth.totalUnits}
                  </Badge>
                </div>
                {remainingUnits === 1 && (
                  <div className="flex items-start gap-2 mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
                    <Warning size={20} weight="fill" className="text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-destructive mb-1">Critical: Last Unit</p>
                      <p className="text-muted-foreground">
                        This will use the final authorized unit. An urgent task will be created for renewal.
                      </p>
                    </div>
                  </div>
                )}
                {remainingUnits > 1 && Number(usagePercent) > 90 && (
                  <div className="flex items-start gap-2 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
                    <Warning size={18} weight="fill" className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900">
                      Warning: Over 90% of units will be used
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!linkedAuth && appointment.requiresAuthorization && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  No prior authorization is linked to this appointment, but one may be required.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteAppointment}
            disabled={loading}
            className="gap-2"
          >
            <CheckCircle size={18} weight="bold" />
            {loading ? 'Processing...' : 'Mark as Completed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
