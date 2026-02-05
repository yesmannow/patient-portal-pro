# Planning Guide

A HIPAA-compliant medical practice patient-provider communication platform that enables secure messaging, care coordination, and clinical workflow management between healthcare providers and their patients.

**Experience Qualities**:
1. **Trustworthy** - Interface conveys security, professionalism, and clinical competence through clear data hierarchy and medical-grade attention to detail
2. **Efficient** - Healthcare providers can triage urgent cases, respond to routine inquiries, and manage patient communications with minimal clicks
3. **Clear** - Medical terminology and patient statuses are consistently presented with structured fields, eliminating ambiguity in care coordination

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires role-based access control (patient vs. provider with different specialties), structured medical data models with immutable enums, clinical workflow management, secure messaging with internal notes, appointment coordination, and real-time status updates across multiple care team members.

## Essential Features

### Patient Authentication & Profile Management
- **Functionality**: Secure login for patients; profile displays firstName, lastName, dateOfBirth, contact information, preferredContactMethod, conditionType, patientStatus, and onboardingSource
- **Purpose**: Establishes patient identity, tracks care journey, enables targeted communication based on condition type and status
- **Trigger**: Patient navigates to portal URL or clicks login link
- **Progression**: Landing page → Login form → Patient Dashboard with cases and appointments
- **Success criteria**: Patients can log in, view their structured profile with all enum fields displayed clearly; system routes based on role

### Provider Authentication & Availability Management
- **Functionality**: Secure login for providers; profile displays name, role (physician|therapist|nurse|admin), specialty, and availabilityStatus
- **Purpose**: Establishes provider identity and credentials, enables intelligent case routing based on specialty and availability
- **Trigger**: Provider navigates to portal URL
- **Progression**: Landing page → Login form → Provider Dashboard with case queue and patient overview
- **Success criteria**: Providers can log in, system displays role and specialty badges, availability status updates persist

### Clinical Case Management System
- **Functionality**: Patients create cases with caseType (question|followUp|billing|clinicalConcern|admin), urgency (routine|timeSensitive|urgent), subject, and description; providers triage by urgency and type, assign cases, update status through workflow (open → awaitingPatient/awaitingProvider → resolved)
- **Purpose**: Structures patient communications into trackable clinical workflows with clear urgency indicators for care team prioritization
- **Trigger**: Patient clicks "New Case" or provider opens case queue filtered by urgency or caseType
- **Progression**: New case form → Select caseType and urgency (required enums) → Enter subject/description → Submit → Appears in provider queue sorted by urgency → Provider reviews → Status progresses through workflow → Resolution
- **Success criteria**: Cases display with caseType badges, urgency color-coding (urgent=red, timeSensitive=amber, routine=blue); providers can filter by caseType and urgency; status transitions follow clinical workflow; no free-text status values

### Secure Threaded Messaging
- **Functionality**: Each case contains a message thread; patients and providers exchange messages; providers add internal notes (visibility: internal) invisible to patients
- **Purpose**: HIPAA-compliant communication with clinical documentation separated from patient-facing messages
- **Trigger**: User opens a case from dashboard
- **Progression**: Case detail view → Message thread display (patient messages vs. internal notes visually distinct) → Compose message → Select visibility (provider only) → Send → Message appears with timestamp and sender badge
- **Success criteria**: Messages display chronologically; internal notes have distinct styling and "Internal Note" badge; patient users never see internal visibility messages; attachments supported

### Appointment Scheduling & Coordination
- **Functionality**: View upcoming appointments by patient; schedule appointments with specific providers based on their role and specialty
- **Purpose**: Coordinates clinical visits and follow-up care
- **Trigger**: Patient clicks "Schedule Appointment" or views appointment calendar
- **Progression**: Calendar view → Select date/time → Choose provider (filtered by specialty) → Add clinical reason → Confirm → Appointment persists → Appears on both patient and provider dashboards
- **Success criteria**: Appointments display with provider specialty and role; both parties can view; status (scheduled|completed|cancelled) updates correctly

