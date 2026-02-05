import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components
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

  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [loading, setLoading] = useState(false)
  const linkedAuth = priorAuths.find(auth => auth.id === appointment.linkedPriorAuthId)
  const handleCompleteAppointment = async () => {

      setAppointments(current => 



      )




      const result = await reconcileAuthUnits(
       
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
          <D
            Mark
        </DialogHeader>
        <div className="space-y-4">
            
         
       
            
                  <div className="flex items-center ju
     

                    <
             
   

          
                    </span>

                    <d
                        <Warning size={20} weight="fill" 
                          <p 
                          </p>
                            Th
                       


                
                        <Warning size={18} weight="f
                          Warning: Over 90% of units will be used
                      </div>
                  )}
              )}
              
                  <p className="text-sm text-warning-minor-foregrou
                  
              )}
          </Card>

          <Button varian
          </Button
            onClick={handleCompleteAppointment}
            className="gap-2"
            <CheckCircle size={18} weight="bol
          </Button>
      </DialogContent>
  )

































































