# Planning Guide

A comprehensive WebRTC-based telehealth platform that enables secure, HIPAA-compliant video consultations between healthcare providers and patients, featuring advanced clinical workflows, smart waiting rooms, and collaborative session management.

**Experience Qualities**: 
1. **Clinical Excellence** - Every interaction should feel professional and medically appropriate, instilling confidence in both providers and patients
2. **Technical Reliability** - Rock-solid WebRTC connections with clear feedback on device status, permissions, and connection quality
3. **Workflow Integration** - Seamlessly integrate video sessions with clinical documentation, specialist consultations, and appointment management

**Complexity Level**: Complex Application (advanced functionality with multiple views and real-time communication)
This is a sophisticated telehealth platform with WebRTC peer connections, real-time state management, device permission handling, multiple participant support, clinical note-taking workflows, and session management features that require careful state orchestration.

## Essential Features

### Smart Waiting Room
- **Functionality**: Pre-session device testing and permission management with provider presence detection
- **Purpose**: Ensure patients have working audio/video before joining and prevent premature session access
- **Trigger**: Patient navigates to scheduled appointment
- **Progression**: Waiting room loads → Patient tests camera/microphone → Permissions granted → Provider status checked → Join button enables when provider present → Session begins
- **Success criteria**: Devices tested successfully, clear permission states, join blocked until provider ready, smooth transition to session

### WebRTC Video Session
- **Functionality**: Real-time peer-to-peer video conferencing with full media control
- **Purpose**: Enable high-quality, low-latency video consultations for telehealth appointments
- **Trigger**: Patient/provider joins after waiting room or directly (provider)
- **Progression**: Media streams initialized → Peer connections established → Video/audio tracks transmitted → UI controls respond → Session state managed
- **Success criteria**: Sub-500ms connection time, clear video quality, synchronized audio, responsive controls

### Clinical Controls & Interactions
- **Functionality**: Video toggle, microphone mute, screen sharing (desktop), participant pinning, note-taking mode
- **Purpose**: Provide clinically-relevant controls optimized for healthcare workflows
- **Trigger**: User interacts with control buttons during active session
- **Progression**: Button clicked → MediaStreamTrack.enabled toggled → UI feedback immediate → Remote participants notified → State persisted
- **Success criteria**: Instant visual feedback, state persists across UI updates, no audio/video glitches

### Provider Note-Taking Mode
- **Functionality**: Minimize video session to draggable corner window while documenting in EMR
- **Purpose**: Allow providers to maintain visual patient contact while charting
- **Trigger**: Provider clicks clipboard/notes icon
- **Progression**: Full session view → Minimize animation → Portal-rendered floating window → Draggable repositioning → Return to full view option
- **Success criteria**: Video continues smoothly, window stays on top, drag works across screen, no layout breaking

### Third-Party Invitations
- **Functionality**: Generate time-limited, pre-authenticated links for specialists or family to join
- **Purpose**: Enable specialist consultations and family member participation without full portal access
- **Trigger**: Provider clicks "Invite Participant" button
- **Progression**: Dialog opens → Provider enters name and role → Link generated with token → Link copied to clipboard → Invitee uses link to join
- **Success criteria**: Link generation instant, token secure and expiring, clipboard copy works, participant joins successfully

### End Session Workflow
- **Functionality**: Graceful session termination with appointment status update
- **Purpose**: Ensure proper clinical documentation and appointment record completion
- **Trigger**: Any participant clicks "End Call" button
- **Progression**: Confirmation dialog displays → Status dropdown shown (Completed/No Show/Cancelled) → Selection made → All media tracks stopped → Peer connections closed → Session logged → Return to lobby
- **Success criteria**: No orphaned connections, status saved correctly, clean state reset, history updated

## Edge Case Handling

- **Permission Denied** - Clear messaging when camera/mic blocked, instructions for browser settings
- **Provider No-Show** - Patient waiting room stays locked, timeout notification after 15 minutes
- **Mid-Session Disconnect** - Automatic reconnection attempt, visual indicator of connection quality
- **Screen Share on Mobile** - Hide/disable screen share button on mobile/tablet devices
- **Multiple Specialist Joins** - Layout adapts to grid view, pinning still functional
- **Note Mode While Screen Sharing** - Floating window shows screen share feed, not participant video
- **Browser Compatibility** - Graceful degradation for older browsers, feature detection

## Design Direction

The design should evoke boutique wellness aesthetics combined with cutting-edge technology - think high-end telehealth that feels both calming and sophisticated. Deep midnight blues create clinical professionalism while maintaining warmth and approachability.

## Color Selection

A boutique wellness palette anchored by deep midnight tones, creating a premium telehealth experience that feels both clinical and calming.

