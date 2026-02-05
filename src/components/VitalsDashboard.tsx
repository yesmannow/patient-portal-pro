import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { VitalSigns, Patient } from '@/lib/types'
import { Heart, Thermometer, ScalesIcon, Warning } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface VitalsDashboardProps {
  patientId: string
}

export function VitalsDashboard({ patientId }: VitalsDashboardProps) {
  const [vitals] = useKV<VitalSigns[]>('vitals', [])
  const [patients] = useKV<Patient[]>('patients', [])

  const patient = patients?.find(p => p.id === patientId)
  const patientVitals = (vitals ?? [])
    .filter(v => v.patientId === patientId)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())

  const latestVitals = patientVitals[0]

  const bpData = useMemo(() => {
    return patientVitals
      .filter(v => v.bloodPressureSystolic && v.bloodPressureDiastolic)
      .slice(0, 10)
      .reverse()
      .map(v => ({
        date: format(new Date(v.recordedAt), 'MM/dd'),
        systolic: v.bloodPressureSystolic,
        diastolic: v.bloodPressureDiastolic
      }))
  }, [patientVitals])

  const bmiData = useMemo(() => {
    return patientVitals
      .filter(v => v.bmi)
      .slice(0, 10)
      .reverse()
      .map(v => ({
        date: format(new Date(v.recordedAt), 'MM/dd'),
        bmi: v.bmi
      }))
  }, [patientVitals])

  const getBPStatus = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return { status: 'Unknown', color: 'bg-slate-500' }
    if (systolic >= 140 || diastolic >= 90) return { status: 'High', color: 'bg-red-600' }
    if (systolic >= 130 || diastolic >= 80) return { status: 'Elevated', color: 'bg-amber-600' }
    return { status: 'Normal', color: 'bg-green-600' }
  }

  const getBMIStatus = (bmi?: number) => {
    if (!bmi) return { status: 'Unknown', color: 'bg-slate-500' }
    if (bmi >= 30) return { status: 'Obese', color: 'bg-red-600' }
    if (bmi >= 25) return { status: 'Overweight', color: 'bg-amber-600' }
    if (bmi >= 18.5) return { status: 'Normal', color: 'bg-green-600' }
    return { status: 'Underweight', color: 'bg-blue-600' }
  }

  const bpStatus = getBPStatus(latestVitals?.bloodPressureSystolic, latestVitals?.bloodPressureDiastolic)
  const bmiStatus = getBMIStatus(latestVitals?.bmi)

  if (!patient) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Patient not found
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {latestVitals && (
        (latestVitals.bloodPressureSystolic && latestVitals.bloodPressureSystolic >= 140) ||
        (latestVitals.bmi && latestVitals.bmi >= 30)
      ) && (
        <Alert variant="destructive">
          <Warning className="w-4 h-4" />
          <AlertDescription>
            Critical vital signs detected. Please review immediately.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" weight="duotone" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestVitals?.bloodPressureSystolic && latestVitals?.bloodPressureDiastolic ? (
              <>
                <div className="text-2xl font-bold">
                  {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={bpStatus.color}>{bpStatus.status}</Badge>
                  <span className="text-xs text-muted-foreground">mmHg</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" weight="duotone" />
              Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestVitals?.heartRate ? (
              <>
                <div className="text-2xl font-bold">{latestVitals.heartRate}</div>
                <div className="text-xs text-muted-foreground mt-2">bpm</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ScalesIcon className="w-4 h-4" weight="duotone" />
              BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestVitals?.bmi ? (
              <>
                <div className="text-2xl font-bold">{latestVitals.bmi.toFixed(1)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={bmiStatus.color}>{bmiStatus.status}</Badge>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="w-4 h-4" weight="duotone" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestVitals?.temperature ? (
              <>
                <div className="text-2xl font-bold">{latestVitals.temperature}°</div>
                <div className="text-xs text-muted-foreground mt-2">Fahrenheit</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {bpData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
            <CardDescription>Last 10 readings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 240)" />
                <XAxis dataKey="date" stroke="oklch(0.50 0.02 240)" />
                <YAxis stroke="oklch(0.50 0.02 240)" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="oklch(0.55 0.22 25)" 
                  strokeWidth={2}
                  name="Systolic"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="oklch(0.50 0.12 230)" 
                  strokeWidth={2}
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {bmiData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>BMI Trend</CardTitle>
            <CardDescription>Last 10 readings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bmiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 240)" />
                <XAxis dataKey="date" stroke="oklch(0.50 0.02 240)" />
                <YAxis stroke="oklch(0.50 0.02 240)" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="oklch(0.45 0.15 245)" 
                  strokeWidth={2}
                  name="BMI"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {patientVitals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" weight="duotone" />
            <p className="text-muted-foreground">No vital signs recorded for this patient yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
