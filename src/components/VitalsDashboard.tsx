import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, Carte
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { VitalSigns, Patient } from '@/lib/types'
import { Activity, Heart, Thermometer, ScaleIcon, ArrowUp, ArrowDown, Warning } from '@phosphor-icons/react'
  patientId: string

  const [vitals] = useKV<VitalSi

 

  const latestVitals = patientVitals[0]
  const bpData = useMemo(() => {
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
        date: format(new Date(v.recordedAt
      }))

    return patientVit

      .map(v => ({
        heartRate: v.hea
  }, [patientVitals])
  const getBPStatus
    if (systolic
    return { statu

    if (!bmi) retur
    if (b
    return { status: 

  const bmiStatus = getBMIStatus(latest
  if (!patient) {
  }
  return (
      {latestVit
        (latestVit
      ) && (
          <Warning className="w
         
        </Alert>

        <Card>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Blood Pressure
          </CardHeader>
            {latestVitals?.bloodPressureSystolic && la
   

                  <Badge className={bpStat
                </div>
            ) : (
            )}
        </Card>
        <Card>
   

          </CardHeader>
            {latestVitals?.heartRate ? (

              </>
              <div className="text-sm text-muted-foreground">No data</div
   

          
              <ScalesIcon class
            </CardTitle>
          <CardContent>
              <>
                <div className="flex items-center gap-2 mt-2">
            
            ) : (
            )}
        </Card>
        <Card>
            <CardTitle classN
              Te
        

                <div className="text-2xl font-bold">{latestVitals.temperatur
              
              <div className="text-sm t
          </CardContent>
      </div>
      {bpData.length > 1 && 
          <CardHeader>
            <CardDescri
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
              <ScaleIcon className="w-4 h-4" weight="duotone" />
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















































