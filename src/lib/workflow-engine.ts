import { WorkflowTemplate, Task, WorkflowEventType, Case, FormSubmission, Appointment, Patient, Payment } from './types'

export class WorkflowEngine {
  static async processEvent(
    eventType: WorkflowEventType,
    eventData: Case | FormSubmission | Appointment,
    workflows: WorkflowTemplate[],
    providers: any[]
  ): Promise<Task[]> {
    const activeWorkflows = workflows.filter(w => w.active && w.eventType === eventType)
    const createdTasks: Task[] = []

    for (const workflow of activeWorkflows) {
      for (const taskTemplate of workflow.taskTemplates) {
        const task = this.createTaskFromTemplate(taskTemplate, eventData, workflow, providers)
        if (task) {
          createdTasks.push(task)
        }
      }
    }

    if (eventType === 'caseCreated' && 'urgency' in eventData && eventData.urgency === 'urgent') {
      const urgentTask = this.createUrgentCaseTask(eventData as Case, providers)
      if (urgentTask) {
        createdTasks.push(urgentTask)
      }
    }

    return createdTasks
  }

  static async check72HourConfirmations(
    appointments: Appointment[],
    updateAppointment: (id: string, updates: Partial<Appointment>) => void
  ): Promise<Appointment[]> {
    const now = new Date()
    const appointmentsNeedingConfirmation: Appointment[] = []

    for (const appointment of appointments) {
      if (appointment.status === 'scheduled' || appointment.status === 'pending_confirmation') {
        const appointmentTime = new Date(appointment.dateTime)
        const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilAppointment <= 72 && hoursUntilAppointment > 0 && !appointment.confirmationSentAt) {
          updateAppointment(appointment.id, {
            status: 'pending_confirmation',
            confirmationSentAt: now.toISOString(),
          })
          appointmentsNeedingConfirmation.push(appointment)
        }
      }
    }

    return appointmentsNeedingConfirmation
  }

  static async simulatePatientSMSResponse(
    appointmentId: string,
    response: '1' | '2',
    appointments: Appointment[],
    updateAppointment: (id: string, updates: Partial<Appointment>) => void
  ): Promise<{ success: boolean; message: string }> {
    const appointment = appointments.find(a => a.id === appointmentId)
    
    if (!appointment) {
      return { success: false, message: 'Appointment not found' }
    }

    if (response === '1') {
      updateAppointment(appointmentId, {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      })
      return { success: true, message: 'Appointment confirmed successfully' }
    } else if (response === '2') {
      return { success: true, message: 'Reschedule request received. Staff will contact you.' }
    }

    return { success: false, message: 'Invalid response' }
  }

  static async processPaymentCompletion(
    payment: Payment,
    patients: Patient[],
    updatePatient: (patientId: string, updates: Partial<Patient>) => void
  ): Promise<void> {
    const patient = patients.find(p => p.id === payment.patientId)
    if (patient && patient.patientStatus !== 'active') {
      updatePatient(payment.patientId, { patientStatus: 'active' })
    }
  }

  static async processAppointmentBooking(
    appointment: Appointment,
    providers: any[]
  ): Promise<Task | null> {
    const now = new Date()
    const dueDate = new Date(appointment.dateTime)
    dueDate.setHours(dueDate.getHours() - 24)

    const assignedProvider = providers.find(p => p.role === 'admin') || providers[0]

    if (!assignedProvider) {
      return null
    }

    return {
      id: `task-confirm-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      patientId: appointment.patientId,
      title: 'Confirm Appointment',
      description: `Confirm appointment scheduled for ${new Date(appointment.dateTime).toLocaleString()}. Reason: ${appointment.reason}`,
      dueDate: dueDate.toISOString(),
      assignedToProviderId: assignedProvider.id,
      status: 'todo',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdByWorkflow: 'auto-appointment-confirmation',
    }
  }

  static createUrgentCaseTask(caseData: Case, providers: any[]): Task | null {
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setHours(dueDate.getHours() + 24)

    let assignedProvider = caseData.assignedProviderId 
      ? providers.find(p => p.id === caseData.assignedProviderId)
      : providers.find(p => p.role === 'physician') || providers[0]

    if (!assignedProvider) {
      return null
    }

    return {
      id: `task-urgent-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      caseId: caseData.id,
      patientId: caseData.patientId,
      title: `URGENT: Review ${caseData.subject}`,
      description: `This case has been marked as urgent and requires immediate attention. Case Type: ${caseData.caseType}`,
      dueDate: dueDate.toISOString(),
      assignedToProviderId: assignedProvider.id,
      status: 'todo',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdByWorkflow: 'auto-urgent',
    }
  }

  private static createTaskFromTemplate(
    template: any,
    eventData: any,
    workflow: WorkflowTemplate,
    providers: any[]
  ): Task | null {
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + template.daysOffset)

    let assignedProvider = providers.find(p => p.role === template.assignToRole)
    if (!assignedProvider && providers.length > 0) {
      assignedProvider = providers[0]
    }

    if (!assignedProvider) {
      return null
    }

    const patientId = eventData.patientId || null
    const caseId = 'caseType' in eventData ? eventData.id : eventData.createdCaseId || null

    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      caseId,
      patientId,
      title: template.title,
      description: template.description,
      dueDate: dueDate.toISOString(),
      assignedToProviderId: assignedProvider.id,
      status: 'todo',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdByWorkflow: workflow.id,
    }
  }

  static checkOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date()
    return tasks.filter(task => {
      if (task.status === 'done') return false
      const dueDate = new Date(task.dueDate)
      return dueDate < now
    })
  }

  static deduplicateTasks(existingTasks: Task[], newTasks: Task[]): Task[] {
    const uniqueTasks: Task[] = []
    
    for (const newTask of newTasks) {
      const isDuplicate = existingTasks.some(existing => 
        existing.title === newTask.title &&
        existing.patientId === newTask.patientId &&
        existing.dueDate === newTask.dueDate &&
        existing.status !== 'done'
      )
      
      if (!isDuplicate) {
        uniqueTasks.push(newTask)
      }
    }
    
    return uniqueTasks
  }
}

export function processNewCase(newCase: Case, providers: any[]): Task | null {
  if (newCase.urgency === 'urgent') {
    return WorkflowEngine.createUrgentCaseTask(newCase, providers)
  }
  return null
}

