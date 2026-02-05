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
import { Case, Message, Patient, Provider, ResponseTemplate } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { PaperPlaneRight, Lock, Sparkle, PencilSimple, Lightning } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
  const [responseTemplates] = useKV<ResponseTemplate[]>('response-templates', [])
  const [messageBody, setMessageBody] = useState('')
  const [visibility, setVisibility] = useState<'patient' | 'internal'>('patient')
  const [summary, setSummary] = useState<ClinicalSummary | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [editedSummary, setEditedSummary] = useState<ClinicalSummary | null>(null)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [suggestedTemplates, setSuggestedTemplates] = useState<ResponseTemplate[]>([])
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

  useEffect(() => {
    if (currentUser?.role === 'provider' && open) {
      findSuggestedTemplates()
    }
  }, [caseItem.id, open, currentUser?.role])

  const findSuggestedTemplates = () => {
    const templates = responseTemplates ?? []
    const relevantTemplates = templates.filter(t => t.category === caseItem.caseType)
    
    const keywords = [
      ...caseItem.subject.toLowerCase().split(' '),
      ...caseItem.description.toLowerCase().split(' ')
    ]
    
    const scored = relevantTemplates.map(template => {
      const matchCount = template.promptKeywords.filter(keyword => 
        keywords.some(k => k.includes(keyword.toLowerCase()))
      ).length
      return { template, score: matchCount }
    })
    
    const topTemplates = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.template)
    
    setSuggestedTemplates(topTemplates)
  }

  const handleGenerateAIResponse = async () => {
    setIsGeneratingResponse(true)
    
    try {
      const conversationText = caseMessages
        .map(msg => `[${msg.senderRole === 'provider' ? 'Provider' : 'Patient'}] ${msg.senderName}: ${msg.body}`)
        .join('\n\n')

      const promptText = `You are a medical provider assistant helping craft a professional response to a patient inquiry.

Case Context:
- Subject: ${caseItem.subject}
- Description: ${caseItem.description}
- Type: ${caseTypeLabels[caseItem.caseType]}
- Urgency: ${urgencyLabels[caseItem.urgency]}

Conversation History:
${conversationText || 'No previous messages'}

Generate a professional, empathetic response that:
1. Acknowledges the patient's concern
2. Provides helpful information or next steps
3. Maintains a warm, professional tone
4. Is concise (2-4 sentences)
5. Includes a clear call-to-action if needed

Return only the response text, no JSON formatting.`

      const response = await window.spark.llm(promptText, 'gpt-4o', false)
      setMessageBody(response.trim())
      toast.success('AI response generated - review and edit before sending')
    } catch (error) {
      console.error('Response generation error:', error)
      toast.error('Failed to generate response')
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  const handleUseTemplate = async (template: ResponseTemplate) => {
    if (template.useAI) {
      setIsGeneratingResponse(true)
      
      try {
        const conversationText = caseMessages
          .map(msg => `[${msg.senderRole === 'provider' ? 'Provider' : 'Patient'}] ${msg.senderName}: ${msg.body}`)
          .join('\n\n')

        const promptText = `You are customizing a response template for a patient. 

Template: ${template.templateText}

Case Context:
- Subject: ${caseItem.subject}
- Description: ${caseItem.description}
- Patient: ${currentPatient?.firstName} ${currentPatient?.lastName}

Conversation History:
${conversationText || 'No previous messages'}

Personalize this template to fit the specific context while maintaining its core message. Replace any placeholders with specific details. Keep the same professional tone.

Return only the personalized response text.`

        const response = await window.spark.llm(promptText, 'gpt-4o', false)
        setMessageBody(response.trim())
        toast.success('Template personalized with AI')
      } catch (error) {
        console.error('Template personalization error:', error)
        setMessageBody(template.templateText)
        toast.success('Template applied')
      } finally {
        setIsGeneratingResponse(false)
      }
    } else {
      setMessageBody(template.templateText)
      toast.success('Template applied')
    }
  }

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
            <>
              <div className="mb-3 flex gap-2">
                <Select value={visibility} onValueChange={(value) => setVisibility(value as 'patient' | 'internal')}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient Message (visible to patient)</SelectItem>
                    <SelectItem value="internal">Internal Note (provider only)</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleGenerateAIResponse}
                  disabled={isGeneratingResponse}
                >
                  <Sparkle className="w-4 h-4 mr-2" weight={isGeneratingResponse ? 'fill' : 'regular'} />
                  {isGeneratingResponse ? 'Generating...' : 'AI Response'}
                </Button>
                {suggestedTemplates.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline">
                        <Lightning className="w-4 h-4 mr-2" weight="fill" />
                        Templates
                        {suggestedTemplates.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                            {suggestedTemplates.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Suggested Templates</h4>
                        <p className="text-xs text-muted-foreground">
                          Based on case type and keywords
                        </p>
                        <Separator />
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {suggestedTemplates.map((template) => (
                            <Card 
                              key={template.id} 
                              className="cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => handleUseTemplate(template)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h5 className="font-semibold text-sm">{template.name}</h5>
                                  {template.useAI && (
                                    <Sparkle className="w-4 h-4 text-primary shrink-0" weight="fill" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {template.templateText}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </>
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
