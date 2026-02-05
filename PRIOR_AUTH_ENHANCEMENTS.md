# Prior Authorization Module - Clinical-Billing Synchronization

## Overview
This implementation enhances the Prior Authorizations module with comprehensive clinical-billing synchronization, ensuring seamless integration between authorization management, appointment scheduling, and ePrescribing workflows.

## Features Implemented

### 1. Smart Appointment Linking with Authorization Checking

**Location:** `AppointmentBookingDialog.tsx`

**Functionality:**
- Automatically detects if a patient's condition type requires prior authorization
- Displays an "Authorization Required" check during appointment booking
- Shows dropdown to select from active Prior Authorization records
- Validates sufficient units are available before allowing booking
- Prevents appointment creation without required authorization

**Authorization-Required Services:**
- Physical Therapy (`physicalTherapy`)
- Chronic Care Management (`chronicCare`)
- Post-Operative Care (`postOp`)

**Key Features:**
- Visual warnings when no active authorizations are found
- Real-time display of remaining authorization units
- Automatic linking of selected authorization to appointment
- Seamless UX with clear error messaging

---

### 2. Automated Unit Deduction System

**Location:** `lib/workflow-engine.ts` - `reconcileAuthUnits()` function

**Functionality:**
- Automatically decrements authorization units when appointment status changes to 'completed'
- Atomic update mechanism prevents double-counting
- Monitors unit depletion and triggers urgent tasks
- Updates authorization status when units are exhausted

**Workflow:**
1. Appointment is marked as completed
2. System checks for linked prior authorization
3. Automatically deducts one unit from `usedUnits`
4. If `usedUnits === totalUnits`:
   - Authorization status changes to 'expired'
   - Creates an URGENT task for billing team
   - Task description: "Authorization units depleted. Request new authorization immediately."
5. If >90% units used: Displays warning to provider

**Safety Features:**
- Validates appointment is completed before unit deduction
- Checks authorization is active before processing
- Returns detailed error messages for troubleshooting
- Creates audit trail with timestamps

---

### 3. ePrescribing Safety Check with Prior Authorization

**Location:** `prescription/NewPrescriptionDialog.tsx`

**Functionality:**
- Cross-references patient allergy data before prescribing
- Adds "Prior Auth Status" badge for high-cost medications
- Prevents prescription submission without valid authorization
- Links prescriptions to specific authorization numbers

**High-Tier Medications Requiring Authorization:**
- Tier 3 medications
- Tier 4 medications
- Specialty medications
- Any medication flagged with `requiresPriorAuth: true`

**Visual Indicators:**
- **Tier Badge:** Shows medication tier (Tier 1, 2, 3, 4, or Specialty)
- **Prior Auth Badge:** Orange warning badge for medications requiring authorization
- **Authorization Selector:** Dropdown showing active authorizations with remaining units
- **Validation Checks:** Cannot submit prescription without selecting authorization

**Enhanced FormularyImport View:**
- Displays "Prior Auth Required" badge on Tier 3+ medications
- Color-coded tier badges for quick identification
- Integrated with authorization status checking

---

### 4. Visual Alert System in PriorAuthManager

**Location:** `PriorAuthManager.tsx`

**Progress Bar Features:**
- Shows `usedUnits` vs `totalUnits` for each authorization
- Color-coded based on usage percentage:
  - **Green/Accent:** 0-75% used
  - **Orange/Warning:** 76-90% used
  - **Red/Destructive:** >90% used (with pulse animation)

**Alert Levels:**
- **Critical (>90%):** Red progress bar with pulse animation + warning message
- **Warning (>75%):** Orange progress bar
- **Normal (<75%):** Standard accent-colored progress bar

**Additional Features:**
- Percentage display next to unit counts
- "Low Units" filter tab showing authorizations with ≤3 units remaining
- "Expiring" filter tab for authorizations expiring within 30 days
- Real-time search and filtering

---

## Data Structure

### Updated Types

#### Appointment Interface
```typescript
interface Appointment {
  // ... existing fields
  linkedPriorAuthId?: string          // Links to PriorAuthorization.id
  requiresAuthorization?: boolean     // Indicates if auth is required
}
```

#### Medication Interface
```typescript
interface Medication {
  // ... existing fields
  requiresPriorAuth?: boolean  // Flags medication as requiring auth
}
```

