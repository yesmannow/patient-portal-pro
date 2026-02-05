import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Case, CaseType, Urgency } from '@/lib/types'
import { toast } from 'sonner'

interface NewCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
}

export function NewCaseDialog({ open, onOpenChange, patientId }: NewCaseDialogProps) {
  const [cases, setCases] = useKV<Case[]>('cases', [])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [caseType, setCaseType] = useState<CaseType>('question')
  const [urgency, setUrgency] = useState<Urgency>('routine')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newCase: Case = {
      id: `case-${Date.now()}`,
      patientId,
      caseType,
      subject,
      description,
      urgency,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCases((current) => [...(current ?? []), newCase])
    
    toast.success('Case created successfully', {
      description: 'Your healthcare provider will review your case shortly.',
    })

    setSubject('')
    setDescription('')
    setCaseType('question')
    setUrgency('routine')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Submit a health-related question or concern. Your care team will respond promptly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="case-type">Case Type</Label>
            <Select value={caseType} onValueChange={(value) => setCaseType(value as CaseType)}>
              <SelectTrigger id="case-type">
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
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={urgency} onValueChange={(value) => setUrgency(value as Urgency)}>
              <SelectTrigger id="urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine - General inquiry</SelectItem>
                <SelectItem value="timeSensitive">Time-Sensitive - Need response within 24 hours</SelectItem>
                <SelectItem value="urgent">Urgent - Requires immediate attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your question or concern..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Case</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
