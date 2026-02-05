export type ParticipantRole = 'provider' | 'patient' | 'specialist' | 'family'

export type SessionStatus = 'waiting' | 'active' | 'completed' | 'no-show' | 'cancelled'

export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'no-show' | 'cancelled'

export interface Participant {
  id: string
  name: string
  role: ParticipantRole
  stream?: MediaStream
  videoEnabled: boolean
  audioEnabled: boolean
  isPinned: boolean
  isPresent: boolean
}

export interface TelehealthSession {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  appointmentId: string
  status: SessionStatus
  startTime?: Date
  endTime?: Date
  participants: Participant[]
  notes?: string
}

export interface InviteLink {
  token: string
  sessionId: string
  expiresAt: Date
  participantName: string
  participantRole: ParticipantRole
}

export interface DevicePermissions {
  camera: boolean
  microphone: boolean
  screen?: boolean
}
