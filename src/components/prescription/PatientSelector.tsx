import { Patient } from '@/types/prescription'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User } from '@phosphor-icons/react'

interface PatientSelectorProps {
  patients: Patient[]
  selectedPatientId: string | null
  onSelectPatient: (patientId: string | null) => void
}

export function PatientSelector({ patients, selectedPatientId, onSelectPatient }: PatientSelectorProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
            <User size={24} weight="bold" className="text-accent" />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="patient-select" className="text-base font-medium">
              Select Patient
            </Label>
            <Select
              value={selectedPatientId || ''}
              onValueChange={(value) => onSelectPatient(value || null)}
            >
              <SelectTrigger id="patient-select" className="w-full">
                <SelectValue placeholder="Choose a patient to view prescriptions..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
