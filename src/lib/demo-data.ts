import { Patient, Provider, Appointment, PaymentCharge, LabResult, Case, Task } from './types'

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'patient-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    email: 'sarah.johnson@email.com',
    phone: '555-0101',
    preferredContactMethod: 'sms',
    conditionType: 'primaryCare',
    patientStatus: 'active',
    onboardingSource: 'website',
    createdAt: '2024-01-15T10:00:00Z',
    hipaaFormCompleted: true,
    intakeFormCompleted: true,
  },
  {
    id: 'patient-2',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1978-07-22',
    email: 'michael.chen@email.com',
    phone: '555-0102',
    preferredContactMethod: 'email',
    conditionType: 'chronicCare',
    patientStatus: 'active',
    onboardingSource: 'referral',
    createdAt: '2024-02-01T14:30:00Z',
    hipaaFormCompleted: true,
    intakeFormCompleted: false,
  },
  {
    id: 'patient-3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    dateOfBirth: '1992-11-08',
    email: 'emily.rodriguez@email.com',
    phone: '555-0103',
    preferredContactMethod: 'portal',
    conditionType: 'physicalTherapy',
    patientStatus: 'active',
    onboardingSource: 'phone',
    createdAt: '2024-02-10T09:15:00Z',
    hipaaFormCompleted: false,
    intakeFormCompleted: true,
  },
  {
    id: 'patient-4',
    firstName: 'James',
    lastName: 'Wilson',
    dateOfBirth: '1965-05-30',
    email: 'james.wilson@email.com',
    phone: '555-0104',
    preferredContactMethod: 'voice',
    conditionType: 'postOp',
    patientStatus: 'active',
    onboardingSource: 'intakeForm',
    createdAt: '2024-01-20T11:45:00Z',
    hipaaFormCompleted: true,
    intakeFormCompleted: true,
  },
  {
    id: 'patient-5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    dateOfBirth: '1990-09-12',
    email: 'lisa.anderson@email.com',
    phone: '555-0105',
    preferredContactMethod: 'sms',
    conditionType: 'wellness',
    patientStatus: 'new',
    onboardingSource: 'website',
    createdAt: '2024-03-01T08:00:00Z',
    hipaaFormCompleted: false,
    intakeFormCompleted: false,
  },
]

export const DEMO_PROVIDERS: Provider[] = [
  {
    id: 'provider-1',
    name: 'Dr. Jennifer Martinez',
    role: 'doctor',
    specialty: 'Family Medicine',
    availabilityStatus: 'available',
    email: 'dr.martinez@clinic.com',
    phone: '555-0201',
  },
  {
    id: 'provider-2',
    name: 'Dr. Robert Kim',
    role: 'doctor',
    specialty: 'Internal Medicine',
    availabilityStatus: 'busy',
    email: 'dr.kim@clinic.com',
    phone: '555-0202',
  },
  {
    id: 'provider-3',
    name: 'Sarah Thompson, RN',
    role: 'nurse',
    specialty: 'Clinical Nursing',
    availabilityStatus: 'available',
    email: 'sarah.thompson@clinic.com',
    phone: '555-0203',
  },
]

