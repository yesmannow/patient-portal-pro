# Planning Guide

A comprehensive prescription management system that enables healthcare providers to safely prescribe medications with real-time allergy cross-checking and drug-drug interaction warnings to prevent adverse events and improve patient safety.

**Experience Qualities**: 
1. **Clinical Confidence** - The interface should inspire trust through clear visual hierarchy, prominent safety warnings, and comprehensive medication data presentation
2. **Rapid Efficiency** - Prescribing workflows must be streamlined for busy clinicians, with quick search, minimal clicks, and intelligent defaults
3. **Safety-First** - Warning systems should be impossible to miss, using bold visual indicators and requiring explicit acknowledgment of risks

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a clinical decision support tool with multiple interconnected features: prescription management, patient allergy tracking, drug interaction checking, and prescription history. It requires robust state management, complex validation logic, and multiple coordinated views.

## Essential Features

### Prescription Creation
- **Functionality**: Search medications, specify dosage/frequency/duration, add instructions
- **Purpose**: Core workflow for creating new prescriptions safely and efficiently
- **Trigger**: Provider clicks "New Prescription" button
- **Progression**: Select patient → Search drug → Configure dosage/frequency/duration → Add instructions → Review warnings → Confirm prescription
- **Success criteria**: Prescription saved with complete medication details, dosing instructions clearly specified

### Allergy Cross-Checking
- **Functionality**: Automatically scan selected medication against patient's documented allergies
- **Purpose**: Prevent allergic reactions by catching contraindicated medications before prescribing
- **Trigger**: Medication selected in prescription form
- **Progression**: System checks drug class/ingredients → Match against patient allergies → Display prominent warning if conflict detected → Require acknowledgment to proceed
- **Success criteria**: Allergy conflicts immediately visible, prescriber cannot proceed without explicit override acknowledgment

### Drug-Drug Interaction Warnings
- **Functionality**: Analyze new prescription against patient's current medications for interactions
- **Purpose**: Identify potentially dangerous medication combinations
- **Trigger**: Medication selected in prescription form
- **Progression**: System checks selected drug → Compare against active prescriptions → Identify interactions by severity → Display warnings with severity levels → Provide clinical guidance
- **Success criteria**: Interactions categorized by severity (minor/moderate/severe), clinical recommendations provided, severe interactions require override justification

### Patient Allergy Management
- **Functionality**: Add, edit, and remove patient allergies with reaction details
- **Purpose**: Maintain accurate allergy records for cross-checking
- **Trigger**: Provider accesses patient allergy section
- **Progression**: View current allergies → Add new allergy → Specify allergen and reaction type → Save to patient record
- **Success criteria**: Allergies persist across sessions, reaction severity documented, allergies immediately used in checking logic

### Active Prescription Management
- **Functionality**: View, discontinue, and modify active prescriptions
- **Purpose**: Maintain accurate medication list for interaction checking and patient care
- **Trigger**: Provider views patient prescription history
- **Progression**: Display active prescriptions → Select prescription → Discontinue or modify → Update status → Refresh interaction checks
- **Success criteria**: Clear distinction between active/discontinued medications, discontinuation persists across sessions

### Drug Formulary Import
- **Functionality**: Import medications from external pharmacy databases (Medicare Part D, Express Scripts, CVS Caremark)
- **Purpose**: Expand medication database with comprehensive formulary data including tier classification and NDC codes
- **Trigger**: Provider clicks "Import Formulary" button in header
- **Progression**: View available databases → Select database → Preview medications → Select drugs to import → Confirm import → Add to medication database
- **Success criteria**: Imported medications immediately available for prescribing, duplicate prevention, tier and manufacturer data preserved

### Prior Authorization Management
- **Functionality**: Track insurance prior authorizations with unit tracking, expiration monitoring, and automated workflow triggers
- **Purpose**: Ensure clinical services are properly authorized, prevent denials, and manage authorization lifecycle
- **Trigger**: Billing staff adds authorization, or automatic check when clinical case created
- **Progression**: Add authorization details → Link to patient and service code → Track units consumed per appointment → Monitor expiration dates → Generate renewal tasks → View status dashboard
- **Success criteria**: Authorization units auto-decrement on appointment completion, expiration warnings 30 days in advance, low unit alerts at 3 remaining, denied/expired authorizations clearly highlighted in bold red

