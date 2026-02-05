import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendUp, Funnel, Star, Phone } from '@phosphor-icons/react'
import { Patient } from '@/lib/types'

interface FormSubmission {
  id: string
  patientId: string
  formType: string
  submittedAt: string
}

export function MarketingDashboard() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [formSubmissions] = useKV<FormSubmission[]>('form-submissions', [])

  const newPatients = (patients ?? [])
    .filter(p => p.patientStatus === 'new')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const activePatients = (patients ?? []).filter(p => p.patientStatus === 'active')

  const conversionRate = (patients ?? []).length > 0
    ? ((activePatients.length / (patients ?? []).length) * 100).toFixed(1)
    : '0'

  const patientsBySource = (patients ?? []).reduce((acc, patient) => {
    acc[patient.onboardingSource] = (acc[patient.onboardingSource] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recentIntakeSubmissions = (formSubmissions ?? [])
    .filter(sub => sub.formType === 'intake')
    .slice(0, 10)

  const sourceIcons: Record<string, typeof Users> = {
    website: Users,
    phone: Phone,
    referral: Users,
    intakeForm: Funnel,
  }

  const sourceLabels: Record<string, string> = {
    website: 'Website',
    phone: 'Phone Call',
    referral: 'Referral',
    intakeForm: 'Online Form',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing Dashboard</h1>
        <p className="text-muted-foreground mt-1">Lead funnel and patient acquisition tracking</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newPatients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePatients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Converted successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lead to active patient
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Funnel className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(patients ?? []).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All statuses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Funnel className="w-5 h-5" weight="duotone" />
              Lead Sources
            </CardTitle>
            <CardDescription>Patient acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(patientsBySource).map(([source, count]) => {
                const Icon = sourceIcons[source] || Users
                const percentage = ((count / (patients?.length || 1)) * 100).toFixed(0)
                
                return (
                  <div key={source} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-medium">{sourceLabels[source] || source}</p>
                        <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">patients</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" weight="duotone" />
              Recent Intake Form Submissions
            </CardTitle>
            <CardDescription>New patient onboarding activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIntakeSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent intake submissions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIntakeSubmissions.map(submission => {
                  const patient = (patients ?? []).find(p => p.id === submission.patientId)
                  if (!patient) return null
                  
                  return (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
