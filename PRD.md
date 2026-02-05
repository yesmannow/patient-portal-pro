# Planning Guide

A comprehensive medical practice portal with intelligent workflow automation, structured form handling, predictive analytics, clinical decision support, and real-time care gap detection for patient-provider communication and care coordination.

**Latest Iteration (v2.0)**: Enhanced data architecture with comprehensive patient demographics (MRN, insurance, emergency contacts), clinical history tracking (problem lists, surgical history, medications, allergies), vitals trending with automated alerts, social determinants of health (SDOH) collection, proactive care gap detection, smart clinical templates, and waitlist automation.

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

### Patient Financial & Payment Module
- **Functionality**: Displays patient payment history with charges, balances, insurance adjustments; secure payment dialog for card entry (integrated with payment processor stub); automatic payment confirmation
- **Purpose**: Enables patients to manage financial obligations directly through the portal, reducing administrative burden
- **Trigger**: Patient navigates to Payments tab; clicks "Pay Now" on outstanding balance
- **Progression**: Patient views payment history → Identifies outstanding balance → Clicks "Pay Now" → Enters card details in secure dialog → Submits payment → Receives confirmation → Status updates to "Paid" → Workflow updates patient status to "Active"
- **Success criteria**: Payment history displays accurately; payment dialog validates card input; successful payments trigger workflow automation; patient status updates correctly

### Provider Availability Management
- **Functionality**: Weekly calendar view allowing providers to mark time blocks as "Available" or "Blocked"; granular control over scheduling windows
- **Purpose**: Gives providers control over their schedule and ensures patients can only book during confirmed availability
- **Trigger**: Provider clicks "Set Availability" in dashboard; modifies time blocks
- **Progression**: Provider opens availability tool → Views weekly calendar → Clicks time blocks to toggle availability → Saves changes → Availability instantly reflects in patient self-scheduling view
- **Success criteria**: Availability changes save and persist; patient booking view respects provider availability; visual clarity on available vs blocked times

### Patient Self-Scheduling
- **Functionality**: Calendar view filtered by provider availability; appointment booking creates both Appointment record and confirmation Task; automatic notifications
- **Purpose**: Reduces administrative overhead by allowing patients to book their own appointments during available times
- **Trigger**: Patient clicks "Book New Appointment" in dashboard
- **Progression**: Patient clicks "Book Appointment" → Views calendar filtered by provider availability → Selects date and time → Enters reason for visit → Confirms booking → Appointment created → Confirmation task auto-generated for staff → Patient receives confirmation
- **Success criteria**: Calendar shows only available slots; appointment saves correctly; task automatically created for staff; no double-booking possible

### Role-Based Access Control (RBAC)
- **Functionality**: Granular role-based dashboard views for Front Desk, Nurse, Doctor, and Billing staff; each role sees only relevant features and data tailored to their job duties
- **Purpose**: Eliminates "click fatigue" by removing irrelevant features; improves efficiency by presenting role-specific workflows; protects sensitive data through role segregation
- **Trigger**: Provider logs in and selects role; system renders appropriate dashboard view
- **Progression**: Provider selects role at login → System loads role-specific navigation tabs → Dashboard displays relevant features (Front Desk: Schedule with hover profiles, confirmations, VoIP | Nurse: Rooming queue, tasks, VoIP | Doctor: Cases, tasks, availability, analytics, forms, templates, VoIP, API Hub | Billing: Billing dashboard, analytics, VoIP)
- **Success criteria**: Each role sees only their designated features; unauthorized features are not rendered; workflow efficiency improves through focused UI

### External API Integration Hub
- **Functionality**: Real-time integration with external public APIs for data validation, clinical decision support, holiday awareness, and security scanning; unified dashboard showing all API connections and automation workflows
- **Purpose**: Connects internal workflows to external data sources for automated validation, compliance, and clinical accuracy; demonstrates "Gold Standard" operational automation beyond internal features
- **Trigger**: Provider navigates to API Hub; system executes API calls based on user actions (intake form submission, drug lookup, appointment scheduling, file upload)
- **Progression**: User initiates action → System calls appropriate external API → Validates/enriches data in real-time → Returns result → User sees instant feedback → Data saved only if validation passes
- **Success criteria**: Phone numbers validated for SMS capability; emails screened for disposable addresses; addresses verified with USPS; public holidays block scheduling; drug info retrieved from OpenFDA; ICD-10 codes suggested for diagnoses; uploaded files scanned for malware before storage

