import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useKV } from '@github/spark/hooks'
import { Patient, PriorAuthorization } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentManager } from '@/components/DocumentManager'
import { 
  User, 
  Envelope, 
  Phone, 
  CalendarBlank, 
  Heart, 
  ChartLine, 
  At, 
  DeviceMobile,
  IdentificationCard,
  FolderOpen,
  FileText,
  CheckCircle,
  XCircle,
  Warning,
  Clock
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
  const [priorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
  const [activeTab, setActiveTab] = useState('profile')

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <IdentificationCard className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="prior-auth" className="gap-2">
            <FileText className="w-4 h-4" />
            Prior Auth
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
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
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentManager patientId={currentPatient.id} />
        </TabsContent>

        <TabsContent value="prior-auth" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Prior Authorizations</CardTitle>
              <CardDescription>View your current authorization status and history</CardDescription>
            </CardHeader>
            <CardContent>
              {priorAuths.filter(auth => auth.patientId === currentPatient.id).length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
                  <h3 className="text-lg font-medium mb-2">No Prior Authorizations</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any prior authorizations on file.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {priorAuths
                    .filter(auth => auth.patientId === currentPatient.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(auth => {
                      const now = new Date()
                      const endDate = new Date(auth.endDate)
                      const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      const remaining = auth.totalUnits - auth.usedUnits
                      const percentUsed = (auth.usedUnits / auth.totalUnits) * 100

                      let statusBadge
                      let borderColor = 'oklch(0.65 0.15 200)'

                      if (auth.status === 'expired') {
                        statusBadge = <Badge variant="destructive" className="gap-1 font-bold"><XCircle size={14} weight="fill" />Expired</Badge>
                        borderColor = 'oklch(0.55 0.22 25)'
                      } else if (auth.status === 'denied') {
                        statusBadge = <Badge variant="destructive" className="gap-1 font-bold"><XCircle size={14} weight="fill" />Denied</Badge>
                        borderColor = 'oklch(0.55 0.22 25)'
                      } else if (auth.status === 'pending') {
                        statusBadge = <Badge variant="secondary" className="gap-1"><Clock size={14} weight="fill" />Pending</Badge>
                      } else if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
                        statusBadge = <Badge variant="secondary" className="gap-1 bg-warning-moderate text-warning-moderate-foreground"><Warning size={14} weight="fill" />Expires in {daysUntilExpiration}d</Badge>
                      } else {
                        statusBadge = <Badge variant="default" className="gap-1 bg-accent text-accent-foreground"><CheckCircle size={14} weight="fill" />Active</Badge>
                      }

                      return (
                        <Card key={auth.id} className="border-l-4" style={{ borderLeftColor }}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">{auth.serviceName || auth.serviceCode}</h4>
                                {statusBadge}
                              </div>
                              <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Authorization Number:</span>
                                  <span className="font-mono">{auth.authNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Insurer:</span>
                                  <span>{auth.insurerId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Coverage Period:</span>
                                  <span>{format(new Date(auth.startDate), 'MMM d, yyyy')} - {format(new Date(auth.endDate), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Units:</span>
                                  <span className={remaining <= 3 && remaining > 0 ? 'font-bold text-warning-moderate' : ''}>
                                    {auth.usedUnits} / {auth.totalUnits} used ({remaining} remaining)
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-accent transition-all"
                                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                    />
                                  </div>
                                </div>
                                {auth.status === 'denied' && auth.denialReason && (
                                  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm font-bold text-destructive">
                                      Denial Reason: {auth.denialReason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
