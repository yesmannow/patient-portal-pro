import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FormDefinition, FormSubmission, Case, Task, Patient, Provider } from '@/lib/types'
import { WorkflowEngine } from '@/lib/workflow-engine'
import { format } from 'date-fns'
import { FileText, CheckCircle, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PatientFormsProps {
  patientId: string
}

export function PatientForms({ patientId }: PatientFormsProps) {
  const [formDefinitions] = useKV<FormDefinition[]>('form-definitions', [])
  const [submissions, setSubmissions] = useKV<FormSubmission[]>('form-submissions', [])
  const [cases, setCases] = useKV<Case[]>('cases', [])
  const [tasks, setTasks] = useKV<Task[]>('tasks', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [workflows] = useKV<any[]>('workflow-templates', [])
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const activeForms = (formDefinitions || []).filter(f => f.active)
  const mySubmissions = (submissions || []).filter(s => s.patientId === patientId)

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value })
  }

  const submitForm = async () => {
    if (!selectedForm) return

    const requiredFields = selectedForm.fields.filter(f => f.required)
    const missingFields = requiredFields.filter(f => !formData[f.id])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`)
      return
    }

    let createdCaseId: string | undefined
    const createdTaskIds: string[] = []

    if (selectedForm.createCaseOnSubmit && selectedForm.caseType && selectedForm.urgency) {
      const newCase: Case = {
        id: `case-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        patientId,
        caseType: selectedForm.caseType,
        subject: `Form Submission: ${selectedForm.name}`,
        description: `Automated case created from ${selectedForm.name} form submission`,
        urgency: selectedForm.urgency,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setCases((currentCases) => [...(currentCases || []), newCase])
      createdCaseId = newCase.id

      const newTasks = await WorkflowEngine.processEvent(
        'formSubmitted',
        { ...newCase, formDefinitionId: selectedForm.id } as any,
        workflows || [],
        providers || []
      )

      if (newTasks.length > 0) {
        const uniqueTasks = WorkflowEngine.deduplicateTasks(tasks || [], newTasks)
        setTasks((currentTasks) => [...(currentTasks || []), ...uniqueTasks])
        createdTaskIds.push(...uniqueTasks.map(t => t.id))
      }
    }

    const submission: FormSubmission = {
      id: `submission-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      formDefinitionId: selectedForm.id,
      patientId,
      responses: formData,
      submittedAt: new Date().toISOString(),
      createdCaseId,
      createdTaskIds,
    }

    setSubmissions((currentSubmissions) => [...(currentSubmissions || []), submission])
    toast.success('Form submitted successfully')
    setSelectedForm(null)
    setFormData({})
  }

  const renderField = (field: any) => {
    const value = formData[field.id]

    switch (field.fieldType) {
      case 'text':
      case 'number':
        return (
          <Input
            id={field.id}
            type={field.fieldType}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
          />
        )
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )
      case 'select':
        return (
          <Select value={value || ''} onValueChange={(v) => handleFieldChange(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label>{value ? 'Yes' : 'No'}</Label>
          </div>
        )
      default:
        return null
    }
  }

  if (selectedForm) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedForm.name}</CardTitle>
                <CardDescription>{selectedForm.description}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => { setSelectedForm(null); setFormData({}) }}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedForm.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={submitForm} className="flex-1">
                Submit Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Forms</h2>
        <p className="text-muted-foreground mt-1">Complete assigned forms and view submission history</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Forms</CardTitle>
            <CardDescription>Forms you can complete</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeForms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" weight="duotone" />
                <p>No forms available</p>
              </div>
            ) : (
              activeForms.map(form => (
                <Card key={form.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedForm(form)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold">{form.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                        <Badge variant="outline" className="mt-2">{form.fields.length} fields</Badge>
                      </div>
                      <FileText className="w-5 h-5 text-primary" weight="duotone" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>Forms you've completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mySubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" weight="duotone" />
                <p>No submissions yet</p>
              </div>
            ) : (
              mySubmissions.map(submission => {
                const form = formDefinitions?.find(f => f.id === submission.formDefinitionId)
                return (
                  <Card key={submission.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{form?.name || 'Unknown Form'}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Submitted {format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')}
                          </p>
                          {submission.createdCaseId && (
                            <Badge variant="secondary" className="mt-2">Case created</Badge>
                          )}
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
