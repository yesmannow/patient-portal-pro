import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, Prescription, Medication, AllergyWarning, DrugInteraction } from '@/types/prescription'
import { PriorAuthorization } from '@/lib/types'
import { searchMedications, checkInteractions } from '@/lib/medication-database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MagnifyingGlass, 
  Pills, 
  Warning, 
  WarningCircle, 
  CheckCircle,
  X,
  ShieldCheck
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface NewPrescriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  activePrescriptions: Prescription[]
  onAddPrescription: (prescription: Prescription) => void
}

export function NewPrescriptionDialog({
  open,
  onOpenChange,
  patient,
  activePrescriptions,
  onAddPrescription
}: NewPrescriptionDialogProps) {
  const [priorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')
  const [instructions, setInstructions] = useState('')
  const [overrideJustification, setOverrideJustification] = useState('')
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState(false)
  const [selectedAuthNumber, setSelectedAuthNumber] = useState('')

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    return searchMedications(searchQuery)
  }, [searchQuery])

  const allergyWarnings = useMemo((): AllergyWarning[] => {
    if (!selectedMedication) return []
    
    const warnings: AllergyWarning[] = []
    
    patient.allergies.forEach(allergy => {
      const allergenLower = allergy.allergen.toLowerCase()
      const drugClassLower = selectedMedication.drugClass.toLowerCase()
      const contraindications = selectedMedication.contraindications.map(c => c.toLowerCase())
      
      if (contraindications.includes(allergenLower) || 
          drugClassLower.includes(allergenLower) ||
          allergenLower.includes(drugClassLower)) {
        warnings.push({
          allergen: allergy.allergen,
          medication: selectedMedication.name,
          reaction: allergy.reaction,
          severity: allergy.severity
        })
      }
    })
    
    return warnings
  }, [selectedMedication, patient.allergies])

  const drugInteractions = useMemo((): DrugInteraction[] => {
    if (!selectedMedication) return []
    
    const activeMedicationIds = activePrescriptions.map(p => p.medication.id)
    return checkInteractions(selectedMedication.id, activeMedicationIds)
  }, [selectedMedication, activePrescriptions])

  const hasSevereWarnings = useMemo(() => {
    const severeAllergy = allergyWarnings.some(w => w.severity === 'severe')
    const severeInteraction = drugInteractions.some(i => i.severity === 'severe')
    return severeAllergy || severeInteraction
  }, [allergyWarnings, drugInteractions])

  const requiresPriorAuth = useMemo(() => {
    if (!selectedMedication) return false
    
    if (selectedMedication.requiresPriorAuth) return true
    
    const tier = selectedMedication.formularyTier
    if (tier === 'Tier 3' || tier === 'Tier 4' || tier === 'Specialty') {
      return true
    }
    
    return false
  }, [selectedMedication])

  const availableAuths = useMemo(() => {
    if (!requiresPriorAuth) return []
    return (priorAuths || []).filter(auth => 
      auth.patientId === patient.id && 
      auth.status === 'active' &&
      (auth.totalUnits - auth.usedUnits) > 0
    )
  }, [priorAuths, patient.id, requiresPriorAuth])

  const handleSelectMedication = (medication: Medication) => {
    setSelectedMedication(medication)
    setSearchQuery('')
    setAcknowledgedWarnings(false)
    setOverrideJustification('')
    setSelectedAuthNumber('')
    
    if (medication.commonDosages.length > 0) {
      setDosage(medication.commonDosages[0])
    }
  }

  const handleSubmit = () => {
    if (!selectedMedication || !dosage || !frequency || !duration) {
      toast.error('Please complete all required fields')
      return
    }

    if ((allergyWarnings.length > 0 || drugInteractions.length > 0) && !acknowledgedWarnings) {
      toast.error('Please acknowledge all warnings before prescribing')
      return
    }

    if (hasSevereWarnings && !overrideJustification.trim()) {
      toast.error('Severe warnings require override justification')
      return
    }

    if (requiresPriorAuth && !selectedAuthNumber) {
      toast.error('This medication requires prior authorization. Please select one or contact billing.')
      return
    }

    const prescription: Prescription = {
      id: `rx-${Date.now()}`,
      patientId: patient.id,
      medication: selectedMedication,
      dosage,
      frequency,
      duration,
      instructions,
      prescribedDate: new Date().toISOString(),
      status: 'active',
      overrideJustification: overrideJustification || undefined,
      linkedAuthNumber: selectedAuthNumber || undefined,
    }

    onAddPrescription(prescription)
    toast.success('Prescription added successfully')
    resetForm()
  }

  const resetForm = () => {
    setSelectedMedication(null)
    setSearchQuery('')
    setDosage('')
    setFrequency('')
    setDuration('')
    setInstructions('')
    setOverrideJustification('')
    setAcknowledgedWarnings(false)
    setSelectedAuthNumber('')
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pills size={24} weight="bold" className="text-primary" />
            New Prescription for {patient.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-6">
            {!selectedMedication ? (
              <div className="space-y-3">
                <Label htmlFor="search">Search Medication</Label>
                <div className="relative">
                  <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, generic name, or drug class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => handleSelectMedication(med)}
                        className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:bg-accent/5 hover:border-accent"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">{med.genericName}</p>
                          </div>
                          <Badge variant="outline">{med.drugClass}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                    <p className="text-sm text-muted-foreground">No medications found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-accent/5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Pills size={20} weight="bold" className="text-accent" />
                        <h3 className="font-semibold">{selectedMedication.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedMedication.genericName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{selectedMedication.drugClass}</Badge>
                        {selectedMedication.formularyTier && (
                          <Badge 
                            variant={
                              selectedMedication.formularyTier === 'Tier 1' ? 'default' :
                              selectedMedication.formularyTier === 'Tier 2' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {selectedMedication.formularyTier}
                          </Badge>
                        )}
                        {requiresPriorAuth && (
                          <Badge className="bg-warning-moderate text-warning-moderate-foreground gap-1">
                            <ShieldCheck size={14} weight="fill" />
                            Prior Auth Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedMedication(null)}
                      variant="ghost"
                      size="sm"
                    >
                      <X size={20} weight="bold" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {allergyWarnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {allergyWarnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border-2 p-5 ${
                            warning.severity === 'severe'
                              ? 'border-warning-severe bg-warning-severe/10 animate-pulse'
                              : warning.severity === 'moderate'
                              ? 'border-warning-moderate bg-warning-moderate/10'
                              : 'border-warning-minor bg-warning-minor/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Warning size={24} weight="fill" className={
                              warning.severity === 'severe'
                                ? 'text-warning-severe'
                                : warning.severity === 'moderate'
                                ? 'text-warning-moderate'
                                : 'text-warning-minor'
                            } />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">Allergy Warning</h4>
                                <Badge className={
                                  warning.severity === 'severe'
                                    ? 'bg-warning-severe text-warning-severe-foreground'
                                    : warning.severity === 'moderate'
                                    ? 'bg-warning-moderate text-warning-moderate-foreground'
                                    : 'bg-warning-minor text-warning-minor-foreground'
                                }>
                                  {warning.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">
                                <strong>Patient has documented allergy:</strong> {warning.allergen}
                              </p>
                              <p className="text-sm">
                                <strong>Known reaction:</strong> {warning.reaction}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {drugInteractions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      className="space-y-3"
                    >
                      {drugInteractions.map((interaction, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border-2 p-5 ${
                            interaction.severity === 'severe'
                              ? 'border-warning-severe bg-warning-severe/10 animate-pulse'
                              : interaction.severity === 'moderate'
                              ? 'border-warning-moderate bg-warning-moderate/10'
                              : 'border-warning-minor bg-warning-minor/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <WarningCircle size={24} weight="fill" className={
                              interaction.severity === 'severe'
                                ? 'text-warning-severe'
                                : interaction.severity === 'moderate'
                                ? 'text-warning-moderate'
                                : 'text-warning-minor'
                            } />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">Drug Interaction</h4>
                                <Badge className={
                                  interaction.severity === 'severe'
                                    ? 'bg-warning-severe text-warning-severe-foreground'
                                    : interaction.severity === 'moderate'
                                    ? 'bg-warning-moderate text-warning-moderate-foreground'
                                    : 'bg-warning-minor text-warning-minor-foreground'
                                }>
                                  {interaction.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm mb-1">
                                <strong>Interaction:</strong> {interaction.drug1} + {interaction.drug2}
                              </p>
                              <p className="text-sm mb-2">{interaction.description}</p>
                              <p className="text-sm">
                                <strong>Recommendation:</strong> {interaction.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {(allergyWarnings.length === 0 && drugInteractions.length === 0) && (
                  <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
                    <div className="flex items-center gap-2 text-accent">
                      <CheckCircle size={20} weight="fill" />
                      <p className="text-sm font-medium">No warnings detected</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g., 10mg"
                      list="dosage-options"
                    />
                    <datalist id="dosage-options">
                      {selectedMedication.commonDosages.map((d, idx) => (
                        <option key={idx} value={d} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Input
                      id="frequency"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="e.g., Twice daily"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 30 days, Ongoing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Additional Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g., Take with food, Avoid alcohol"
                    rows={3}
                  />
                </div>

                {hasSevereWarnings && (
                  <div className="space-y-2">
                    <Label htmlFor="justification" className="text-destructive">
                      Override Justification * (Required for severe warnings)
                    </Label>
                    <Textarea
                      id="justification"
                      value={overrideJustification}
                      onChange={(e) => setOverrideJustification(e.target.value)}
                      placeholder="Provide clinical justification for prescribing despite severe warnings..."
                      rows={3}
                      className="border-destructive focus-visible:ring-destructive"
                    />
                  </div>
                )}

                {requiresPriorAuth && (
                  <div className="space-y-3 rounded-lg border-2 border-warning-moderate bg-warning-moderate/10 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} weight="fill" className="text-warning-moderate" />
                      <Label className="text-sm font-semibold">Prior Authorization Required</Label>
                    </div>
                    
                    {availableAuths.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          No active prior authorizations found for this patient. 
                          This {selectedMedication.formularyTier || 'high-tier'} medication cannot be prescribed without authorization.
                        </p>
                        <Badge variant="destructive">Cannot prescribe without authorization</Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="auth-select" className="text-sm">Select Prior Authorization *</Label>
                        <Select value={selectedAuthNumber} onValueChange={setSelectedAuthNumber}>
                          <SelectTrigger id="auth-select">
                            <SelectValue placeholder="Choose authorization..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAuths.map((auth) => {
                              const remaining = auth.totalUnits - auth.usedUnits
                              return (
                                <SelectItem key={auth.id} value={auth.authNumber}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span>
                                      {auth.authNumber} - {auth.serviceName}
                                    </span>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {remaining} units left
                                    </Badge>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {selectedAuthNumber && (
                          <div className="flex items-center gap-2 text-sm text-accent">
                            <CheckCircle size={16} weight="fill" />
                            <span>Authorization linked successfully</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(allergyWarnings.length > 0 || drugInteractions.length > 0) && (
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
                    <input
                      type="checkbox"
                      id="acknowledge"
                      checked={acknowledgedWarnings}
                      onChange={(e) => setAcknowledgedWarnings(e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <label htmlFor="acknowledge" className="text-sm cursor-pointer">
                      I acknowledge the {allergyWarnings.length > 0 ? 'allergy' : ''} 
                      {allergyWarnings.length > 0 && drugInteractions.length > 0 ? ' and ' : ''}
                      {drugInteractions.length > 0 ? 'interaction' : ''} warning(s) above and have reviewed 
                      the clinical recommendations. I take full responsibility for this prescribing decision.
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {selectedMedication && (
          <div className="flex gap-3 border-t border-border pt-4">
            <Button onClick={handleClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Create Prescription
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
