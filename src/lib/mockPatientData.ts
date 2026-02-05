import type { PatientRecord } from '@/types/clinical'

export const mockPatients: PatientRecord[] = [
  {
    patientId: 'patient-001',
    patientName: 'Sarah Martinez',
    dateOfBirth: new Date('1970-03-15'),
    age: 54,
    gender: 'female',
    conditions: [
      {
        id: 'cond-001',
        name: 'Essential Hypertension',
        codes: [
          { system: 'ICD-10', code: 'I10', display: 'Essential Hypertension' },
          { system: 'SNOMED-CT', code: '38341003', display: 'Hypertensive disorder' }
        ],
        diagnosedDate: new Date('2018-06-12'),
        status: 'chronic'
      },
      {
        id: 'cond-002',
        name: 'Type 2 Diabetes Mellitus',
        codes: [
          { system: 'ICD-10', code: 'E11.9', display: 'Type 2 diabetes without complications' },
          { system: 'SNOMED-CT', code: '44054006', display: 'Type 2 diabetes mellitus' }
        ],
        diagnosedDate: new Date('2020-01-08'),
        status: 'chronic'
      }
    ],
    vitals: [
      {
        timestamp: new Date(),
        systolicBP: 156,
        diastolicBP: 94,
        heartRate: 78,
        temperature: 98.6,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        weight: 175,
        height: 64,
        bmi: 30.1,
        recordedBy: 'Nurse Johnson'
      }
    ],
    medications: [
      {
        id: 'med-001',
        name: 'Lisinopril 20mg',
        rxNormCode: '1998',
        dosage: '20mg',
        frequency: 'Once daily',
        startDate: new Date('2018-06-12'),
        prescribedBy: 'Dr. Emily Chen'
      },
      {
        id: 'med-002',
        name: 'Metformin 1000mg',
        rxNormCode: '6809',
        dosage: '1000mg',
        frequency: 'Twice daily',
        startDate: new Date('2020-01-08'),
        prescribedBy: 'Dr. Emily Chen'
      },
      {
        id: 'med-003',
        name: 'Ibuprofen 600mg',
        rxNormCode: '5640',
        dosage: '600mg',
        frequency: 'As needed for pain',
        startDate: new Date('2024-01-15'),
        prescribedBy: 'Dr. Emily Chen'
      }
    ],
    screenings: [
      {
        id: 'screen-001',
        type: 'colonoscopy',
        name: 'Colonoscopy',
        lastDate: new Date('2014-08-22'),
        result: 'No polyps found',
        codes: [
          { system: 'CPT', code: '45378', display: 'Colonoscopy' }
        ]
      },
      {
        id: 'screen-002',
        type: 'mammogram',
        name: 'Mammogram',
        lastDate: new Date('2023-10-15'),
        result: 'Normal',
        codes: [
          { system: 'CPT', code: '77067', display: 'Screening mammography' }
        ]
      }
    ],
    labs: [
      {
        id: 'lab-001',
        testName: 'Hemoglobin A1c',
        loincCode: '4548-4',
        value: '9.2',
        unit: '%',
        referenceRange: '<7.0%',
        abnormalFlag: true,
        collectedDate: new Date('2024-02-10'),
        resultDate: new Date('2024-02-12')
      },
      {
        id: 'lab-002',
        testName: 'Creatinine',
        loincCode: '2160-0',
        value: '1.1',
        unit: 'mg/dL',
        referenceRange: '0.6-1.2 mg/dL',
        abnormalFlag: false,
        collectedDate: new Date('2024-02-10'),
        resultDate: new Date('2024-02-12')
      }
    ],
    allergies: ['Penicillin', 'Shellfish'],
    lastEncounter: new Date('2023-11-20')
  },
  {
    patientId: 'patient-002',
    patientName: 'Robert Johnson',
    dateOfBirth: new Date('1955-07-22'),
    age: 69,
    gender: 'male',
    conditions: [],
    vitals: [
      {
        timestamp: new Date(),
        systolicBP: 128,
        diastolicBP: 82,
        heartRate: 72,
        temperature: 98.4,
        respiratoryRate: 14,
        oxygenSaturation: 97,
        weight: 190,
        height: 70,
        bmi: 27.3,
        recordedBy: 'Nurse Smith'
      }
    ],
    medications: [],
    screenings: [
      {
        id: 'screen-003',
        type: 'immunization',
        name: 'Influenza Vaccine',
        lastDate: new Date('2022-10-01'),
        result: 'Administered',
        codes: [
          { system: 'CPT', code: '90658', display: 'Influenza virus vaccine' }
        ]
      }
    ],
    labs: [],
    allergies: [],
    lastEncounter: new Date('2024-01-15')
  },
  {
    patientId: 'patient-003',
    patientName: 'Maria Garcia',
    dateOfBirth: new Date('1988-11-30'),
    age: 36,
    gender: 'female',
    conditions: [],
    vitals: [
      {
        timestamp: new Date(),
        systolicBP: 118,
        diastolicBP: 76,
        heartRate: 68,
        temperature: 98.6,
        respiratoryRate: 14,
        oxygenSaturation: 99,
        weight: 145,
        height: 65,
        bmi: 24.1,
        recordedBy: 'Nurse Williams'
      }
    ],
    medications: [],
    screenings: [],
    labs: [],
    allergies: ['Latex'],
    lastEncounter: new Date('2023-08-10')
  }
]

export function getMockPatient(patientId: string): PatientRecord | undefined {
  return mockPatients.find(p => p.patientId === patientId)
}
