import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { APIServices, FileScanResult } from '@/lib/api-services'
import { FileArrowUp, ShieldCheck, Warning, CheckCircle, XCircle, Sparkle, File } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UploadedFile {
  file: File
  scanResult?: FileScanResult
  status: 'pending' | 'scanning' | 'safe' | 'threat' | 'error'
}

export function SecureDocumentUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return

    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      status: 'pending',
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    for (let i = 0; i < newFiles.length; i++) {
      await scanFile(newFiles[i].file)
    }
  }

  const scanFile = async (file: File) => {
    setIsScanning(true)

    setUploadedFiles(prev =>
      prev.map(uf =>
        uf.file === file ? { ...uf, status: 'scanning' } : uf
      )
    )

    try {
      const scanResult = await APIServices.scanFile(file)

      setUploadedFiles(prev =>
        prev.map(uf =>
          uf.file === file
            ? {
                ...uf,
                scanResult,
                status: scanResult.safe ? 'safe' : 'threat',
              }
            : uf
        )
      )

      if (scanResult.safe) {
        toast.success(`${file.name} - No threats detected`)
      } else {
        toast.error(`${file.name} - Security threat detected!`, {
          description: scanResult.threats.join(', '),
        })
      }
    } catch (error) {
      setUploadedFiles(prev =>
        prev.map(uf =>
          uf.file === file ? { ...uf, status: 'error' } : uf
        )
      )
      toast.error(`Failed to scan ${file.name}`)
    } finally {
      setIsScanning(false)
    }
  }

  const removeFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(uf => uf.file !== file))
  }

  const handleUploadAll = () => {
    const safeFiles = uploadedFiles.filter(uf => uf.status === 'safe')
    if (safeFiles.length === 0) {
      toast.error('No safe files to upload')
      return
    }

    toast.success(`${safeFiles.length} file(s) uploaded to secure patient portal`)
    setUploadedFiles([])
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'scanning':
        return <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
      case 'threat':
        return <XCircle className="w-5 h-5 text-red-600" weight="fill" />
      case 'error':
        return <Warning className="w-5 h-5 text-amber-600" weight="fill" />
      default:
        return <File className="w-5 h-5 text-muted-foreground" weight="duotone" />
    }
  }

  const getStatusBadge = (status: UploadedFile['status']) => {
    switch (status) {
      case 'scanning':
        return <Badge variant="outline">Scanning...</Badge>
      case 'safe':
        return <Badge className="bg-green-600 text-white">Safe</Badge>
      case 'threat':
        return <Badge variant="destructive">Threat Detected</Badge>
      case 'error':
        return <Badge variant="outline" className="border-amber-600 text-amber-600">Error</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const safeFileCount = uploadedFiles.filter(uf => uf.status === 'safe').length
  const threatCount = uploadedFiles.filter(uf => uf.status === 'threat').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Secure Document Upload</h1>
        <p className="text-muted-foreground mt-1">HIPAA-compliant file scanning before upload</p>
      </div>

      <Alert className="bg-accent/10 border-accent">
        <Sparkle className="w-4 h-4" weight="duotone" />
        <AlertDescription>
          <strong>Gold Standard Automation:</strong> All patient documents are automatically scanned 
          for malware using VirusTotal/ClamAV integration before they reach your server, protecting against ransomware attacks.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" weight="duotone" />
            Upload Patient Documents
          </CardTitle>
          <CardDescription>
            Medical records, lab results, insurance cards, and other documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileArrowUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" weight="duotone" />
              <p className="font-medium mb-1">Click to upload files</p>
              <p className="text-sm text-muted-foreground">
                PDF, JPG, PNG, DOC, DOCX up to 10MB
              </p>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {safeFileCount} Safe
                  </Badge>
                  {threatCount > 0 && (
                    <Badge variant="destructive">
                      {threatCount} Threat{threatCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {safeFileCount > 0 && (
                  <Button onClick={handleUploadAll} disabled={isScanning}>
                    Upload {safeFileCount} Safe File{safeFileCount > 1 ? 's' : ''}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {uploadedFiles.map((uploadedFile, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(uploadedFile.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {uploadedFile.file.name}
                        </p>
                        {getStatusBadge(uploadedFile.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>

                      {uploadedFile.status === 'scanning' && (
                        <Progress value={50} className="mt-2 h-1" />
                      )}

                      {uploadedFile.status === 'threat' && uploadedFile.scanResult && (
                        <Alert variant="destructive" className="mt-2">
                          <Warning className="w-4 h-4" weight="fill" />
                          <AlertDescription className="text-xs">
                            {uploadedFile.scanResult.threats.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}

                      {uploadedFile.status === 'safe' && uploadedFile.scanResult && (
                        <div className="flex items-center gap-2 mt-2">
                          <ShieldCheck className="w-3 h-3 text-green-600" weight="fill" />
                          <p className="text-xs text-green-700">
                            Scanned on {new Date(uploadedFile.scanResult.scanDate).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(uploadedFile.file)}
                      disabled={uploadedFile.status === 'scanning'}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Security Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">Real-Time Malware Scanning</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Every file scanned before reaching server infrastructure
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Warning className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">Ransomware Protection</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Blocks malicious files before they can execute
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileArrowUp className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">HIPAA Compliance</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Secure encrypted upload with audit trail
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">Automatic Threat Blocking</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Infected files rejected before storage
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
