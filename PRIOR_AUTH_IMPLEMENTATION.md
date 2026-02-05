# Prior Authorizations Management - Implementation Summary

## Overview
The Prior Authorizations Management module has been successfully integrated into the clinical workflow, providing comprehensive tracking of insurance authorizations with automated unit tracking, expiration monitoring, and workflow triggers.

## Data Model Updates

### New Entity: PriorAuthorization
Located in `src/lib/types.ts`:

```typescript
export interface PriorAuthorization {
  id: string
  patientId: string
  insurerId: string
  authNumber: string
  serviceCode: string          // CPT/HCPCS code
  serviceName?: string
  totalUnits: number
  usedUnits: number
  startDate: string
  endDate: string
  status: 'pending' | 'active' | 'expired' | 'denied'
  denialReason?: string
  createdAt: string
  updatedAt: string
  caseId?: string              // Link to related clinical case
}
```

### Updated Entity: Case
The Case model now includes an optional `priorAuthId` field to link clinical cases with their related authorizations:

```typescript
export interface Case {
  // ... existing fields
  priorAuthId?: string
}
```

## Workflow Engine Integration

### New Functions in `src/lib/workflow-engine.ts`

#### 1. Enhanced processNewCase()
- Now accepts optional `priorAuths` parameter
- Automatically checks for active authorizations when `clinicalConcern` cases are created
- Creates billing team tasks when no active authorization found
- Task created with 48-hour deadline for authorization verification

#### 2. checkExpiringAuthorizations()
- Scans all active authorizations
- Identifies authorizations expiring within 30 days
- Creates tasks for billing team to initiate renewal
- Task deadline set to authorization expiration date

#### 3. checkLowUnitsAuthorizations()
- Monitors active authorizations for low remaining units
- Default threshold: 3 units
- Creates tasks when units fall below threshold
- Allows time for renewal before complete depletion

#### 4. unitTracker()
- Decrements units when appointments are completed
- Automatically marks authorization as 'expired' when units reach 0
- Returns updated authorization object
- Updates timestamp on each modification

## UI Components

### PriorAuthManager.tsx
**Location**: `src/components/PriorAuthManager.tsx`

Comprehensive dashboard for managing all prior authorizations:

**Features**:
- Search by patient name, authorization number, or service code
- Filter tabs: All / Active / Expiring Soon / Low Units
- Summary cards showing key metrics
- Add new authorizations via dialog form
- Update authorization status (active → expired/denied)
- Visual indicators:
  - Active: Green check circle
  - Expiring Soon: Orange warning (within 30 days)
  - Expired: Red X circle (bold)
  - Denied: Red X circle (bold)
  - Pending: Gray clock
- Progress bars showing unit consumption
- Color-coded left border (accent for active, destructive for expired/denied)

**Role-Based Access**:
- Full edit access: `billing`, `nurse`, `admin`
- Read-only access: `patient`
- Prop: `userRole?: 'billing' | 'nurse' | 'admin' | 'patient'`

### PatientProfile.tsx Updates
**Location**: `src/components/PatientProfile.tsx`

Added "Prior Auth" tab for patient self-service:

**Features**:
- View current authorization status
- See authorization history
- Units remaining with visual progress bar
- Coverage period display
- Denial reasons prominently displayed (bold red)
- No editing capabilities (read-only for patients)
- Empty state when no authorizations exist

## Utility Library

### prior-auth-utils.ts
**Location**: `src/lib/prior-auth-utils.ts`

Helper functions for authorization management:

#### processAppointmentCompletion()
- Automatically called when appointment marked as 'completed'
- Finds related active authorization by patient and date
- Calls `unitTracker()` to decrement units
- Updates authorization in storage

#### checkAuthorizationForCase()
- Finds active authorizations for a patient
- Returns authorization with most remaining units
- Used when creating clinical cases

#### getAuthorizationSummary()
- Calculates authorization metrics:
  - Remaining units
  - Percentage used
  - Days until expiration
  - Boolean flags for expiring soon / low units
