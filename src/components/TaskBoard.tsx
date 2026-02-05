import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Task, Patient, Case, Provider } from '@/lib/types'
import { WorkflowEngine } from '@/lib/workflow-engine'
import { useAuth } from '@/lib/auth-context'
import { format, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { CheckSquare, Clock, Warning, User, FolderOpen, Tag } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { TaskDetailDialog } from './TaskDetailDialog'

const statusColors = {
  todo: 'bg-slate-100 text-slate-700 border-slate-300',
  inProgress: 'bg-blue-100 text-blue-700 border-blue-300',
  done: 'bg-green-100 text-green-700 border-green-300',
}

export function TaskBoard() {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [cases] = useKV<Case[]>('cases', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all')
  const [filterPatient, setFilterPatient] = useState<string>('all')

  const currentProvider = providers?.find(p => p.email === currentUser?.email)

  const providerTasks = (tasks || []).filter(task => 
    currentProvider ? task.assignedToProviderId === currentProvider.id : false
  )

  const overdueTasks = WorkflowEngine.checkOverdueTasks(providerTasks)

  const filteredTasks = providerTasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterPatient !== 'all' && task.patientId !== filterPatient) return false
    return true
  })

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo').sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ),
    inProgress: filteredTasks.filter(t => t.status === 'inProgress').sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    ),
    done: filteredTasks.filter(t => t.status === 'done').sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  }

  const getPatientName = (patientId?: string) => {
    if (!patientId) return 'Unassigned'
    const patient = patients?.find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  }

  const getCaseSubject = (caseId?: string) => {
    if (!caseId) return null
    const linkedCase = cases?.find(c => c.id === caseId)
    return linkedCase?.subject
  }

  const isOverdue = (task: Task) => {
    return task.status !== 'done' && isPast(new Date(task.dueDate))
  }

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isThisWeek(date)) return format(date, 'EEEE')
    return format(date, 'MMM d')
  }

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks((currentTasks) =>
      (currentTasks || []).map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    )
  }

  const taskCounts = {
    total: providerTasks.length,
    todo: tasksByStatus.todo.length,
    inProgress: tasksByStatus.inProgress.length,
    done: tasksByStatus.done.length,
    overdue: overdueTasks.length,
  }

  if (!currentProvider) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Warning className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
            <p className="text-muted-foreground">Provider profile not found. Please contact administrator.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Task Board</h1>
          <p className="text-muted-foreground mt-1">Manage your assigned clinical workflow tasks</p>
        </div>
        {overdueTasks.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1.5">
            <Warning className="w-4 h-4" weight="fill" />
            {overdueTasks.length} Overdue
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCounts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCounts.todo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCounts.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Warning className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{taskCounts.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPatient} onValueChange={setFilterPatient}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patients?.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {(['todo', 'inProgress', 'done'] as const).map(status => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                {status === 'todo' && <FolderOpen className="w-5 h-5" />}
                {status === 'inProgress' && <Clock className="w-5 h-5" />}
                {status === 'done' && <CheckSquare className="w-5 h-5" />}
                {status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : 'Done'}
              </CardTitle>
              <CardDescription>{tasksByStatus[status].length} tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByStatus[status].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No {status === 'todo' ? 'pending' : status === 'inProgress' ? 'active' : 'completed'} tasks
                </div>
              ) : (
                tasksByStatus[status].map(task => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        isOverdue(task) ? 'border-l-4 border-l-destructive bg-red-50/30' : ''
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={statusColors[task.status]} variant="outline">
                              {status === 'inProgress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done'}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                          )}

                          {task.caseId && getCaseSubject(task.caseId) && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Tag className="w-3 h-3" />
                              <span className="truncate">Case: {getCaseSubject(task.caseId)}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{getPatientName(task.patientId)}</span>
                            </div>
                            <div className={`flex items-center gap-1 font-medium ${
                              isOverdue(task) ? 'text-red-600 font-bold' : ''
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{getDueDateLabel(task.dueDate)}</span>
                              {isOverdue(task) && <Warning className="w-3 h-3 ml-0.5" weight="fill" />}
                            </div>
                          </div>

                          {status !== 'done' && (
                            <div className="flex gap-2 mt-3">
                              {status === 'todo' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateTaskStatus(task.id, 'inProgress')
                                  }}
                                >
                                  Start
                                </Button>
                              )}
                              {status === 'inProgress' && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateTaskStatus(task.id, 'done')
                                  }}
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onUpdateStatus={updateTaskStatus}
        />
      )}
    </div>
  )
}
