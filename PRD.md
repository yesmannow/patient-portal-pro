# Planning Guide

A comprehensive appointment booking testing system that validates authorization requirements for different patient condition types, ensuring proper prior authorization checks before scheduling appointments.

**Experience Qualities**: 
1. **Clarity & Precision** - The interface should clearly show which condition types require authorization and which appointments are properly authorized
2. **Validation Focus** - Visual feedback must immediately indicate authorization status, missing authorizations, and expired/denied states
3. **Testing Efficiency** - Test scenarios should be easy to execute with clear results showing authorization requirement logic working correctly

**Complexity Level**: Light Application (multiple features with basic state)
This is a testing dashboard that simulates appointment booking workflows with authorization requirement validation. It requires state management for patients, authorizations, and appointments, with clear test case execution and result visualization.

## Essential Features

### Test Patient Management
- **Functionality**: Display test patients with different condition types to validate authorization requirements
- **Purpose**: Provide test data representing all condition types (physicalTherapy, chronicCare, postOp, primaryCare, wellness)
- **Trigger**: Application loads
- **Progression**: View patient list → Identify condition type → See authorization requirement status → Select patient for testing
- **Success criteria**: All 5 condition types represented, clear visual indicators of which require authorization

### Authorization Requirement Validation
- **Functionality**: Check if selected patient's condition type requires prior authorization before booking
- **Purpose**: Enforce authorization rules: physicalTherapy, chronicCare, postOp require auth; primaryCare and wellness do not
- **Trigger**: Patient selected for appointment booking
- **Progression**: Select patient → System checks condition type against rules → Display authorization requirement → Block/allow booking accordingly
- **Success criteria**: Correct authorization requirement displayed for each condition type, booking flow adapts based on requirement

### Authorization Status Checking
- **Functionality**: Validate that patient has active authorization with available units before appointment booking
- **Purpose**: Prevent booking appointments for patients without valid authorizations
- **Trigger**: Attempt to book appointment for patient requiring authorization
- **Progression**: Check patient authorizations → Verify status is 'active' → Verify units available → Display authorization selection → Validate before booking
- **Success criteria**: Only active authorizations shown, expired/denied authorizations blocked, unit availability validated

### Appointment Booking with Authorization Linking
- **Functionality**: Book appointments and automatically link to selected prior authorization
- **Purpose**: Track which authorization is used for each appointment to enable unit reconciliation
- **Trigger**: User completes appointment booking form for patient requiring authorization
- **Progression**: Select patient → Choose provider/date/time → Select authorization (if required) → Confirm booking → Link authorization to appointment
- **Success criteria**: Appointment created with linkedPriorAuthId field populated, requiresAuthorization flag set correctly

### Test Scenario Execution
- **Functionality**: Execute predefined test scenarios to validate authorization workflow logic
- **Purpose**: Systematically test all authorization requirement combinations and edge cases
- **Trigger**: User clicks "Run Test" button for specific scenario
- **Progression**: Execute test case → Validate authorization check → Attempt booking → Display pass/fail result → Show detailed feedback
- **Success criteria**: All test scenarios execute correctly, clear pass/fail indicators, detailed error messages for failures

### Authorization Unit Tracking Display
- **Functionality**: Show authorization unit consumption and remaining units for active authorizations
- **Purpose**: Visualize how appointment bookings consume authorization units
- **Trigger**: Display patient's active authorizations
- **Progression**: Show total units → Show used units → Calculate remaining → Display progress bar → Highlight low units (≤3)
- **Success criteria**: Accurate unit calculations, visual indicators for low units, unit depletion clearly visible

### Missing Authorization Alerts
- **Functionality**: Display prominent warnings when attempting to book appointments for patients without required authorizations
- **Purpose**: Prevent unauthorized appointments from being scheduled
- **Trigger**: Attempt to book appointment for patient requiring authorization but lacking active auth
- **Progression**: Detect missing authorization → Block booking action → Display error alert → Suggest adding authorization first
- **Success criteria**: Booking blocked for missing authorization, clear error message, actionable guidance provided

## Edge Case Handling

- **No Active Authorizations** - Block booking for patients requiring auth but having only expired/denied authorizations
- **Multiple Active Authorizations** - Allow selection from multiple valid authorizations, default to one with most remaining units
- **Authorization at Zero Units** - Prevent selection of authorizations with no remaining units, display as depleted
- **Expired Authorization Selected** - Block booking if selected authorization expired between selection and submission
- **Condition Type Without Requirement** - Allow direct booking for primaryCare and wellness without authorization checks
- **Missing Patient Selection** - Disable booking button until patient selected, show guidance message
- **Incomplete Booking Form** - Validate all required fields before submission, highlight missing data
- **Authorization Unit Edge Cases** - Handle exactly 1 unit remaining, exactly 0 units, negative unit scenarios

## Design Direction

The design should evoke testing reliability, clinical precision, and clear validation feedback. This is a quality assurance tool where the interface must make test results immediately obvious—success states should feel reassuring, failure states should command attention. The overall aesthetic should balance technical testing rigor with approachable usability, using color strategically to communicate authorization status at a glance.

