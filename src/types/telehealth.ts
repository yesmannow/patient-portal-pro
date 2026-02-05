export type ParticipantRole = 'provider' | 'patient' | 'specialist' | 'family'

export type SessionStatus = 'waiting' | 'active' | 'completed' | 'no-show' | 'cancelled'

export type AppointmentStatus = 'completed' | 'no-show' | 'cancelled'

export interface Participant {
  id: string
  stream?: Med
  audioEnabled: boolean
  isPresent: boolean

  id: string
  patientName: stri
  providerName: stri
 

}
export inter
  expiresAt: Date
  participantRole: Pa
}
export interface Devic
  microphone: boolean
}





export interface InviteLink {
  token: string
  expiresAt: Date
  participantName: string
  participantRole: ParticipantRole
  sessionId: string
}

export interface DevicePermissions {
  camera: boolean
  microphone: boolean
  screen?: boolean
}







