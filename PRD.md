# Planning Guide

A comprehensive medical practice portal with intelligent workflow automation, structured form handling, predictive analytics, and open-source integration capabilities for patient-provider communication and care coordination.

**Experience Qualities**:
1. **Efficient** - Automated workflows reduce manual tracking, allowing providers to focus on care delivery rather than administrative tasks.
2. **Intelligent** - AI-driven insights surface patterns and suggest proactive interventions before issues escalate.
3. **Transparent** - Patients and providers have complete visibility into tasks, cases, forms, and care progress with clear status indicators.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This platform includes role-based multi-view dashboards, workflow automation engine, custom form builder, analytics with AI insights, structured task management, and integration points for external systems—all requiring sophisticated state management and coordinated data flows.

## Essential Features

### Workflow & Task Automation Engine
- **Functionality**: Auto-generates task sequences from events (new cases, form submissions, appointment changes, status transitions) based on configurable templates
- **Purpose**: Eliminates manual task creation and ensures consistent follow-through on care protocols
- **Trigger**: Event listeners on case creation, form submission, appointment scheduling, status changes
- **Progression**: Event occurs → Workflow engine matches template → Tasks created with calculated due dates → Provider receives notification → Provider completes/reassigns tasks → Status updates
- **Success criteria**: Tasks appear on provider dashboard within seconds of triggering event; overdue tasks flagged; completion rates tracked

### Form Builder & Structured Intake
- **Functionality**: Drag-and-drop interface for creating custom intake forms with typed fields; patient-facing form completion; automatic mapping to patient records and case creation
- **Purpose**: Standardizes data collection across different care scenarios while remaining flexible for clinic-specific needs
- **Trigger**: Admin/provider creates form template; patient assigned form; patient completes and submits
- **Progression**: Provider builds form definition → Saves template → Assigns to patient → Patient receives notification → Patient completes form → Data maps to patient record → Optional case/tasks created → Provider reviews submission
- **Success criteria**: Forms save and load reliably; submitted data correctly populates patient fields; conditional case/task creation works as configured

### Advanced Analytics & Predictive Insights
- **Functionality**: Visual charts showing case volume trends, task completion rates, bottleneck identification; AI-generated insights highlighting patterns and recommending actions
- **Purpose**: Transforms raw operational data into actionable intelligence for improving care delivery and resource allocation
- **Trigger**: Provider navigates to analytics dashboard; AI engine runs periodic analysis on aggregated data
- **Progression**: Provider opens analytics → Charts render with real-time data → Trend lines show patterns → AI insight cards display → Provider clicks insight for details → Provider takes suggested action
- **Success criteria**: Charts update dynamically; insights are contextually relevant; suggestions lead to measurable improvements in metrics

### Task Board & Management
- **Functionality**: Kanban-style board displaying tasks grouped by status and due date; filtering, assignment, and status updates
- **Purpose**: Centralizes provider workload visibility and enables efficient task triaging
- **Trigger**: Provider navigates to task board; tasks auto-created by workflow engine
- **Progression**: Provider views task board → Filters by patient/urgency/due date → Selects task → Reviews details → Marks complete or reassigns → Task updates → Metrics refresh
- **Success criteria**: Tasks sort correctly by due date; overdue tasks visually flagged; status changes persist; metrics reflect completion

### Open-Source Integration Hooks
- **Functionality**: FHIR-compliant API endpoints for importing/exporting patient data, appointments, and observations; placeholder functions for OpenEMR integration
- **Purpose**: Enables future interoperability with EMR systems without vendor lock-in
- **Trigger**: External system calls FHIR endpoints; manual data sync initiated by admin
- **Progression**: External request → Validate FHIR format → Map to internal data model → Persist → Return confirmation → Trigger workflows if needed
- **Success criteria**: FHIR resources parse correctly; data maintains integrity across systems; bi-directional sync works without data loss

### Telehealth & Communication Enhancements
- **Functionality**: WebRTC video consultation component stub; SMS/email reminder system placeholders
- **Purpose**: Supports virtual care delivery and proactive patient engagement
- **Trigger**: Provider schedules video visit; workflow triggers reminder for upcoming appointment/overdue task
- **Progression**: Video: Provider initiates → Patient receives link → Both join session → Video call completes → Notes saved to case. Reminders: Workflow trigger → System sends notification → Patient receives → Patient takes action
- **Success criteria**: Video component renders correctly (feature-flagged); reminder functions execute at correct times; notifications include relevant context

