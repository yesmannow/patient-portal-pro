import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ParticipantRole } from '@/types/telehealth'

interface InviteParticipantDialogProps {
  sessionId: string
  onClose: () => void
}

export function InviteParticipantDialog({ sessionId, onClose }: InviteParticipantDialogProps) {
  const [participantName, setParticipantName] = useState('')
  const [participantRole, setParticipantRole] = useState<ParticipantRole>('specialist')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateInviteLink = () => {
    if (!participantName.trim()) {
      toast.error('Please enter participant name')
      return
    }

    const token = Math.random().toString(36).substring(2, 15)
    const expiresIn = 24
    const link = `${window.location.origin}/telehealth/join?token=${token}&session=${sessionId}&name=${encodeURIComponent(participantName)}&role=${participantRole}`
    
    setInviteLink(link)
    toast.success('Invite link generated', {
      description: `Valid for ${expiresIn} hours`
    })
  }

  const copyToClipboard = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success('Link copied to clipboard')
        
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Participant to Session</DialogTitle>
          <DialogDescription>
            Generate a temporary pre-authenticated link for specialists or family members to join this telehealth session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="participant-name">Participant Name</Label>
            <Input
              id="participant-name"
              placeholder="Dr. Sarah Johnson"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant-role">Role</Label>
            <Select value={participantRole} onValueChange={(value) => setParticipantRole(value as ParticipantRole)}>
              <SelectTrigger id="participant-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specialist">Specialist</SelectItem>
                <SelectItem value="family">Family Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inviteLink && (
            <Alert className="bg-accent/10 border-accent/50">
              <CheckCircle size={20} weight="fill" className="text-accent" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p className="font-medium">Invite link generated successfully</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={copyToClipboard}
                      className={copied ? 'bg-success hover:bg-success/90' : ''}
                    >
                      {copied ? (
                        <CheckCircle size={18} weight="fill" />
                      ) : (
                        <Copy size={18} weight="bold" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This link expires in 24 hours and grants access only to this session
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {!inviteLink ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={generateInviteLink}>
                Generate Link
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
