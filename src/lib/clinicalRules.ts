import type { ClinicalRule, PatientRecord, RuleAlert, ClinicalContext } from '@/types/clinical'
import { v4 as uuidv4 } from 'uuid'

export const clinicalRules: ClinicalRule[] = [
  {
    id: 'HTN-001',
    name: 'Hypertension Alert - Elevated Blood Pressure',
    category: 'chronic-disease',
    description: 'Alert when blood pressure exceeds 140/90 mmHg',
    severity: 'high',
    trigger: 'vitals-entry',
    codes: [
      { system: 'ICD-10', code: 'I10', display: 'Essential Hypertension' },
      { system: 'SNOMED-CT', code: '38341003', display: 'Hypertensive disorder' }
    ],
    condition: (patient: PatientRecord, context?: ClinicalContext) => {
      const latestVitals = context?.vitals || patient.vitals[0]
      if (!latestVitals) return false
      return (latestVitals.systolicBP && latestVitals.systolicBP >= 140) ||
             (latestVitals.diastolicBP && latestVitals.diastolicBP >= 90)
    },
    alertTemplate: (patient: PatientRecord, context?: ClinicalContext) => {
      const vitals = context?.vitals || patient.vitals[0]
      return `Elevated blood pressure detected: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg. Consider medication adjustment or lifestyle intervention.`
    },
    recommendation: 'Review current antihypertensive regimen. Consider DASH diet counseling and exercise recommendations.',
    references: ['JNC 8 Hypertension Guidelines', 'AHA/ACC 2017 BP Guidelines'],
    enabled: true
  },
  {
    id: 'DM-001',
    name: 'Diabetes Screening Overdue',
    category: 'preventive-care',
    description: 'Alert when patient over 45 has not had diabetes screening in over 12 months',
    severity: 'medium',
    trigger: 'encounter-start',
    codes: [
      { system: 'ICD-10', code: 'E11', display: 'Type 2 Diabetes Mellitus' },
      { system: 'SNOMED-CT', code: '44054006', display: 'Type 2 diabetes mellitus' },
      { system: 'LOINC', code: '4548-4', display: 'Hemoglobin A1c' }
    ],
    condition: (patient: PatientRecord) => {
      if (patient.age < 45) return false
      
      const diabetesScreening = patient.screenings.find(s => 
        s.type === 'diabetes' || s.name.toLowerCase().includes('a1c') || s.name.toLowerCase().includes('glucose')
      )
      
      if (!diabetesScreening) return true
      
      const monthsSinceLastScreen = (Date.now() - new Date(diabetesScreening.lastDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsSinceLastScreen > 12
    },
    alertTemplate: (patient: PatientRecord) => {
      return `Patient is ${patient.age} years old and overdue for diabetes screening. Last screening more than 12 months ago.`
    },
    recommendation: 'Order HbA1c or fasting glucose test. Consider risk factors: obesity, family history, hypertension.',
    references: ['ADA Standards of Care 2024', 'USPSTF Diabetes Screening Recommendations'],
    cqmId: 'CMS122',
    enabled: true
  },
  {
    id: 'PREV-001',
    name: 'Colorectal Cancer Screening Due',
    category: 'preventive-care',
    description: 'Alert for patients 45-75 who need colorectal cancer screening',
    severity: 'medium',
    trigger: 'encounter-start',
    codes: [
      { system: 'SNOMED-CT', code: '363406005', display: 'Malignant tumor of colon' },
      { system: 'CPT', code: '45378', display: 'Colonoscopy' }
    ],
    condition: (patient: PatientRecord) => {
      if (patient.age < 45 || patient.age > 75) return false
      
      const colonoscopy = patient.screenings.find(s => 
        s.type === 'colonoscopy' || s.name.toLowerCase().includes('colonoscopy')
      )
      
      if (!colonoscopy) return true
      
      const yearsSinceLastScreen = (Date.now() - new Date(colonoscopy.lastDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
      return yearsSinceLastScreen > 10
    },
    alertTemplate: (patient: PatientRecord) => {
      return `Patient age ${patient.age} is due for colorectal cancer screening per USPSTF guidelines.`
    },
    recommendation: 'Discuss screening options: colonoscopy (every 10 years), FIT test (annual), or stool DNA test (every 3 years).',
    references: ['USPSTF Colorectal Cancer Screening 2021'],
    cqmId: 'CMS130',
    enabled: true
  },
  {
    id: 'MED-001',
    name: 'ACE Inhibitor + NSAID Interaction',
    category: 'medication-safety',
    description: 'Alert for potential kidney injury risk when ACE inhibitor and NSAID prescribed together',
    severity: 'high',
    trigger: 'manual-check',
    codes: [
      { system: 'RxNorm', code: '1998', display: 'Lisinopril' },
      { system: 'RxNorm', code: '5640', display: 'Ibuprofen' }
    ],
    condition: (patient: PatientRecord) => {
      const hasACEInhibitor = patient.medications.some(med => 
        med.name.toLowerCase().includes('lisinopril') ||
        med.name.toLowerCase().includes('enalapril') ||
        med.name.toLowerCase().includes('ramipril')
      )
      
      const hasNSAID = patient.medications.some(med =>
        med.name.toLowerCase().includes('ibuprofen') ||
        med.name.toLowerCase().includes('naproxen') ||
        med.name.toLowerCase().includes('diclofenac')
      )
      
      return hasACEInhibitor && hasNSAID
    },
    alertTemplate: () => {
      return 'Potential drug interaction: ACE inhibitor + NSAID increases risk of acute kidney injury and hyperkalemia.'
    },
    recommendation: 'Consider alternative pain management. If both necessary, monitor renal function and potassium levels closely.',
    references: ['FDA Drug Safety Communication', 'UpToDate Drug Interactions'],
    enabled: true
  },
  {
    id: 'DM-002',
    name: 'Diabetes A1c Control',
    category: 'chronic-disease',
    description: 'Alert when diabetic patient has A1c > 9%',
    severity: 'high',
    trigger: 'lab-result',
    codes: [
      { system: 'LOINC', code: '4548-4', display: 'Hemoglobin A1c' },
      { system: 'ICD-10', code: 'E11.65', display: 'Type 2 diabetes with hyperglycemia' }
    ],
    condition: (patient: PatientRecord, context?: ClinicalContext) => {
      const hasDiabetes = patient.conditions.some(c => 
        c.name.toLowerCase().includes('diabetes') && c.status !== 'resolved'
      )
      
      if (!hasDiabetes) return false
      
      const a1cLab = patient.labs.find(lab => 
        lab.loincCode === '4548-4' || lab.testName.toLowerCase().includes('a1c')
      )
      
      if (!a1cLab) return false
      
      const a1cValue = parseFloat(a1cLab.value)
      return a1cValue > 9.0
    },
    alertTemplate: (patient: PatientRecord) => {
      const a1cLab = patient.labs.find(lab => lab.testName.toLowerCase().includes('a1c'))
      return `Poor diabetes control: HbA1c ${a1cLab?.value}% (target <7%). Intensification of therapy recommended.`
    },
    recommendation: 'Intensify diabetes regimen. Consider adding or adjusting medications. Assess adherence and barriers to care.',
    references: ['ADA Standards of Care 2024'],
    cqmId: 'CMS122',
    enabled: true
  },
  {
    id: 'PREV-002',
    name: 'Influenza Vaccination Due',
    category: 'preventive-care',
    description: 'Annual influenza vaccination reminder (September-March)',
    severity: 'low',
    trigger: 'encounter-start',
    codes: [
      { system: 'CPT', code: '90658', display: 'Influenza virus vaccine' },
      { system: 'SNOMED-CT', code: '86198006', display: 'Influenza vaccination' }
    ],
    condition: (patient: PatientRecord) => {
      const now = new Date()
      const currentMonth = now.getMonth()
      
      if (currentMonth < 8 || currentMonth > 2) return false
      
      const fluShot = patient.screenings.find(s => 
        s.type === 'immunization' && s.name.toLowerCase().includes('influenza')
      )
      
      if (!fluShot) return true
      
      const lastShotYear = new Date(fluShot.lastDate).getFullYear()
      const currentYear = now.getFullYear()
      
      return lastShotYear < currentYear
    },
    alertTemplate: () => {
      return 'Patient is due for annual influenza vaccination for current flu season.'
    },
    recommendation: 'Administer influenza vaccine if no contraindications present.',
    references: ['CDC ACIP Influenza Vaccination Recommendations'],
    cqmId: 'CMS147',
    enabled: true
  }
]

export function evaluateRules(patient: PatientRecord, context: ClinicalContext): RuleAlert[] {
  const alerts: RuleAlert[] = []
  const triggerType = context.vitals ? 'vitals-entry' : context.sessionId ? 'encounter-start' : 'manual-check'
  
  for (const rule of clinicalRules) {
    if (!rule.enabled) continue
    if (rule.trigger !== triggerType && rule.trigger !== 'manual-check') continue
    
    try {
      if (rule.condition(patient, context)) {
        const alert: RuleAlert = {
          id: uuidv4(),
          ruleId: rule.id,
          ruleName: rule.name,
          patientId: patient.patientId,
          patientName: patient.patientName,
          severity: rule.severity,
          category: rule.category,
          message: rule.alertTemplate(patient, context),
          recommendation: rule.recommendation,
          status: 'active',
          triggeredAt: new Date(),
          triggeredBy: triggerType,
          sessionId: context.sessionId,
          encounterId: context.encounterId,
          metadata: {
            codes: rule.codes,
            cqmId: rule.cqmId
          }
        }
        alerts.push(alert)
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error)
    }
  }
  
  return alerts
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'destructive'
    case 'high':
      return 'destructive'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    case 'info':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'preventive-care':
      return 'Shield'
    case 'chronic-disease':
      return 'Heartbeat'
    case 'medication-safety':
      return 'Pill'
    case 'quality-measure':
      return 'ChartBar'
    default:
      return 'Bell'
  }
}
