import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APIServices } from '@/lib/api-services'
import { Patient, HousingStatus, TransportationAccess } from '@/lib/types'
import { CheckCircle, XCircle, Warning, User, Phone, Envelope, MapPin, Sparkle, House, Car, Briefcase } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ValidationStatus {
  phone?: { valid: boolean; message: string; canSms: boolean }
  email?: { valid: boolean; message: string; score: number }
  address?: { valid: boolean; message: string; formatted?: string }
}

export function PatientIntakeForm() {
  const [patients, setPatients] = useKV<Patient[]>('patients', [])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    mrn: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    housingStatus: '' as HousingStatus | '',
    transportationAccess: '' as TransportationAccess | '',
    employmentStatus: '',
    preferredLanguage: '',
  })
  const [validation, setValidation] = useState<ValidationStatus>({})
  const [isValidating, setIsValidating] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const handlePhoneValidation = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setValidation(prev => ({
        ...prev,
        phone: { valid: false, message: 'Phone number too short', canSms: false }
      }))
      return
    }

    setIsValidating(true)
    try {
      const result = await APIServices.validatePhone(formData.phone)
      setValidation(prev => ({
        ...prev,
        phone: {
          valid: result.valid,
          message: result.valid
            ? `${result.lineType.toUpperCase()} - ${result.carrier || 'Unknown carrier'}`
            : 'Invalid phone number',
          canSms: result.canReceiveSms,
        }
      }))
      
      if (!result.canReceiveSms) {
        toast.warning('This appears to be a landline. Patient may not receive SMS confirmations.')
      }
    } catch (error) {
      toast.error('Phone validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  const handleEmailValidation = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setValidation(prev => ({
        ...prev,
        email: { valid: false, message: 'Invalid email format', score: 0 }
      }))
      return
    }

    setIsValidating(true)
    try {
      const result = await APIServices.validateEmail(formData.email)
      setValidation(prev => ({
        ...prev,
        email: {
          valid: result.valid && !result.disposable,
          message: result.disposable
            ? 'Disposable email detected - please use permanent email'
            : result.roleAccount
            ? 'Role account (e.g., info@) - personal email preferred'
            : `Quality Score: ${result.score}/100`,
          score: result.score,
        }
      }))

      if (result.disposable) {
        toast.error('Please provide a permanent email address for medical communications')
      }
    } catch (error) {
      toast.error('Email validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  const handleAddressValidation = async () => {
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      setValidation(prev => ({
        ...prev,
        address: { valid: false, message: 'All address fields required' }
      }))
      return
    }

    setIsValidating(true)
    try {
      const result = await APIServices.validateAddress({
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      })
      
      setValidation(prev => ({
        ...prev,
        address: {
          valid: result.valid,
          message: result.valid
            ? 'Address verified with USPS'
            : 'Address could not be verified',
          formatted: result.formatted,
        }
      }))

      if (result.valid && result.formatted) {
        setFormData(prev => ({
          ...prev,
          street: result.street,
          city: result.city,
          state: result.state,
          zipCode: result.zipCode,
        }))
        toast.success('Address standardized and verified')
      }
    } catch (error) {
      toast.error('Address validation failed')
    } finally {
      setIsValidating(false)
    }
  }

  const validateAll = async () => {
    setShowValidation(true)
    setIsValidating(true)
    
    await Promise.all([
      handlePhoneValidation(),
      handleEmailValidation(),
      handleAddressValidation(),
    ])
    
    setIsValidating(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await validateAll()

    const hasErrors =
      validation.phone?.valid === false ||
      validation.email?.valid === false ||
      validation.address?.valid === false

    if (hasErrors) {
      toast.error('Please fix validation errors before submitting')
      return
    }

    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      mrn: formData.mrn || `MRN${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      phoneValidated: validation.phone?.valid || false,
      phoneLineType: validation.phone?.valid ? 
        (validation.phone.message.includes('MOBILE') ? 'mobile' : 
         validation.phone.message.includes('LANDLINE') ? 'landline' : 
         validation.phone.message.includes('VOIP') ? 'voip' : 'unknown') : undefined,
      phoneCarrier: validation.phone?.valid ? validation.phone.message.split(' - ')[1] : undefined,
      canReceiveSms: validation.phone?.canSms || false,
      dateOfBirth: formData.dateOfBirth || '1990-01-01',
      preferredContactMethod: validation.phone?.canSms ? 'sms' : 'email',
      conditionType: 'primaryCare',
      patientStatus: 'new',
      onboardingSource: 'intakeForm',
      createdAt: new Date().toISOString(),
      hipaaFormCompleted: false,
      intakeFormCompleted: true,
      address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      insuranceStatus: formData.insuranceProvider ? 'active' : 'unknown',
      insuranceProvider: formData.insuranceProvider || undefined,
      insurancePolicyNumber: formData.insurancePolicyNumber || undefined,
      sdoh: {
        housingStatus: (formData.housingStatus as HousingStatus) || 'unknown',
        transportationAccess: (formData.transportationAccess as TransportationAccess) || 'unknown',
        employmentStatus: formData.employmentStatus || undefined,
        preferredLanguage: formData.preferredLanguage || 'English',
      },
    }

    setPatients(current => [...(current || []), newPatient])
    toast.success('Patient registered successfully with validated contact information')
    
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      dateOfBirth: '',
      mrn: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      housingStatus: '',
      transportationAccess: '',
      employmentStatus: '',
      preferredLanguage: '',
    })
    setValidation({})
    setShowValidation(false)
  }

  const getValidationIcon = (status?: { valid: boolean }) => {
    if (!showValidation || !status) return null
    return status.valid ? (
      <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" weight="fill" />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Intake</h1>
        <p className="text-muted-foreground mt-1">Automated data validation prevents bad contact info</p>
      </div>

      <Alert className="bg-accent/10 border-accent">
        <Sparkle className="w-4 h-4" weight="duotone" />
        <AlertDescription>
          <strong>Gold Standard Automation:</strong> Phone numbers are validated for SMS capability, 
          emails are screened for disposable addresses, and physical addresses are verified against USPS standards.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" weight="duotone" />
            New Patient Registration
          </CardTitle>
          <CardDescription>All contact information is validated in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="demographics" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="insurance">Insurance & Admin</TabsTrigger>
              <TabsTrigger value="sdoh">Social Determinants</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="demographics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" weight="duotone" />
                Phone Number
                {getValidationIcon(validation.phone)}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="555-123-4567"
                  required
                />
                <Button type="button" onClick={handlePhoneValidation} disabled={isValidating} variant="outline">
                  Validate
                </Button>
              </div>
              {showValidation && validation.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={validation.phone.valid ? 'default' : 'destructive'}>
                    {validation.phone.message}
                  </Badge>
                  {validation.phone.canSms && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      SMS Capable
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Envelope className="w-4 h-4" weight="duotone" />
                Email Address
                {getValidationIcon(validation.email)}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="patient@example.com"
                  required
                />
                <Button type="button" onClick={handleEmailValidation} disabled={isValidating} variant="outline">
                  Validate
                </Button>
              </div>
              {showValidation && validation.email && (
                <Badge variant={validation.email.valid ? 'default' : 'destructive'}>
                  {validation.email.message}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" weight="duotone" />
                Address
                {getValidationIcon(validation.address)}
              </Label>
              
              <div className="space-y-2">
                <Input
                  id="street"
                  value={formData.street}
                  onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  id="city"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  required
                />
                <Input
                  id="state"
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  maxLength={2}
                  required
                />
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={e => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="ZIP Code"
                  required
                />
              </div>

              <Button type="button" onClick={handleAddressValidation} disabled={isValidating} variant="outline" className="w-full">
                Verify Address with USPS
              </Button>

              {showValidation && validation.address && (
                <Badge variant={validation.address.valid ? 'default' : 'destructive'} className="w-full justify-center py-2">
                  {validation.address.message}
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insurance" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
              <Input
                id="mrn"
                value={formData.mrn}
                onChange={e => setFormData(prev => ({ ...prev, mrn: e.target.value }))}
                placeholder="Auto-generated if left blank"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={e => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                placeholder="e.g., Blue Cross, Medicare"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={e => setFormData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
                placeholder="Insurance policy/member ID"
              />
            </div>
          </TabsContent>

          <TabsContent value="sdoh" className="space-y-4">
            <Alert>
              <House className="w-4 h-4" weight="duotone" />
              <AlertDescription>
                Social determinants of health help us understand barriers to care and provide appropriate support.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="housingStatus" className="flex items-center gap-2">
                <House className="w-4 h-4" weight="duotone" />
                Housing Status
              </Label>
              <Select
                value={formData.housingStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, housingStatus: value as HousingStatus }))}
              >
                <SelectTrigger id="housingStatus">
                  <SelectValue placeholder="Select housing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="unstable">Unstable</SelectItem>
                  <SelectItem value="homeless">Homeless</SelectItem>
                  <SelectItem value="assisted">Assisted Living</SelectItem>
                  <SelectItem value="unknown">Prefer not to answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportationAccess" className="flex items-center gap-2">
                <Car className="w-4 h-4" weight="duotone" />
                Transportation Access
              </Label>
              <Select
                value={formData.transportationAccess}
                onValueChange={(value) => setFormData(prev => ({ ...prev, transportationAccess: value as TransportationAccess }))}
              >
                <SelectTrigger id="transportationAccess">
                  <SelectValue placeholder="Select transportation access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own">Own Vehicle</SelectItem>
                  <SelectItem value="public">Public Transportation</SelectItem>
                  <SelectItem value="limited">Limited Access</SelectItem>
                  <SelectItem value="none">No Access</SelectItem>
                  <SelectItem value="unknown">Prefer not to answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentStatus" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" weight="duotone" />
                Employment Status
              </Label>
              <Select
                value={formData.employmentStatus}
                onValueChange={(value) => setFormData(prev => ({ ...prev, employmentStatus: value }))}
              >
                <SelectTrigger id="employmentStatus">
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed Full-Time</SelectItem>
                  <SelectItem value="part-time">Employed Part-Time</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="unknown">Prefer not to answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <Input
                id="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={e => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                placeholder="English"
              />
            </div>
          </TabsContent>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isValidating} className="flex-1">
                {isValidating ? 'Validating...' : 'Register Patient'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    dateOfBirth: '',
                    mrn: '',
                    insuranceProvider: '',
                    insurancePolicyNumber: '',
                    housingStatus: '',
                    transportationAccess: '',
                    employmentStatus: '',
                    preferredLanguage: '',
                  })
                  setValidation({})
                  setShowValidation(false)
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
