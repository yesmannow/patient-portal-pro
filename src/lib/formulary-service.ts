import { FormularyDrug } from '@/types/prescription'

const DRUG_CLASSES = [
  'ACE Inhibitor', 'ARB', 'Beta Blocker', 'Calcium Channel Blocker', 'Diuretic',
  'Statin', 'Antibiotic', 'NSAID', 'Opioid Analgesic', 'SSRI', 'SNRI',
  'Proton Pump Inhibitor', 'Anticoagulant', 'Antiplatelet', 'Bronchodilator',
  'Corticosteroid', 'Antihistamine', 'Antidiabetic', 'Thyroid Hormone', 'Benzodiazepine'
]

const BRAND_NAMES = {
  'ACE Inhibitor': ['Zestril', 'Prinivil', 'Vasotec', 'Altace', 'Accupril'],
  'ARB': ['Cozaar', 'Diovan', 'Avapro', 'Benicar', 'Atacand'],
  'Beta Blocker': ['Toprol-XL', 'Lopressor', 'Tenormin', 'Coreg', 'Bystolic'],
  'Calcium Channel Blocker': ['Norvasc', 'Cardizem', 'Procardia', 'Plendil', 'Verelan'],
  'Diuretic': ['Lasix', 'Bumex', 'Aldactone', 'Dyazide', 'Maxzide'],
  'Statin': ['Lipitor', 'Crestor', 'Zocor', 'Pravachol', 'Livalo'],
  'Antibiotic': ['Amoxil', 'Augmentin', 'Zithromax', 'Cipro', 'Levaquin', 'Keflex'],
  'NSAID': ['Advil', 'Motrin', 'Aleve', 'Celebrex', 'Mobic'],
  'Opioid Analgesic': ['OxyContin', 'Percocet', 'Vicodin', 'Norco', 'Dilaudid'],
  'SSRI': ['Prozac', 'Zoloft', 'Paxil', 'Lexapro', 'Celexa'],
  'SNRI': ['Cymbalta', 'Effexor', 'Pristiq', 'Savella', 'Fetzima'],
  'Proton Pump Inhibitor': ['Nexium', 'Prilosec', 'Prevacid', 'Protonix', 'Aciphex'],
  'Anticoagulant': ['Coumadin', 'Xarelto', 'Eliquis', 'Pradaxa', 'Savaysa'],
  'Antiplatelet': ['Plavix', 'Brilinta', 'Effient', 'Aspirin', 'Aggrenox'],
  'Bronchodilator': ['Ventolin', 'ProAir', 'Xopenex', 'Spiriva', 'Atrovent'],
  'Corticosteroid': ['Prednisone', 'Medrol', 'Deltasone', 'Decadron', 'Solu-Medrol'],
  'Antihistamine': ['Zyrtec', 'Claritin', 'Allegra', 'Xyzal', 'Clarinex'],
  'Antidiabetic': ['Glucophage', 'Januvia', 'Victoza', 'Jardiance', 'Farxiga'],
  'Thyroid Hormone': ['Synthroid', 'Levoxyl', 'Unithroid', 'Tirosint', 'Cytomel'],
  'Benzodiazepine': ['Xanax', 'Ativan', 'Klonopin', 'Valium', 'Restoril']
}

