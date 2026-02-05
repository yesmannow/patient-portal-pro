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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ResponseTemplate, CaseType, TemplateFolder } from '@/lib/types'
import { defaultResponseTemplates } from '@/lib/default-templates'
import { Plus, Trash, Sparkle, Pencil, Info, Folder, FolderOpen, CaretDown, CaretRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [folders, setFolders] = useKV<TemplateFolder[]>('template-folders', [])
  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'question' as CaseType,
    folderId: '' as string,
    promptKeywords: '',
    templateText: '',
    useAI: false,
  })

  const [folderFormData, setFolderFormData] = useState({
    name: '',
    color: 'oklch(0.50 0.12 230)',
  })

  const handleLoadDefaults = () => {
    setTemplates(defaultResponseTemplates)
    toast.success(`Loaded ${defaultResponseTemplates.length} default templates`)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'question',
      folderId: '',
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
      folderId: formData.folderId || undefined,
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
              folderId: formData.folderId || undefined,
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
      folderId: template.folderId || '',
      promptKeywords: template.promptKeywords.join(', '),
      templateText: template.templateText,
      useAI: template.useAI,
    })
    setIsCreating(true)
  }

  const handleCreateFolder = () => {
    if (!folderFormData.name.trim()) {
      toast.error('Folder name is required')
      return
    }

    const newFolder: TemplateFolder = {
      id: `folder-${Date.now()}`,
      name: folderFormData.name,
      color: folderFormData.color,
      createdAt: new Date().toISOString(),
    }

    setFolders((current) => [...(current ?? []), newFolder])
    toast.success('Folder created')
    setFolderFormData({ name: '', color: 'oklch(0.50 0.12 230)' })
    setIsFolderDialogOpen(false)
  }

  const handleDeleteFolder = (folderId: string) => {
    const folderTemplates = (templates ?? []).filter(t => t.folderId === folderId)
    if (folderTemplates.length > 0) {
      toast.error(`Cannot delete folder with ${folderTemplates.length} templates. Move or delete templates first.`)
      return
    }
    setFolders((current) => (current ?? []).filter((f) => f.id !== folderId))
    toast.success('Folder deleted')
  }

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const templatesByFolder = (templates ?? []).reduce((acc, template) => {
    const key = template.folderId || 'uncategorized'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(template)
    return acc
  }, {} as Record<string, ResponseTemplate[]>)

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
          <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Create Template Folder</DialogTitle>
                <DialogDescription>
                  Organize your templates into folders for better management
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    placeholder="e.g., Appointment Templates"
                    value={folderFormData.name}
                    onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folder-color">Folder Color</Label>
                  <div className="flex gap-2">
                    {[
                      { label: 'Blue', value: 'oklch(0.50 0.12 230)' },
                      { label: 'Purple', value: 'oklch(0.50 0.15 280)' },
                      { label: 'Green', value: 'oklch(0.55 0.15 150)' },
                      { label: 'Orange', value: 'oklch(0.60 0.15 50)' },
                      { label: 'Red', value: 'oklch(0.55 0.20 25)' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className="w-10 h-10 rounded-md border-2 transition-all"
                        style={{
                          backgroundColor: color.value,
                          borderColor: folderFormData.color === color.value ? 'oklch(0.25 0.015 240)' : 'transparent',
                        }}
                        onClick={() => setFolderFormData({ ...folderFormData, color: color.value })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                <Label htmlFor="folder">Folder (Optional)</Label>
                <Select
                  value={formData.folderId}
                  onValueChange={(value) => setFormData({ ...formData, folderId: value })}
                >
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="No folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No folder</SelectItem>
                    {(folders ?? []).map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4" style={{ color: folder.color }} />
                          {folder.name}
                        </div>
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
        <div className="space-y-4">
          {(folders ?? []).map((folder) => {
            const folderTemplates = templatesByFolder[folder.id] || []
            const isOpen = openFolders.has(folder.id)
            
            return (
              <Collapsible
                key={folder.id}
                open={isOpen}
                onOpenChange={() => toggleFolder(folder.id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <FolderOpen className="w-5 h-5" style={{ color: folder.color }} weight="duotone" />
                          ) : (
                            <Folder className="w-5 h-5" style={{ color: folder.color }} weight="duotone" />
                          )}
                          <CardTitle className="text-base">{folder.name}</CardTitle>
                          <Badge variant="secondary">{folderTemplates.length}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          {isOpen ? (
                            <CaretDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <CaretRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <AnimatePresence>
                        {folderTemplates.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No templates in this folder
                          </p>
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {folderTemplates.map((template) => (
                              <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
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
                                        <CardDescription className="mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {caseTypeLabels[template.category]}
                                          </Badge>
                                        </CardDescription>
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
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}

          {templatesByFolder['uncategorized'] && templatesByFolder['uncategorized'].length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Uncategorized Templates
                <Badge variant="secondary">{templatesByFolder['uncategorized'].length}</Badge>
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {templatesByFolder['uncategorized'].map((template) => (
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
                            <CardDescription className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {caseTypeLabels[template.category]}
                              </Badge>
                            </CardDescription>
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
          )}
        </div>
      )}
    </div>
  )
}
