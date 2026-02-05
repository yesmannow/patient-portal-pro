import { useAuth } from '@/lib/auth-context'
import { useKV } from '@github/spark/hooks'
import { Patient } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Envelope, 
  Phone, 
  CalendarBlank, 
  Heart, 
  ChartLine, 
  At, 
  DeviceMobile 
} from '@phosphor-icons/react'
import { format } from 'date-fns'

const preferredContactMethodLabels = {
  portal: 'Patient Portal',
  email: 'Email',
  sms: 'SMS Text',
  voice: 'Voice Call',
}

const conditionTypeLabels = {
  primaryCare: 'Primary Care',
  physicalTherapy: 'Physical Therapy',
  chronicCare: 'Chronic Care Management',
  postOp: 'Post-Operative Care',
  wellness: 'Wellness & Prevention',
}

const patientStatusLabels = {
  new: 'New Patient',
  active: 'Active',
  dormant: 'Dormant',
  discharged: 'Discharged',
}

const onboardingSourceLabels = {
  intakeForm: 'Online Intake Form',
  referral: 'Provider Referral',
  phone: 'Phone Registration',
  website: 'Website Signup',
}

const statusColors = {
  new: 'bg-blue-500 text-white',
  active: 'bg-green-600 text-white',
  dormant: 'bg-amber-500 text-white',
  discharged: 'bg-gray-500 text-white',
}

const contactMethodIcons = {
  portal: At,
  email: Envelope,
  sms: DeviceMobile,
  voice: Phone,
}

export function PatientProfile() {
  const { currentUser } = useAuth()
  const [patients] = useKV<Patient[]>('patients', [])

  const currentPatient = (patients ?? []).find(p => p.email === currentUser?.email)

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
            <h3 className="font-semibold text-lg mb-2">Profile Not Found</h3>
            <p className="text-muted-foreground text-sm">
              We couldn't locate your patient profile. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ContactMethodIcon = contactMethodIcons[currentPatient.preferredContactMethod]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">View and manage your patient information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {currentPatient.firstName} {currentPatient.lastName}
                </CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <CalendarBlank className="w-4 h-4" />
                  Born {format(new Date(currentPatient.dateOfBirth), 'MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Badge className={statusColors[currentPatient.patientStatus]}>
                {patientStatusLabels[currentPatient.patientStatus]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Envelope className="w-5 h-5 text-primary" weight="duotone" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="font-medium">{currentPatient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="w-5 h-5 text-primary" weight="duotone" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{currentPatient.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Care Details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Heart className="w-5 h-5 text-accent mt-0.5" weight="duotone" />
                  <div>
                    <p className="text-xs text-muted-foreground">Condition Type</p>
                    <p className="font-medium text-sm">{conditionTypeLabels[currentPatient.conditionType]}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <ChartLine className="w-5 h-5 text-accent mt-0.5" weight="duotone" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patient Status</p>
                    <p className="font-medium text-sm">{patientStatusLabels[currentPatient.patientStatus]}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferred Contact</CardTitle>
              <CardDescription>How we'll reach you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <ContactMethodIcon className="w-5 h-5 text-primary" weight="duotone" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    {preferredContactMethodLabels[currentPatient.preferredContactMethod]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Primary method</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrollment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Onboarding Source</p>
                <Badge variant="outline" className="font-normal">
                  {onboardingSourceLabels[currentPatient.onboardingSource]}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient Since</p>
                <p className="font-medium text-sm">
                  {format(new Date(currentPatient.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
