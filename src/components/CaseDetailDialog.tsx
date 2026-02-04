import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Case, Message } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { PaperPlaneRight } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface CaseDetailDialogProps {
  case: Case
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors = {
  'Open': 'bg-[var(--status-open)] text-white',
  'In Review': 'bg-[var(--status-review)] text-white',
  'Waiting on Client': 'bg-[var(--status-waiting)] text-white',
  'Resolved': 'bg-[var(--status-resolved)] text-white',
}

export function CaseDetailDialog({ case: caseItem, open, onOpenChange }: CaseDetailDialogProps) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useKV<Message[]>('messages', [])
  const [messageBody, setMessageBody] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const caseMessages = (messages ?? [])
    .filter(m => m.caseId === caseItem.id)
    .filter(m => currentUser?.role === 'provider' || m.visibility === 'client')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [caseMessages.length])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageBody.trim() || !currentUser) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      caseId: caseItem.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      body: messageBody,
      visibility: 'client',
      timestamp: new Date().toISOString(),
    }

    setMessages((current) => [...(current ?? []), newMessage])
    setMessageBody('')
    
    toast.success('Message sent')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{caseItem.subject}</DialogTitle>
              <DialogDescription className="mt-2">
                {caseItem.description}
              </DialogDescription>
            </div>
            <Badge className={statusColors[caseItem.status]}>
              {caseItem.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3">
            <span>Case #{caseItem.id.slice(-6)}</span>
            <span>•</span>
            <span>Created {format(new Date(caseItem.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </DialogHeader>
        
        <Separator />

        <ScrollArea ref={scrollRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {caseMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation below.
                </p>
              ) : (
                caseMessages.map((message) => {
                  const isCurrentUser = message.senderId === currentUser?.id
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
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div 
                          className={`rounded-lg p-3 ${
                            isCurrentUser 
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
          <div className="flex gap-3">
            <Textarea
              placeholder="Type your message..."
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
