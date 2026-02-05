# API Integration Guide

## Overview

The Clinical Hub platform integrates with multiple external public APIs to provide "Gold Standard" automation across the entire clinical workflow. This document outlines each API integration, its purpose, and how it fits into the operational command center strategy.

## Architecture

All API integrations are centralized in `/src/lib/api-services.ts` and operate in **MOCK MODE** by default for demonstration purposes. This allows the application to function fully without requiring actual API keys or external service dependencies.

### Mock Mode vs. Production Mode

```typescript
// In api-services.ts
private static readonly MOCK_MODE = true
```

- **MOCK MODE (default)**: Uses realistic simulated responses for all API calls
- **PRODUCTION MODE**: Makes actual HTTP requests to external APIs (requires API keys)

To switch to production mode:
1. Set `MOCK_MODE = false` in `api-services.ts`
2. Configure API keys as environment variables
3. Ensure CORS proxies are configured for client-side API calls

## API Integrations by Role

### 1. Front Desk & Intake (The "Gatekeeper" Role)

#### Phone Validation API
- **Service**: NumVerify / Abstract API
- **Purpose**: Validate phone numbers and identify line type (mobile vs. landline)
- **Use Case**: Ensure patients can receive SMS confirmations before storing contact info
- **Implementation**: `APIServices.validatePhone(phoneNumber)`
- **Response**:
  ```typescript
  {
    valid: boolean
    lineType: 'mobile' | 'landline' | 'voip' | 'unknown'
    carrier: string
    canReceiveSms: boolean
  }
  ```
- **UI Component**: `PatientIntakeForm.tsx`
- **Workflow**: User enters phone → Click validate → API checks → Badge shows "SMS Capable" or warning for landlines

#### Address Verification API
- **Service**: Smarty (US) / Postcodes.io (UK)
- **Purpose**: Standardize addresses to USPS format and verify deliverability
- **Use Case**: Prevent billing errors from bad addresses; auto-complete as user types
- **Implementation**: `APIServices.validateAddress({ street, city, state, zipCode })`
- **Response**:
  ```typescript
  {
    valid: boolean
    formatted: string  // USPS-standardized format
    deliverable: boolean
  }
  ```
- **UI Component**: `PatientIntakeForm.tsx`
- **Workflow**: User enters address → Click verify → API standardizes → Form auto-corrects to official format

#### Email Validation API
- **Service**: Eva / MailboxLayer
- **Purpose**: Screen for disposable email addresses and measure email quality
- **Use Case**: Marketing campaigns avoid bounce rates; prevent spam email registrations
- **Implementation**: `APIServices.validateEmail(email)`
- **Response**:
  ```typescript
  {
    valid: boolean
    disposable: boolean  // e.g., 10minutemail.com
    roleAccount: boolean  // e.g., info@, admin@
    score: number  // Quality score 0-100
  }
  ```
- **UI Component**: `PatientIntakeForm.tsx`
- **Workflow**: User enters email → Click validate → API checks → Reject if disposable → Show quality score

#### Public Holiday Calendar API
- **Service**: Nager.Date
- **Purpose**: Block appointment scheduling on federal holidays automatically
- **Use Case**: Self-scheduling module grays out holidays; prevents booking errors
- **Implementation**: `APIServices.getPublicHolidays(year, countryCode)`
- **Response**:
  ```typescript
  [
    { date: '2024-07-04', name: 'Independence Day', type: 'public' },
    ...
  ]
  ```
- **UI Component**: `SmartAppointmentScheduler.tsx`
- **Workflow**: Calendar loads → Fetch holidays → Disable dates → User sees holiday name on hover

### 2. Clinical & Provider (The "Medical Core")

#### OpenFDA Drug Information API
- **Service**: OpenFDA (U.S. Food & Drug Administration)
- **Purpose**: Retrieve official drug labels, warnings, recalls, and adverse events
- **Use Case**: AI Scribe / e-prescribing support; clinical decision support during visits
- **Implementation**: `APIServices.getDrugInfo(drugName)`
- **Response**:
  ```typescript
  {
    brandName: string
    genericName: string
    activeIngredients: string[]
    warnings: string[]
    recalls: { date: string; reason: string }[]
    adverseEvents: { symptom: string; frequency: string }[]
  }
  ```
- **UI Component**: `ClinicalDecisionSupport.tsx`
- **Workflow**: Doctor types drug name → Search → Display FDA warnings/recalls → Alert if recalled

#### ICD-10 Medical Coding API
- **Service**: ClinicalTables (NIH)
- **Purpose**: Automated medical coding for billing claims
- **Use Case**: Doctor types "High blood pressure" → System suggests ICD-10 code I10
- **Implementation**: `APIServices.searchICD10(searchTerm)`
- **Response**:
  ```typescript
  [
    { code: 'I10', description: 'Essential (primary) hypertension', billable: true },
    ...
  ]
  ```
- **UI Component**: `ClinicalDecisionSupport.tsx`
- **Workflow**: Doctor enters diagnosis → Search ICD-10 → Select code → Copy to billing form

### 3. Security & Compliance (The "Admin" Role)

#### Malware Scanning API
- **Service**: VirusTotal / ClamAV
- **Purpose**: Scan uploaded files for malware before they reach the server
- **Use Case**: Patient uploads "Previous Records" PDF → Scanned for ransomware → Blocked if infected
- **Implementation**: `APIServices.scanFile(file)`
- **Response**:
  ```typescript
  {
    safe: boolean
    threats: string[]  // e.g., ['Trojan.Generic', 'Malware.PDF']
    scanDate: string
    fileHash: string
  }
  ```
