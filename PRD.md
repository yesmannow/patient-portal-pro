# Planning Guide

A comprehensive business communication and customer relationship portal that enables seamless interaction between service providers and their clients through integrated messaging, appointment scheduling, and targeted engagement campaigns.

**Experience Qualities**:
1. **Professional** - Interface conveys trustworthiness and competence through clean design, clear hierarchy, and attention to detail
2. **Efficient** - Users can complete common tasks quickly with minimal clicks; providers can triage and respond to messages at speed
3. **Organized** - Complex information is structured logically with clear navigation, smart filtering, and visual grouping of related content

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires role-based access control, multiple interconnected data models (clients, cases, messages, appointments, campaigns), real-time messaging workflows, analytics dashboards, and sophisticated state management across provider and client portals.

## Essential Features

### Client Authentication & Profile Management
- **Functionality**: Secure login system with role-based access (client vs. provider); client profile with contact info, preferences, and tags
- **Purpose**: Establishes identity, personalizes experience, enables targeted communication
- **Trigger**: User navigates to portal URL or clicks login link
- **Progression**: Landing page → Login form → Dashboard (client or provider based on role)
- **Success criteria**: Users can log in, view their profile, update preferences; system correctly routes to appropriate dashboard

### Case Management System
- **Functionality**: Clients submit questions/concerns as cases; providers view, triage, assign priority, change status, respond
- **Purpose**: Organizes client communications into trackable threads with lifecycle management
- **Trigger**: Client clicks "New Case" or provider opens pending cases list
- **Progression**: New case button → Case form (subject, description, attachments) → Submit → Appears in provider queue → Provider reviews → Status updates → Resolution
- **Success criteria**: Cases persist with all metadata; status changes reflect in real-time; providers can filter by status/priority

### Threaded Messaging
- **Functionality**: Each case contains a message thread; clients and providers exchange messages; providers can add internal notes invisible to clients
- **Trigger**: User opens a case
- **Progression**: Case detail view → Message thread display → Compose message → Send → Message appears in thread with timestamp
- **Success criteria**: Messages display chronologically; internal notes hidden from clients; attachments supported

### Appointment Scheduling
- **Functionality**: View upcoming appointments; book new appointments with providers; receive confirmations
- **Purpose**: Coordinates in-person or virtual meetings
- **Trigger**: Client clicks "Schedule Appointment" or views calendar
- **Progression**: Calendar view → Select date/time → Choose provider → Add reason → Confirm → Appointment created → Appears on both dashboards
- **Success criteria**: Appointments persist; both parties can view; conflicts prevented

### Marketing Campaign Manager
- **Functionality**: Providers create targeted campaigns based on client tags; schedule sends; track engagement metrics
- **Purpose**: Proactive outreach for announcements, promotions, educational content
- **Trigger**: Provider navigates to campaigns section → Create campaign
- **Progression**: Campaign form → Set title, content, target tags, schedule → Save → System sends at scheduled time → Track opens/clicks
- **Success criteria**: Campaigns send to correct audience; metrics update; clients receive communications

### Analytics Dashboard
- **Functionality**: Display key metrics: average response time, case resolution rate, campaign engagement, client satisfaction
- **Purpose**: Data-driven insights for service improvement
- **Trigger**: Provider navigates to analytics tab
- **Progression**: Analytics page loads → Charts render → Filter by date range → Export data
- **Success criteria**: Metrics calculate correctly; visualizations clear; data updates as new events occur

## Edge Case Handling

- **Unauthenticated access attempts**: Redirect to login page; preserve intended destination for post-login redirect
- **Empty states**: Show helpful guidance when no cases, appointments, or campaigns exist (e.g., "No pending cases – you're all caught up!")
- **Long message threads**: Auto-collapse older messages; provide AI summary at top of thread
- **Missing client data**: Gracefully handle incomplete profiles; prompt for required fields
- **Concurrent edits**: Last-write-wins for now; future: show warning if case modified by another user
- **Network failures**: Show error toast; retry failed operations; preserve unsent message drafts in local state
- **Large attachments**: Validate file size; show upload progress; display error for oversized files
- **Invalid appointment times**: Prevent booking in past; check provider availability; show conflicts

## Design Direction

The design should evoke **trust, clarity, and calm efficiency**. Users should feel confident that their communications are secure and will be handled promptly. The interface should reduce cognitive load through excellent information hierarchy, generous whitespace, and purposeful use of color to indicate status and priority. Subtle animations reinforce actions without distraction.

## Color Selection

A sophisticated palette anchored in deep teals and warm neutrals, projecting professionalism and approachability.

- **Primary Color**: Deep Teal `oklch(0.45 0.08 210)` – Conveys trust, competence, and calm; used for primary actions, navigation highlights, and brand elements
- **Secondary Colors**: 
  - Warm Slate `oklch(0.35 0.015 260)` for secondary UI elements and borders
  - Soft Cream `oklch(0.97 0.01 85)` for card backgrounds and subtle contrast