### Smart Patient Intake with Data Validation
- **Functionality**: Patient registration form with real-time phone validation (NumVerify/Abstract API), email quality scoring (Eva/MailboxLayer), and USPS address verification (Smarty/Postcodes.io)
- **Purpose**: Prevents bad contact data from entering the system; ensures SMS confirmations reach mobile numbers; validates deliverable addresses for billing
- **Trigger**: Front desk or patient fills out intake form; clicks validation buttons
- **Progression**: User enters contact info → Clicks validate button → API validates data → System displays result (mobile/landline, email quality score, USPS-standardized address) → Flags issues before save → Only clean data enters database
- **Success criteria**: Phone validation identifies SMS-capable mobile numbers; email validation rejects disposable addresses; address validation auto-corrects to USPS standard format; form prevents submission with invalid data

### Clinical Decision Support APIs
- **Functionality**: Real-time drug information lookup via OpenFDA (brand names, warnings, recalls, adverse events) and ICD-10 code search via ClinicalTables API for automated billing
- **Purpose**: Provides instant clinical reference during prescribing and documentation; automates medical coding for billing claims; alerts to drug recalls and safety issues
- **Trigger**: Provider searches drug name or diagnosis in Clinical Decision Support dashboard
- **Progression**: Provider types drug name → Searches OpenFDA → System displays official drug label, warnings, recalls, adverse events → Provider types diagnosis → Searches ICD-10 → System suggests billable codes → Provider copies code to billing form
- **Success criteria**: Drug info retrieved within 2 seconds; recalls prominently displayed; ICD-10 suggestions match diagnosis; codes marked as billable; providers can copy codes to clipboard

### Holiday-Aware Smart Scheduling
- **Functionality**: Appointment scheduler integrated with Nager.Date public holiday API; automatically blocks scheduling on federal holidays, weekends, and office closures
- **Purpose**: Prevents patients from self-scheduling on days the office is closed; reduces administrative burden of manually blocking dates
- **Trigger**: Patient or front desk accesses appointment scheduler; system loads current year holidays
- **Progression**: User opens scheduler → System fetches holidays from API → Calendar disables holiday dates → User selects available date → Selects provider and time → Books appointment → System queues 72-hour SMS confirmation
- **Success criteria**: Holidays auto-blocked on calendar; holiday names displayed on hover; weekends disabled; only available dates selectable; upcoming holidays listed in sidebar

### Secure Document Upload with Malware Scanning
- **Functionality**: Patient document uploader with real-time malware scanning via VirusTotal/ClamAV API before files reach server
- **Purpose**: HIPAA compliance and ransomware protection; prevents malicious files from infecting medical records system
- **Trigger**: Patient or staff uploads document (PDF, image, etc.)
- **Progression**: User selects file → System sends to scanning API → Displays scanning progress → Returns threat report → Safe files marked green and uploadable → Infected files marked red and blocked → Only clean files reach server
- **Success criteria**: All files scanned before upload; threats blocked automatically; scan results displayed with threat names; safe files upload successfully; infected files rejected with clear warning

### Hover-Active Schedule (Front Desk)
- **Functionality**: Front Desk schedule displays today's appointments with hover-triggered mini-profile popups showing patient balance, missing forms (HIPAA/Intake), and visit reason
- **Purpose**: Revenue protection by ensuring staff never miss outstanding balances during check-in; compliance by flagging missing forms before patient is roomed
- **Trigger**: Front Desk staff hovers mouse over patient name in schedule
- **Progression**: Front Desk opens schedule → Views today's appointments → Hovers over patient name → Mini-profile popup appears showing balance (red if >$0), form status (red flags for missing HIPAA/Intake), and visit reason
- **Success criteria**: Popup displays instantly on hover; balance shown in red when >$0; missing forms clearly flagged; visit reason easily visible

### 72-Hour Smart Confirmation Automation
- **Functionality**: Automated system triggers transactional SMS 72 hours before appointments; patient replies "1" to confirm or "2" to reschedule; confirmation automatically updates appointment status to "confirmed" (green in schedule)
- **Purpose**: Reduces no-shows by proactive confirmation; eliminates manual phone call workload; keeps schedule optimized
- **Trigger**: System automatically checks appointments every minute; sends SMS when appointment is 72 hours away
- **Progression**: Appointment within 72 hours → System sends SMS "Reply 1 to Confirm or 2 to Reschedule" → Patient replies "1" → Appointment status changes to "confirmed" → Front Desk schedule shows green badge → Staff knows patient is coming
- **Success criteria**: SMS trigger fires at 72 hours; patient "1" response changes status to "confirmed"; schedule badge turns green; "2" response notifies staff for follow-up

