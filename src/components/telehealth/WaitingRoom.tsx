import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { VideoCamera, Microphone, MicrophoneSlash, VideoCameraSlash, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { DevicePermissions } from '@/types/telehealth'

interface WaitingRoomProps {
  patientName: string
  appointmentTime: string
  providerName: string
  onJoinSession: (stream: MediaStream) => void
  isProviderPresent: boolean
}

export function WaitingRoom({
  patientName,
  appointmentTime,
  providerName,
  onJoinSession,
  isProviderPresent
}: WaitingRoomProps) {
  const [permissions, setPermissions] = useState<DevicePermissions>({
    camera: false,
    microphone: false
  })
  const [isTestingDevices, setIsTestingDevices] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const requestDevicePermissions = async () => {
    setIsTestingDevices(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      setPermissions({
        camera: stream.getVideoTracks().length > 0,
        microphone: stream.getAudioTracks().length > 0
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      toast.success('Devices ready', {
        description: 'Camera and microphone access granted'
      })
    } catch (error) {
      toast.error('Device access denied', {
        description: 'Please allow camera and microphone access to join the session'
      })
      setPermissions({ camera: false, microphone: false })
    } finally {
      setIsTestingDevices(false)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const handleJoinSession = () => {
    if (localStream && permissions.camera && permissions.microphone) {
      onJoinSession(localStream)
    }
  }

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream])

  const canJoin = permissions.camera && permissions.microphone && isProviderPresent

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.02_245)] via-[oklch(0.18_0.03_250)] to-[oklch(0.15_0.02_245)] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardHeader className="text-center border-b border-border/50 pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Telehealth Waiting Room</CardTitle>
          <CardDescription className="text-base mt-2">
            Appointment with {providerName} at {appointmentTime}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-[oklch(0.15_0.02_245)] rounded-lg overflow-hidden relative">
                {localStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!videoEnabled && (
                      <div className="absolute inset-0 bg-[oklch(0.15_0.02_245)] flex items-center justify-center">
                        <VideoCameraSlash size={48} className="text-muted-foreground" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoCamera size={48} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {localStream && (
                <div className="flex gap-3 justify-center">
                  <Button
                    variant={videoEnabled ? 'default' : 'destructive'}
                    size="lg"
                    onClick={toggleVideo}
                    className="flex-1"
                  >
                    {videoEnabled ? (
                      <VideoCamera size={20} weight="fill" />
                    ) : (
                      <VideoCameraSlash size={20} weight="fill" />
                    )}
                    <span className="ml-2">
                      {videoEnabled ? 'Video On' : 'Video Off'}
                    </span>
                  </Button>

                  <Button
                    variant={audioEnabled ? 'default' : 'destructive'}
                    size="lg"
                    onClick={toggleAudio}
                    className="flex-1"
                  >
                    {audioEnabled ? (
                      <Microphone size={20} weight="fill" />
                    ) : (
                      <MicrophoneSlash size={20} weight="fill" />
                    )}
                    <span className="ml-2">
                      {audioEnabled ? 'Mic On' : 'Mic Off'}
                    </span>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Device Check</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    {permissions.camera ? (
                      <CheckCircle size={24} weight="fill" className="text-success" />
                    ) : (
                      <XCircle size={24} weight="fill" className="text-muted-foreground" />
                    )}
                    <span className="flex-1">Camera Access</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    {permissions.microphone ? (
                      <CheckCircle size={24} weight="fill" className="text-success" />
                    ) : (
                      <XCircle size={24} weight="fill" className="text-muted-foreground" />
                    )}
                    <span className="flex-1">Microphone Access</span>
                  </div>
                </div>

                {!localStream && (
                  <Button
                    onClick={requestDevicePermissions}
                    disabled={isTestingDevices}
                    size="lg"
                    className="w-full"
                  >
                    {isTestingDevices ? 'Testing Devices...' : 'Test My Devices'}
                  </Button>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <h3 className="font-semibold text-lg">Provider Status</h3>
                
                {isProviderPresent ? (
                  <Alert className="bg-success/10 border-success/50">
                    <CheckCircle size={20} weight="fill" className="text-success" />
                    <AlertDescription className="ml-2">
                      {providerName} is ready. You can join the session now.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-muted/50 border-border">
                    <Clock size={20} weight="fill" className="text-muted-foreground" />
                    <AlertDescription className="ml-2">
                      Waiting for {providerName} to enter the session...
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                onClick={handleJoinSession}
                disabled={!canJoin}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90"
              >
                {!permissions.camera || !permissions.microphone
                  ? 'Test Devices First'
                  : !isProviderPresent
                  ? 'Waiting for Provider...'
                  : 'Join Session'}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center pt-4 border-t border-border/50">
            <p>Welcome, {patientName}. Please test your devices before joining.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
