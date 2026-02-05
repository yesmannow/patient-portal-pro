import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Case, Appointment, Patient, CaseStatus } from '@/lib/types'
import { ChatCircle, CalendarBlank, ChartLine, Users, FunnelSimple } from '@phosphor-icons/react'
import { CaseDetailDialog } from './CaseDetailDialog'
import { ProviderCaseCard } from './ProviderCaseCard'
import { format } from 'date-fns'

export function ProviderDashboard() {
  const [cases, setCases] = useKV<Case[]>('cases', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const allCases = cases ?? []
  const filteredCases = statusFilter === 'all' 
    ? allCases 
    : allCases.filter(c => c.status === statusFilter)

  const activeCases = allCases.filter(c => c.status !== 'resolved')
  const upcomingAppointments = (appointments ?? [])
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const avgResponseTime = 1.8

  const handleStatusChange = (caseId: string, newStatus: CaseStatus) => {
    setCases((current) => 
      (current ?? []).map(c => 
        c.id === caseId 
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
          : c
      )
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage patient cases, appointments, and communications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <ChatCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {allCases.length} total cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <CalendarBlank className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next: {upcomingAppointments[0] ? format(new Date(upcomingAppointments[0].dateTime), 'MMM d') : 'None'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <ChartLine className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">↓ 15%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(patients ?? []).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active patient base</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">
            <ChatCircle className="w-4 h-4 mr-2" />
            Cases
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <CalendarBlank className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Case Management</h2>
            <div className="flex items-center gap-2">
              <FunnelSimple className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="awaitingPatient">Awaiting Patient</SelectItem>
                  <SelectItem value="awaitingProvider">Awaiting Provider</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ChatCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                  <p className="text-muted-foreground">
                    {statusFilter === 'all' ? 'No cases yet' : `No ${statusFilter} cases`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCases.map((caseItem) => (
                <ProviderCaseCard
                  key={caseItem.id}
                  case={caseItem}
                  onClick={() => setSelectedCase(caseItem)}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalendarBlank className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.slice(0, 10).map((appointment) => (
                <Card key={appointment.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CalendarBlank className="w-5 h-5 text-primary" weight="duotone" />
                          <div>
                            <p className="font-semibold">
                              {format(new Date(appointment.dateTime), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.dateTime), 'h:mm a')} • {appointment.location}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm mt-3">{appointment.reason}</p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCase && (
        <CaseDetailDialog 
          case={selectedCase} 
          open={!!selectedCase} 
          onOpenChange={(open) => !open && setSelectedCase(null)} 
        />
      )}
    </div>
  )
}
