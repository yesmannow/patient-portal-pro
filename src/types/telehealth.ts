export type ParticipantRole = 'provider' | 'patient' | 'specialist' | 'family'

export type SessionStatus = 'waiting' | 'active' | 'completed' | 'no-show' | 'cancelled'

export interface Participant {

  stream?: MediaStream
  audioEnabl
  isPresent: b

  id: string
  patientName: string
  providerName: string
  status: SessionSt
  endTime?: Date
 

  token: string
  expiresAt:
  participantRole: 

  camera: boolean
  screen?: boolean





