- **Primary Color**: Brand Midnight `oklch(0.15 0.02 245)` - Deep, sophisticated blue-black that communicates professionalism and focus, used for main UI backgrounds
- **Secondary Colors**: 
  - Twilight Accent `oklch(0.18 0.03 250)` - Slightly lighter midnight for subtle depth and layering
  - Crisp Clinical White `oklch(0.99 0 0)` - High-contrast text and card backgrounds for clarity
- **Accent Color**: Healing Teal `oklch(0.65 0.20 180)` - Vibrant teal for success states, active elements, and positive feedback
- **Foreground/Background Pairings**: 
  - White on Brand Midnight `oklch(0.99 0 0)` on `oklch(0.15 0.02 245)` - Ratio 15.8:1 ✓
  - Healing Teal on White `oklch(0.65 0.20 180)` on `oklch(0.99 0 0)` - Ratio 4.7:1 ✓
  - White on Twilight `oklch(0.99 0 0)` on `oklch(0.18 0.03 250)` - Ratio 14.2:1 ✓
  - Success Green `oklch(0.65 0.20 150)` on Card - Ratio 4.9:1 ✓
  - Error Red `oklch(0.55 0.22 25)` on Card - Ratio 5.8:1 ✓

## Font Selection

Typography that balances modern geometric forms with medical precision, combining Space Grotesk's distinctive character for UI with JetBrains Mono for clinical data.

- **Typographic Hierarchy**: 
  - H1 (App Title): Space Grotesk Bold / 36px / -2% letter spacing / leading-tight
  - H2 (Section Headers): Space Grotesk SemiBold / 28px / -1.5% letter spacing / leading-tight
  - H3 (Card Titles): Space Grotesk Medium / 20px / normal spacing / leading-normal
  - Body (UI Text): Space Grotesk Regular / 15px / normal spacing / leading-relaxed
  - Labels (Form Fields): Space Grotesk Medium / 13px / normal spacing / leading-normal
  - Data (Session IDs, Timestamps): JetBrains Mono Medium / 14px / normal spacing / tabular-nums

## Animations

Animations should reinforce the premium telehealth experience - smooth, purposeful, and never distracting from the critical clinical conversation.

- Video feed transitions use 300ms ease-out for layout changes
- Participant pinning animates with 250ms scale and position interpolation
- Note-taking mode minimize uses 400ms spring animation with portal rendering
- Control button states respond with 100ms color transitions
- Waiting room status changes fade in over 200ms
- Floating window drag has zero animation - direct manipulation only
- End session dialog appears with 150ms fade and subtle scale-up

## Component Selection

- **Components**: 
  - Dialog (Shadcn) for end session confirmation and invite participant flows
  - Card (Shadcn) for video participant containers and session history
  - Button (Shadcn) with custom variants for video controls and destructive actions
  - Select (Shadcn) for appointment status dropdown
  - Input (Shadcn) for invite participant name entry
  - Alert (Shadcn) for device permission status and provider presence
  - Badge (Shadcn) for participant role indicators
  - Tabs (Shadcn) for demo mode role selection

- **Customizations**: 
  - ParticipantVideo: Custom component with video element, hover overlay, and pin controls
  - FloatingVideoWindow: Portal-rendered draggable window for note-taking mode
  - WaitingRoom: Full-screen pre-session component with device testing
  - Telehealth: Main session container with dynamic grid layout

- **States**: 
  - Video enabled/disabled: Green default / Red destructive button variants
  - Microphone muted/unmuted: Toggle between icon states, color shift
  - Pin active/inactive: Filled pin icon vs outline, primary color highlight
  - Provider present/absent: Pulsing green dot vs gray clock icon
  - Connection quality: Border color changes (green/yellow/red)

- **Icon Selection**: 
  - VideoCamera/VideoCameraSlash for camera control
  - Microphone/MicrophoneSlash for audio control  
  - Monitor/MonitorArrowUp for screen sharing
  - PushPin/PushPinSlash for participant pinning
  - Clipboard for note-taking mode
  - Phone for ending call
  - UserPlus for inviting participants
  - CheckCircle/XCircle for status indicators
  - Clock for waiting states
  - Copy for clipboard actions

- **Spacing**: 
  - Video grid: gap-4 between participant tiles
  - Control bar: p-4 with gap-3 between buttons
  - Waiting room: space-y-6 for major sections
  - Floating window: Absolute positioning with draggable state

- **Mobile**: 
  - Waiting room stacks device preview and status vertically
  - Video grid switches to single column on small screens
  - Pinned view goes full screen on mobile
  - Control buttons slightly larger touch targets (44px minimum)
  - Screen sharing hidden on mobile devices
  - Note-taking mode not available on mobile (EMR requires desktop)
  - Floating window not draggable on mobile, docked to bottom
