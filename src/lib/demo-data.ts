import { Patient, Provider, Appointment, PaymentCharge, LabResult, Case, Task } from './types'

    id: 'patient-1',
   
    email: 'sarah.jo
    preferredContactMet
    patientStatus: 'acti
    createdAt: '2024-01-15T10:
    intakeFormCompleted: true,
  {
    firstName: 'Michael',
    dateOfBirth: '1978-07-22',
    phone: '555-0102',
    conditionType: 'chronicCare'
    onboardingSource: 'referral',
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
      status: 'sch
    {
      patientId: 'patient-3',
      dateTime: new Date(today.getTi
      reason: 'Physical Therap
      confirmedAt: new Date(now.getTime() - 
    {
      patientId: 'patient-4',
      
     
      confirmation
    {
      patientId: 'patient-5',
      dateTime: in2Days.toISOString(),
      reason: 'New Patient Con
      confirmationSentAt: new Date(now.getTime() - 10
  ]

  {
    patientId: 'pa
    description: 'Office Visi
    insuranceCovered: 200.00,
    paidAmount: 0,
    dateOfService: '2024-02-15T10:00:00Z'
  },
    id: 'charge-2',
    chargeType: 'procedure',
    am
    p
    balanceDue: 30
    createdAt: '2024-02-20T14
  {
    patientId: 'patient-4',
    description: 'Blood Work P
    insuranceCovered: 0,
    paidAmount: 0,
    dateOfService: '2024-01-25T09:00:00Z',
  },
    i
    chargeType: 'c
    amount: 35.00,
    patientResponsibility: 35.0
    balanceDue: 0,
    createdAt: '2024-03-01T09:
  {
    patientId: 'patient-5',
    description: 'New Patient Comprehensive Exam',
    in
   
 


  {
    patientId: 'pat
    result: 'Within normal 
    orderedDate: '2024-0
  },
    id: 'lab-2',
    testName: 'Post-op Wound 
    status: 'pending',
  },
    id: 'lab-3',
    testName: 'Lipid Panel',
    status: 'abnormal',
    
]
export const DEMO_C
    id: 'case-1',
    caseType: 'clinicalConce
    description: 'Patient reports elevated B
    status: 'open',
    createdAt: '2024-03-05T14
  },
    id: 'case-2',
    caseType: 'followU
    description: 'Patient reports improvem
    status: 'awaitingProvider',
    
  }

  {
    caseId: 'case-1',
    title: 'Review home BP readings 
    dueDate: new Da
    status: 'todo',
    updatedAt: '2024-03-05T14:00:0
  },
    id: 'task-2',
    title: 'Follow up on pending wound cul
    dueDate: new Date(Date.now() + 100
    
   
]
export async function initi
  setProviders: (fn: (cu
  setCharges: (fn: (current: 
  setCases: (fn: (
) {
  setProviders((current) => curre
  setCharges((current)
  setCases((curren
}





















































































