export function getDemoAppointments(): Appointment[] {
  const now = new Date()
  const today = new Date(now)
  today.setHours(9, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const in3Days = new Date(today)
  in3Days.setDate(in3Days.getDate() + 3)
  in3Days.setHours(14, 0, 0, 0)
  
  const in2Days = new Date(today)
  in2Days.setDate(in2Days.getDate() + 2)
  in2Days.setHours(10, 30, 0, 0)

  return [
    {
      id: 'apt-1',
      patientId: 'patient-1',
      providerId: 'provider-1',
      dateTime: today.toISOString(),
      location: 'Exam Room 1',
      reason: 'Annual Physical Examination',
      status: 'confirmed',
      confirmedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'apt-2',
      patientId: 'patient-2',
      providerId: 'provider-2',
      dateTime: new Date(today.getTime() + 1000 * 60 * 60 * 2).toISOString(),
      location: 'Exam Room 2',
      reason: 'Follow-up: Blood Pressure Management',
      status: 'scheduled',
    },
    {
      id: 'apt-3',
      patientId: 'patient-3',
      providerId: 'provider-1',
      dateTime: new Date(today.getTime() + 1000 * 60 * 60 * 4).toISOString(),
      location: 'Physical Therapy Suite',
      reason: 'Physical Therapy Session',
      status: 'confirmed',
      confirmedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'apt-4',
      patientId: 'patient-4',
      providerId: 'provider-2',
      dateTime: in3Days.toISOString(),
      location: 'Exam Room 3',
      reason: 'Post-operative Check-up',
      status: 'pending_confirmation',
      confirmationSentAt: now.toISOString(),
    },
    {
      id: 'apt-5',
      patientId: 'patient-5',
      providerId: 'provider-1',
      dateTime: in2Days.toISOString(),
      location: 'Exam Room 1',
      reason: 'New Patient Consultation',
      status: 'pending_confirmation',
      confirmationSentAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    },
  ]
}

export const DEMO_CHARGES: PaymentCharge[] = [
  {
    id: 'charge-1',
    patientId: 'patient-2',
    chargeType: 'visit',
    description: 'Office Visit - Follow-up',
    amount: 250.00,
    insuranceCovered: 200.00,
    patientResponsibility: 50.00,
    paidAmount: 0,
    balanceDue: 50.00,
    dateOfService: '2024-02-15T10:00:00Z',
    createdAt: '2024-02-15T10:30:00Z',
  },
  {
    id: 'charge-2',
    patientId: 'patient-3',
    chargeType: 'procedure',
    description: 'Physical Therapy Session',
    amount: 150.00,
    insuranceCovered: 120.00,
    patientResponsibility: 30.00,
    paidAmount: 0,
    balanceDue: 30.00,
    dateOfService: '2024-02-20T14:00:00Z',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'charge-3',
    patientId: 'patient-4',
    chargeType: 'lab',
    description: 'Blood Work Panel',
    amount: 300.00,
    insuranceCovered: 0,
    patientResponsibility: 300.00,
    paidAmount: 0,
    balanceDue: 300.00,
    dateOfService: '2024-01-25T09:00:00Z',
    createdAt: '2024-01-25T09:30:00Z',
  },
  {
    id: 'charge-4',
    patientId: 'patient-1',
    chargeType: 'copay',
    description: 'Copayment',
    amount: 35.00,
    insuranceCovered: 0,
    patientResponsibility: 35.00,
    paidAmount: 35.00,
    balanceDue: 0,
    dateOfService: '2024-03-01T09:00:00Z',
    createdAt: '2024-03-01T09:15:00Z',
  },
  {
    id: 'charge-5',
    patientId: 'patient-5',
    chargeType: 'visit',
    description: 'New Patient Comprehensive Exam',
    amount: 350.00,
    insuranceCovered: 280.00,
    patientResponsibility: 70.00,
    paidAmount: 0,
    balanceDue: 70.00,
    dateOfService: '2024-03-01T08:00:00Z',
    createdAt: '2024-03-01T08:30:00Z',
  },
]

export const DEMO_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab-1',
    patientId: 'patient-2',
    testName: 'Complete Blood Count (CBC)',
    result: 'Within normal limits',
    status: 'completed',
    orderedDate: '2024-02-10T09:00:00Z',
    completedDate: '2024-02-12T14:00:00Z',
  },
  {
    id: 'lab-2',
    patientId: 'patient-4',
    testName: 'Post-op Wound Culture',
    result: 'Pending',
    status: 'pending',
    orderedDate: '2024-02-25T10:00:00Z',
  },
  {
    id: 'lab-3',
    patientId: 'patient-1',
    testName: 'Lipid Panel',
    result: 'Cholesterol elevated - follow-up recommended',
    status: 'abnormal',
    orderedDate: '2024-02-01T11:00:00Z',
    completedDate: '2024-02-05T09:00:00Z',
  },
]

export const DEMO_CASES: Case[] = [
  {
    id: 'case-1',
    patientId: 'patient-2',
    caseType: 'clinicalConcern',
    subject: 'Elevated Blood Pressure Reading',
    description: 'Patient reports elevated BP readings at home (150/95). Requesting medication review.',
    urgency: 'timeSensitive',
    status: 'open',
    assignedProviderId: 'provider-2',
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
  },
  {
    id: 'case-2',
    patientId: 'patient-3',
    caseType: 'followUp',
    subject: 'PT Progress Update',
    description: 'Patient reports improvement in mobility after 3 sessions. Requesting schedule adjustment.',
    urgency: 'routine',
    status: 'awaitingProvider',
    assignedProviderId: 'provider-1',
    createdAt: '2024-03-04T10:30:00Z',
    updatedAt: '2024-03-04T16:00:00Z',
  },
]

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-1',
    caseId: 'case-1',
    patientId: 'patient-2',
    title: 'Review home BP readings and adjust medication',
    description: 'Patient reporting elevated readings. Review chart and consider medication adjustment.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    assignedToProviderId: 'provider-2',
    status: 'todo',
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
    createdByWorkflow: 'auto-urgent',
  },
  {
    id: 'task-2',
    patientId: 'patient-4',
    title: 'Follow up on pending wound culture results',
    description: 'Check lab results and notify patient of findings.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    assignedToProviderId: 'provider-2',
    status: 'todo',
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-02-25T10:00:00Z',
  },
]

export async function initializeDemoData(
  setPatients: (fn: (current: Patient[]) => Patient[]) => void,
  setProviders: (fn: (current: Provider[]) => Provider[]) => void,
  setAppointments: (fn: (current: Appointment[]) => Appointment[]) => void,
  setCharges: (fn: (current: PaymentCharge[]) => PaymentCharge[]) => void,
  setLabResults: (fn: (current: LabResult[]) => LabResult[]) => void,
  setCases: (fn: (current: Case[]) => Case[]) => void,
  setTasks: (fn: (current: Task[]) => Task[]) => void
) {
  setPatients((current) => current?.length > 0 ? current : DEMO_PATIENTS)
  setProviders((current) => current?.length > 0 ? current : DEMO_PROVIDERS)
  setAppointments((current) => current?.length > 0 ? current : getDemoAppointments())
  setCharges((current) => current?.length > 0 ? current : DEMO_CHARGES)
  setLabResults((current) => current?.length > 0 ? current : DEMO_LAB_RESULTS)
  setCases((current) => current?.length > 0 ? current : DEMO_CASES)
  setTasks((current) => current?.length > 0 ? current : DEMO_TASKS)
}
