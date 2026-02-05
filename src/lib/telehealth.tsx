import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { VideoCamera, PhoneDisconnect, Microphone, MicrophoneSlash, VideoCameraSlash, Info } from '@phosphor-icons/react'

interface TelehealthStubProps {
  appointmentId: string
  participantName: string
}

export function TelehealthStub({ appointmentId, participantName }: TelehealthStubProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  const handleConnect = () => {
    console.log('[Telehealth] Placeholder: Would initiate WebRTC connection for appointment', appointmentId)
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    console.log('[Telehealth] Placeholder: Would end WebRTC session')
    setIsConnected(false)
  }

  const toggleMute = () => {
    console.log('[Telehealth] Placeholder: Would toggle audio track')
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    console.log('[Telehealth] Placeholder: Would toggle video track')
    setIsVideoOff(!isVideoOff)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoCamera className="w-5 h-5" weight="duotone" />
          Video Consultation
        </CardTitle>
        <CardDescription>Connect with {participantName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertTitle>Integration Placeholder</AlertTitle>
          <AlertDescription>
            This is a stub component for self-hosted WebRTC video consultation. In production, this would integrate with an open-source WebRTC solution (e.g., Jitsi, MediaSoup, or custom implementation).
          </AlertDescription>
        </Alert>

        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {isConnected ? (
            <div className="text-center">
              <VideoCamera className="w-16 h-16 text-primary mx-auto mb-3" weight="duotone" />
              <p className="text-muted-foreground">Video stream would appear here</p>
              <Badge variant="secondary" className="mt-2">Connected</Badge>
            </div>
          ) : (
            <div className="text-center">
              <VideoCamera className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-50" weight="duotone" />
              <p className="text-muted-foreground">Not connected</p>
            </div>
          )}
        </div>

        {isConnected ? (
          <div className="flex justify-center gap-3">
            <Button
              variant={isMuted ? 'destructive' : 'outline'}
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? <MicrophoneSlash className="w-5 h-5" /> : <Microphone className="w-5 h-5" />}
            </Button>
            <Button
              variant={isVideoOff ? 'destructive' : 'outline'}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoCameraSlash className="w-5 h-5" /> : <VideoCamera className="w-5 h-5" />}
            </Button>
            <Button variant="destructive" onClick={handleDisconnect}>
              <PhoneDisconnect className="w-5 h-5 mr-2" />
              End Call
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleConnect}>
            <VideoCamera className="w-5 h-5 mr-2" />
            Start Video Call
          </Button>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Session ID: {appointmentId}
        </div>
      </CardContent>
    </Card>
  )
}

export async function sendAppointmentReminder(
  patientEmail: string,
  appointmentDateTime: string,
  appointmentReason: string,
  method: 'email' | 'sms'
): Promise<void> {
  console.log(
    `[Notification] Placeholder: Would send ${method} reminder to ${patientEmail}`,
    {
      dateTime: appointmentDateTime,
      reason: appointmentReason,
    }
  )
}

export async function sendTaskNotification(
  providerEmail: string,
  taskTitle: string,
  dueDate: string
): Promise<void> {
  console.log(
    `[Notification] Placeholder: Would send task notification to ${providerEmail}`,
    {
      task: taskTitle,
      due: dueDate,
    }
  )
}