const GENERIC_NAMES = {
  'ACE Inhibitor': ['lisinopril', 'enalapril', 'ramipril', 'quinapril', 'benazepril'],
  'ARB': ['losartan', 'valsartan', 'irbesartan', 'olmesartan', 'candesartan'],
  'Beta Blocker': ['metoprolol', 'atenolol', 'carvedilol', 'nebivolol', 'propranolol'],
  'Calcium Channel Blocker': ['amlodipine', 'diltiazem', 'nifedipine', 'felodipine', 'verapamil'],
  'Diuretic': ['furosemide', 'bumetanide', 'spironolactone', 'hydrochlorothiazide', 'triamterene'],
  'Statin': ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin', 'pitavastatin'],
  'Antibiotic': ['amoxicillin', 'amoxicillin-clavulanate', 'azithromycin', 'ciprofloxacin', 'levofloxacin', 'cephalexin'],
  'NSAID': ['ibuprofen', 'naproxen', 'celecoxib', 'meloxicam', 'diclofenac'],
  'Opioid Analgesic': ['oxycodone', 'oxycodone-acetaminophen', 'hydrocodone-acetaminophen', 'hydromorphone', 'morphine'],
  'SSRI': ['fluoxetine', 'sertraline', 'paroxetine', 'escitalopram', 'citalopram'],
  'SNRI': ['duloxetine', 'venlafaxine', 'desvenlafaxine', 'milnacipran', 'levomilnacipran'],
  'Proton Pump Inhibitor': ['esomeprazole', 'omeprazole', 'lansoprazole', 'pantoprazole', 'rabeprazole'],
  'Anticoagulant': ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran', 'edoxaban'],
  'Antiplatelet': ['clopidogrel', 'ticagrelor', 'prasugrel', 'aspirin', 'dipyridamole-aspirin'],
  'Bronchodilator': ['albuterol', 'levalbuterol', 'tiotropium', 'ipratropium', 'salmeterol'],
  'Corticosteroid': ['prednisone', 'methylprednisolone', 'dexamethasone', 'prednisolone', 'hydrocortisone'],
  'Antihistamine': ['cetirizine', 'loratadine', 'fexofenadine', 'levocetirizine', 'desloratadine'],
  'Antidiabetic': ['metformin', 'sitagliptin', 'liraglutide', 'empagliflozin', 'dapagliflozin'],
  'Thyroid Hormone': ['levothyroxine', 'liothyronine', 'desiccated thyroid', 'thyroxine', 'thyroid extract'],
  'Benzodiazepine': ['alprazolam', 'lorazepam', 'clonazepam', 'diazepam', 'temazepam']
}

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Injection', 'Inhaler', 'Liquid', 'Patch', 'Cream']
const TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']

const CONTRAINDICATIONS_MAP: Record<string, string[]> = {
  'ACE Inhibitor': ['angioedema', 'pregnancy', 'bilateral renal artery stenosis'],
  'ARB': ['pregnancy', 'bilateral renal artery stenosis'],
  'Beta Blocker': ['severe asthma', 'heart block', 'severe bradycardia'],
  'Calcium Channel Blocker': ['severe hypotension', 'heart failure'],
  'Diuretic': ['severe hypokalemia', 'anuria', 'severe dehydration'],
  'Statin': ['active liver disease', 'pregnancy', 'breastfeeding'],
  'Antibiotic': ['penicillin allergy', 'sulfa allergy'],
  'NSAID': ['nsaid allergy', 'aspirin allergy', 'active GI bleeding', 'severe kidney disease'],
  'Opioid Analgesic': ['respiratory depression', 'severe asthma'],
  'SSRI': ['MAO inhibitor use'],
  'SNRI': ['MAO inhibitor use', 'uncontrolled hypertension'],
  'Proton Pump Inhibitor': ['osteoporosis'],
  'Anticoagulant': ['active bleeding', 'bleeding disorder', 'severe liver disease'],
  'Antiplatelet': ['active bleeding', 'bleeding disorder'],
  'Bronchodilator': ['severe tachycardia'],
  'Corticosteroid': ['systemic fungal infection', 'live vaccine'],
  'Antihistamine': ['narrow-angle glaucoma'],
  'Antidiabetic': ['diabetic ketoacidosis', 'severe renal impairment'],
  'Thyroid Hormone': ['recent MI', 'thyrotoxicosis'],
  'Benzodiazepine': ['severe respiratory insufficiency', 'sleep apnea']
}

function generateNDC(): string {
  const part1 = Math.floor(10000 + Math.random() * 90000)
  const part2 = Math.floor(100 + Math.random() * 900)
  const part3 = Math.floor(10 + Math.random() * 90)
  return `${part1}-${part2}-${part3}`
}