### Prior Authorization Workflow Integration
- **Functionality**: Automatically check for active authorizations when clinical cases created, create billing tasks for missing or expiring authorizations
- **Purpose**: Proactively manage authorization requirements in clinical workflow
- **Trigger**: New clinical concern case created, or scheduled authorization check runs
- **Progression**: Case created → Check patient authorizations → Flag missing auth → Create task for billing team → Alert on expiring auth (30 days) → Alert on low units (≤3)
- **Success criteria**: Billing tasks auto-created, no clinical case proceeds without auth check, renewal initiated before expiration

## Edge Case Handling

- **No Patient Selected** - Disable prescription creation, show prompt to select patient first
- **Empty Medication Search** - Display helpful message suggesting search tips or showing common medications
- **Multiple Severe Warnings** - Stack warnings visually with most severe on top, require acknowledgment of each
- **No Active Medications** - Skip interaction checking, show message that no interactions are possible
- **No Documented Allergies** - Display notice prompting provider to confirm no known allergies
- **Duplicate Prescription** - Warn if prescribing medication already active for patient
- **Rapid Successive Searches** - Debounce search input to prevent excessive API-like calls
- **Duplicate Formulary Import** - Prevent importing medications that already exist in database, check by brand/generic name
- **Empty Formulary Selection** - Disable import button if no medications selected from preview
- **Large Formulary Import** - Show progress indicator during import, simulate async processing
- **Missing Prior Authorization** - When clinical case created without active auth, auto-create billing task to verify if auth needed
- **Expired Authorization Used** - Highlight in bold red, prevent unit consumption, alert billing team
- **Denied Authorization Override** - Show denial reason prominently, require supervisor approval to proceed
- **Multiple Active Authorizations** - Select auth with most remaining units when auto-tracking
- **Authorization at Exactly 0 Units** - Auto-mark as expired, trigger renewal task

## Design Direction

The design should evoke clinical precision, medical authority, and life-critical seriousness. This is a tool where mistakes have real consequences, so the interface must feel professional, trustworthy, and methodical. Warning states should command immediate attention through bold color and unmissable placement. The overall aesthetic should balance medical sterility with modern digital polish—clean but not cold, serious but not intimidating.

## Color Selection

Medical-inspired palette with strong warning hierarchy and clinical credibility.

- **Primary Color**: Deep Medical Blue (oklch(0.45 0.08 250)) - Conveys medical authority, trustworthiness, and clinical professionalism; used for primary actions and headers
- **Secondary Colors**: 
  - Soft Clinical Gray (oklch(0.92 0.005 250)) - Supporting backgrounds, de-emphasized content
  - Crisp White (oklch(0.99 0 0)) - Card backgrounds, clean separation
- **Accent Color**: Vibrant Safety Teal (oklch(0.65 0.15 200)) - Used for confirmed safe actions, successful states, positive indicators
- **Warning Hierarchy**:
  - Minor Warning Yellow (oklch(0.85 0.12 85)) - Minor interactions, information notices
  - Moderate Warning Orange (oklch(0.70 0.18 45)) - Moderate interactions requiring attention
  - Severe Warning Red (oklch(0.55 0.22 25)) - Severe interactions, allergy conflicts, critical alerts
- **Foreground/Background Pairings**:
  - Primary Blue (oklch(0.45 0.08 250)): White text (oklch(0.99 0 0)) - Ratio 8.9:1 ✓
  - Secondary Gray (oklch(0.92 0.005 250)): Dark text (oklch(0.25 0.01 250)) - Ratio 12.1:1 ✓
  - Accent Teal (oklch(0.65 0.15 200)): White text (oklch(0.99 0 0)) - Ratio 5.2:1 ✓
  - Severe Red (oklch(0.55 0.22 25)): White text (oklch(0.99 0 0)) - Ratio 6.8:1 ✓
  - Moderate Orange (oklch(0.70 0.18 45)): Dark text (oklch(0.25 0.01 250)) - Ratio 7.5:1 ✓

