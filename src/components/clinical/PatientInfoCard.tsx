import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Info, CheckCircle } from '@phosphor-icons/react'
import type { PatientRecord } from '@/types/clinical'

interface PatientInfoCardProps {
  patient: PatientRecord
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{patient.patientName}</CardTitle>
            <CardDescription>
              {patient.age} years old • {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} • ID: {patient.patientId}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Active Conditions</h4>
            <div className="space-y-1">
              {patient.conditions.length > 0 ? (
                patient.conditions.map((condition) => (
                  <div key={condition.id} className="text-sm">
                    <Badge variant="secondary" className="mr-2">
                      {condition.codes[0]?.code}
                    </Badge>
                    {condition.name}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No active conditions</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Current Medications</h4>
            <div className="space-y-1">
              {patient.medications.length > 0 ? (
                patient.medications.slice(0, 3).map((medication) => (
                  <div key={medication.id} className="text-sm">
                    <span className="font-medium">{medication.name}</span>
                    <span className="text-muted-foreground"> - {medication.frequency}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No medications</p>
              )}
              {patient.medications.length > 3 && (
                <p className="text-xs text-muted-foreground">+{patient.medications.length - 3} more</p>
              )}
            </div>
          </div>

          {patient.vitals.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Latest Vitals</h4>
              <div className="text-sm space-y-1">
                {patient.vitals[0].systolicBP && patient.vitals[0].diastolicBP && (
                  <div>
                    <span className="font-medium">BP:</span> {patient.vitals[0].systolicBP}/{patient.vitals[0].diastolicBP} mmHg
                  </div>
                )}
                {patient.vitals[0].heartRate && (
                  <div>
                    <span className="font-medium">HR:</span> {patient.vitals[0].heartRate} bpm
                  </div>
                )}
                {patient.vitals[0].bmi && (
                  <div>
                    <span className="font-medium">BMI:</span> {patient.vitals[0].bmi.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          )}

          {patient.allergies.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Allergies</h4>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((allergy, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {patient.labs.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Recent Lab Results</h4>
              <div className="space-y-2">
                {patient.labs.slice(0, 3).map((lab) => (
                  <div key={lab.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{lab.testName}:</span> {lab.value} {lab.unit}
                    </div>
                    {lab.abnormalFlag ? (
                      <Badge variant="destructive" className="text-xs">Abnormal</Badge>
                    ) : (
                      <CheckCircle size={16} className="text-success" weight="fill" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