### Waitlist Backfill Automation
- **Functionality**: When appointment cancelled within 24 hours, system automatically scans waitlist for patients wanting that provider and sends SMS notifications to fill the gap; first patient to respond "YES" claims the slot
- **Purpose**: Maximizes provider utilization; reduces revenue loss from last-minute cancellations; improves patient access by filling slots from waitlist
- **Trigger**: Appointment status changes to "cancelled" and appointment is within 24 hours
- **Progression**: Patient cancels appointment → System detects cancellation <24 hours before visit → Scans waitlist for matching provider → Finds 3 waitlist patients → Sends SMS "Slot available on [date] at [time]. Reply YES to claim" → First patient replies YES → Slot reassigned → Other waitlist patients notified slot is filled
- **Success criteria**: Cancellations within 24 hours trigger waitlist check; SMS sent to up to 3 waitlist patients; first "YES" response books appointment; other patients notified; slot filled within minutes

### VoIP Screen Pop Integration with Validated Phone Numbers
- **Functionality**: When incoming call detected from patient phone number, system instantly displays full clinical profile popup including phone validation status (line type, carrier, SMS capability), upcoming appointments, outstanding labs, and account balance; phone number matching uses intelligent normalization to handle different formats
- **Purpose**: Patient satisfaction through personalized greeting; staff efficiency by eliminating manual lookup; instant context for better service; validation status alerts staff if SMS confirmations will fail
- **Trigger**: VoIP system detects incoming call; phone number matches patient record via normalized comparison
- **Progression**: Incoming call detected → System normalizes phone number and matches to patient record → Screen pop displays patient profile with phone validation details (validated status, line type, carrier, SMS capability) → Displays upcoming appointments, outstanding lab results, and account balance → Alerts for unvalidated numbers → Staff greets patient by name with instant context → Call completes → Profile closes
- **Success criteria**: Screen pop appears within 1 second of call detection; patient correctly matched by normalized phone number; phone validation metadata displayed (line type, carrier, SMS capable); warning shown for unvalidated numbers; all relevant data displayed (appointments, labs, balance); staff can immediately reference information

### Enhanced Data Architecture & Clinical History
- **Functionality**: Comprehensive patient records including MRN, emergency contacts, guarantor info, insurance details, structured problem lists with ICD-10 codes, surgical history, active medications, documented allergies with severity levels, and social determinants of health (housing, transportation, employment)
- **Purpose**: Moves beyond basic demographics to capture complete clinical context; enables accurate billing, care coordination, and proactive risk assessment
- **Trigger**: Front desk or clinical staff accesses patient intake form; nurse updates vitals; provider documents clinical findings
- **Progression**: Staff opens enhanced intake form with tabs (Demographics, Insurance/Admin, SDOH) → Captures validated contact info → Records insurance status → Documents housing/transportation barriers → Saves comprehensive profile → Data available across all clinical workflows
- **Success criteria**: All structured data persists correctly; problem list supports active/inactive statuses; allergies display with severity indicators; SDOH data informs care gap alerts

### Vitals Dashboard with Trend Analysis
- **Functionality**: Visual charting of blood pressure, BMI, heart rate, temperature, and oxygen saturation over time; automatic calculation of BMI from height/weight; color-coded status badges for abnormal readings; high-risk alerts for hypertension (BP ≥140/90), obesity (BMI ≥30), and hypoxia (O2 <95%)
- **Purpose**: Enables nurses to quickly assess patient status; provides providers with trend data for chronic disease management; triggers automated alerts for dangerous vitals
- **Trigger**: Nurse records vitals in rooming queue; provider views patient vitals dashboard
- **Progression**: Nurse enters measurements → System calculates BMI → Checks vital thresholds → Displays high-risk badge if abnormal → Saves to patient record → Provider views trends on dashboard → Line charts show BP/BMI/HR over last 10 visits
- **Success criteria**: Vitals persist with timestamps; BMI auto-calculates correctly; BP ≥140/90 triggers red "High Risk" badge; trend charts render with last 10 readings; abnormal values visually distinct

