import { Medication, DrugInteraction, FormularyDrug } from '@/types/prescription'

export let MEDICATIONS: Medication[] = [
  {
    id: 'med-001',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    drugClass: 'ACE Inhibitor',
    commonDosages: ['5mg', '10mg', '20mg', '40mg'],
    interactions: ['med-002', 'med-009'],
    contraindications: ['angioedema', 'pregnancy']
  },
  {
    id: 'med-002',
    name: 'Spironolactone',
    genericName: 'Spironolactone',
    drugClass: 'Potassium-Sparing Diuretic',
    commonDosages: ['25mg', '50mg', '100mg'],
    interactions: ['med-001', 'med-009'],
    contraindications: ['hyperkalemia', 'kidney disease']
  },
  {
    id: 'med-003',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    drugClass: 'Penicillin Antibiotic',
    commonDosages: ['250mg', '500mg', '875mg'],
    interactions: ['med-005'],
    contraindications: ['penicillin']
  },
  {
    id: 'med-004',
    name: 'Augmentin',
    genericName: 'Amoxicillin-Clavulanate',
    drugClass: 'Penicillin Antibiotic',
    commonDosages: ['500mg-125mg', '875mg-125mg'],
    interactions: ['med-005'],
    contraindications: ['penicillin']
  },
  {
    id: 'med-005',
    name: 'Warfarin',
    genericName: 'Warfarin',
    drugClass: 'Anticoagulant',
    commonDosages: ['1mg', '2mg', '5mg', '10mg'],
    interactions: ['med-003', 'med-004', 'med-006', 'med-012'],
    contraindications: ['bleeding disorder']
  },
  {
    id: 'med-006',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    drugClass: 'NSAID',
    commonDosages: ['81mg', '325mg'],
    interactions: ['med-005', 'med-007'],
    contraindications: ['aspirin', 'bleeding disorder']
  },
  {
    id: 'med-007',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    drugClass: 'NSAID',
    commonDosages: ['200mg', '400mg', '600mg', '800mg'],
    interactions: ['med-006', 'med-001'],
    contraindications: ['aspirin', 'nsaid']
  },
  {
    id: 'med-008',
    name: 'Metformin',
    genericName: 'Metformin',
    drugClass: 'Biguanide',
    commonDosages: ['500mg', '850mg', '1000mg'],
    interactions: [],
    contraindications: ['kidney disease', 'liver disease']
  },
  {
    id: 'med-009',
    name: 'Losartan',
    genericName: 'Losartan',
    drugClass: 'ARB',
    commonDosages: ['25mg', '50mg', '100mg'],
    interactions: ['med-001', 'med-002'],
    contraindications: ['pregnancy']
  },
  {
    id: 'med-010',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin',
    drugClass: 'Statin',
    commonDosages: ['10mg', '20mg', '40mg', '80mg'],
    interactions: ['med-011'],
    contraindications: ['liver disease']
  },
  {
    id: 'med-011',
    name: 'Amlodipine',
    genericName: 'Amlodipine',
    drugClass: 'Calcium Channel Blocker',
    commonDosages: ['2.5mg', '5mg', '10mg'],
    interactions: ['med-010'],
    contraindications: []
  },
  {
    id: 'med-012',
    name: 'Levothyroxine',
    genericName: 'Levothyroxine',
    drugClass: 'Thyroid Hormone',
    commonDosages: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg'],
    interactions: ['med-005'],
    contraindications: []
  },
  {
    id: 'med-013',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    drugClass: 'Proton Pump Inhibitor',
    commonDosages: ['20mg', '40mg'],
    interactions: [],
    contraindications: []
  },
  {
    id: 'med-014',
    name: 'Sertraline',
    genericName: 'Sertraline',
    drugClass: 'SSRI',
    commonDosages: ['25mg', '50mg', '100mg'],
    interactions: ['med-005'],
    contraindications: []
  },
  {
    id: 'med-015',
    name: 'Albuterol',
    genericName: 'Albuterol',
    drugClass: 'Beta-2 Agonist',
    commonDosages: ['90mcg/spray'],
    interactions: [],
    contraindications: []
  }
]

