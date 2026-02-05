import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { HealthDocument, DocumentCategory } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { 
  UploadSimple, 
  File, 
  Trash, 
  DownloadSimple,
  FileText,
  Heartbeat,
  IdentificationCard,
  ClipboardText,
  Folder
} from '@phosphor-icons/react'
import { format } from 'date-fns'
import { toast } from 'sonner'

const categoryLabels: Record<DocumentCategory, string> = {
  labResults: 'Lab Results',
  imaging: 'Imaging Reports',
  insurance: 'Insurance Documents',
  referral: 'Referral Letters',
  other: 'Other Documents',
}

const categoryIcons: Record<DocumentCategory, typeof File> = {
  labResults: Heartbeat,
  imaging: FileText,
  insurance: IdentificationCard,
  referral: ClipboardText,
  other: Folder,
}

const categoryColors: Record<DocumentCategory, string> = {
  labResults: 'bg-blue-500 text-white',
  imaging: 'bg-purple-500 text-white',
  insurance: 'bg-green-600 text-white',
  referral: 'bg-amber-500 text-white',
  other: 'bg-gray-500 text-white',
}

interface DocumentManagerProps {
  patientId: string
}

export function DocumentManager({ patientId }: DocumentManagerProps) {
  const [documents, setDocuments] = useKV<HealthDocument[]>('health-documents', [])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<HealthDocument | null>(null)
  
  const [uploadForm, setUploadForm] = useState({
    category: '' as DocumentCategory,
    description: '',
    file: null as File | null,
  })

  const patientDocuments = (documents ?? []).filter(d => d.patientId === patientId)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB.')
        return
      }
      setUploadForm(prev => ({ ...prev, file }))
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.category) {
      toast.error('Please select a file and category')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string
        
        const newDocument: HealthDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          patientId,
          fileName: uploadForm.file!.name,
          fileSize: uploadForm.file!.size,
          category: uploadForm.category,
          uploadedAt: new Date().toISOString(),
          description: uploadForm.description || undefined,
          base64Data,
        }

        setDocuments(current => [...(current ?? []), newDocument])
        
        toast.success('Document uploaded successfully')
        setUploadDialogOpen(false)
        setUploadForm({ category: '' as DocumentCategory, description: '', file: null })
      }
      
      reader.readAsDataURL(uploadForm.file)
    } catch (error) {
      toast.error('Failed to upload document')
      console.error(error)
    }
  }

  const handleDelete = () => {
    if (!selectedDocument) return

    setDocuments(current => 
      (current ?? []).filter(d => d.id !== selectedDocument.id)
    )
    
    toast.success('Document deleted')
    setDeleteDialogOpen(false)
    setSelectedDocument(null)
  }

  const handleDownload = (doc: HealthDocument) => {
    const link = document.createElement('a')
    link.href = doc.base64Data
    link.download = doc.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Document downloaded')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const groupedDocuments = patientDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<DocumentCategory, HealthDocument[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Health Documents</h2>
          <p className="text-muted-foreground mt-1">
            Upload and manage your medical records
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UploadSimple className="w-4 h-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Health Document</DialogTitle>
              <DialogDescription>
                Add a new medical document to your profile. Maximum file size: 10MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Document Category</Label>
                <Select 
                  value={uploadForm.category} 
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value as DocumentCategory }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {uploadForm.file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this document..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!uploadForm.file || !uploadForm.category}>
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {patientDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <File className="w-8 h-8 text-muted-foreground" weight="duotone" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No documents yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-sm mb-4">
              Upload your medical records, lab results, and other health documents to keep them organized in one secure place.
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <UploadSimple className="w-4 h-4" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => {
            const CategoryIcon = categoryIcons[category as DocumentCategory]
            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <CategoryIcon className="w-5 h-5 text-primary" weight="duotone" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {categoryLabels[category as DocumentCategory]}
                      </CardTitle>
                      <CardDescription>
                        {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {docs.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                            <File className="w-5 h-5 text-muted-foreground" weight="duotone" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">{doc.fileName}</p>
                              <Badge className={categoryColors[doc.category]} variant="secondary">
                                {categoryLabels[doc.category]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</span>
                            </div>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                          >
                            <DownloadSimple className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedDocument(doc)
                              setDeleteDialogOpen(true)
                            }}
                            title="Delete"
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.fileName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDocument(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
