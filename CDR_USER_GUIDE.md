# Clinical Decision Rule (CDR) Engine - User Guide

## Overview

The WebRTC Telehealth Suite now includes an integrated Clinical Decision Rule (CDR) Engine that provides real-time clinical alerts during telehealth encounters. This system demonstrates ONC Certification-aligned workflows for quality measure tracking, preventive care gap closure, chronic disease management, and medication safety.

## Features

### Real-Time Clinical Alerts
- Alerts trigger automatically when telehealth sessions begin
- Provider-only visibility (patient side does not see alerts)
- Non-intrusive notification badge with alert count
- Expandable/collapsible sidebar for detailed alert management

### Evidence-Based Rules
The system includes six clinical decision rules aligned with national guidelines:

1. **Hypertension Management (HTN-001)**
   - Triggers on: Vitals entry with BP ≥ 140/90
   - Standards: ICD-10 I10, SNOMED 38341003
   - Recommendation: Review antihypertensive regimen and lifestyle interventions

2. **Diabetes Screening (DM-001)**
   - Triggers on: Encounter start for patients ≥45 years without screening in past 12 months
   - Standards: ICD-10 E11, SNOMED 44054006, LOINC 4548-4
   - CQM: CMS122
   - Recommendation: Order HbA1c or fasting glucose

3. **Colorectal Cancer Screening (PREV-001)**
   - Triggers on: Encounter start for patients 45-75 years without colonoscopy in past 10 years
   - Standards: SNOMED 363406005, CPT 45378
   - CQM: CMS130
   - Recommendation: Discuss screening options (colonoscopy, FIT, stool DNA test)

4. **ACE Inhibitor + NSAID Interaction (MED-001)**
   - Triggers on: Manual check when both medications present
   - Standards: RxNorm codes for Lisinopril (1998) and Ibuprofen (5640)
   - Recommendation: Monitor renal function and potassium levels, consider alternatives

5. **Diabetes A1c Control (DM-002)**
   - Triggers on: Lab result entry with A1c > 9%
   - Standards: LOINC 4548-4, ICD-10 E11.65
   - CQM: CMS122
   - Recommendation: Intensify therapy, assess adherence

6. **Influenza Vaccination (PREV-002)**
   - Triggers on: Encounter start during flu season (Sept-March) without current year vaccination
   - Standards: CPT 90658, SNOMED 86198006
   - CQM: CMS147
   - Recommendation: Administer vaccine if no contraindications

### Alert Severity Levels
- **Critical/High**: Red destructive badge (e.g., severe hyperglycemia, dangerous drug interactions)
- **Medium**: Yellow/orange warning badge (e.g., screening overdue, mild BP elevation)
- **Low/Info**: Blue informational badge (e.g., vaccination reminders, routine screenings)

### Provider Workflow
1. Provider selects "Join as Provider" from demo landing page
2. System loads patient data (Sarah Martinez - demo patient with multiple conditions)
3. CDR engine evaluates patient against all enabled rules
4. Alerts display in sidebar with notification badge
5. Provider reviews alert details, clinical recommendations, and evidence references
6. Provider acknowledges alert (documenting review) or dismisses if not applicable
7. Alert status persists in patient record for audit trail

### Alert Components
Each alert displays:
- **Severity Badge**: Visual indicator of urgency
- **Category Icon**: Type of alert (preventive care, chronic disease, medication safety, quality measure)
- **Rule Name**: Brief clinical description
- **Alert Message**: Context-specific details about the patient's situation
- **Recommendation**: Actionable clinical guidance
- **Metadata**: Triggered timestamp, clinical codes (ICD-10, SNOMED, RxNorm), CQM ID if applicable
- **Actions**: Acknowledge or Dismiss buttons

## Demo Patient Data

**Sarah Martinez (Patient ID: patient-001)**
- Age: 54, Female
- Conditions:
  - Essential Hypertension (diagnosed 2018)
  - Type 2 Diabetes Mellitus (diagnosed 2020)
- Current Vitals: BP 156/94 (elevated), BMI 30.1
- Medications:
  - Lisinopril 20mg daily
  - Metformin 1000mg twice daily
  - Ibuprofen 600mg PRN (creates interaction alert)
- Labs: HbA1c 9.2% (poor control)
- Screenings: Colonoscopy in 2014 (overdue)
- Allergies: Penicillin, Shellfish

**Expected Alerts for Sarah:**
1. ✅ Hypertension Alert - BP 156/94
2. ✅ Diabetes A1c Control - HbA1c 9.2%
3. ✅ ACE Inhibitor + NSAID Interaction
4. ✅ Colorectal Cancer Screening Overdue

## Technical Architecture

### Data Flow
```
Session Start → Load Patient Record → Evaluate CDR Rules → Generate Alerts → Display Sidebar → Provider Action → Update Alert Status → Persist to KV Store
```

### Rule Evaluation
- Trigger Types: encounter-start, vitals-entry, lab-result, manual-check
- Evaluation Time: <200ms for full rule set
- Error Handling: Failed rules log error, don't block session

