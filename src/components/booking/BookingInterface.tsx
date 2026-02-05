import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calendar, Warning, Check, X, ClipboardText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Patient, AppointmentType, Provider, TestResult, AuthorizationRule, ConditionType } from '@/types/appointments'

const PROVIDERS: Provider[] = [
  { id: 'PR-001', name: 'Dr. Sarah Johnson', specialty: 'primary-care', availableConditions: ['chronic-disease', 'preventive-care', 'acute-injury'], availableDays: [1, 2, 3, 4, 5] },
  { id: 'PR-002', name: 'Dr. Michael Chen', specialty: 'orthopedics', availableConditions: ['acute-injury', 'surgical-consult'], availableDays: [1, 3, 5] },
  { id: 'PR-003', name: 'Dr. Emily Rodriguez', specialty: 'psychiatry', availableConditions: ['mental-health'], availableDays: [1, 2, 3, 4, 5] },
  { id: 'PR-004', name: 'Dr. James Wilson', specialty: 'surgery', availableConditions: ['surgical-consult', 'acute-injury'], availableDays: [2, 4] },
  { id: 'PR-005', name: 'Dr. Lisa Park', specialty: 'emergency-medicine', availableConditions: ['emergency', 'acute-injury'], availableDays: [1, 2, 3, 4, 5, 6, 7] }
]

const AUTHORIZATION_RULES: AuthorizationRule[] = [
  {
    conditionType: 'acute-injury',
    appointmentTypes: ['procedure', 'new-patient'],
    requiresAuth: true,
    requiredDocuments: ['Injury report', 'X-ray/imaging results'],
    urgencyLevel: 'high'
  },
  {
    conditionType: 'chronic-disease',
    appointmentTypes: ['new-patient', 'procedure'],
    requiresAuth: true,
    requiredDocuments: ['Medical history', 'Current medication list'],
    urgencyLevel: 'medium'
  },
  {
    conditionType: 'preventive-care',
    appointmentTypes: [],
    requiresAuth: false,
    requiredDocuments: [],
    urgencyLevel: 'low'
  },
  {
    conditionType: 'mental-health',
    appointmentTypes: ['new-patient', 'procedure'],
    requiresAuth: true,
    requiredDocuments: ['Referral letter', 'Mental health assessment'],
    urgencyLevel: 'medium'
  },
  {
    conditionType: 'surgical-consult',
    appointmentTypes: ['new-patient', 'consultation', 'procedure'],
    requiresAuth: true,
    requiredDocuments: ['Referral letter', 'Medical imaging', 'Pre-op assessment'],
    urgencyLevel: 'high'
  },
  {
    conditionType: 'emergency',
    appointmentTypes: [],
    requiresAuth: false,
    requiredDocuments: [],
    urgencyLevel: 'emergency'
  }
]

interface BookingInterfaceProps {
  patient: Patient
  onTestComplete: (result: TestResult) => void
}

