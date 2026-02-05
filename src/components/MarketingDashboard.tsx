import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { Patient } from '@/lib/types'
interface FormSubmission {
  patientId: string


  const [pat

    .filter(p => p




    acc[patient.onboardingSource] = (acc[patient.onbo
  }, {} as Record<string, number>)

    .slice(0, 10)
  const sourceIcons: Record<string, typeof 
    phone: Phone,



    referral: 'Referral',
  }
  return 

        <p className="text-muted-foreground mt-1">Lead funnel and pati

        <Card>
            <CardTitle className="

            <div className="text-2xl font-bold">{newPatie
              Awaiting conversion
          </CardC

          <CardHeader className="flex flex-row items-
            <Star c
          <CardCo
            <p class
            </p>
   

            <CardTitle className="text-sm font-m
          </CardHeader>
            <div classNa
              Lead to act
          </CardContent>


          
          <CardContent>
           
            </p>
        </Card>


            <CardTitle className="flex items-cent
              
            <CardDescription>Patient acquisition channels</CardDescription>
          <CardContent>
              {Object.entries(patientsBySource).map(([source, c
                const p
                return 
                    <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary"
                      <div>
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

                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">patients</p>
                    </div>

                )

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

}