function generateStrength(drugClass: string): string {
  const strengths: Record<string, string[]> = {
    'ACE Inhibitor': ['5mg', '10mg', '20mg', '40mg'],
    'ARB': ['25mg', '50mg', '100mg'],
    'Beta Blocker': ['25mg', '50mg', '100mg', '200mg'],
    'Calcium Channel Blocker': ['2.5mg', '5mg', '10mg'],
    'Diuretic': ['20mg', '40mg', '80mg'],
    'Statin': ['10mg', '20mg', '40mg', '80mg'],
    'Antibiotic': ['250mg', '500mg', '875mg'],
    'NSAID': ['200mg', '400mg', '600mg'],
    'Opioid Analgesic': ['5mg', '10mg', '15mg', '20mg'],
    'SSRI': ['10mg', '20mg', '40mg'],
    'SNRI': ['30mg', '60mg', '90mg'],
    'Proton Pump Inhibitor': ['20mg', '40mg'],
    'Anticoagulant': ['1mg', '2mg', '5mg', '10mg'],
    'Antiplatelet': ['75mg', '81mg', '325mg'],
    'Bronchodilator': ['90mcg', '108mcg'],
    'Corticosteroid': ['5mg', '10mg', '20mg'],
    'Antihistamine': ['5mg', '10mg'],
    'Antidiabetic': ['500mg', '850mg', '1000mg'],
    'Thyroid Hormone': ['25mcg', '50mcg', '75mcg', '100mcg'],
    'Benzodiazepine': ['0.5mg', '1mg', '2mg']
  }
  
  const options = strengths[drugClass] || ['10mg', '20mg', '50mg']
  return options[Math.floor(Math.random() * options.length)]
}

function generateCommonDosages(strength: string): string[] {
  return [strength, `${strength} twice daily`, `${strength} three times daily`]
}

export async function generateFormularyDatabase(databaseId: string): Promise<FormularyDrug[]> {
  const drugs: FormularyDrug[] = []
  const count = databaseId === 'medicare-2024' ? 25 : databaseId === 'express-scripts' ? 20 : 22
  
  for (let i = 0; i < count; i++) {
    const drugClass = DRUG_CLASSES[Math.floor(Math.random() * DRUG_CLASSES.length)]
    const brandNames = BRAND_NAMES[drugClass] || ['Generic Brand']
    const genericNames = GENERIC_NAMES[drugClass] || ['generic medication']
    
    const brandName = brandNames[Math.floor(Math.random() * brandNames.length)]
    const genericName = genericNames[Math.floor(Math.random() * genericNames.length)]
    const strength = generateStrength(drugClass)
    const dosageForm = DOSAGE_FORMS[Math.floor(Math.random() * DOSAGE_FORMS.length)]
    
    const tierWeights = databaseId === 'medicare-2024' ? [0.4, 0.3, 0.2, 0.1] : [0.35, 0.35, 0.2, 0.1]
    const random = Math.random()
    let tier = 'Tier 1'
    let cumulative = 0
    for (let j = 0; j < tierWeights.length; j++) {
      cumulative += tierWeights[j]
      if (random < cumulative) {
        tier = TIERS[j]
        break
      }
    }
    
    drugs.push({
      ndc: generateNDC(),
      brandName,
      genericName,
      manufacturer: ['Pfizer', 'Merck', 'GSK', 'Novartis', 'Teva', 'Mylan'][Math.floor(Math.random() * 6)],
      drugClass,
      strength,
      dosageForm,
      tier,
      commonDosages: generateCommonDosages(strength),
      contraindications: CONTRAINDICATIONS_MAP[drugClass] || []
    })
  }
  
  return drugs.sort((a, b) => a.brandName.localeCompare(b.brandName))
}

export async function simulateImport(
  drugs: FormularyDrug[], 
  onProgress: (progress: number) => void
): Promise<void> {
  const totalSteps = 100
  const stepDuration = 30
  
  for (let i = 0; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, stepDuration))
    onProgress(i)
  }
}
