# Planning Guide

A comprehensive appointment booking testing system that validates scheduling workflows across different medical condition types, simulating real-world scenarios where various conditions require different authorization levels, documentation, and provider specialties.

**Experience Qualities**: 
1. **Clinical Precision** - Every interaction should feel medically accurate and trustworthy, with proper terminology and realistic workflows
2. **Testing Clarity** - The system should make it immediately obvious what's being tested, what passed, and what failed
3. **Operational Efficiency** - Rapid test execution with minimal clicks, allowing healthcare staff to validate booking logic quickly

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused testing tool with several interconnected features (patient selection, condition management, appointment booking, authorization validation) but doesn't require complex multi-view navigation or advanced state orchestration.

## Essential Features

### Patient Selection with Condition Types
- **Functionality**: Display a gallery of test patients, each with distinct medical conditions (acute injury, chronic disease, preventive care, mental health, surgical consult)
- **Purpose**: Provide diverse test cases that represent real-world appointment booking scenarios
- **Trigger**: User views the main dashboard
- **Progression**: Dashboard loads → Patient cards display with condition badges → User clicks patient card → Patient becomes selected and highlighted
- **Success criteria**: Patient selection persists, condition type clearly visible, active selection visually distinct

### Appointment Booking Form
- **Functionality**: Comprehensive booking form with provider selection, appointment type, date/time picker, and reason for visit
- **Purpose**: Capture all necessary appointment details while enforcing condition-specific requirements
- **Trigger**: User selects "Book Appointment" after choosing a patient
- **Progression**: Button click → Dialog opens with form fields → User fills required fields → Validation runs → Submission processes → Success/error feedback displays
- **Success criteria**: Form validates condition-specific requirements, prevents invalid bookings, shows clear error messages

### Authorization Requirement Validation
- **Functionality**: Real-time checking of whether the selected condition type requires prior authorization before booking
- **Purpose**: Simulate insurance authorization workflows that vary by condition severity and type
- **Trigger**: User selects appointment type or submits booking form
- **Progression**: Condition type detected → Authorization rules evaluated → Required/not required status shown → If required, additional fields appear → Documentation checklist enforced
- **Success criteria**: Authorization requirements display accurately, conditional fields appear/hide correctly, booking blocked without proper authorization when required

### Test Results Dashboard
- **Functionality**: Summary view showing all booking attempts with success/failure status and authorization outcomes
- **Purpose**: Track testing coverage across different condition types and identify patterns in booking failures
- **Trigger**: User completes any booking attempt (success or failure)
- **Progression**: Booking submitted → Result logged → Dashboard updates → Statistics recalculated → Test history displays with filters
- **Success criteria**: All attempts logged, filtering works, statistics accurate, export option available

### Provider Availability Matrix
- **Functionality**: Visual grid showing which providers are available for which condition types and appointment slots
- **Purpose**: Ensure proper provider-condition matching and prevent inappropriate scheduling
- **Trigger**: User opens provider selection dropdown or views availability calendar
- **Progression**: Provider list loads → Availability filtered by condition type → Time slots shown → User selects available slot → Booking proceeds
- **Success criteria**: Only appropriate providers shown for condition type, unavailable slots disabled, real-time updates

## Edge Case Handling

- **Missing Authorization** - Block booking and display clear message requiring prior auth documentation
- **Provider Mismatch** - Prevent booking specialists with wrong condition types (e.g., orthopedist for mental health)
- **Duplicate Bookings** - Warn when patient already has appointment in same time window
- **Emergency Conditions** - Auto-prioritize and bypass authorization for urgent/emergency condition types
- **Invalid Time Slots** - Disable past dates, non-business hours, and provider unavailable times
- **Incomplete Patient Data** - Highlight missing required fields based on condition complexity

## Design Direction

The design should evoke clinical professionalism with a testing mindset - combining the trustworthiness of medical software with the clarity of developer tools. It should feel like a robust quality assurance platform built specifically for healthcare workflows.

## Color Selection

A medical-professional palette with vibrant accents for test status indicators, combining clinical cleanliness with high-visibility testing feedback.

