export type UserRole = 'client' | 'provider'

export type CaseStatus = 'Open' | 'In Review' | 'Waiting on Client' | 'Resolved'
export type CasePriority = 'low' | 'medium' | 'high'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

export type CampaignStatus = 'draft' | 'scheduled' | 'sent'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  company?: string
  tags: string[]
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
  }
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  avatarUrl?: string
}

export interface Case {
  id: string
  clientId: string
  subject: string
  description: string
  status: CaseStatus
  priority: CasePriority
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
  visibility: 'client' | 'internal'
  attachments?: string[]
  timestamp: string
}

export interface Appointment {
  id: string
  clientId: string
  providerId: string
  dateTime: string
  location: string
  reason: string
  status: AppointmentStatus
  notes?: string
}

export interface Campaign {
  id: string
  title: string
  content: string
  targetTags: string[]
  scheduledDate: string
  status: CampaignStatus
  metrics: {
    sent: number
    opened: number
    clicked: number
  }
  createdAt: string
}

export interface DashboardMetrics {
  totalCases: number
  activeCases: number
  avgResponseTime: number
  resolutionRate: number
  upcomingAppointments: number
  clientSatisfaction: number
}