- Useful for UI display logic

## Workflow Automation

### Automatic Triggers

1. **Clinical Case Created (type: clinicalConcern)**
   - System checks for active patient authorizations
   - If none found → creates billing task to verify if auth needed
   - Task assigned to billing role with 48-hour deadline

2. **Daily Authorization Check** (recommendation)
   - Run `checkExpiringAuthorizations()` daily
   - Creates tasks 30 days before expiration
   - Ensures renewal initiated in time

3. **Unit Monitoring** (recommendation)
   - Run `checkLowUnitsAuthorizations()` daily
   - Alerts when ≤3 units remain
   - Prevents complete depletion without warning

4. **Appointment Completion**
   - Call `processAppointmentCompletion()` when appointment status → 'completed'
   - Units auto-decrement
   - Authorization auto-expires when units reach 0

## Data Persistence

All prior authorizations stored using the Spark KV persistence API:

```typescript
const [priorAuths, setPriorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
```

**Key**: `'prior-authorizations'`
**Type**: Array of PriorAuthorization objects

## Visual Design

### Color Indicators
- **Active/Approved**: Accent color (oklch(0.65 0.15 200))
- **Expiring Soon**: Moderate warning (oklch(0.70 0.18 45))
- **Expired/Denied**: Destructive (oklch(0.55 0.22 25)) - **BOLD**
- **Pending**: Secondary/muted

### Typography
- Denied/expired status: **Bold red text**
- Authorization numbers: Monospace font
- Service names: Semibold
- Metadata: Muted foreground

### Layout
- Left border accent on cards (4px)
- Progress bars for unit consumption
- Badge indicators for status
- Search and filter in header
- Summary metric cards at top

## Integration Points

### Where to Use PriorAuthManager
1. **Billing Dashboard**: Primary use case for billing staff
2. **Admin Dashboard**: Oversight and management
3. **Nurse Dashboard**: Quick reference during patient rooming

### Where to Use PatientProfile Prior Auth Tab
1. **Patient Portal**: Self-service authorization viewing
2. **Provider Review**: Quick check during patient visit

### Where to Call Workflow Functions
1. **Case Creation**: `processNewCase()` with priorAuths array
2. **Daily Cron Job**: `checkExpiringAuthorizations()` and `checkLowUnitsAuthorizations()`
3. **Appointment Completion Handler**: `processAppointmentCompletion()`

## Testing Checklist

- [ ] Add prior authorization via PriorAuthManager
- [ ] Verify authorization appears in PatientProfile for that patient
- [ ] Create clinical concern case without authorization → check task created
- [ ] Complete appointment → verify units decrement
- [ ] Set authorization to expire in 20 days → verify "Expiring Soon" filter
- [ ] Reduce units to 2 → verify "Low Units" filter
- [ ] Mark authorization as denied → verify bold red display
- [ ] Mark authorization as expired → verify bold red display
- [ ] Search by auth number, patient name, service code
- [ ] Test role-based access (billing can edit, patient cannot)

## Future Enhancements

1. **Link to Claims**: Connect authorizations to billing claims
2. **Auto-Renewal**: Submit renewal requests automatically
3. **Insurance Integration**: Pull authorization status from payer APIs
4. **Historical Analytics**: Track authorization approval rates
5. **Predictive Alerts**: ML-based prediction of authorization needs
6. **Bulk Import**: Import multiple authorizations from spreadsheet

## Security Considerations

- Role-based access control implemented
- Patients can only view their own authorizations
- Billing/nurse/admin can view all authorizations
- Denial reasons are visible to patients (transparency)
- No PHI exposure in URLs or client-side logs

## Performance Notes

- Authorizations filtered in-memory (client-side)
- Efficient useMemo for computed filters
- Minimal re-renders with proper React hooks
- KV storage handles persistence efficiently
- Search debouncing recommended for large datasets
