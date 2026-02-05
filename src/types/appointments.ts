export type ConditionType = 
  | 'chronic-disease'
  | 'mental-health'
  | 'emergency'
  | 'surgical-consult'
  | 'procedure'
  | 'urgent-care'
  | 'routine-checkup'
  | 'follow-up'

export type ProviderSpecialty = 
  | 'family-medicine'
  | 'internal-medicine'
  | 'pediatrics'
  | 'cardiology'
  | 'orthopedics'
  | 'psychiatry'
  | 'emergency-medicine'
  | 'surgery'

export type AuthorizationStatus = 
  | 'approved'
  | 'pending'
  | 'denied'
  | 'not-required'

export type AppointmentType = 
  | 'new-patient'
  | 'follow-up'
  | 'urgent-care'
  | 'procedure'
  | 'telehealth'

export type UrgencyLevel = 
  | 'routine'
  | 'urgent'
  | 'emergency'

export type StatusVariant = 
  | 'success'
  | 'warning'
  | 'destructive'
  | 'secondary'

export interface Condition {
  id: string
  name: string
  conditionType: ConditionType
  requiresAuthorization: boolean
}

export interface Provider {
  id: string
  name: string
  specialty: ProviderSpecialty
  availableConditions: ConditionType[]
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  appointmentType: AppointmentType
  scheduledTime: Date
  conditionType?: ConditionType
  authorization?: AuthorizationStatus
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  requiresAuth: boolean
  urgencyLevel?: UrgencyLevel
}

export interface TestResult {
  timestamp: Date
  conditionType: ConditionType
  providerName: string
  authorizationProvided: boolean
  message: string
  details: {
    validationsPassed: boolean
    authMatched: boolean
  }
}