### Clinical Analytics Dashboard (Provider)
- **Functionality**: Display key practice metrics: case volume by caseType, urgency distribution, average response time by urgency level, resolution rate, patient status breakdown
- **Purpose**: Data-driven insights for practice management and clinical quality improvement
- **Trigger**: Provider navigates to analytics tab
- **Progression**: Analytics page loads → Charts render showing caseType distribution, urgency trends, response time by urgency → Filter by date range → Export data
- **Success criteria**: All metrics calculate from structured enum fields; no reliance on free-text; visualizations show clinical workflow patterns clearly

## Edge Case Handling

- **Unauthenticated access attempts**: Redirect to login; preserve intended destination for post-login redirect
- **Empty patient queue**: Show helpful onboarding message with clinical context (e.g., "No active cases – your care team will respond within 24 hours")
- **Long message threads**: Auto-collapse older messages beyond 10; display expand control
- **Missing patient data**: Required fields (firstName, lastName, dateOfBirth, preferredContactMethod, conditionType) must be captured; gracefully prompt for completion
- **Concurrent case updates**: Last-write-wins for status changes; display warning if case modified by another provider
- **Network failures**: Show error toast; retry failed operations; preserve unsent message drafts in component state
- **Invalid appointment times**: Prevent booking in past; check provider availability; show scheduling conflicts
- **Urgent case notification**: Visual indicator (red badge) on urgent cases; providers see urgent cases first in queue

## Design Direction

The design should evoke **clinical trust, clarity, and calm efficiency**. Patients should feel confident their health concerns are being handled securely and professionally. Providers should experience a streamlined clinical workflow with clear urgency indicators and structured data presentation. The interface reduces cognitive load through excellent medical information hierarchy, generous whitespace, and purposeful use of color to indicate clinical urgency and case status.

## Color Selection

A professional medical palette anchored in calming blues and clinical whites, with clear urgency indicators.

- **Primary Color**: Medical Blue `oklch(0.50 0.12 230)` – Conveys trust, clinical professionalism, and calm; used for primary actions and provider elements
- **Secondary Colors**: 
  - Clinical Slate `oklch(0.40 0.01 240)` for secondary UI elements and provider notes
  - Soft White `oklch(0.98 0.005 240)` for card backgrounds and clean clinical aesthetic
- **Accent Color**: Urgent Red `oklch(0.60 0.20 25)` – Clear, medical-appropriate indicator for urgent cases and critical status
- **Foreground/Background Pairings**:
  - Primary Blue `oklch(0.50 0.12 230)`: White text `oklch(1 0 0)` - Ratio 7.1:1 ✓
  - Urgent Red `oklch(0.60 0.20 25)`: White text `oklch(1 0 0)` - Ratio 5.8:1 ✓
  - Background White `oklch(0.98 0.005 240)`: Dark text `oklch(0.25 0.015 240)` - Ratio 13.2:1 ✓
  - Muted backgrounds `oklch(0.94 0.005 240)`: Mid-tone text `oklch(0.50 0.02 240)` - Ratio 6.2:1 ✓

## Font Selection

Typography should convey medical professionalism with excellent readability for clinical documentation.

- **Primary**: **Instrument Sans** for UI elements, headings, and clinical labels – modern, professional, highly legible
- **Secondary**: **Inter** for body text, message threads, and patient documentation – optimized for extended reading of medical content

**Typographic Hierarchy**:
- H1 (Page Titles): Instrument Sans Semibold / 32px / -0.02em letter spacing / line-height 1.2
- H2 (Section Headers): Instrument Sans Semibold / 24px / -0.01em / line-height 1.3
- H3 (Card Titles): Instrument Sans Medium / 18px / normal / line-height 1.4
- Body (Messages, Notes): Inter Regular / 15px / normal / line-height 1.6
- Labels (Form Fields, Enums): Instrument Sans Medium / 13px / 0.01em / line-height 1.4
- Small (Metadata, Timestamps): Inter Regular / 13px / normal / line-height 1.5

