export type UserRole = 'patient' | 'provider'

export type PreferredContactMethod = 'portal' | 'email' | 'sms' | 'voice'
export type ConditionType = 'primaryCare' | 'physicalTherapy' | 'chronicCare' | 'postOp' | 'wellness'
export type PatientStatus = 'new' | 'active' | 'dormant' | 'discharged'
export type OnboardingSource = 'intakeForm' | 'referral' | 'phone' | 'website'

export type ProviderRole = 'physician' | 'therapist' | 'nurse' | 'admin'
export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline'

export type CaseType = 'question' | 'followUp' | 'billing' | 'clinicalConcern' | 'admin'
export type Urgency = 'routine' | 'timeSensitive' | 'urgent'
export type CaseStatus = 'open' | 'awaitingPatient' | 'awaitingProvider' | 'resolved'

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type ChargeType = 'visit' | 'procedure' | 'lab' | 'medication' | 'copay'

export interface User {
  id: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  phone: string
  preferredContactMethod: PreferredContactMethod
  conditionType: ConditionType
  patientStatus: PatientStatus
  onboardingSource: OnboardingSource
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  role: ProviderRole
  specialty: string
  availabilityStatus: AvailabilityStatus
  email: string
  phone: string
  avatarUrl?: string
}

export interface Case {
  id: string
  patientId: string
  caseType: CaseType
  subject: string
  description: string
  urgency: Urgency
  status: CaseStatus
  assignedProviderId?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  caseId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  body: string
  visibility: 'patient' | 'internal'
  attachments?: string[]
  timestamp: string
}

export interface Appointment {
  id: string
  patientId: string
  providerId: string
  dateTime: string
  location: string
  reason: string
  status: AppointmentStatus
  notes?: string
}

export interface PaymentCharge {
  id: string
  patientId: string
  chargeType: ChargeType
  description: string
  amount: number
  insuranceCovered: number
  patientResponsibility: number
  paidAmount: number
  balanceDue: number
  dateOfService: string
  createdAt: string
}

export interface Payment {
  id: string
  chargeId: string
  patientId: string
  amount: number
  paymentMethod: string
  status: PaymentStatus
  transactionId?: string
  createdAt: string
  processedAt?: string
}

export interface ProviderAvailability {
  id: string
  providerId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface DashboardMetrics {
  totalCases: number
  activeCases: number
  avgResponseTime: number
  resolutionRate: number
  upcomingAppointments: number
}

export type DocumentCategory = 'labResults' | 'imaging' | 'insurance' | 'referral' | 'other'

export interface HealthDocument {
  id: string
  patientId: string
  fileName: string
  fileSize: number
  category: DocumentCategory
  uploadedAt: string
  description?: string
  base64Data: string
}

export type TaskStatus = 'todo' | 'inProgress' | 'done'

export interface Task {
  id: string
  caseId?: string
  patientId?: string
  title: string
  description: string
  dueDate: string
  assignedToProviderId: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  createdByWorkflow?: string
}

export type WorkflowEventType = 'caseCreated' | 'formSubmitted' | 'appointmentScheduled' | 'statusChanged'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  eventType: WorkflowEventType
  active: boolean
  taskTemplates: TaskTemplate[]
  createdAt: string
  updatedAt: string
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  daysOffset: number
  assignToRole?: ProviderRole
}

export type FormFieldType = 'text' | 'textarea' | 'date' | 'select' | 'boolean' | 'number'

export interface FormField {
  id: string
  label: string
  fieldType: FormFieldType
  required: boolean
  options?: string[]
  placeholder?: string
  mapToPatientField?: keyof Patient
}

export interface FormDefinition {
  id: string
  name: string
  description: string
  fields: FormField[]
  createCaseOnSubmit: boolean
  caseType?: CaseType
  urgency?: Urgency
  createTasksOnSubmit: boolean
  taskTemplates?: TaskTemplate[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface FormSubmission {
  id: string
  formDefinitionId: string
  patientId: string
  responses: Record<string, any>
  submittedAt: string
  createdCaseId?: string
  createdTaskIds?: string[]
}

export interface AnalyticsInsight {
  id: string
  type: 'trend' | 'alert' | 'suggestion'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  actionText?: string
  generatedAt: string
}

export interface TemplateFolder {
  id: string
  name: string
  color: string
  icon?: string
  createdAt: string
}

export interface ResponseTemplate {
  id: string
  name: string
  category: CaseType
  folderId?: string
  promptKeywords: string[]
  templateText: string
  useAI: boolean
  createdAt: string
  updatedAt: string
}
