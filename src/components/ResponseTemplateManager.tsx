import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResponseTemplate, CaseType } from '@/lib/types'
import { defaultResponseTemplates } from '@/lib/default-templates'
import { Plus, Trash, Sparkle, Pencil, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const caseTypeLabels: Record<CaseType, string> = {
  question: 'Question',
  followUp: 'Follow-Up',
  billing: 'Billing',
  clinicalConcern: 'Clinical Concern',
  admin: 'Administrative',
}

export function ResponseTemplateManager() {
  const [templates, setTemplates] = useKV<ResponseTemplate[]>('response-templates', [])
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'question' as CaseType,
    promptKeywords: '',
    templateText: '',
    useAI: false,
  })

  const handleLoadDefaults = () => {
    setTemplates(defaultResponseTemplates)
    toast.success(`Loaded ${defaultResponseTemplates.length} default templates`)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'question',
      promptKeywords: '',
      templateText: '',
      useAI: false,
    })
    setEditingTemplate(null)
  }

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.templateText.trim()) {
      toast.error('Name and template text are required')
      return
    }

    const newTemplate: ResponseTemplate = {
      id: `template-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      promptKeywords: formData.promptKeywords.split(',').map(k => k.trim()).filter(Boolean),
      templateText: formData.templateText,
      useAI: formData.useAI,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTemplates((current) => [...(current ?? []), newTemplate])
    toast.success('Response template created')
    resetForm()
    setIsCreating(false)
  }

  const handleUpdate = () => {
    if (!editingTemplate || !formData.name.trim() || !formData.templateText.trim()) {
      toast.error('Name and template text are required')
      return
    }

    setTemplates((current) =>
      (current ?? []).map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: formData.name,
              category: formData.category,
              promptKeywords: formData.promptKeywords.split(',').map(k => k.trim()).filter(Boolean),
              templateText: formData.templateText,
              useAI: formData.useAI,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    )
    toast.success('Template updated')
    resetForm()
    setIsCreating(false)
  }

  const handleDelete = (templateId: string) => {
    setTemplates((current) => (current ?? []).filter((t) => t.id !== templateId))
    toast.success('Template deleted')
  }

  const handleEdit = (template: ResponseTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      category: template.category,
      promptKeywords: template.promptKeywords.join(', '),
      templateText: template.templateText,
      useAI: template.useAI,
    })
    setIsCreating(true)
  }

  const templatesByCategory = (templates ?? []).reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<CaseType, ResponseTemplate[]>)

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>AI-Powered Response Templates</AlertTitle>
        <AlertDescription>
          Templates marked with <Sparkle className="w-3 h-3 inline mx-1 text-primary" weight="fill" /> 
          will be personalized using AI based on the specific patient case context. Suggested templates appear automatically when keywords match the case.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Response Templates</h2>
          <p className="text-muted-foreground">
            Create reusable templates to respond faster to common patient questions
          </p>
        </div>
        <div className="flex gap-2">
          {(templates ?? []).length === 0 && (
            <Button variant="outline" onClick={handleLoadDefaults}>
              <Sparkle className="w-4 h-4 mr-2" weight="fill" />
              Load Defaults
            </Button>
          )}
          <Dialog open={isCreating} onOpenChange={(open) => {
            setIsCreating(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Response Template'}</DialogTitle>
              <DialogDescription>
                Build reusable responses for common patient inquiries
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Appointment Confirmation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Case Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CaseType })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(caseTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., appointment, schedule, reschedule"
                  value={formData.promptKeywords}
                  onChange={(e) => setFormData({ ...formData, promptKeywords: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Templates will be suggested when these keywords appear in cases
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template Text</Label>
                <Textarea
                  id="template"
                  placeholder="Type your response template here..."
                  value={formData.templateText}
                  onChange={(e) => setFormData({ ...formData, templateText: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="use-ai"
                  checked={formData.useAI}
                  onCheckedChange={(checked) => setFormData({ ...formData, useAI: checked })}
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="use-ai" className="cursor-pointer">
                    Personalize with AI
                  </Label>
                  <Sparkle className="w-4 h-4 text-primary" weight="fill" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, AI will customize this template based on the specific case context
              </p>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingTemplate ? handleUpdate : handleCreate}>
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {(templates ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkle className="w-12 h-12 text-muted-foreground mb-4" weight="duotone" />
            <h3 className="font-semibold mb-2">No templates yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first response template to speed up patient replies
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(caseTypeLabels).map(([categoryKey, categoryLabel]) => {
            const categoryTemplates = templatesByCategory[categoryKey as CaseType] || []
            if (categoryTemplates.length === 0) return null

            return (
              <div key={categoryKey}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {categoryLabel}
                  <Badge variant="secondary">{categoryTemplates.length}</Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {template.name}
                                {template.useAI && (
                                  <Sparkle className="w-4 h-4 text-primary" weight="fill" />
                                )}
                              </CardTitle>
                              {template.promptKeywords.length > 0 && (
                                <CardDescription className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {template.promptKeywords.map((keyword, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(template)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(template.id)}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {template.templateText}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
