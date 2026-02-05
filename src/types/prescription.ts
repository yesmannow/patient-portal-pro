export interface Patient {
  id: string
  name: string
  dateOfBirth: string
}
e

  severity: 'mild' | 'mode
}
export interface M
  name: string
  drugClass: string
  interactions: string
}

  patientId: string
  dosage: st
  duration: st
  genericName: string
  drugClass: string
  commonDosages: string[]
  interactions: string[]
  contraindications: string[]
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
  instructions: string
  prescribedDate: string
  status: 'active' | 'discontinued' | 'completed'
  discontinuedDate?: string
  overrideJustification?: string
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