export function BookingInterface({ patient, onTestComplete }: BookingInterfaceProps) {
  const [appointmentType, setAppointmentType] = useState<AppointmentType | ''>('')
  const [providerId, setProviderId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [reason, setReason] = useState('')
  const [authNumber, setAuthNumber] = useState('')

  const getAuthRequirement = (conditionType: ConditionType, apptType: AppointmentType | ''): AuthorizationRule | null => {
    if (!apptType) return null
    const rule = AUTHORIZATION_RULES.find(r => r.conditionType === conditionType)
    if (!rule) return null
    return rule.requiresAuth && rule.appointmentTypes.includes(apptType as AppointmentType) ? rule : null
  }

  const authRule = getAuthRequirement(patient.conditionType, appointmentType)
  const requiresAuth = authRule !== null
  const availableProviders = PROVIDERS.filter(p => p.availableConditions.includes(patient.conditionType))

  const validateBooking = (): { isValid: boolean; validationsPassed: string[]; validationsFailed: string[] } => {
    const passed: string[] = []
    const failed: string[] = []

    if (appointmentType) {
      passed.push('Appointment type selected')
    } else {
      failed.push('Appointment type is required')
    }

    if (providerId) {
      const provider = PROVIDERS.find(p => p.id === providerId)
      if (provider && provider.availableConditions.includes(patient.conditionType)) {
        passed.push('Provider specialty matches condition type')
      } else {
        failed.push('Provider specialty does not match condition type')
      }
    } else {
      failed.push('Provider is required')
    }

    if (appointmentDate) {
      const selectedDate = new Date(appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate >= today) {
        passed.push('Appointment date is valid')
      } else {
        failed.push('Appointment date cannot be in the past')
      }
    } else {
      failed.push('Appointment date is required')
    }

    if (appointmentTime) {
      passed.push('Appointment time selected')
    } else {
      failed.push('Appointment time is required')
    }

    if (reason.trim()) {
      passed.push('Reason for visit provided')
    } else {
      failed.push('Reason for visit is required')
    }

    if (requiresAuth) {
      if (patient.hasActiveAuth || authNumber.trim()) {
        passed.push('Authorization requirement met')
      } else {
        failed.push('Prior authorization required but not provided')
      }
    } else {
      passed.push('No authorization required for this booking')
    }

    return {
      isValid: failed.length === 0,
      validationsPassed: passed,
      validationsFailed: failed
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateBooking()
    const provider = PROVIDERS.find(p => p.id === providerId)

    const testResult: TestResult = {
      id: `TEST-${Date.now()}`,
      timestamp: new Date().toISOString(),
      patientName: patient.name,
      conditionType: patient.conditionType,
      appointmentType: appointmentType as AppointmentType,
      providerName: provider?.name || 'Unknown',
      authorizationRequired: requiresAuth,
      authorizationProvided: patient.hasActiveAuth || !!authNumber.trim(),
      status: validation.isValid ? 'success' : 'failed',
      message: validation.isValid 
        ? 'Appointment booking successful - all validations passed'
        : `Booking failed - ${validation.validationsFailed.length} validation(s) failed`,
      details: {
        validationsPassed: validation.validationsPassed,
        validationsFailed: validation.validationsFailed
      }
    }

    onTestComplete(testResult)

    if (validation.isValid) {
      toast.success('Test Passed', {
        description: 'Appointment booked successfully'
      })
      resetForm()
    } else {
      toast.error('Test Failed', {
        description: `${validation.validationsFailed.length} validation error(s)`
      })
    }
  }

  const resetForm = () => {
    setAppointmentType('')
    setProviderId('')
    setAppointmentDate('')
    setAppointmentTime('')
    setReason('')
    setAuthNumber('')
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar size={24} weight="bold" className="text-primary" />
          Book Appointment Test
        </CardTitle>
        <CardDescription>
          Testing booking for <strong>{patient.name}</strong> - {patient.conditionDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-type">Appointment Type *</Label>
              <Select value={appointmentType} onValueChange={(value) => setAppointmentType(value as AppointmentType)}>
                <SelectTrigger id="appointment-type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-patient">New Patient</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="annual-physical">Annual Physical</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="urgent-care">Urgent Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider *</Label>
              <Select value={providerId} onValueChange={setProviderId}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name} - {provider.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableProviders.length === 0 && (
                <p className="text-xs text-destructive">No providers available for this condition type</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Appointment Date *</Label>
              <Input
                id="date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Appointment Time *</Label>
              <Input
                id="time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the reason for this appointment..."
              rows={3}
            />
          </div>

          {requiresAuth && authRule && (
            <Alert className="border-warning bg-warning/5">
              <Warning size={18} weight="bold" className="text-warning" />
              <AlertDescription className="space-y-3">
                <div>
                  <p className="font-semibold text-warning">Prior Authorization Required</p>
                  <p className="text-sm mt-1">
                    This appointment type requires prior authorization for {patient.conditionDescription.toLowerCase()}.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Required Documents:</p>
                  <ul className="text-sm space-y-0.5 ml-4">
                    {authRule.requiredDocuments.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <ClipboardText size={14} weight="bold" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                {!patient.hasActiveAuth && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="auth-number">Authorization Number *</Label>
                    <Input
                      id="auth-number"
                      value={authNumber}
                      onChange={(e) => setAuthNumber(e.target.value)}
                      placeholder="Enter authorization number..."
                    />
                  </div>
                )}

                {patient.hasActiveAuth && (
                  <Badge className="bg-green-100 text-green-700 border-green-300 border">
                    <Check size={14} weight="bold" className="mr-1" />
                    Active Authorization on File
                  </Badge>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!requiresAuth && appointmentType && (
            <Alert className="border-green-300 bg-green-50">
              <Check size={18} weight="bold" className="text-green-600" />
              <AlertDescription>
                <p className="font-semibold text-green-700">No Authorization Required</p>
                <p className="text-sm text-green-600 mt-1">
                  This appointment type does not require prior authorization.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1 sm:flex-none min-h-12 gap-2">
              <Check size={18} weight="bold" />
              Run Booking Test
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none min-h-12 gap-2">
              <X size={18} weight="bold" />
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
