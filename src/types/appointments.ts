export type ConditionType = 
  | 'acute-injury'
  | 'chronic-disease'
  | 'preventive-care'
  | 'mental-health'
  | 'surgical-consult'
  | 'emergency'

export type AppointmentType = 
  | 'new-patient'
  | 'follow-up'
  | 'annual-physical'
  | 'procedure'
  | 'consultation'
  | 'urgent-care'

export type ProviderSpecialty = 
  | 'primary-care'
  | 'orthopedics'
  | 'cardiology'
  | 'psychiatry'
  | 'surgery'
  | 'emergency-medicine'

export type AuthorizationStatus = 
  | 'required'
  | 'not-required'
  | 'pending'
  | 'approved'
  | 'denied'

export type TestResultStatus = 
  | 'success'
  | 'failed'
  | 'warning'

export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  conditionType: ConditionType
  conditionDescription: string
  insuranceId: string
  hasActiveAuth: boolean
}

export interface Provider {
  id: string
  name: string
  specialty: ProviderSpecialty
  availableConditions: ConditionType[]
  availableDays: number[]
}

export interface Appointment {
  id: string
  patientId: string
  providerId: string
  appointmentType: AppointmentType
  scheduledDate: string
  scheduledTime: string
  reason: string
  authorizationRequired: boolean
  authorizationNumber?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
}

export interface TestResult {
  id: string
  timestamp: string
  patientName: string
  conditionType: ConditionType
  appointmentType: AppointmentType
  providerName: string
  authorizationRequired: boolean
  authorizationProvided: boolean
  status: TestResultStatus
  message: string
  details: {
    validationsPassed: string[]
    validationsFailed: string[]
  }
}

export interface AuthorizationRule {
  conditionType: ConditionType
  appointmentTypes: AppointmentType[]
  requiresAuth: boolean
  requiredDocuments: string[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
}