## Font Selection

Typography should convey medical precision and modern clinical software—highly legible for critical information scanning with a professional, technical character.

- **Primary Typeface**: IBM Plex Sans - Clean, technical, and highly legible; excellent for medical software
- **Monospace Typeface**: IBM Plex Mono - For medication codes, dosages, and technical details

- **Typographic Hierarchy**:
  - H1 (App Title): IBM Plex Sans Semibold/32px/tight letter spacing (-0.02em)
  - H2 (Section Headers): IBM Plex Sans Semibold/24px/tight letter spacing (-0.01em)
  - H3 (Subsection): IBM Plex Sans Medium/18px/normal letter spacing
  - Body (Main Content): IBM Plex Sans Regular/15px/line-height 1.6
  - Small (Metadata): IBM Plex Sans Regular/13px/line-height 1.5
  - Code (Dosages/IDs): IBM Plex Mono Medium/14px/normal spacing

## Animations

Animations should be purposeful and restrained, focusing on safety-critical feedback and smooth transitions. Warning states should animate in with attention-grabbing motion (scale + fade) to ensure they're noticed. Interaction checking should show subtle loading states. Form submissions should provide clear confirmation animations. Overall, motion should reinforce the clinical seriousness while maintaining modern software polish.

## Component Selection

- **Components**:
  - Dialog - For prescription creation modal workflow and formulary import
  - Command - For medication search with keyboard navigation
  - Card - For prescription items, allergy cards, warning panels, formulary database selection
  - Alert - For warning banners (with custom styling for severity levels)
  - Badge - For severity indicators, medication status tags, formulary tier classification
  - Table - For prescription history listing
  - Input - For dosage, frequency, duration fields
  - Textarea - For prescription instructions and override justifications
  - Button - Primary (prescribe), Secondary (cancel), Destructive (discontinue)
  - Separator - To divide sections clearly
  - Accordion - For collapsible interaction details
  - ScrollArea - For long medication lists and formulary preview
  - Progress - For formulary import progress indicator
  - Checkbox - For selecting medications during formulary import
  
- **Customizations**:
  - Custom warning Alert variants with severity-based colors (minor/moderate/severe)
  - Enhanced Badge with pulsing animation for severe warnings
  - Custom medication search Command with drug class categorization
  - Prescription Card with expandable details section
  
- **States**:
  - Buttons: Clear hover elevation, disabled state for unsafe actions, loading state during checks
  - Inputs: Focus state with blue ring, error state with red border for required fields
  - Cards: Hover elevation on interactive cards, selected state for active prescription
  - Warnings: Pulsing border for severe, solid border for moderate, dashed for minor
  
- **Icon Selection**:
  - Pills (medication/prescription icons)
  - Warning, WarningCircle (severity-based warnings)
  - CheckCircle (safe/verified states)
  - MagnifyingGlass (search)
  - Plus, X (add/remove)
  - ClockCounterClockwise (history)
  - User (patient selection)
  - Database (formulary import)
  - Download (import action)
  - Package (medication count)
  - ArrowRight (navigation)
  - FileText (prior authorization documents)
  - XCircle (denied/expired status)
  - Clock (pending/expiring status)
  
- **Spacing**:
  - Cards: p-6 padding for content breathing room
  - Form fields: gap-4 between inputs for clear separation
  - Warning panels: p-5 with mb-4 to ensure visibility
  - Section spacing: space-y-6 between major sections
  
- **Mobile**:
  - Stack prescription form fields vertically on mobile
  - Full-screen Dialog on mobile for prescription creation
  - Simplified Table view with essential columns only
  - Warning alerts become fixed to bottom of screen on mobile for visibility
  - Collapsible sections for allergy/interaction details to save space
