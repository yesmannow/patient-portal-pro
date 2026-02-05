import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, FirstAid } from '@phosphor-icons/react'
import type { Patient, ConditionType } from '@/types/appointments'

const TEST_PATIENTS: Patient[] = [
  {
    id: 'PT-001',
    name: 'Sarah Mitchell',
    dateOfBirth: '1985-03-15',
    conditionType: 'acute-injury',
    conditionDescription: 'Fractured ankle from sports injury',
    insuranceId: 'INS-12345',
    hasActiveAuth: false
  },
  {
    id: 'PT-002',
    name: 'Robert Chen',
    dateOfBirth: '1972-08-22',
    conditionType: 'chronic-disease',
    conditionDescription: 'Type 2 diabetes management',
    insuranceId: 'INS-23456',
    hasActiveAuth: true
  },
  {
    id: 'PT-003',
    name: 'Emily Rodriguez',
    dateOfBirth: '1990-11-05',
    conditionType: 'preventive-care',
    conditionDescription: 'Annual physical examination',
    insuranceId: 'INS-34567',
    hasActiveAuth: false
  },
  {
    id: 'PT-004',
    name: 'Marcus Johnson',
    dateOfBirth: '1988-06-30',
    conditionType: 'mental-health',
    conditionDescription: 'Anxiety and depression treatment',
    insuranceId: 'INS-45678',
    hasActiveAuth: true
  },
  {
    id: 'PT-005',
    name: 'Jennifer Williams',
    dateOfBirth: '1965-12-18',
    conditionType: 'surgical-consult',
    conditionDescription: 'Hip replacement consultation',
    insuranceId: 'INS-56789',
    hasActiveAuth: false
  },
  {
    id: 'PT-006',
    name: 'David Park',
    dateOfBirth: '1995-04-12',
    conditionType: 'emergency',
    conditionDescription: 'Severe chest pain',
    insuranceId: 'INS-67890',
    hasActiveAuth: false
  }
]

const getConditionColor = (type: ConditionType): string => {
  const colors: Record<ConditionType, string> = {
    'acute-injury': 'bg-orange-100 text-orange-700 border-orange-300',
    'chronic-disease': 'bg-blue-100 text-blue-700 border-blue-300',
    'preventive-care': 'bg-green-100 text-green-700 border-green-300',
    'mental-health': 'bg-purple-100 text-purple-700 border-purple-300',
    'surgical-consult': 'bg-red-100 text-red-700 border-red-300',
    'emergency': 'bg-red-200 text-red-900 border-red-400 font-semibold'
  }
  return colors[type]
}

const getConditionLabel = (type: ConditionType): string => {
  const labels: Record<ConditionType, string> = {
    'acute-injury': 'Acute Injury',
    'chronic-disease': 'Chronic Disease',
    'preventive-care': 'Preventive Care',
    'mental-health': 'Mental Health',
    'surgical-consult': 'Surgical Consult',
    'emergency': 'Emergency'
  }
  return labels[type]
}

interface PatientSelectorProps {
  selectedPatient: Patient | null
  onSelectPatient: (patient: Patient) => void
}

export function PatientSelector({ selectedPatient, onSelectPatient }: PatientSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight" style={{ letterSpacing: '-0.01em' }}>
          Select Test Patient
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a patient with a specific condition type to test booking workflows
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {TEST_PATIENTS.map((patient) => (
          <Card
            key={patient.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPatient?.id === patient.id
                ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectPatient(patient)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User size={20} weight="bold" className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{patient.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{patient.id}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={`${getConditionColor(patient.conditionType)} border`}>
                <FirstAid size={14} weight="bold" className="mr-1" />
                {getConditionLabel(patient.conditionType)}
              </Badge>

              <CardDescription className="text-sm line-clamp-2">
                {patient.conditionDescription}
              </CardDescription>

              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Insurance:</span>
                  <span className="font-mono text-foreground">{patient.insuranceId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Auth:</span>
                  <span className={patient.hasActiveAuth ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {patient.hasActiveAuth ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