- **UI Component**: `SecureDocumentUploader.tsx`
- **Workflow**: User selects file → Upload triggers scan → Progress bar → Green badge if safe → Red warning if threat detected

### 4. Marketing & Patient Engagement

#### Transactional SMS API
- **Service**: Twilio / Plivo (simulated in mock mode)
- **Purpose**: Automated SMS confirmations 72 hours before appointments
- **Use Case**: Appointment created → System sends SMS "Reply 1 to Confirm" → Patient replies → Status updated
- **Implementation**: `APIServices.sendTransactionalSMS(phoneNumber, message)`
- **Workflow**: Automated by workflow engine (not manually triggered)
- **Note**: Currently simulated; would integrate with SMS provider in production

## Integration Points in Application

### Patient Intake Flow
```
User fills intake form
    ↓
Validates phone (NumVerify)
    ↓
Validates email (Eva)
    ↓
Validates address (Smarty)
    ↓
Only clean data saved to database
```

### Appointment Scheduling Flow
```
User opens scheduler
    ↓
Load holidays (Nager.Date)
    ↓
Calendar blocks holidays/weekends
    ↓
User selects date & provider
    ↓
Appointment created
    ↓
72-hour SMS confirmation queued
```

### Clinical Documentation Flow
```
Doctor sees patient
    ↓
Searches drug (OpenFDA)
    ↓
Reviews warnings/recalls
    ↓
Enters diagnosis
    ↓
Searches ICD-10 codes
    ↓
Copies code to billing system
```

### Document Upload Flow
```
User selects file
    ↓
File sent to scanning API (VirusTotal)
    ↓
Scan result returned
    ↓
If safe: upload permitted
    ↓
If threat: file blocked with warning
```

## Error Handling

All API integrations implement graceful degradation:

1. **Network Failures**: Toast notification with retry option
2. **API Rate Limits**: Exponential backoff with user notification
3. **Invalid Responses**: Fall back to manual entry with warning flag
4. **Timeout**: 10-second timeout with fallback to cached data where applicable

## Mock Data Examples

The mock mode provides realistic test data:

- **Phone Numbers**: Numbers containing "555" or "123" return as mobile/SMS-capable
- **Addresses**: ZIP codes 90210, 10001, 60614, 33139, 78701 validate successfully
- **Emails**: Domains like "tempmail.com" flagged as disposable
- **Holidays**: Standard US federal holidays (New Year's, July 4th, Thanksgiving, Christmas)
- **Drugs**: Lisinopril and Metformin have full mock data including warnings
- **ICD-10**: Common diagnoses (hypertension, diabetes, flu) return multiple codes
- **Files**: Filenames containing "virus", "malware", "ransomware" flagged as threats

## Production Deployment Checklist

To enable production APIs:

1. ✅ Obtain API keys for each service
2. ✅ Set `MOCK_MODE = false` in `api-services.ts`
3. ✅ Configure environment variables for API keys
4. ✅ Set up CORS proxy or backend API gateway (client-side API calls may require proxy)
5. ✅ Implement rate limiting and caching strategy
6. ✅ Add error logging and monitoring
7. ✅ Test each API integration individually
8. ✅ Configure fallback behavior for each API
9. ✅ Update API endpoints to production URLs
10. ✅ Implement API key rotation strategy

## Component Documentation

### APIServices Class
Location: `/src/lib/api-services.ts`

All API methods are static and can be called directly:
```typescript
import { APIServices } from '@/lib/api-services'

// Example usage
const phoneResult = await APIServices.validatePhone('555-123-4567')
const holidays = await APIServices.getPublicHolidays(2024, 'US')
const drugInfo = await APIServices.getDrugInfo('Lisinopril')
```

### UI Components

- **PatientIntakeForm**: `/src/components/PatientIntakeForm.tsx`
  - Phone, email, address validation with real-time feedback
  
- **ClinicalDecisionSupport**: `/src/components/ClinicalDecisionSupport.tsx`
  - Drug information and ICD-10 code lookup
  
- **SmartAppointmentScheduler**: `/src/components/SmartAppointmentScheduler.tsx`
  - Holiday-aware calendar with blocked dates
  
- **SecureDocumentUploader**: `/src/components/SecureDocumentUploader.tsx`
  - Malware scanning before file upload
  
- **APIIntegrationDashboard**: `/src/components/APIIntegrationDashboard.tsx`
  - Central hub showing all integrations and workflows

## Performance Considerations

- **Caching**: Holiday data cached for 24 hours
- **Debouncing**: Address autocomplete debounced to 500ms
- **Parallel Validation**: Phone/email/address validated in parallel for speed
- **Progressive Enhancement**: App remains functional if APIs unavailable
- **Optimistic UI**: Show validation UI immediately, update when API responds

## Security Notes

- API keys never exposed in client-side code
- All API calls go through secure HTTPS
- File scanning happens before files touch server filesystem
- Validation results logged for audit trail
- Failed validations flagged for manual review rather than blocking entirely

## Future Enhancements

- Social media review APIs (Google Places) for post-visit review requests
- Lab results integration APIs (LabCorp, Quest Diagnostics)
- Insurance eligibility verification APIs
- Prescription routing APIs (SureScripts)
- Telehealth video APIs (Twilio Video, Agora)