### Clinical Decision Support & Care Gap Detection
- **Functionality**: Automated scanning of patient data to detect preventive care gaps (colonoscopy for age 50+, A1C for diabetics >6 months overdue, vaccinations); displays urgent/warning/info alerts; shows all documented allergies across patient panel; proactive notifications for missing screenings
- **Purpose**: Shifts from reactive to proactive care; prevents missed screenings that lead to late-stage diagnoses; reduces malpractice risk by flagging overdue tests
- **Trigger**: System runs periodic care gap analysis; provider opens Clinical Decision Support dashboard; patient with diabetes hasn't had A1C in 7 months
- **Progression**: Background job scans patient records → Detects age ≥50 with no colonoscopy record → Creates care gap alert → Displays on CDS dashboard with severity badge → Provider clicks alert → Sees patient details and recommended action → Orders screening or sends portal message
- **Success criteria**: Care gaps accurately detect based on age + problem list; A1C gaps trigger for diabetic patients >6 months; colonoscopy gaps trigger for age 50+; allergy warnings display with severity color coding; zero false positives in gap detection

### Smart Clinical Note Templates
- **Functionality**: Reason-for-visit-aware note templates that auto-populate based on appointment type; orthopedic exam template for knee pain, diabetes follow-up template for A1C checks, annual wellness visit template for preventive care; providers can edit before saving
- **Purpose**: Reduces documentation time by 60%; ensures consistent clinical documentation; improves billing accuracy by capturing all billable elements
- **Trigger**: Provider opens case for patient with specific reason for visit; system detects keywords like "knee pain", "diabetes", "annual physical"
- **Progression**: Provider views appointment → Clicks "Generate Note" → System matches reason ("knee pain") → Loads orthopedic exam template with HPI/Physical/Assessment sections → Provider fills in findings → Reviews and edits → Saves to patient chart
- **Success criteria**: "Knee pain" loads orthopedic template; "diabetes" loads A1C follow-up template; "annual" loads wellness visit template; templates include specialty-specific exam sections; providers can override and customize

### Nurse Rooming Queue
- **Functionality**: Displays today's confirmed appointments ready for vital sign collection; nurses can record BP, heart rate, temperature, weight, and height directly from queue
- **Purpose**: Streamlines patient rooming process; ensures vitals are recorded before provider sees patient; improves clinical workflow
- **Trigger**: Nurse opens Rooming Queue tab; views patients scheduled for today
- **Progression**: Nurse views queue → Selects patient → Opens vitals dialog → Records measurements → Saves → Badge changes to "Vitals Recorded" → Patient ready for provider
- **Success criteria**: Queue shows confirmed appointments; vitals dialog validates inputs; recorded vitals persist; visual indicator shows completion

### Billing Dashboard with Claim Denials
- **Functionality**: Billing staff view showing outstanding charges, recent payments, and claim denials requiring follow-up; financial metrics and patient balance tracking
- **Purpose**: Centralized revenue cycle management; claim denial queue ensures timely resubmission; financial visibility for practice management
- **Trigger**: Billing staff logs in and views dashboard
- **Progression**: Billing staff opens dashboard → Views key metrics (outstanding balance, total collected, denials) → Switches between tabs (Outstanding Charges, Recent Payments, Claim Denials) → Reviews denial details → Takes action on claims
- **Success criteria**: Metrics calculate correctly; charges sorted by balance; payments show completion status; denials clearly flagged for action

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
- **API Rate Limiting**: External API calls implement exponential backoff and caching; users notified if service temporarily unavailable.
- **Invalid API Responses**: Validation APIs failing gracefully degrade to warning state; data entry still permitted with manual review flag.
- **Phone Number Edge Cases**: International numbers, extensions, and formatted variations normalized before validation; unsupported formats flagged.
- **Address Autocorrect Conflicts**: When USPS suggests address correction, user shown both original and corrected versions with option to choose.
- **Holiday API Failures**: If holiday service unavailable, system falls back to cached previous year data with staleness warning.
- **File Size Limits**: Documents exceeding 10MB rejected with clear message before scanning API called to avoid unnecessary charges.
- **Concurrent Appointment Booking**: Double-booking prevented through optimistic locking; second user notified slot taken and shown alternatives.
- **Malware False Positives**: When scanning API flags common medical terms in filenames, admin override available with audit trail.

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
