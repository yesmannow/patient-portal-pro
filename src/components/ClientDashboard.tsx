import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Case, Appointment } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { CalendarBlank, ChatCircle, Plus, Clock, CheckCircle } from '@phosphor-icons/react'
import { NewCaseDialog } from './NewCaseDialog'
import { CaseDetailDialog } from './CaseDetailDialog'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

const statusColors = {
  'Open': 'bg-[var(--status-open)] text-white',
  'In Review': 'bg-[var(--status-review)] text-white',
  'Waiting on Client': 'bg-[var(--status-waiting)] text-white',
  'Resolved': 'bg-[var(--status-resolved)] text-white',
}

const priorityColors = {
  high: 'border-l-[var(--priority-high)]',
  medium: 'border-l-[var(--priority-medium)]',
  low: 'border-l-[var(--priority-low)]',
}

export function ClientDashboard() {
  const { currentUser } = useAuth()
  const [cases, setCases] = useKV<Case[]>('cases', [])
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])
  const [newCaseOpen, setNewCaseOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  const myCases = (cases ?? []).filter(c => c.clientId === currentUser?.id)
  const myAppointments = (appointments ?? [])
    .filter(a => a.clientId === currentUser?.id && a.status === 'scheduled')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const activeCases = myCases.filter(c => c.status !== 'Resolved')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser?.name}</h1>
          <p className="text-muted-foreground mt-1">Manage your cases and appointments</p>
        </div>
        <Button onClick={() => setNewCaseOpen(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Case
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <ChatCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {myCases.length} total cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarBlank className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {myAppointments[0] ? format(new Date(myAppointments[0].dateTime), 'MMM d, h:mm a') : 'None scheduled'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~2h</div>
            <p className="text-xs text-muted-foreground mt-1">Average reply time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
            <CardDescription>Recent inquiries and communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myCases.length === 0 ? (
              <div className="text-center py-12">
                <ChatCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                <p className="text-muted-foreground">No cases yet</p>
                <Button variant="link" onClick={() => setNewCaseOpen(true)} className="mt-2">
                  Create your first case
                </Button>
              </div>
            ) : (
              myCases.slice(0, 5).map((caseItem) => (
                <motion.div
                  key={caseItem.id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card 
                    className={`cursor-pointer border-l-4 ${priorityColors[caseItem.priority]} hover:border-primary/30 hover:shadow-md transition-all`}
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{caseItem.subject}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {caseItem.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(caseItem.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={statusColors[caseItem.status]}>
                          {caseItem.status === 'Resolved' && <CheckCircle className="w-3 h-3 mr-1" weight="fill" />}
                          {caseItem.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarBlank className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              myAppointments.slice(0, 5).map((appointment) => (
                <Card key={appointment.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CalendarBlank className="w-4 h-4 text-primary" weight="duotone" />
                          <p className="font-semibold">
                            {format(new Date(appointment.dateTime), 'EEEE, MMMM d')}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(appointment.dateTime), 'h:mm a')} • {appointment.location}
                        </p>
                        <p className="text-sm mt-2">{appointment.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <NewCaseDialog open={newCaseOpen} onOpenChange={setNewCaseOpen} />
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