export const INTERACTION_DATABASE: Record<string, DrugInteraction> = {
  'med-001_med-002': {
    severity: 'severe',
    drug1: 'Lisinopril',
    drug2: 'Spironolactone',
    description: 'Concurrent use may significantly increase serum potassium levels, potentially leading to life-threatening hyperkalemia.',
    recommendation: 'Monitor potassium levels closely. Consider alternative therapy or dose adjustment. Frequent lab monitoring required.'
  },
  'med-001_med-009': {
    severity: 'severe',
    drug1: 'Lisinopril',
    drug2: 'Losartan',
    description: 'Dual RAAS blockade increases risk of hypotension, hyperkalemia, and renal dysfunction.',
    recommendation: 'Avoid combination. Use only one RAAS blocker unless specifically indicated by specialist.'
  },
  'med-002_med-009': {
    severity: 'severe',
    drug1: 'Spironolactone',
    drug2: 'Losartan',
    description: 'Combined use may lead to severe hyperkalemia and renal impairment.',
    recommendation: 'Monitor potassium and renal function closely. Consider alternative therapy.'
  },
  'med-003_med-005': {
    severity: 'moderate',
    drug1: 'Amoxicillin',
    drug2: 'Warfarin',
    description: 'Antibiotics may alter gut flora and potentiate warfarin effect, increasing bleeding risk.',
    recommendation: 'Monitor INR more frequently during antibiotic therapy and for 1 week after completion.'
  },
  'med-004_med-005': {
    severity: 'moderate',
    drug1: 'Augmentin',
    drug2: 'Warfarin',
    description: 'May enhance anticoagulant effect of warfarin, increasing risk of bleeding.',
    recommendation: 'Monitor INR closely. May need warfarin dose adjustment.'
  },
  'med-005_med-006': {
    severity: 'severe',
    drug1: 'Warfarin',
    drug2: 'Aspirin',
    description: 'Significantly increases risk of major bleeding when used together.',
    recommendation: 'Use combination only when clearly indicated. Monitor closely for bleeding. Consider lower aspirin dose (81mg).'
  },
  'med-005_med-012': {
    severity: 'moderate',
    drug1: 'Warfarin',
    drug2: 'Levothyroxine',
    description: 'Thyroid hormones may increase catabolism of vitamin K-dependent clotting factors, enhancing warfarin effect.',
    recommendation: 'Monitor INR when initiating, adjusting, or discontinuing thyroid therapy.'
  },
  'med-005_med-014': {
    severity: 'moderate',
    drug1: 'Warfarin',
    drug2: 'Sertraline',
    description: 'SSRIs may increase bleeding risk and can affect warfarin metabolism.',
    recommendation: 'Monitor INR more frequently when starting or stopping SSRI therapy.'
  },
  'med-006_med-007': {
    severity: 'moderate',
    drug1: 'Aspirin',
    drug2: 'Ibuprofen',
    description: 'Multiple NSAIDs increase risk of GI bleeding and may reduce cardioprotective effect of aspirin.',
    recommendation: 'Avoid concurrent use when possible. If needed, take ibuprofen at least 2 hours after aspirin.'
  },
  'med-007_med-001': {
    severity: 'minor',
    drug1: 'Ibuprofen',
    drug2: 'Lisinopril',
    description: 'NSAIDs may reduce antihypertensive effect of ACE inhibitors and increase risk of renal dysfunction.',
    recommendation: 'Monitor blood pressure and renal function. Use lowest effective NSAID dose for shortest duration.'
  },
  'med-010_med-011': {
    severity: 'minor',
    drug1: 'Atorvastatin',
    drug2: 'Amlodipine',
    description: 'Amlodipine may increase atorvastatin levels, slightly increasing statin-related side effects.',
    recommendation: 'Generally safe combination. Monitor for muscle pain or weakness. Consider lower statin starting dose.'
  }
}

export function searchMedications(query: string): Medication[] {
  const lowerQuery = query.toLowerCase()
  return MEDICATIONS.filter(med => 
    med.name.toLowerCase().includes(lowerQuery) ||
    med.genericName.toLowerCase().includes(lowerQuery) ||
    med.drugClass.toLowerCase().includes(lowerQuery)
  )
}

export function checkInteractions(medicationId: string, activePrescriptions: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = []
  
  activePrescriptions.forEach(activeId => {
    const key1 = `${medicationId}_${activeId}`
    const key2 = `${activeId}_${medicationId}`
    
    if (INTERACTION_DATABASE[key1]) {
      interactions.push(INTERACTION_DATABASE[key1])
    } else if (INTERACTION_DATABASE[key2]) {
      interactions.push(INTERACTION_DATABASE[key2])
    }
  })
  
  return interactions.sort((a, b) => {
    const severityOrder = { severe: 3, moderate: 2, minor: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

export function addFormularyDrugs(formularyDrugs: FormularyDrug[]): void {
  let currentMaxId = MEDICATIONS.length
  
  formularyDrugs.forEach(drug => {
    const existingDrug = MEDICATIONS.find(
      m => m.name.toLowerCase() === drug.brandName.toLowerCase() ||
           m.genericName.toLowerCase() === drug.genericName.toLowerCase()
    )
    
    if (!existingDrug) {
      currentMaxId++
      const newMedication: Medication = {
        id: `med-${String(currentMaxId).padStart(3, '0')}`,
        name: drug.brandName,
        genericName: drug.genericName,
        drugClass: drug.drugClass,
        commonDosages: drug.commonDosages,
        interactions: [],
        contraindications: drug.contraindications,
        ndc: drug.ndc,
        manufacturer: drug.manufacturer,
        formularyTier: drug.tier
      }
      MEDICATIONS.push(newMedication)
    }
  })
}

export function getMedicationCount(): number {
  return MEDICATIONS.length
}
