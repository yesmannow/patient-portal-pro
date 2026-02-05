import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  VideoCamera,
  VideoCameraSlash,
  Microphone,
  MicrophoneSlash,
  Monitor,
  MonitorArrowUp,
  Phone,
  PushPin,
  PushPinSlash,
  Clipboard,
  UserPlus
} from '@phosphor-icons/react'
import type { Participant, TelehealthSession, AppointmentStatus } from '@/types/telehealth'
import { ParticipantVideo } from './ParticipantVideo'
import { FloatingVideoWindow } from './FloatingVideoWindow'
import { InviteParticipantDialog } from './InviteParticipantDialog'

interface TelehealthProps {
  session: TelehealthSession
  localStream: MediaStream
  isProvider: boolean
  onEndSession: (status: AppointmentStatus) => void
}

export function Telehealth({ session, localStream, isProvider, onEndSession }: TelehealthProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null)
  const [isNoteTakingMode, setIsNoteTakingMode] = useState(false)
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false)
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState<AppointmentStatus>('completed')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  
  const screenStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())

  const toggleVideo = () => {
    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setVideoEnabled(videoTrack.enabled)
      
      toast.success(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off')
    }
  }

  const toggleAudio = () => {
    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setAudioEnabled(audioTrack.enabled)
      
      toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted')
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
        screenStreamRef.current = null
      }
      setIsScreenSharing(false)
      toast.success('Screen sharing stopped')
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        
        screenStreamRef.current = screenStream
        setIsScreenSharing(true)
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          screenStreamRef.current = null
        }
        
        toast.success('Screen sharing started')
      } catch (error) {
        toast.error('Failed to share screen', {
          description: 'Please allow screen sharing permissions'
        })
      }
    }
  }

  const togglePinParticipant = (participantId: string) => {
    if (pinnedParticipantId === participantId) {
      setPinnedParticipantId(null)
      toast.success('Participant unpinned')
    } else {
      setPinnedParticipantId(participantId)
      toast.success('Participant pinned to main view')
    }
  }

  const handleEndSession = () => {
    setShowEndSessionDialog(true)
  }

  const confirmEndSession = () => {
    localStream.getTracks().forEach(track => track.stop())
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    peerConnectionsRef.current.forEach(pc => pc.close())
    peerConnectionsRef.current.clear()
    
    onEndSession(selectedAppointmentStatus)
    toast.success('Session ended', {
      description: `Appointment status updated to: ${selectedAppointmentStatus}`
    })
  }

  const createPeerConnection = (participantId: string): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }
    
    const peerConnection = new RTCPeerConnection(configuration)
    
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })
    
    peerConnection.ontrack = (event) => {
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, stream: event.streams[0] }
          : p
      ))
    }
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate:', event.candidate)
      }
    }
    
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState)
    }
    
    peerConnectionsRef.current.set(participantId, peerConnection)
    return peerConnection
  }

  useEffect(() => {
    const mockParticipants: Participant[] = [
      {
        id: 'local',
        name: isProvider ? session.providerName : session.patientName,
        role: isProvider ? 'provider' : 'patient',
        stream: localStream,
        videoEnabled: true,
        audioEnabled: true,
        isPinned: false,
        isPresent: true
      },
      {
        id: 'remote',
        name: isProvider ? session.patientName : session.providerName,
        role: isProvider ? 'patient' : 'provider',
        videoEnabled: true,
        audioEnabled: true,
        isPinned: false,
        isPresent: true
      }
    ]
    
    setParticipants(mockParticipants)
    
    if (!isProvider) {
      createPeerConnection('remote')
    }
  }, [])

  useEffect(() => {
    return () => {
      localStream.getTracks().forEach(track => track.stop())
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
      }
      peerConnectionsRef.current.forEach(pc => pc.close())
    }
  }, [])

  const pinnedParticipant = participants.find(p => p.id === pinnedParticipantId)
  const otherParticipants = participants.filter(p => p.id !== pinnedParticipantId)
  const displayParticipants = pinnedParticipant ? [pinnedParticipant, ...otherParticipants] : participants

  if (isNoteTakingMode) {
    return (
      <FloatingVideoWindow
        participants={participants}
        localStream={localStream}
        onExitNoteTakingMode={() => setIsNoteTakingMode(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.02_245)] via-[oklch(0.18_0.03_250)] to-[oklch(0.15_0.02_245)] p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Telehealth Session</h1>
            <p className="text-sm text-white/70">
              {isProvider ? `With ${session.patientName}` : `With ${session.providerName}`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isProvider && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <UserPlus size={18} weight="bold" />
                  <span className="ml-2">Invite</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNoteTakingMode(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Clipboard size={18} weight="bold" />
                  <span className="ml-2">Take Notes</span>
                </Button>
              </>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              className="bg-destructive/90 hover:bg-destructive"
            >
              <Phone size={18} weight="fill" />
              <span className="ml-2">End Call</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={pinnedParticipant ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <Card className="bg-[oklch(0.12_0.02_245)] border-border/30 overflow-hidden">
              {pinnedParticipant ? (
                <div className="relative aspect-video">
                  <ParticipantVideo
                    participant={pinnedParticipant}
                    isPinned={true}
                    onTogglePin={() => togglePinParticipant(pinnedParticipant.id)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-4">
                  {displayParticipants.slice(0, 4).map(participant => (
                    <div key={participant.id} className="relative aspect-video">
                      <ParticipantVideo
                        participant={participant}
                        isPinned={false}
                        onTogglePin={() => togglePinParticipant(participant.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {pinnedParticipant && (
            <div className="space-y-4">
              {otherParticipants.slice(0, 3).map(participant => (
                <Card key={participant.id} className="bg-[oklch(0.12_0.02_245)] border-border/30 overflow-hidden">
                  <div className="relative aspect-video">
                    <ParticipantVideo
                      participant={participant}
                      isPinned={false}
                      onTogglePin={() => togglePinParticipant(participant.id)}
                      isCompact={true}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {isScreenSharing && screenStreamRef.current && (
          <Card className="bg-[oklch(0.12_0.02_245)] border-border/30 overflow-hidden">
            <div className="relative aspect-video">
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el && screenStreamRef.current) {
                    el.srcObject = screenStreamRef.current
                  }
                }}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <p className="text-sm text-white font-medium">Screen Share</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-[oklch(0.12_0.02_245)] border-border/30">
          <div className="p-4 flex items-center justify-center gap-3">
            <Button
              variant={videoEnabled ? 'default' : 'destructive'}
              size="lg"
              onClick={toggleVideo}
              className="px-6"
            >
              {videoEnabled ? (
                <VideoCamera size={24} weight="fill" />
              ) : (
                <VideoCameraSlash size={24} weight="fill" />
              )}
            </Button>

            <Button
              variant={audioEnabled ? 'default' : 'destructive'}
              size="lg"
              onClick={toggleAudio}
              className="px-6"
            >
              {audioEnabled ? (
                <Microphone size={24} weight="fill" />
              ) : (
                <MicrophoneSlash size={24} weight="fill" />
              )}
            </Button>

            <Button
              variant={isScreenSharing ? 'secondary' : 'outline'}
              size="lg"
              onClick={toggleScreenShare}
              className={isScreenSharing ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
            >
              {isScreenSharing ? (
                <Monitor size={24} weight="fill" />
              ) : (
                <MonitorArrowUp size={24} weight="bold" />
              )}
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Telehealth Session</DialogTitle>
            <DialogDescription>
              Please update the appointment status before ending the session.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select
              value={selectedAppointmentStatus}
              onValueChange={(value) => setSelectedAppointmentStatus(value as AppointmentStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndSessionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEndSession} className="bg-destructive hover:bg-destructive/90">
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showInviteDialog && (
        <InviteParticipantDialog
          sessionId={session.id}
          onClose={() => setShowInviteDialog(false)}
        />
      )}
    </div>
  )
}