## Color Selection

Testing-focused palette with strong pass/fail indicators and clear status hierarchy.

- **Primary Color**: Deep Testing Blue (oklch(0.50 0.12 250)) - Conveys technical reliability and test execution; used for primary actions
- **Secondary Colors**: 
  - Soft Neutral Gray (oklch(0.95 0.005 250)) - Supporting backgrounds, neutral states
  - Crisp White (oklch(0.99 0 0)) - Card backgrounds, clean separation
- **Accent Color**: Success Green (oklch(0.70 0.18 145)) - Used for passed tests, active authorizations, successful validations
- **Status Hierarchy**:
  - Active/Valid (oklch(0.70 0.18 145)) - Active authorizations, valid states, test passes
  - Warning Yellow (oklch(0.80 0.14 85)) - Low units, expiring soon, caution states
  - Blocked/Error Red (oklch(0.60 0.22 25)) - Missing authorization, expired, denied, test failures
  - Neutral Info (oklch(0.60 0.12 250)) - Informational states, no auth required
- **Foreground/Background Pairings**:
  - Primary Blue (oklch(0.50 0.12 250)): White text (oklch(0.99 0 0)) - Ratio 7.8:1 ✓
  - Success Green (oklch(0.70 0.18 145)): White text (oklch(0.99 0 0)) - Ratio 5.5:1 ✓
  - Error Red (oklch(0.60 0.22 25)): White text (oklch(0.99 0 0)) - Ratio 6.8:1 ✓
  - Warning Yellow (oklch(0.80 0.14 85)): Dark text (oklch(0.25 0.01 250)) - Ratio 9.2:1 ✓

## Font Selection

Typography should convey technical precision and testing clarity—highly legible for test results and status indicators.

- **Primary Typeface**: Space Grotesk - Modern, technical, and highly legible; excellent for testing interfaces
- **Monospace Typeface**: JetBrains Mono - For authorization numbers, unit counts, and technical details

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold/36px/tight letter spacing (-0.03em)
  - H2 (Section Headers): Space Grotesk Semibold/24px/tight letter spacing (-0.01em)
  - H3 (Subsection): Space Grotesk Medium/18px/normal letter spacing
  - Body (Main Content): Space Grotesk Regular/15px/line-height 1.6
  - Small (Metadata): Space Grotesk Regular/13px/line-height 1.5
  - Code (Auth Numbers/Units): JetBrains Mono Medium/14px/normal spacing

## Animations

Animations should emphasize test execution and validation feedback. Test result transitions should be satisfying and clear (fade + scale for status changes). Authorization status checks should show subtle loading indicators. Pass/fail states should animate in with appropriate energy—gentle confirmation for success, attention-grabbing for failures. Overall, motion should reinforce the testing workflow while maintaining professional restraint.

## Component Selection

- **Components**:
  - Card - For patient cards, authorization cards, test result displays
  - Badge - For status indicators (active/expired/denied), condition types, authorization requirements
  - Alert - For test results, missing authorization warnings, validation errors
  - Table - For patient listing, authorization listing
  - Button - Primary (run test, book appointment), Secondary (cancel), Destructive (clear data)
  - Dialog - For appointment booking form
  - Progress - For authorization unit consumption visualization
  - Select - For patient selection, authorization selection, provider selection
  - Calendar - For appointment date selection
  - Separator - To divide test sections clearly
  - ScrollArea - For long patient/authorization lists
  - Enhanced Alert variants for test results (success=green, error=red)
  - Custom Card with colored left border indicating authorization status
  - Custom Badge variants for authorization status (active=green, expired=red, denied=red, pending=yellow)
  - Enhanced Alert variants for test results (success=green, error=red)
  - Custom Card with colored left border indicating authorization status
  - Progress bar with color coding for unit levels (high=green, medium=yellow, low=red)
  - Cards: Hover elevation on selectable items, selected state with border highlight
  - Badges: Solid background for status indicators, subtle pulse for active states
  - Buttons: Clear hover states, disabled when validation fails, loading state during test execution
  - Cards: Hover elevation on selectable items, selected state with border highlight
  - Badges: Solid background for status indicators, subtle pulse for active states
  - Alerts: Distinct colors and icons for different severities
  - CheckCircle, XCircle (pass/fail indicators)
  - Warning, WarningCircle (caution states)
  - TestTube, Flask (testing icons)
  - CheckCircle, XCircle (pass/fail indicators)
  - Warning, WarningCircle (caution states)
  - ShieldCheck, ShieldWarning (authorization status)
  - User, UserCircle (patient indicators)
  - CalendarCheck (appointment booking)
  - ClipboardText (requirements)
  - Activity (unit tracking)
  - Clock (expiration)
  - Stack patient and authorization cards vertically
  - Full-screen Dialog for appointment booking
  - Simplified Table view with essential columns only
  - Test sections: gap-6 between test scenarios
  - Result panels: p-5 with mb-4 to ensure visibility
  - List items: space-y-3 between items  - Stack patient and authorization cards vertically  - Full-screen Dialog for appointment booking  - Test results become scrollable cards instead of table  - Collapsible sections for authorization details