### AI-Powered Response Templates
- **Functionality**: Providers create reusable response templates with keyword matching and optional AI personalization; templates are automatically suggested based on case context; AI can generate responses from scratch or customize existing templates
- **Purpose**: Dramatically reduces provider response time for common patient inquiries while maintaining personalization and quality
- **Trigger**: Provider opens case detail dialog; system suggests relevant templates based on case type and keywords; provider clicks "AI Response" or selects template
- **Progression**: Provider views case → System suggests matching templates → Provider selects template or generates AI response → AI personalizes template with case context → Provider reviews and edits → Provider sends message
- **Success criteria**: Templates accurately match case keywords; AI personalization maintains professional tone; providers can edit before sending; template library is easily manageable

## Edge Case Handling

- **Missing Patient Data**: Form submissions and task creation gracefully handle incomplete patient records by creating placeholder entries and flagging for manual review.
- **Conflicting Task Assignments**: When multiple workflows attempt to create duplicate tasks, the engine deduplicates by task title + patient + due date to prevent redundancy.
- **Overdue Task Accumulation**: Tasks beyond 7 days overdue automatically escalate to practice admin with summary report.
- **Form Schema Changes**: Existing form submissions remain viewable even if the form definition is later modified; historical data preserved.
- **Provider Unavailability**: Task reassignment mechanism allows delegating tasks when assigned provider is marked away/offline.
- **Large Data Volumes**: Analytics dashboard limits chart data to last 90 days by default with option to expand; prevents rendering performance issues.
- **Network Interruptions**: Form submissions cache locally and retry automatically; users notified of pending submissions.
- **AI Response Failures**: If AI generation fails, providers can still manually type responses or use non-AI templates; user receives clear error message.
- **Template Keyword Mismatches**: When no templates match case keywords, providers can still manually select from all templates or generate fresh AI responses.
- **Duplicate Templates**: System allows multiple templates with similar keywords to coexist; relevance scoring ensures best matches surface first.

## Design Direction

The interface should evoke **clinical precision, calm efficiency, and trust**. Visual design communicates medical professionalism through clean layouts, structured information hierarchy, and purposeful use of color to signal urgency without creating anxiety. The experience feels like a thoughtfully organized medical practice—organized, attentive, and human-centered.

## Color Selection

Soft clinical blues and greens create a calming medical environment, while warm accents provide approachable human touch. Urgency levels use universally understood traffic-light semantics.

- **Primary Color**: Deep Clinical Blue `oklch(0.50 0.12 230)` - Conveys medical professionalism, trustworthiness, and calm authority. Used for primary actions and navigation.
- **Secondary Colors**: 
  - Soft Slate `oklch(0.94 0.005 240)` for subtle backgrounds and secondary UI elements
  - Muted Purple `oklch(0.60 0.15 290)` for provider-specific features and workflow elements
- **Accent Color**: Warm Coral `oklch(0.60 0.20 25)` - Draws attention to critical actions and important notifications. White text `oklch(1 0 0)` - Ratio 5.2:1 ✓
- **Foreground/Background Pairings**: 
  - Background Light Blue-Gray `oklch(0.98 0.005 240)`: Dark Text `oklch(0.25 0.015 240)` - Ratio 14.8:1 ✓
  - Card White `oklch(0.99 0.002 240)`: Dark Text `oklch(0.25 0.015 240)` - Ratio 15.2:1 ✓
  - Primary Blue `oklch(0.50 0.12 230)`: White `oklch(1 0 0)` - Ratio 6.8:1 ✓
- **Urgency Indicators**:
  - Urgent: Red `oklch(0.55 0.22 25)` with border accents
  - Time-Sensitive: Amber `oklch(0.70 0.15 70)` for moderate priority
  - Routine: Blue `oklch(0.60 0.12 230)` for standard workflow

## Font Selection

Typography should balance medical authority (clear, structured) with human approachability (warm, accessible). Instrument Sans provides geometric precision for UI elements while Inter ensures excellent readability for body content.