#### Prescription Interface
```typescript
interface Prescription {
  // ... existing fields
  linkedAuthNumber?: string    // Links to PriorAuthorization.authNumber
}
```

---

## Workflow Integration

### Authorization-Required Service Detection
```typescript
// lib/workflow-engine.ts
export function getAuthRequiringServices() {
  return [
    { conditionType: 'physicalTherapy', requiresAuth: true },
    { conditionType: 'chronicCare', requiresAuth: true },
    { conditionType: 'postOp', requiresAuth: true },
    { conditionType: 'primaryCare', requiresAuth: false },
    { conditionType: 'wellness', requiresAuth: false },
  ]
}
```

### Automatic Task Creation
- **Low Units Warning:** Created 7 days before depletion (≤3 units remaining)
- **Expiring Soon:** Created 30 days before authorization end date
- **Units Depleted:** Created immediately when last unit is used (URGENT priority)

---

## Role-Based Functionality

### For Doctors/Providers:
- View authorization status during prescribing
- See available units before scheduling appointments
- Receive warnings about pending authorization expirations
- Cannot prescribe high-tier meds without active authorization

### For Billing Staff:
- Manage all prior authorizations in centralized dashboard
- Receive high-priority notifications for:
  - Authorizations expiring within 30 days
  - Authorizations with ≤3 units remaining
  - URGENT tasks when units are depleted
- Filter and search authorizations by status
- Track unit usage with visual progress indicators

---

## Usage Examples

### Example 1: Booking an Appointment with Authorization
1. Select patient with `conditionType: 'physicalTherapy'`
2. Choose provider and date/time
3. Authorization Required section appears automatically
4. Select from dropdown: "PA-2024-001234 - Physical Therapy (2 units left)"
5. System links authorization to appointment
6. Booking completes successfully

### Example 2: Completing Appointment & Unit Deduction
1. Mark appointment as 'completed'
2. `AppointmentConfirmationManager` component triggers
3. Shows current and projected unit usage
4. Confirmation decrements one unit from authorization
5. If last unit: Creates URGENT task for billing team
6. Toast notification confirms success

### Example 3: Prescribing with Authorization Check
1. Doctor searches for "Humira" (Specialty tier medication)
2. Medication card shows "Prior Auth Required" badge
3. Select dosage, frequency, duration
4. Authorization section appears automatically
5. Select authorization from dropdown
6. Prescription links to authorization number
7. Submit prescription

---

## Testing Checklist

- [x] ✅ Appointment booking shows auth requirement for Physical Therapy patients
- [x] ✅ Appointment booking prevents scheduling without selecting authorization
- [x] ✅ Unit deduction happens automatically on appointment completion
- [x] ✅ URGENT task created when authorization units depleted
- [x] ✅ Progress bars display correctly with color coding
- [x] ✅ High-tier medications show "Prior Auth Required" badge
- [x] ✅ Cannot prescribe Tier 3+ meds without authorization
- [x] ✅ FormularyImport displays auth badges on appropriate medications
- [x] ✅ Low Units filter shows authorizations with ≤3 units
- [x] ✅ Expiring filter shows authorizations expiring within 30 days

---

## Seed Data

The system includes realistic test data:

### Prior Authorizations:
- **PA-2024-001234:** Physical Therapy (10/12 units used) - Critical
- **PA-2024-005678:** Chronic Care (8/20 units used) - Normal
- **PA-2024-009876:** Psychotherapy (1/8 units used) - Normal
- **PA-2023-112233:** Physical Therapy (15/15 units used) - Expired

### Patients:
- **Sarah Johnson:** Physical Therapy patient with 2 active authorizations
- **Michael Chen:** Chronic Care patient with 1 active authorization
- **Emma Rodriguez:** Post-Op patient with expired authorization

---

## Future Enhancements

Potential additions for future iterations:
1. Electronic authorization submission to insurance carriers
2. Auto-renewal requests when units fall below threshold
3. Integration with insurance formulary databases
4. Predictive analytics for authorization usage patterns
5. Automated appeals process for denied authorizations
6. Multi-authorization bundling for complex treatments

---

## Technical Notes

- Uses `useKV` hook for persistent data storage
- Implements functional updates to prevent race conditions
- Color system uses theme-aware CSS variables
- Progress bars use responsive design patterns
- All components follow accessibility best practices
- Atomic updates prevent double-counting in concurrent scenarios
