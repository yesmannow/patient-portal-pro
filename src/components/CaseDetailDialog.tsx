import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Case, Message, Patient, Provider } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { PaperPlaneRight, Lock, Sparkle, PencilSimple } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CaseDetailDialogProps {
  case: Case
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors = {
  'open': 'bg-blue-500 text-white',
  'awaitingPatient': 'bg-amber-500 text-white',
  'awaitingProvider': 'bg-purple-500 text-white',
  'resolved': 'bg-green-600 text-white',
}

const statusLabels = {
  'open': 'Open',
  'awaitingPatient': 'Awaiting Patient',
  'awaitingProvider': 'Awaiting Provider',
  'resolved': 'Resolved',
}

const caseTypeLabels = {
  question: 'Question',
  followUp: 'Follow-Up',
  billing: 'Billing',
  clinicalConcern: 'Clinical Concern',
  admin: 'Administrative',
}

const urgencyLabels = {
  urgent: 'Urgent',
  timeSensitive: 'Time-Sensitive',
  routine: 'Routine',
}

interface ClinicalSummary {
  clinicalConcern: string
  actionItems: string
  status: string
}

export function CaseDetailDialog({ case: caseItem, open, onOpenChange }: CaseDetailDialogProps) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useKV<Message[]>('messages', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [providers] = useKV<Provider[]>('providers', [])
  const [messageBody, setMessageBody] = useState('')
  const [visibility, setVisibility] = useState<'patient' | 'internal'>('patient')
  const [summary, setSummary] = useState<ClinicalSummary | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [editedSummary, setEditedSummary] = useState<ClinicalSummary | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const caseMessages = (messages ?? [])
    .filter(m => m.caseId === caseItem.id)
    .filter(m => currentUser?.role === 'provider' || m.visibility === 'patient')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const currentPatient = (patients ?? []).find(p => p.id === caseItem.patientId)
  const currentProvider = (providers ?? []).find(p => p.email === currentUser?.email)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [caseMessages.length])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageBody.trim() || !currentUser) return

    const senderName = currentUser.role === 'patient' 
      ? `${currentPatient?.firstName ?? ''} ${currentPatient?.lastName ?? ''}`.trim() || currentUser.email
      : currentProvider?.name || currentUser.email

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      caseId: caseItem.id,
      senderId: currentUser.id,
      senderName,
      senderRole: currentUser.role,
      body: messageBody,
      visibility: currentUser.role === 'provider' ? visibility : 'patient',
      timestamp: new Date().toISOString(),
    }

    setMessages((current) => [...(current ?? []), newMessage])
    setMessageBody('')
    
    toast.success(visibility === 'internal' ? 'Internal note added' : 'Message sent')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || name.slice(0, 2).toUpperCase()
  }

  const handleSummarizeHistory = async () => {
    if (caseMessages.length === 0) {
      toast.error('No messages to summarize')
      return
    }

    setIsSummarizing(true)
    
    try {
      const conversationText = caseMessages
        .map(msg => `[${msg.senderRole === 'provider' ? 'Provider' : 'Patient'}] ${msg.senderName}: ${msg.body}`)
        .join('\n\n')

      const promptText = `You are a clinical assistant analyzing a patient-provider message thread. Read the conversation below and generate a concise 3-point summary.

Conversation:
${conversationText}

Case Context:
- Subject: ${caseItem.subject}
- Description: ${caseItem.description}
- Type: ${caseTypeLabels[caseItem.caseType]}
- Urgency: ${urgencyLabels[caseItem.urgency]}

Generate a JSON summary with exactly three fields:
1. "clinicalConcern": A single sentence describing the primary medical issue or question
2. "actionItems": A single sentence listing specific requests the patient has made
3. "status": A single sentence stating who is currently responsible for the next move (Patient or Provider) and what that next step is

Return your response as valid JSON.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsedSummary = JSON.parse(response) as ClinicalSummary
      
      setSummary(parsedSummary)
      setEditedSummary(parsedSummary)
      toast.success('Clinical brief generated')
    } catch (error) {
      console.error('Summarization error:', error)
      toast.error('Failed to generate summary')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleSaveSummary = () => {
    if (editedSummary) {
      setSummary(editedSummary)
      setIsEditingSummary(false)
      toast.success('Clinical brief updated')
    }
  }

  const handleCancelEdit = () => {
    setEditedSummary(summary)
    setIsEditingSummary(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {caseTypeLabels[caseItem.caseType]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {urgencyLabels[caseItem.urgency]}
                </Badge>
              </div>
              <DialogTitle className="text-xl">{caseItem.subject}</DialogTitle>
              <DialogDescription className="mt-2">
                {caseItem.description}
              </DialogDescription>
            </div>
            <Badge className={statusColors[caseItem.status]}>
              {statusLabels[caseItem.status]}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Case #{caseItem.id.slice(-6)}</span>
              <span>•</span>
              <span>Created {format(new Date(caseItem.createdAt), 'MMM d, yyyy')}</span>
            </div>
            {currentUser?.role === 'provider' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSummarizeHistory}
                disabled={isSummarizing || caseMessages.length === 0}
              >
                <Sparkle className="w-4 h-4 mr-2" weight={isSummarizing ? 'fill' : 'regular'} />
                {isSummarizing ? 'Generating...' : 'Summarize History'}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <Separator />

        <ScrollArea ref={scrollRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                        <CardTitle className="text-base">Clinical Brief</CardTitle>
                      </div>
                      {currentUser?.role === 'provider' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingSummary(!isEditingSummary)}
                        >
                          <PencilSimple className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      AI-generated summary • Not stored permanently
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isEditingSummary && editedSummary ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-primary mb-1 block">
                            Clinical Concern:
                          </label>
                          <Textarea
                            value={editedSummary.clinicalConcern}
                            onChange={(e) =>
                              setEditedSummary({ ...editedSummary, clinicalConcern: e.target.value })
                            }
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-primary mb-1 block">
                            Action Items:
                          </label>
                          <Textarea
                            value={editedSummary.actionItems}
                            onChange={(e) =>
                              setEditedSummary({ ...editedSummary, actionItems: e.target.value })
                            }
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-primary mb-1 block">
                            Status:
                          </label>
                          <Textarea
                            value={editedSummary.status}
                            onChange={(e) =>
                              setEditedSummary({ ...editedSummary, status: e.target.value })
                            }
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveSummary}>
                            Save Changes
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-1">
                            Clinical Concern:
                          </h4>
                          <p className="text-sm text-foreground/90">
                            {summary.clinicalConcern}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-1">
                            Action Items:
                          </h4>
                          <p className="text-sm text-foreground/90">
                            {summary.actionItems}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-1">
                            Status:
                          </h4>
                          <p className="text-sm text-foreground/90">
                            {summary.status}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <AnimatePresence>
              {caseMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                caseMessages.map((message) => {
                  const isCurrentUser = message.senderId === currentUser?.id
                  const isInternal = message.visibility === 'internal'
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={message.senderRole === 'provider' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}>
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : ''}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-medium">{message.senderName}</span>
                          {isInternal && (
                            <Badge variant="secondary" className="text-xs h-5 gap-1">
                              <Lock className="w-3 h-3" />
                              Internal Note
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div 
                          className={`rounded-lg p-3 ${
                            isInternal
                              ? 'bg-yellow-50 border border-yellow-300'
                              : isCurrentUser 
                              ? 'bg-primary text-primary-foreground' 
                              : message.senderRole === 'provider'
                              ? 'bg-primary/5 border border-primary/20'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <Separator />

        <form onSubmit={handleSendMessage} className="p-6 pt-4">
          {currentUser?.role === 'provider' && (
            <div className="mb-3">
              <Select value={visibility} onValueChange={(value) => setVisibility(value as 'patient' | 'internal')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient Message (visible to patient)</SelectItem>
                  <SelectItem value="internal">Internal Note (provider only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-3">
            <Textarea
              placeholder={visibility === 'internal' ? 'Type internal note...' : 'Type your message...'}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            <Button type="submit" size="icon" className="h-auto" disabled={!messageBody.trim()}>
              <PaperPlaneRight className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
