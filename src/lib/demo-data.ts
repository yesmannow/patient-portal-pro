import { Patient, Provider, Appointment, PaymentCharge, LabResult, Case, Task } from './types'

    id: 'patient-1',
   
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
    createdAt: '2024-01-15T10:30:00Z',
    hipaaFormCompleted: true,
    firstName: 'Michael',
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
    phone: '555-0104
    conditionType: 'pos
    onboardingSource: '
    hipaaFormCompleted: true,
  },
    id: 'patient-5',
    lastName: 'Anderson',
    email: 'lisa.anderson@em
    preferredContactMethod: 
    patientStatus: 'new',
    createdAt: '2024-03-01T08:00:00Z',
    intakeFormCompleted: fals
]
expo
   
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
  {
    id: 'provider-4',
    name: 'Jessica Davis',
    role: 'frontDesk',
    specialty: 'Patient Coordination',
    availabilityStatus: 'available',
    email: 'jessica.davis@clinic.com',
    phone: '555-0204',
  },
  {
    id: 'provider-5',
    name: 'Michael Roberts',
    role: 'billing',
    specialty: 'Medical Billing',
    availabilityStatus: 'available',
    email: 'michael.roberts@clinic.com',
    phone: '555-0205',
  },
]

      providerId: 'provider-1',
      location: 'Exam Ro
      status: 'confirmed',
    },
  
      providerId: 'provider-2',
      location: 'Exam Room 2',
  
    {
      patientId: 'patient-3',
      dateTime: new Date(today.
  
      confirmedAt: new Date(now.g
    {
      patientId: 'patient-4',

      reas
     
    {
      patientId: 'patient-5',
      dateTime: in2Days.toISOSt
      reason: 'New Patient Consultation',
      confirmationSentAt: new 
  ]

  {
    pa
    d
    insuranceCovered: 200.
    paidAmount: 0,
    dateOfService: '2024-02-15T
  },
    id: 'charge-2',
    chargeType: 'procedure',
    amount: 450.00,
    pa
    b
    createdAt: '2024-02-20
  {
    patientId: 'patient-3',
    description: 'Physical Therapy Session',
    insuranceCovered: 100.00,
    paidAmount: 25.00,
    dateOfService: '2024-0
  },
    id
    c
    amount: 180.00,
    patientResponsibility: 0,
    balanceDue: 0,
    createdAt: '2024-01-25T11:00:00Z',
  {
    patientId: 'patient-5',
    description: 'New Patient Copay',
    insuranceCovered: 0,
    pa
    d
  },
    id: 'charge-6',
    chargeType: 'visit',
    amount: 350.00,
    patientResponsibility: 70.
    balanceDue: 70.00,
    createdAt: '2024-03-01
]
export
   
 

    completedDate: '2024-02-16T14:00:00Z',
  {
    patientId: 'pat
    result: 'Pending analys
    orderedDate: '2024-0
  {
    patientId: 'pat
    result: 'Elevated LDL cho
    orderedDate: '2024-02-20T14:3
  },

  {
    patientId: 'patient-2',
    
   
    assignedProvide
    updatedAt: '2024-03-05T
  {
    patientId: 'patient-3',
    subject: 'PT Pr
    urgency: 'routine',
    assignedProviderId: 'provider-
    updatedAt: '20
]
export const DEMO_TASKS: Task[] = [
    id: 'task-1',
    
   
    assignedToProvi
    createdAt: '2024-03-05T
  },
    id: 'task-2',
    title: 'Follow 
    dueDate: new Date(Date.no
    status: 'todo',
    updatedAt: '2024-0
]
export async function initializeDemoData(
  setProviders: (fn: (current: Provide
  se
  s
) {
  setProviders((current) =>
  setCharges((current)
  setCases((current) => current.leng
}






































































































































