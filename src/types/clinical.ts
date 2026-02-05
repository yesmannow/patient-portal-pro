export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type RuleTrigger = 'encounter-start' | 'vitals-entry' | 'manual-check' | 'lab-result'
export type RuleCategory = 'preventive-care' | 'chronic-disease' | 'medication-safety' | 'quality-measure'
export type AlertStatus = 'active' | 'acknowledged' | 'dismissed' | 'resolved'

export interface ClinicalCode {
  system: 'ICD-10' | 'SNOMED-CT' | 'RxNorm' | 'CPT' | 'LOINC'
  code: string
  display: string
}

export interface ClinicalCondition {
  id: string
  name: string
  codes: ClinicalCode[]
  diagnosedDate: Date
  status: 'active' | 'resolved' | 'chronic'
}

export interface VitalSigns {
  timestamp: Date
  systolicBP?: number
  diastolicBP?: number
  heartRate?: number
  temperature?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  bmi?: number
  recordedBy: string
}

export interface Medication {
  id: string
  name: string
  rxNormCode?: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date
  prescribedBy: string
}

export interface Screening {
  id: string
  type: string
  name: string
  lastDate: Date
  result?: string
  dueDate?: Date
  codes: ClinicalCode[]
}

export interface LabResult {
  id: string
  testName: string
  loincCode?: string
  value: string
  unit: string
  referenceRange: string
  abnormalFlag?: boolean
  collectedDate: Date
  resultDate: Date
}

export interface PatientRecord {
  patientId: string
  patientName: string
  dateOfBirth: Date
  age: number
  gender: 'male' | 'female' | 'other'
  conditions: ClinicalCondition[]
  vitals: VitalSigns[]
  medications: Medication[]
  screenings: Screening[]
  labs: LabResult[]
  allergies: string[]
  lastEncounter?: Date
}

export interface ClinicalRule {
  id: string
  name: string
  category: RuleCategory
  description: string
  severity: RuleSeverity
  trigger: RuleTrigger
  codes: ClinicalCode[]
  condition: (patient: PatientRecord, context?: any) => boolean
  alertTemplate: (patient: PatientRecord, context?: any) => string
  recommendation?: string
  references?: string[]
  cqmId?: string
  enabled: boolean
}

export interface RuleAlert {
  id: string
  ruleId: string
  ruleName: string
  patientId: string
  patientName: string
  severity: RuleSeverity
  category: RuleCategory
  message: string
  recommendation?: string
  status: AlertStatus
  triggeredAt: Date
  triggeredBy: RuleTrigger
  acknowledgedAt?: Date
  acknowledgedBy?: string
  dismissedAt?: Date
  dismissedBy?: string
  sessionId?: string
  encounterId?: string
  metadata?: Record<string, any>
}

export interface QualityMeasure {
  id: string
  name: string
  description: string
  numerator: number
  denominator: number
  percentage: number
  target: number
  relatedRules: string[]
  reportingPeriod: {
    start: Date
    end: Date
  }
}

export interface ClinicalContext {
  sessionId?: string
  encounterId?: string
  providerId: string
  providerName: string
  timestamp: Date
  vitals?: VitalSigns
  newMedication?: Medication
  labResult?: LabResult
}
