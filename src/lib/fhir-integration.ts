import { Patient, Appointment } from './types'

export interface FHIRPatient {
  resourceType: 'Patient'
  id: string
  name: Array<{
    use: string
    family: string
    given: string[]
  }>
  telecom: Array<{
    system: string
    value: string
    use: string
  }>
  birthDate: string
}

export interface FHIRAppointment {
  resourceType: 'Appointment'
  id: string
  status: string
  participant: Array<{
    actor: {
      reference: string
    }
    status: string
  }>
  start: string
  end: string
  description: string
}

export interface FHIRObservation {
  resourceType: 'Observation'
  id: string
  status: string
  code: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  subject: {
    reference: string
  }
  effectiveDateTime: string
  valueQuantity?: {
    value: number
    unit: string
  }
}

export class FHIRIntegration {
  static async exportPatient(patient: Patient): Promise<FHIRPatient> {
    return {
      resourceType: 'Patient',
      id: patient.id,
      name: [
        {
          use: 'official',
          family: patient.lastName,
          given: [patient.firstName],
        },
      ],
      telecom: [
        {
          system: 'email',
          value: patient.email,
          use: 'home',
        },
        {
          system: 'phone',
          value: patient.phone,
          use: 'home',
        },
      ],
      birthDate: patient.dateOfBirth,
    }
  }

  static async importPatient(fhirPatient: FHIRPatient): Promise<Partial<Patient>> {
    const name = fhirPatient.name[0]
    const email = fhirPatient.telecom.find(t => t.system === 'email')?.value || ''
    const phone = fhirPatient.telecom.find(t => t.system === 'phone')?.value || ''

    return {
      id: fhirPatient.id,
      firstName: name.given[0] || '',
      lastName: name.family,
      email,
      phone,
      dateOfBirth: fhirPatient.birthDate,
      preferredContactMethod: 'email',
      conditionType: 'primaryCare',
      patientStatus: 'active',
      onboardingSource: 'intakeForm',
      createdAt: new Date().toISOString(),
    }
  }

  static async exportAppointment(appointment: Appointment): Promise<FHIRAppointment> {
    const endDateTime = new Date(appointment.dateTime)
    endDateTime.setHours(endDateTime.getHours() + 1)

    return {
      resourceType: 'Appointment',
      id: appointment.id,
      status: appointment.status === 'scheduled' ? 'booked' : appointment.status,
      participant: [
        {
          actor: {
            reference: `Patient/${appointment.patientId}`,
          },
          status: 'accepted',
        },
        {
          actor: {
            reference: `Practitioner/${appointment.providerId}`,
          },
          status: 'accepted',
        },
      ],
      start: appointment.dateTime,
      end: endDateTime.toISOString(),
      description: appointment.reason,
    }
  }

  static async importAppointment(fhirAppointment: FHIRAppointment): Promise<Partial<Appointment>> {
    const patientParticipant = fhirAppointment.participant.find(p => p.actor.reference.startsWith('Patient/'))
    const providerParticipant = fhirAppointment.participant.find(p => p.actor.reference.startsWith('Practitioner/'))

    return {
      id: fhirAppointment.id,
      patientId: patientParticipant?.actor.reference.split('/')[1] || '',
      providerId: providerParticipant?.actor.reference.split('/')[1] || '',
      dateTime: fhirAppointment.start,
      location: 'Imported from EMR',
      reason: fhirAppointment.description,
      status: fhirAppointment.status === 'booked' ? 'scheduled' : 'completed',
    }
  }

  static async fetchFromEMR(endpoint: string, resourceType: string, resourceId?: string): Promise<any> {
    console.log(`[FHIR Integration] Placeholder: Would fetch ${resourceType}${resourceId ? `/${resourceId}` : ''} from ${endpoint}`)
    return null
  }

  static async pushToEMR(endpoint: string, resource: any): Promise<void> {
    console.log(`[FHIR Integration] Placeholder: Would push ${resource.resourceType} to ${endpoint}`, resource)
  }
}
