import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Patient, CareGap, VitalSigns } from '@/lib/types'
import { WorkflowEngine } from '@/lib/workflow-engine'
import { Warning, CheckCircle, Info, FirstAid, Pulse, Calendar, Bell } from '@phosphor-icons/react'
import { format } from 'date-fns'

export function ClinicalDecisionSupport() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [vitals] = useKV<VitalSigns[]>('vital-signs', [])
  const [careGaps, setCareGaps] = useState<CareGap[]>([])
  const [vitalAlerts, setVitalAlerts] = useState<Map<string, any>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function analyzeCareGaps() {
      setLoading(true)
      const gaps = await WorkflowEngine.checkCareGaps(patients ?? [])
      setCareGaps(gaps)

      const alerts = new Map()
      for (const vital of (vitals ?? [])) {
        const alert = await WorkflowEngine.checkVitalAlerts(vital)
        if (alert) {
          alerts.set(vital.patientId, alert)
        }
      }
      setVitalAlerts(alerts)
      setLoading(false)
    }

    analyzeCareGaps()
  }, [patients, vitals])

  const getSeverityColor = (severity: 'info' | 'warning' | 'urgent') => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-500'
      case 'warning':
        return 'bg-amber-500'
      case 'info':
        return 'bg-blue-500'
    }
  }

  const getSeverityIcon = (severity: 'info' | 'warning' | 'urgent') => {
    switch (severity) {
      case 'urgent':
        return <Warning className="w-4 h-4" weight="fill" />
      case 'warning':
        return <Bell className="w-4 h-4" weight="fill" />
      case 'info':
        return <Info className="w-4 h-4" weight="fill" />
    }
  }

  const urgentGaps = careGaps.filter(g => g.severity === 'urgent')
  const warningGaps = careGaps.filter(g => g.severity === 'warning')
  const infoGaps = careGaps.filter(g => g.severity === 'info')

  const allergiesCount = (patients ?? []).reduce((sum, p) => sum + (p.allergies?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clinical Decision Support</h2>
          <p className="text-muted-foreground mt-1">
            Proactive care gap detection and clinical alerts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-500/30 bg-red-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning className="w-4 h-4 text-red-600" weight="fill" />
              Urgent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{urgentGaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" weight="fill" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{warningGaps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Action recommended</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FirstAid className="w-4 h-4 text-blue-600" weight="fill" />
              Active Allergies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{allergiesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all patients</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Analyzing patient data...
          </CardContent>
        </Card>
      ) : careGaps.length === 0 ? (
        <Card className="border-green-500/30 bg-green-50/50">
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" weight="fill" />
            <div>
              <div className="font-semibold text-green-900">No Care Gaps Detected</div>
              <div className="text-sm text-green-700">All patients are up to date with preventive care</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {urgentGaps.length > 0 && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Warning className="w-5 h-5" weight="fill" />
                  Urgent Care Gaps
                </CardTitle>
                <CardDescription>These require immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {urgentGaps.map(gap => {
                  const patient = (patients ?? []).find(p => p.id === gap.patientId)
                  return (
                    <div key={gap.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-red-900">{gap.title}</div>
                          <div className="text-sm text-red-700 mt-1">
                            Patient: {patient?.firstName} {patient?.lastName}
                          </div>
                          <div className="text-sm text-red-600 mt-2">{gap.description}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Detected: {format(new Date(gap.detectedAt), 'PPp')}
                          </div>
                        </div>
                        <Badge className="bg-red-500">URGENT</Badge>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {warningGaps.length > 0 && (
            <Card className="border-amber-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Bell className="w-5 h-5" weight="fill" />
                  Care Gap Warnings
                </CardTitle>
                <CardDescription>Proactive screening opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {warningGaps.map(gap => {
                  const patient = (patients ?? []).find(p => p.id === gap.patientId)
                  return (
                    <div key={gap.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-amber-900">{gap.title}</div>
                          <div className="text-sm text-amber-700 mt-1">
                            Patient: {patient?.firstName} {patient?.lastName}
                          </div>
                          <div className="text-sm text-amber-600 mt-2">{gap.description}</div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Detected: {format(new Date(gap.detectedAt), 'PPp')}
                          </div>
                        </div>
                        <Badge className="bg-amber-500">WARNING</Badge>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FirstAid className="w-5 h-5" weight="duotone" />
            Allergy Warnings
          </CardTitle>
          <CardDescription>All documented patient allergies</CardDescription>
        </CardHeader>
        <CardContent>
          {allergiesCount === 0 ? (
            <div className="text-sm text-muted-foreground">No allergies documented</div>
          ) : (
            <div className="space-y-4">
              {(patients ?? [])
                .filter(p => p.allergies && p.allergies.length > 0)
                .map(patient => (
                  <div key={patient.id} className="space-y-2">
                    <div className="font-semibold">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies?.map(allergy => (
                        <Badge
                          key={allergy.id}
                          variant="outline"
                          className={
                            allergy.severity === 'severe'
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : allergy.severity === 'moderate'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-blue-500 bg-blue-50 text-blue-700'
                          }
                        >
                          {allergy.allergen} - {allergy.reaction} ({allergy.severity})
                        </Badge>
                      ))}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