- **Typographic Hierarchy**:
  - H1 (Dashboard Titles): Instrument Sans Bold / 30px / -0.02em letter spacing / 1.2 line height
  - H2 (Section Headers): Instrument Sans SemiBold / 20px / -0.01em / 1.3
  - H3 (Card Titles): Instrument Sans Medium / 16px / normal / 1.4
  - Body Text: Inter Regular / 14px / normal / 1.6
  - Small Labels: Inter Medium / 12px / 0.01em / 1.4
  - Button Text: Instrument Sans SemiBold / 14px / 0.01em / 1

## Animations

Animations reinforce the sense of precision and responsiveness expected in medical software. Micro-interactions provide immediate feedback for actions, while page transitions maintain spatial context. All animations should feel purposeful and complete within 200-350ms.

Key animation moments: Form field focus (subtle glow), task completion (satisfying check with fade), card hover (gentle lift), status badge transitions (smooth color morph), chart data updates (animated value changes), workflow progression (cascading task appearance).

## Component Selection

- **Components**: 
  - Dialog for task details, case detail, form builder configuration
  - Card for dashboard metrics, case summaries, appointment listings, task items, response templates
  - Tabs for switching between dashboard views (overview/analytics/tasks/templates)
  - Select for filtering cases/tasks by status, urgency, type; template categories
  - Button for primary actions (new case, complete task, submit form, generate AI response), variants for urgency levels
  - Badge for status indicators, urgency levels, role tags, AI-enabled templates
  - Popover for template suggestions dropdown in case detail
  - Calendar (react-day-picker) for appointment scheduling and date inputs
  - Form components (Input, Textarea, Select, Checkbox, Switch) with react-hook-form for validation
  - Table for analytics data, form submission history
  - Progress bar for task completion metrics
  - Alert for workflow notifications, AI insights, and template feature explanations
  - Accordion for collapsible sections in form builder
  - Avatar for provider/patient identification
  - Separator for visual section breaks in complex forms

- **Customizations**: 
  - Custom workflow visualization component showing event → task chain
  - Drag-and-drop form field reordering using framer-motion
  - AI insight cards with animated appearance and color-coded severity
  - Task board with status columns using custom grid layout
  - Chart components using recharts with clinical color palette

- **States**: 
  - Buttons: Rest (solid primary), Hover (subtle shadow + slight scale), Active (inset shadow), Disabled (40% opacity + no pointer)
  - Input fields: Default (border-input), Focus (ring-2 ring-primary), Error (ring-destructive + error text), Success (subtle green border)
  - Task items: Todo (neutral), In Progress (blue border-left accent), Done (green check + reduced opacity), Overdue (red pulse animation)
  - Workflow status: Active (pulsing indicator), Paused (gray), Completed (checkmark)

- **Icon Selection**: 
  - Phosphor Icons weight="regular" for most UI, weight="duotone" for empty states and feature illustrations, weight="fill" for active/selected states
  - Task: CheckSquare, ListChecks
  - Workflow: Flow, GitBranch, Robot
  - Analytics: ChartLine, TrendUp, Lightbulb
  - Forms: TextBox, ListPlus, SquaresFour
  - Communication: VideoCamera, Bell, ChatCircle
  - Medical: FirstAid, Pulse, FileText

- **Spacing**: 
  - Card padding: `p-6` for main content areas
  - Section gaps: `space-y-6` for dashboard sections
  - Grid gaps: `gap-6` for card grids, `gap-4` for form fields
  - Button spacing: `px-4 py-2` for default, `px-6 py-3` for large
  - Inline element gaps: `gap-2` for badges/icons, `gap-3` for button groups

- **Mobile**: 
  - Dashboard metric cards: 3-column grid on desktop → single column on mobile
  - Task board: horizontal scroll on mobile with snap points for each status column
  - Form builder: drag-and-drop disabled on mobile, replaced with reorder buttons
  - Analytics charts: responsive aspect ratios, legends move below chart on narrow screens
  - Navigation: hamburger menu for mobile with slide-out drawer
  - Action buttons: fixed bottom bar on mobile for primary actions (New Case, Complete Task)
  - Tables: horizontal scroll with sticky first column for key data