- **Primary Color**: Deep Medical Blue `oklch(0.45 0.15 245)` - Communicates healthcare professionalism and trust, used for primary actions and headers
- **Secondary Colors**: 
  - Soft Clinical Gray `oklch(0.96 0.005 245)` - Subtle backgrounds that don't compete with content
  - Crisp White `oklch(0.99 0 0)` - Card backgrounds for information clarity
- **Accent Color**: Vibrant Test Green `oklch(0.65 0.20 150)` - High-visibility color for successful test results and CTAs
- **Foreground/Background Pairings**: 
  - Primary Blue on White `oklch(0.45 0.15 245)` on `oklch(0.99 0 0)` - Ratio 8.2:1 ✓
  - Accent Green on White `oklch(0.65 0.20 150)` on `oklch(0.99 0 0)` - Ratio 4.9:1 ✓
  - Dark Text on Background `oklch(0.22 0.02 245)` on `oklch(0.98 0.005 240)` - Ratio 13.1:1 ✓
  - Warning Orange on White `oklch(0.70 0.18 55)` on `oklch(0.99 0 0)` - Ratio 4.6:1 ✓
  - Error Red on White `oklch(0.55 0.22 25)` on `oklch(0.99 0 0)` - Ratio 5.8:1 ✓

## Font Selection

Typefaces that balance medical precision with modern testing UI clarity, combining a distinctive geometric sans with a technical monospace for data display.

- **Typographic Hierarchy**: 
  - H1 (Dashboard Title): Space Grotesk Bold / 32px / -2% letter spacing / leading-tight
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / -1% letter spacing / leading-snug
  - H3 (Card Titles): Space Grotesk Medium / 18px / normal spacing / leading-normal
  - Body (Descriptions): Space Grotesk Regular / 15px / normal spacing / leading-relaxed
  - Labels (Form Fields): Space Grotesk Medium / 13px / normal spacing / leading-normal
  - Data/Codes (Patient IDs, Auth Numbers): JetBrains Mono Medium / 14px / normal spacing / tabular-nums

## Animations

Animations should provide immediate feedback for test actions while maintaining medical software professionalism - quick, purposeful, and never distracting from critical information.

- Form validation feedback appears with gentle 150ms fade-in
- Patient selection highlights with 200ms color transition
- Test result cards animate in with 250ms slide-up when added to history
- Success/error toasts use 300ms spring animation for attention without disruption
- Authorization requirement badges pulse subtly when conditions change

## Component Selection

- **Components**: 
  - Dialog for appointment booking form with multi-step validation
  - Card for patient profiles with condition type badges
  - Badge for condition types, authorization status, and test results
  - Select for provider and appointment type dropdowns
  - Calendar (react-day-picker) for date selection with disabled unavailable dates
  - Table for test results history with sortable columns
  - Alert for authorization warnings and validation errors
  - Tabs for switching between booking view and results dashboard
  - Tooltip for explaining authorization requirements and provider specialties
  - Progress indicator for multi-step authorization validation
  
- **Customizations**: 
  - Custom condition type badge with color-coding (blue=chronic, orange=acute, green=preventive, purple=mental health, red=surgical)
  - Authorization status indicator with icon and text
  - Test result status cards with expandable detail sections
  
- **States**: 
  - Buttons: Default with shadow, hover with lift effect, active with press depression, disabled with reduced opacity and cursor-not-allowed
  - Form inputs: Default with subtle border, focus with primary ring and shadow, error with red border and shake animation, success with green checkmark
  - Patient cards: Default with border, hover with shadow elevation, selected with primary border and background tint
  
- **Icon Selection**: 
  - User for patient profiles
  - Calendar for appointment dates
  - ClipboardText for authorization documentation
  - Check for successful validations
  - Warning for authorization requirements
  - X for failed validations
  - FirstAid for medical conditions
  - TestTube for testing dashboard
  
- **Spacing**: 
  - Card padding: p-6 for primary cards, p-4 for compact cards
  - Section gaps: gap-8 for major sections, gap-4 for related elements
  - Form field spacing: space-y-4 for vertical form layout
  - Grid gaps: gap-6 for patient card grid
  
- **Mobile**: 
  - Patient cards stack vertically on mobile (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
  - Booking dialog switches to full-screen drawer on mobile
  - Test results table converts to stacked card layout on mobile
  - Navigation tabs scroll horizontally with touch on mobile
  - Form switches to single column on mobile with larger touch targets (min-h-12)
