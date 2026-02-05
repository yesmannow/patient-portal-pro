import { WorkflowTemplate, Task, WorkflowEventType, Case, FormSubmission, Appointment } from './types'

export class WorkflowEngine {
  static async processEvent(
    eventType: WorkflowEventType,
    eventData: Case | FormSubmission | Appointment,
    workflows: WorkflowTemplate[],
    providers: any[]
  ): Promise<Task[]> {
    const activeWorkflows = workflows.filter(w => w.active && w.eventType === eventType)
    const createdTasks: Task[] = []

    for (const workflow of activeWorkflows) {
      for (const taskTemplate of workflow.taskTemplates) {
        const task = this.createTaskFromTemplate(taskTemplate, eventData, workflow, providers)
        if (task) {
          createdTasks.push(task)
        }
      }
    }

    return createdTasks
  }

  private static createTaskFromTemplate(
    template: any,
    eventData: any,
    workflow: WorkflowTemplate,
    providers: any[]
  ): Task | null {
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + template.daysOffset)

    let assignedProvider = providers.find(p => p.role === template.assignToRole)
    if (!assignedProvider && providers.length > 0) {
      assignedProvider = providers[0]
    }

    if (!assignedProvider) {
      return null
    }

    const patientId = eventData.patientId || null
    const caseId = 'caseType' in eventData ? eventData.id : eventData.createdCaseId || null

    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      caseId,
      patientId,
      title: template.title,
      description: template.description,
      dueDate: dueDate.toISOString(),
      assignedToProviderId: assignedProvider.id,
      status: 'todo',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      createdByWorkflow: workflow.id,
    }
  }

  static checkOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date()
    return tasks.filter(task => {
      if (task.status === 'done') return false
      const dueDate = new Date(task.dueDate)
      return dueDate < now
    })
  }

  static deduplicateTasks(existingTasks: Task[], newTasks: Task[]): Task[] {
    const uniqueTasks: Task[] = []
    
    for (const newTask of newTasks) {
      const isDuplicate = existingTasks.some(existing => 
        existing.title === newTask.title &&
        existing.patientId === newTask.patientId &&
        existing.dueDate === newTask.dueDate &&
        existing.status !== 'done'
      )
      
      if (!isDuplicate) {
        uniqueTasks.push(newTask)
      }
    }
    
    return uniqueTasks
  }
}