## Animations

Animations should **orient users during clinical workflow transitions and provide clear feedback** for status changes, never delaying critical medical information display.

- **Case status transitions**: 250ms color fade and subtle pulse on status badge when changed
- **Urgency indicator**: Urgent cases have subtle 2s pulse animation on red border to draw provider attention
- **Message send**: 150ms fade-in; immediate optimistic rendering for clinical responsiveness
- **Provider availability change**: 200ms color transition on availability badge
- **Loading states**: Skeleton shimmer for case lists; no blocking spinners for critical data
- **Toast notifications**: Slide-in from top-right for case assignments and urgent alerts

## Component Selection

**Components**: 
- **Dialog** for new case creation, appointment booking – modal focus on structured form entry
- **Card** for case listings, patient profiles – clean, bordered containers for medical information
- **Badge** for caseType, urgency, patientStatus, providerRole, availabilityStatus – color-coded enum indicators
- **Select** for all enum fields (caseType, urgency, status, providerRole, conditionType, etc.) – enforces structured data entry
- **Button** variants: primary (medical blue) for main actions, secondary (outline) for cancel, destructive (red) for urgent actions
- **Textarea** for message composition, case descriptions
- **Separator** to divide patient info sections and message threads
- **ScrollArea** for long message threads in clinical cases
- **Avatar** with role badges for patient and provider identity in messages
- **Toast** (sonner) for case assignments, urgent case alerts, status confirmations

**Customizations**:
- **Case Card Component**: Custom card with left-border color by urgency (urgent=red 4px, timeSensitive=amber 4px, routine=blue 2px); caseType badge in header
- **Message Bubble**: Role-based styling (patient: soft white background, provider: light blue background, internal note: yellow tint with lock icon)
- **Urgency Indicator**: Custom component with pulsing animation for urgent cases; static for routine/timeSensitive
- **Provider Badge**: Custom badge showing role icon + specialty text
- **Patient Status Indicator**: Color-coded badge (new=green, active=blue, dormant=gray, discharged=slate)

**States**:
- Buttons: Default (solid primary) → Hover (darker blue) → Active (pressed) → Disabled (50% opacity)
- Case Cards: Default → Hover (border-primary, shadow) → Selected (blue background tint)
- Status Badges: Animate on change with 250ms color transition
- Urgency Urgent: Continuous subtle 2s pulse to maintain provider attention

**Icon Selection**:
- **ChatCircle** for cases/messages
- **CalendarBlank** for appointments
- **FirstAidKit** for clinical concerns
- **Question** for question caseType
- **ClockCounterClockwise** for follow-up caseType
- **CurrencyDollar** for billing caseType
- **Clipboard** for admin caseType
- **Warning** for urgent urgency
- **Clock** for timeSensitive urgency
- **CheckCircle** for resolved status
- **UserCircle** for patient
- **Stethoscope** for providers

**Spacing**:
- Container padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
- Card internal spacing: `p-5` (20px) for clinical information cards
- Gap between case cards: `gap-4` (16px)
- Form field spacing: `space-y-4` (16px) for structured enum entry
- Section margins: `mb-8` (32px) between dashboard sections
- Message bubble spacing: `gap-3` (12px) for readability

**Mobile**:
- Navigation: Top medical header with patient/provider name; hamburger for secondary navigation
- Case Cards: Full-width on mobile; reduce padding to `p-4`; urgency border remains prominent
- Enum Badges: Maintain full size for clinical clarity; wrap if needed
- Forms: Stack all enum selects vertically; full-width buttons
- Message threads: Maintain role distinction; reduce avatar size to 32px
- Touch targets: Minimum 44px for all clinical actions and case selections
