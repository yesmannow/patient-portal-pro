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

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

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