- **Accent Color**: Vibrant Coral `oklch(0.68 0.15 25)` – Warm, inviting highlight for CTAs, notifications, and important status indicators
- **Foreground/Background Pairings**:
  - Primary Teal `oklch(0.45 0.08 210)`: White text `oklch(1 0 0)` - Ratio 8.2:1 ✓
  - Accent Coral `oklch(0.68 0.15 25)`: White text `oklch(1 0 0)` - Ratio 5.1:1 ✓
  - Background Cream `oklch(0.97 0.01 85)`: Dark Slate text `oklch(0.25 0.015 260)` - Ratio 12.8:1 ✓
  - Muted backgrounds `oklch(0.94 0.005 260)`: Mid-tone text `oklch(0.50 0.02 260)` - Ratio 6.4:1 ✓

## Font Selection

Typography should balance modern professionalism with excellent readability for extended use.

- **Primary**: **Instrument Sans** for UI elements, headings, and labels – geometric clarity with humanist warmth
- **Secondary**: **Inter** for body text, messages, and data tables – optimized for screen legibility

**Typographic Hierarchy**:
- H1 (Page Titles): Instrument Sans Bold / 32px / -0.02em letter spacing / line-height 1.2
- H2 (Section Headers): Instrument Sans Semibold / 24px / -0.01em / line-height 1.3
- H3 (Card Titles): Instrument Sans Medium / 18px / normal / line-height 1.4
- Body (Messages, Content): Inter Regular / 15px / normal / line-height 1.6
- Labels (Form Fields): Instrument Sans Medium / 13px / 0.01em / line-height 1.4
- Small (Metadata, Timestamps): Inter Regular / 13px / normal / line-height 1.5

## Animations

Animations should **orient users during transitions and provide tactile feedback** for interactions, never delay or distract. Use subtle spring physics (framer-motion defaults) for natural feel.

- **Page transitions**: 300ms slide-fade when switching dashboard views
- **Case status changes**: 200ms color fade and subtle scale pulse (0.98 → 1.0) on status badge
- **Message send**: Optimistic rendering with 150ms fade-in; subtle slide-up from compose area
- **Card hover states**: 150ms elevation increase (shadow depth change) and 100ms border color shift
- **Loading states**: Skeleton shimmer for content placeholders; indeterminate progress for actions
- **Toast notifications**: Slide-in from top-right with spring, auto-dismiss after 4s with fade-out

## Component Selection

**Components**: 
- **Dialog** for new case creation, appointment booking, campaign setup – modal focus on complex forms
- **Card** for case listings, appointment items, client profiles – contained units of information with clear visual boundaries
- **Tabs** for switching between "Active Cases," "Resolved," "All" – horizontal navigation within context
- **Badge** for case status, priority indicators – compact, color-coded labels (customize with status-specific colors)
- **Button** variants: primary (teal) for main actions, secondary (outline) for cancel/back, ghost for icon-only
- **Select** for provider assignment, status changes, tag selection
- **Textarea** for message composition, case descriptions
- **Calendar** (react-day-picker) for appointment scheduling
- **ScrollArea** for long message threads
- **Avatar** for client and provider identity in message threads
- **Separator** to divide sections within complex views
- **Toast** (sonner) for confirmations, errors, success messages

**Customizations**:
- **Case Card Component**: Custom card layout with left-border color coding by priority (high=coral, medium=amber, low=muted)
- **Message Bubble**: Custom component with role-based styling (client messages: cream background, provider: light teal)
- **Stats Card**: Custom card with large number display, label, and trend indicator for analytics
- **Empty State Illustration**: Custom SVG or icon-based empty states for zero-data views

**States**:
- Buttons: Default (solid primary) → Hover (darker teal, slight lift) → Active (pressed, scale 0.98) → Disabled (50% opacity, no pointer)
- Inputs: Default (border-input) → Focus (ring-2 ring-primary, border-primary) → Error (border-destructive, ring-destructive) → Filled (subtle background shift)
- Cards: Default (border-border) → Hover (border-primary/30, shadow-md) → Selected (border-primary, subtle background tint)

**Icon Selection**:
- **Chats** (ChatCircle) for cases/messages
- **Calendar** (CalendarBlank) for appointments
- **Megaphone** (Megaphone) for campaigns
- **ChartLine** (ChartLine) for analytics
- **User** (User) for client profiles
- **CheckCircle** (CheckCircle) for resolved status
- **Clock** (Clock) for pending status
- **ArrowRight** (ArrowRight) for progression indicators
- **Plus** (Plus) for create actions
- **FunnelSimple** (FunnelSimple) for filters

**Spacing**:
- Container padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
- Card internal spacing: `p-5` (20px)
- Gap between cards/list items: `gap-4` (16px)
- Form field spacing: `space-y-4` (16px vertical)
- Section margins: `mb-8` (32px) between major sections
- Inline element gaps: `gap-2` (8px) for icon+label, tags

**Mobile**:
- Navigation: Top app bar with hamburger menu; side drawer for main navigation (Sidebar component in sheet mode)
- Cards: Full-width on mobile (<768px); reduce internal padding to `p-4`
- Tabs: Scrollable horizontal tabs with scroll-shadow indicators
- Forms: Stack all inputs vertically; full-width buttons
- Message threads: Reduce avatar size; tighter message spacing
- Analytics: Stack charts vertically; simplified metrics (1 per row)
- Touch targets: Minimum 44px height for all interactive elements
