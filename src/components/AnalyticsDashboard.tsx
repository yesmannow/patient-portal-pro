import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useKV } from '@github/spark/hooks'
import { Case, Task, Patient } from '@/lib/types'
import { CheckCircle, Clock, Warning, TrendUp } from '@phosphor-icons/react'

export function AnalyticsDashboard() {
  const [cases] = useKV<Case[]>('cases', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [patients] = useKV<Patient[]>('patients', [])

  const totalCases = cases?.length || 0
  const activeCases = cases?.filter((c) => c.status === 'open' || c.status === 'awaitingPatient' || c.status === 'awaitingProvider').length || 0
  const completedCases = cases?.filter((c) => c.status === 'resolved').length || 0
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((t) => t.status === 'done').length || 0
  const totalPatients = patients?.length || 0

  const stats = [
    {
      title: 'Total Cases',
      value: totalCases,
      icon: TrendUp,
      description: `${activeCases} active, ${completedCases} resolved`,
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: CheckCircle,
      description: `${completedTasks} completed`,
    },
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: Warning,
      description: 'Enrolled in practice',
    },
    {
      title: 'Avg. Response Time',
      value: '2.4h',
      icon: Clock,
      description: 'Average case response',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Overview of practice performance and metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Status Distribution</CardTitle>
            <CardDescription>Breakdown of case statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active</span>
                <span className="font-medium">{activeCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Closed</span>
                <span className="font-medium">{completedCases}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
            <CardDescription>Tasks completed vs. total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <span className="font-medium">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="font-medium">{totalTasks}</span>
              </div>
              {totalTasks > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Rate</span>
                  <span className="font-bold">{Math.round((completedTasks / totalTasks) * 100)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
