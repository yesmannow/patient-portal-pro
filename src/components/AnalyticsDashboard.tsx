import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Case, Task, Patient, AnalyticsInsight } from '@/lib/types'
import { generateAnalyticsInsights, getCaseVolumeOverTime, groupCasesByType, groupCasesByUrgency } from '@/lib/analytics'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartLine, Lightbulb, TrendUp, Warning, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

const CHART_COLORS = ['oklch(0.50 0.12 230)', 'oklch(0.60 0.15 290)', 'oklch(0.60 0.20 25)', 'oklch(0.70 0.15 70)', 'oklch(0.55 0.22 25)']

export function AnalyticsDashboard() {
  const [cases] = useKV<Case[]>('cases', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInsights() {
      setLoading(true)
      const generatedInsights = await generateAnalyticsInsights(cases || [], tasks || [], patients || [])
      setInsights(generatedInsights)
      setLoading(false)
    }
    loadInsights()
  }, [cases, tasks, patients])

  const caseVolumeData = getCaseVolumeOverTime(cases || [], 30)
  const casesByType = groupCasesByType(cases || [])
  const casesByUrgency = groupCasesByUrgency(cases || [])

  const caseTypeData = Object.entries(casesByType).map(([type, count]) => ({
    name: type.replace(/([A-Z])/g, ' $1').trim(),
    value: count,
  }))

  const caseUrgencyData = Object.entries(casesByUrgency).map(([urgency, count]) => ({
    name: urgency.charAt(0).toUpperCase() + urgency.slice(1).replace(/([A-Z])/g, ' $1'),
    value: count,
  }))

  const taskCompletionData = [
    { name: 'To Do', value: (tasks || []).filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: (tasks || []).filter(t => t.status === 'inProgress').length },
    { name: 'Done', value: (tasks || []).filter(t => t.status === 'done').length },
  ]

  const insightIcons = {
    trend: TrendUp,
    alert: Warning,
    suggestion: Lightbulb,
  }

  const insightColors = {
    info: 'border-blue-500 bg-blue-50',
    warning: 'border-amber-500 bg-amber-50',
    critical: 'border-red-500 bg-red-50',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-1">Data-driven insights to improve care delivery</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <ChartLine className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(cases || []).filter(c => c.status !== 'resolved').length} unresolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <TrendUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks?.length ? Math.round(((tasks || []).filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(tasks || []).filter(t => t.status === 'done').length} of {tasks?.length || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Info className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(patients || []).filter(p => p.patientStatus === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patients?.length || 0} total patients
            </p>
          </CardContent>
        </Card>
      </div>

      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" weight="duotone" />
            AI-Powered Insights
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => {
              const Icon = insightIcons[insight.type]
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Alert className={`${insightColors[insight.severity]} border-l-4`}>
                    <Icon className="w-5 h-5" />
                    <AlertTitle className="flex items-center gap-2">
                      {insight.title}
                      <Badge variant="outline" className="ml-auto">
                        {insight.type}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      {insight.description}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Volume (Last 30 Days)</CardTitle>
            <CardDescription>Daily case creation trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={caseVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 240)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="oklch(0.50 0.02 240)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="oklch(0.50 0.02 240)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'oklch(0.99 0.002 240)', border: '1px solid oklch(0.88 0.01 240)' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Line type="monotone" dataKey="count" stroke="oklch(0.50 0.12 230)" strokeWidth={2} dot={{ fill: 'oklch(0.50 0.12 230)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution across case categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {caseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'oklch(0.99 0.002 240)', border: '1px solid oklch(0.88 0.01 240)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Urgency</CardTitle>
            <CardDescription>Priority level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caseUrgencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 240)" />
                <XAxis dataKey="name" stroke="oklch(0.50 0.02 240)" style={{ fontSize: '12px' }} />
                <YAxis stroke="oklch(0.50 0.02 240)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'oklch(0.99 0.002 240)', border: '1px solid oklch(0.88 0.01 240)' }} />
                <Bar dataKey="value" fill="oklch(0.50 0.12 230)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>Workflow task status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'oklch(0.99 0.002 240)', border: '1px solid oklch(0.88 0.01 240)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
