export interface Patient {
  id: string
  name: string
  dateOfBirth: string
  allergies: Allergy[]
}

export interface Allergy {
  id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
}

export interface Medication {
  id: string
  name: string
  genericName: string
  drugClass: string
  commonDosages: string[]
  interactions: string[]
  contraindications: string[]
  ndc?: string
  manufacturer?: string
  formularyTier?: string
  requiresPriorAuth?: boolean
}

export interface Prescription {
  id: string
  patientId: string
  medication: Medication
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescribedDate: string
  status: 'active' | 'discontinued' | 'completed'
  discontinuedDate?: string
  overrideJustification?: string
  linkedAuthNumber?: string
}

export interface DrugInteraction {
  severity: 'minor' | 'moderate' | 'severe'
  drug1: string
  drug2: string
  description: string
  recommendation: string
}

export interface AllergyWarning {
  allergen: string
  medication: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
}

export interface FormularyDrug {
  ndc: string
  brandName: string
  genericName: string
  manufacturer: string
  drugClass: string
  strength: string
  dosageForm: string
  tier: string
  commonDosages: string[]
  contraindications: string[]
  requiresPriorAuth?: boolean
}

export interface FormularyDatabase {
  id: string
  name: string
  description: string
  drugCount: number
  lastUpdated: string
}
