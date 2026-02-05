import { WorkflowTemplate, Task, WorkflowEventType, Case, FormSubmission, Appointment, Patient, Payment, CareGap, WaitlistEntry, VitalSigns, ProblemListItem } from './types'

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

  static async trigger72HourConfirmation(
    appointments: Appointment[],
    patients: Patient[]
  ): Promise<{ appointmentId: string; patientName: string; phoneNumber: string; dateTime: string }[]> {
    const now = new Date()
    const confirmationsToSend: { appointmentId: string; patientName: string; phoneNumber: string; dateTime: string }[] = []

    for (const appointment of appointments) {
      if (appointment.status === 'scheduled' && !appointment.confirmationSentAt) {
        const appointmentTime = new Date(appointment.dateTime)
        const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilAppointment <= 72 && hoursUntilAppointment > 0) {
          const patient = patients.find(p => p.id === appointment.patientId)
          if (patient) {
            confirmationsToSend.push({
              appointmentId: appointment.id,
              patientName: `${patient.firstName} ${patient.lastName}`,
              phoneNumber: patient.phone,
              dateTime: appointment.dateTime,
            })
          }
        }
      }
    }

    return confirmationsToSend
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

  static async checkCareGaps(
    patients: Patient[]
  ): Promise<CareGap[]> {
    const careGaps: CareGap[] = []
    const now = new Date()

    for (const patient of patients) {
      const age = patient.dateOfBirth 
        ? Math.floor((now.getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : 0

      if (age >= 50 && !patient.lastColonoscopyDate) {
        careGaps.push({
          id: `gap-colonoscopy-${patient.id}`,
          patientId: patient.id,
          gapType: 'colonoscopy',
          title: 'Colonoscopy Screening Overdue',
          description: 'Patient is 50+ years old and has no record of colonoscopy screening.',
          severity: 'warning',
          detectedAt: now.toISOString(),
        })
      }

      const hasDiabetes = patient.problemList?.some(
        problem => problem.status === 'active' && 
        (problem.condition.toLowerCase().includes('diabetes') || problem.icd10Code?.startsWith('E11'))
      )

      if (hasDiabetes) {
        const lastA1c = patient.lastA1cDate ? new Date(patient.lastA1cDate) : null
        const monthsSinceA1c = lastA1c 
          ? (now.getTime() - lastA1c.getTime()) / (1000 * 60 * 60 * 24 * 30)
          : 999

        if (monthsSinceA1c > 6) {
          careGaps.push({
            id: `gap-a1c-${patient.id}`,
            patientId: patient.id,
            gapType: 'a1c',
            title: 'A1C Test Overdue',
            description: `Patient with diabetes has not had A1C test in ${Math.floor(monthsSinceA1c)} months (recommended every 3-6 months).`,
            severity: 'urgent',
            detectedAt: now.toISOString(),
          })
        }
      }
    }

    return careGaps
  }

  static async checkVitalAlerts(
    vitals: VitalSigns
  ): Promise<{ type: string; severity: 'info' | 'warning' | 'urgent'; message: string } | null> {
    if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
      if (vitals.bloodPressureSystolic >= 140 || vitals.bloodPressureDiastolic >= 90) {
        return {
          type: 'hypertension',
          severity: 'urgent',
          message: `High Blood Pressure: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`
        }
      }
    }

    if (vitals.bmi && vitals.bmi >= 30) {
      return {
        type: 'obesity',
        severity: 'warning',
        message: `BMI ${vitals.bmi.toFixed(1)} indicates obesity (≥30)`
      }
    }

    if (vitals.oxygenSat && vitals.oxygenSat < 95) {
      return {
        type: 'hypoxia',
        severity: 'urgent',
        message: `Low Oxygen Saturation: ${vitals.oxygenSat}%`
      }
    }

    return null
  }

  static async processWaitlistBackfill(
    cancelledAppointment: Appointment,
    waitlist: WaitlistEntry[],
    patients: Patient[]
  ): Promise<{ patientId: string; patientName: string; phone: string; message: string }[]> {
    const now = new Date()
    const appointmentTime = new Date(cancelledAppointment.dateTime)
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilAppointment > 24) {
      const matchingWaitlistEntries = waitlist.filter(
        w => w.providerId === cancelledAppointment.providerId && !w.notifiedAt
      )

      const notifications: { patientId: string; patientName: string; phone: string; message: string }[] = []

      for (const entry of matchingWaitlistEntries.slice(0, 3)) {
        const patient = patients.find(p => p.id === entry.patientId)
        if (patient && patient.canReceiveSms) {
          notifications.push({
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`,
            phone: patient.phone,
            message: `Hi ${patient.firstName}, a ${appointmentTime.toLocaleDateString()} appointment slot just opened up. Reply YES to claim it.`
          })
        }
      }

      return notifications
    }

    return []
  }

  static generateSmartTemplate(reasonForVisit: string): string | null {
    const reason = reasonForVisit.toLowerCase()

    if (reason.includes('knee') || reason.includes('joint')) {
      return `ORTHOPEDIC EXAM TEMPLATE

Chief Complaint: ${reasonForVisit}

History of Present Illness:
- Onset:
- Duration:
- Aggravating factors:
- Relieving factors:
- Pain scale (1-10):

Physical Examination:
- Inspection: 
- Palpation:
- Range of Motion:
- Special Tests:

Assessment & Plan:
- Diagnosis:
- Treatment:
- Follow-up:`
    }

    if (reason.includes('diabetes') || reason.includes('a1c') || reason.includes('blood sugar')) {
      return `DIABETES FOLLOW-UP TEMPLATE

Chief Complaint: ${reasonForVisit}

Interval History:
- Recent blood glucose readings:
- Medication adherence:
- Dietary compliance:
- Exercise routine:
- Hypoglycemic episodes:

Physical Examination:
- Foot exam:
- Weight:
- Blood pressure:

Labs Reviewed:
- A1C: 
- Lipid panel:

Assessment & Plan:
- Current glycemic control:
- Medication adjustments:
- Referrals needed:
- Next A1C due:`
    }

    if (reason.includes('annual') || reason.includes('physical') || reason.includes('checkup')) {
      return `ANNUAL WELLNESS VISIT TEMPLATE

Chief Complaint: ${reasonForVisit}

Preventive Screenings:
- Cancer screenings (mammogram, colonoscopy, PSA):
- Vaccinations status:
- Labs reviewed:

Chronic Conditions Review:
- Active problems:
- Medication reconciliation:

Health Maintenance:
- Diet & nutrition:
- Exercise:
- Substance use:

Assessment & Plan:
- Screenings ordered:
- Referrals:
- Follow-up in:`
    }

    return null
  }
}

export function processNewCase(newCase: Case, providers: any[]): Task | null {
  if (newCase.urgency === 'urgent') {
    return WorkflowEngine.createUrgentCaseTask(newCase, providers)
  }
  return null
}

