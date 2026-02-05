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
import { FormDefinition, FormField, CaseType, Urgency } from '@/lib/types'
import { Plus, Trash, DotsSixVertical, TextT, Calendar, ToggleLeft, ListNumbers, TextAlignLeft } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function FormBuilder() {
  const [forms, setForms] = useKV<FormDefinition[]>('form-definitions', [])
  const [editingForm, setEditingForm] = useState<FormDefinition | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [createCase, setCreateCase] = useState(false)
  const [caseType, setCaseType] = useState<CaseType>('question')
  const [urgency, setUrgency] = useState<Urgency>('routine')

  const startNewForm = () => {
    setEditingForm(null)
    setFormName('')
    setFormDescription('')
    setFields([])
    setCreateCase(false)
    setCaseType('question')
    setUrgency('routine')
  }

  const addField = (type: FormField['fieldType']) => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      label: '',
      fieldType: type,
      required: false,
      placeholder: '',
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const saveForm = () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name')
      return
    }
    if (fields.length === 0) {
      toast.error('Please add at least one field')
      return
    }

    const newForm: FormDefinition = {
      id: editingForm?.id || `form-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: formName,
      description: formDescription,
      fields,
      createCaseOnSubmit: createCase,
      caseType: createCase ? caseType : undefined,
      urgency: createCase ? urgency : undefined,
      createTasksOnSubmit: false,
      active: true,
      createdAt: editingForm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setForms((currentForms) => {
      const existing = (currentForms || []).filter(f => f.id !== newForm.id)
      return [...existing, newForm]
    })

    toast.success(editingForm ? 'Form updated' : 'Form created')
    startNewForm()
  }

  const editForm = (form: FormDefinition) => {
    setEditingForm(form)
    setFormName(form.name)
    setFormDescription(form.description)
    setFields(form.fields)
    setCreateCase(form.createCaseOnSubmit)
    setCaseType(form.caseType || 'question')
    setUrgency(form.urgency || 'routine')
  }

  const deleteForm = (formId: string) => {
    setForms((currentForms) => (currentForms || []).filter(f => f.id !== formId))
    toast.success('Form deleted')
  }

  const fieldTypeIcons = {
    text: TextT,
    textarea: TextAlignLeft,
    date: Calendar,
    select: ListNumbers,
    boolean: ToggleLeft,
    number: ListNumbers,
  }

  const fieldTypeLabels = {
    text: 'Text Input',
    textarea: 'Long Text',
    date: 'Date Picker',
    select: 'Dropdown',
    boolean: 'Yes/No',
    number: 'Number',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Builder</h1>
          <p className="text-muted-foreground mt-1">Create custom intake and data collection forms</p>
        </div>
        <Button onClick={startNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          New Form
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingForm ? 'Edit Form' : 'Create New Form'}</CardTitle>
              <CardDescription>Configure form properties and fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name *</Label>
                <Input
                  id="form-name"
                  placeholder="e.g., New Patient Intake"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-description">Description</Label>
                <Textarea
                  id="form-description"
                  placeholder="What is this form for?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 py-2">
                <div className="space-y-0.5">
                  <Label>Auto-create case on submission</Label>
                  <p className="text-sm text-muted-foreground">Automatically open a case when submitted</p>
                </div>
                <Switch checked={createCase} onCheckedChange={setCreateCase} />
              </div>

              {createCase && (
                <div className="grid gap-4 md:grid-cols-2 pl-6 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label>Case Type</Label>
                    <Select value={caseType} onValueChange={(v: CaseType) => setCaseType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="followUp">Follow-Up</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="clinicalConcern">Clinical Concern</SelectItem>
                        <SelectItem value="admin">Administrative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select value={urgency} onValueChange={(v: Urgency) => setUrgency(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="timeSensitive">Time-Sensitive</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Add Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['text', 'textarea', 'date', 'select', 'boolean', 'number'] as const).map(type => {
                    const Icon = fieldTypeIcons[type]
                    return (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addField(type)}
                        className="justify-start"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {fieldTypeLabels[type]}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {fields.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <Label>Form Fields ({fields.length})</Label>
                  {fields.map((field, index) => {
                    const Icon = fieldTypeIcons[field.fieldType]
                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <DotsSixVertical className="w-4 h-4 text-muted-foreground" />
                              <Icon className="w-4 h-4 text-primary" />
                              <Badge variant="secondary">{fieldTypeLabels[field.fieldType]}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto"
                                onClick={() => removeField(field.id)}
                              >
                                <Trash className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>

                            <Input
                              placeholder="Field label (e.g., Email Address)"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                            />

                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Required field</Label>
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              />
                            </div>

                            {field.fieldType === 'select' && (
                              <Textarea
                                placeholder="Options (one per line)"
                                value={field.options?.join('\n') || ''}
                                onChange={(e) => updateField(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                                rows={3}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={saveForm} className="flex-1">
                  {editingForm ? 'Update Form' : 'Save Form'}
                </Button>
                {editingForm && (
                  <Button variant="outline" onClick={startNewForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Forms</CardTitle>
              <CardDescription>Manage your form templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(forms || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" weight="duotone" />
                  <p>No forms created yet</p>
                </div>
              ) : (
                (forms || []).map(form => (
                  <Card key={form.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{form.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{form.fields.length} fields</Badge>
                            {form.createCaseOnSubmit && (
                              <Badge variant="secondary">Auto-creates case</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => editForm(form)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteForm(form.id)}>
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
