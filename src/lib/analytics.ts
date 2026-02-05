import { Case, Task, Patient, AnalyticsInsight } from './types'

export async function generateAnalyticsInsights(
  cases: Case[],
  tasks: Task[],
  patients: Patient[]
): Promise<AnalyticsInsight[]> {
  const insights: AnalyticsInsight[] = []
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const recentCases = cases.filter(c => new Date(c.createdAt) > thirtyDaysAgo)
  const urgentCases = recentCases.filter(c => c.urgency === 'urgent')
  
  if (urgentCases.length > recentCases.length * 0.3 && recentCases.length > 10) {
    insights.push({
      id: `insight-urgent-${Date.now()}`,
      type: 'alert',
      severity: 'warning',
      title: 'Rising Urgent Cases',
      description: `${urgentCases.length} of ${recentCases.length} cases (${Math.round(urgentCases.length / recentCases.length * 100)}%) in the last 30 days were marked urgent. Consider reviewing triage protocols or increasing staff availability.`,
      actionText: 'Review urgent cases',
      generatedAt: now.toISOString(),
    })
  }

  const overdueTasks = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < now)
  if (overdueTasks.length > 5) {
    insights.push({
      id: `insight-overdue-${Date.now()}`,
      type: 'alert',
      severity: 'critical',
      title: 'Overdue Tasks Require Attention',
      description: `${overdueTasks.length} tasks are past their due date. Reassign or extend deadlines to keep workflow moving.`,
      actionText: 'View overdue tasks',
      generatedAt: now.toISOString(),
    })
  }

  const completedTasks = tasks.filter(t => t.status === 'done')
  const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0
  if (completionRate > 0.85 && tasks.length > 20) {
    insights.push({
      id: `insight-completion-${Date.now()}`,
      type: 'trend',
      severity: 'info',
      title: 'Excellent Task Completion Rate',
      description: `Your team has completed ${Math.round(completionRate * 100)}% of tasks. Keep up the great workflow discipline!`,
      generatedAt: now.toISOString(),
    })
  }

  const unresolvedCases = cases.filter(c => c.status !== 'resolved')
  const avgResolutionTime = await calculateAvgResolutionTime(cases)
  if (unresolvedCases.length > 50) {
    insights.push({
      id: `insight-backlog-${Date.now()}`,
      type: 'suggestion',
      severity: 'warning',
      title: 'Case Backlog Building',
      description: `${unresolvedCases.length} open cases detected. Consider adding temporary provider hours or streamlining response workflows.`,
      actionText: 'Review case distribution',
      generatedAt: now.toISOString(),
    })
  }

  const chronicCareCases = cases.filter(c => {
    const patient = patients.find(p => p.id === c.patientId)
    return patient?.conditionType === 'chronicCare'
  })
  
  if (chronicCareCases.length > 0) {
    const unresolvedChronic = chronicCareCases.filter(c => c.status !== 'resolved')
    if (unresolvedChronic.length > chronicCareCases.length * 0.4) {
      insights.push({
        id: `insight-chronic-${Date.now()}`,
        type: 'suggestion',
        severity: 'info',
        title: 'Chronic Care Follow-Up Opportunity',
        description: `${unresolvedChronic.length} chronic care cases need attention. Consider sending preventive care reminders or scheduling check-ins.`,
        actionText: 'View chronic care patients',
        generatedAt: now.toISOString(),
      })
    }
  }

  return insights
}

async function calculateAvgResolutionTime(cases: Case[]): Promise<number> {
  const resolvedCases = cases.filter(c => c.status === 'resolved')
  if (resolvedCases.length === 0) return 0

  const totalTime = resolvedCases.reduce((sum, c) => {
    const created = new Date(c.createdAt).getTime()
    const updated = new Date(c.updatedAt).getTime()
    return sum + (updated - created)
  }, 0)

  return totalTime / resolvedCases.length / (1000 * 60 * 60)
}

export function groupCasesByType(cases: Case[]) {
  return cases.reduce((acc, c) => {
    acc[c.caseType] = (acc[c.caseType] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function groupCasesByUrgency(cases: Case[]) {
  return cases.reduce((acc, c) => {
    acc[c.urgency] = (acc[c.urgency] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function getCaseVolumeOverTime(cases: Case[], days: number = 30) {
  const now = new Date()
  const data: { date: string; count: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const count = cases.filter(c => {
      const createdDate = new Date(c.createdAt)
      return createdDate >= date && createdDate < nextDate
    }).length

    data.push({
      date: date.toISOString().split('T')[0],
      count,
    })
  }

  return data
}