### Data Persistence
- Alert history stored in Spark KV (`clinical-alerts` key)
- Session history stored in Spark KV (`telehealth-sessions` key)
- Acknowledgment/dismissal actions tracked with timestamp and provider name

### Standards Compliance
- **SNOMED CT**: Clinical terminology for conditions
- **ICD-10**: Diagnosis codes
- **RxNorm**: Medication codes
- **LOINC**: Laboratory test codes
- **CPT**: Procedure codes
- **CQM**: Clinical Quality Measures (CMS program)

## File Structure

```
src/
├── types/
│   └── clinical.ts              # Clinical data type definitions
├── lib/
│   ├── clinicalRules.ts         # Rule definitions and evaluation engine
│   └── mockPatientData.ts       # Demo patient records
├── components/
│   └── clinical/
│       ├── ClinicalAlertsSidebar.tsx  # Alert display component
│       └── PatientInfoCard.tsx        # Patient summary component
└── App.tsx                      # Integration with telehealth session
```

## Usage Instructions

### For Providers
1. Click "Join as Provider" on landing page
2. Grant camera/microphone permissions in waiting room
3. Click "Join Session" when ready
4. Clinical alerts sidebar appears automatically with active alerts
5. Review each alert by reading the message and recommendation
6. Click "Acknowledge" to mark as reviewed (recommended for audit trail)
7. Click dismiss icon to hide non-applicable alerts
8. Toggle sidebar visibility using bell icon if needed
9. Alerts persist throughout the session

### For Developers
```typescript
// Adding a new clinical rule
import type { ClinicalRule } from '@/types/clinical'

const newRule: ClinicalRule = {
  id: 'RULE-ID',
  name: 'Rule Display Name',
  category: 'preventive-care', // or chronic-disease, medication-safety, quality-measure
  description: 'Detailed description',
  severity: 'medium',  // critical, high, medium, low, info
  trigger: 'encounter-start',  // or vitals-entry, lab-result, manual-check
  codes: [
    { system: 'ICD-10', code: 'XXX', display: 'Condition Name' }
  ],
  condition: (patient, context) => {
    // Return true to fire alert, false to skip
    return patient.age > 65
  },
  alertTemplate: (patient, context) => {
    // Return message string for the alert
    return `Patient is ${patient.age} years old...`
  },
  recommendation: 'Clinical action to take',
  references: ['Guideline source'],
  cqmId: 'CMSXXX',  // optional
  enabled: true
}

// Add to clinicalRules array in src/lib/clinicalRules.ts
```

## ONC Certification Alignment

This implementation demonstrates key requirements for ONC Health IT Certification:

- **Clinical Decision Support**: Real-time interventions based on patient-specific data
- **Quality Measurement**: CQM gap identification and tracking
- **Patient-Specific Education**: Recommendations tailored to individual patients
- **Drug-Drug Interaction Checks**: Medication safety alerts
- **Preventive Care Reminders**: Evidence-based screening recommendations
- **Audit Trail**: All alert actions logged with timestamp and provider

## Future Enhancements

Potential expansions of the CDR system:
- Integration with external clinical knowledge bases (e.g., UpToDate, Clinical Key)
- Machine learning-based risk prediction models
- Patient-specific education material generation
- Automated order entry for recommended tests
- Integration with pharmacy systems for real-time formulary checks
- Multi-language support for diverse patient populations
- Mobile-responsive alert interface for tablet-based clinical workflows

## Support & Documentation

- Technical Documentation: `/CDR_IMPLEMENTATION.md`
- Product Requirements: `/PRD.md`
- OpenEMR CDR Documentation: [OpenEMR Wiki - Clinical Decision Rules](https://www.open-emr.org/wiki/index.php/Clinical_Decision_Rules)
- CMS Quality Measures: [CMS eCQM Library](https://ecqi.healthit.gov/)

## Troubleshooting

**Q: Alerts not appearing?**
- Verify you joined as "Provider" (patient view doesn't show alerts)
- Check browser console for rule evaluation errors
- Confirm patient data loaded (check mockPatientData.ts)

**Q: Alert sidebar hidden?**
- Click the bell icon (top right) to expand sidebar
- Check for notification badge showing active alert count

**Q: Want to add custom patient data?**
- Edit `/src/lib/mockPatientData.ts`
- Add new PatientRecord object to mockPatients array
- Update App.tsx to reference new patient ID

**Q: How to test specific rules?**
- Modify patient data in mockPatientData.ts to meet rule conditions
- Age, vitals, medications, screenings, labs can all be adjusted
- Reload session to re-evaluate rules

## License & Attribution

This CDR implementation is a demonstration system aligned with OpenEMR Clinical Decision Rule patterns. It is not intended for production clinical use without appropriate validation, testing, and regulatory clearance.

Clinical guidelines referenced:
- American Diabetes Association (ADA) Standards of Care
- American Heart Association (AHA) / American College of Cardiology (ACC) Guidelines
- U.S. Preventive Services Task Force (USPSTF) Recommendations
- Centers for Disease Control and Prevention (CDC) / Advisory Committee on Immunization Practices (ACIP)
- FDA Drug Safety Communications
