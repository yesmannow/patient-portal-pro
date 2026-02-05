import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PushPin, PushPinSlash, MicrophoneSlash, VideoCameraSlash } from '@phosphor-icons/react'
import type { Participant } from '@/types/telehealth'

interface ParticipantVideoProps {
  participant: Participant
  isPinned: boolean
  onTogglePin: () => void
  isCompact?: boolean
}

export function ParticipantVideo({ 
  participant, 
  isPinned, 
  onTogglePin,
  isCompact = false 
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream
    }
  }, [participant.stream])

  const getRoleBadgeColor = () => {
    switch (participant.role) {
      case 'provider':
        return 'bg-primary text-primary-foreground'
      case 'patient':
        return 'bg-accent text-accent-foreground'
      case 'specialist':
        return 'bg-secondary text-secondary-foreground'
      case 'family':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="relative w-full h-full group">
      {participant.stream && participant.videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.id === 'local'}
          className="w-full h-full object-cover bg-[oklch(0.15_0.02_245)]"
        />
      ) : (
        <div className="w-full h-full bg-[oklch(0.15_0.02_245)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-primary">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-white/70">{participant.name}</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className={getRoleBadgeColor()}>
            {participant.role}
          </Badge>
          
          {!participant.audioEnabled && (
            <div className="bg-destructive/90 p-1.5 rounded-md">
              <MicrophoneSlash size={16} weight="fill" className="text-white" />
            </div>
          )}
          
          {!participant.videoEnabled && (
            <div className="bg-destructive/90 p-1.5 rounded-md">
              <VideoCameraSlash size={16} weight="fill" className="text-white" />
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            variant={isPinned ? 'default' : 'outline'}
            onClick={onTogglePin}
            className={isPinned 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            {isPinned ? (
              <PushPinSlash size={18} weight="fill" />
            ) : (
              <PushPin size={18} weight="bold" />
            )}
          </Button>
        </div>

        <div className="absolute bottom-3 left-3">
          <p className={`font-medium text-white ${isCompact ? 'text-sm' : 'text-base'}`}>
            {participant.name}
          </p>
        </div>
      </div>
    </div>
  )
}
