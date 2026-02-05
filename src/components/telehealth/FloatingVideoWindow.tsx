import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, ArrowsOutSimple } from '@phosphor-icons/react'
import type { Participant } from '@/types/telehealth'
import { createPortal } from 'react-dom'

interface FloatingVideoWindowProps {
  participants: Participant[]
  localStream: MediaStream
  onExitNoteTakingMode: () => void
}

export function FloatingVideoWindow({
  participants,
  localStream,
  onExitNoteTakingMode
}: FloatingVideoWindowProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream
    }
  }, [localStream])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const remoteParticipant = participants.find(p => p.id !== 'local')

  const content = (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card className="bg-[oklch(0.12_0.02_245)] border-border/30 shadow-2xl overflow-hidden">
        <div
          className="bg-gradient-to-r from-[oklch(0.15_0.02_245)] to-[oklch(0.18_0.03_250)] px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-white">
              {remoteParticipant?.name || 'Video Call'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onExitNoteTakingMode}
              className="h-7 w-7 p-0 text-white hover:bg-white/10"
            >
              <ArrowsOutSimple size={16} weight="bold" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onExitNoteTakingMode}
              className="h-7 w-7 p-0 text-white hover:bg-white/10"
            >
              <X size={16} weight="bold" />
            </Button>
          </div>
        </div>

        <div className="aspect-video bg-[oklch(0.15_0.02_245)] relative">
          {remoteParticipant?.stream ? (
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el && remoteParticipant.stream) {
                  el.srcObject = remoteParticipant.stream
                }
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-primary">
                    {remoteParticipant?.name?.charAt(0).toUpperCase() || 'P'}
                  </span>
                </div>
                <p className="text-xs text-white/70">{remoteParticipant?.name || 'Participant'}</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 right-3 w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover bg-[oklch(0.15_0.02_245)]"
            />
          </div>
        </div>

        <div className="p-3 bg-[oklch(0.10_0.02_245)] text-center">
          <p className="text-xs text-white/70">
            Drag to reposition • Click expand to return to full view
          </p>
        </div>
      </Card>
    </div>
  )

  return createPortal(content, document.body)
}
