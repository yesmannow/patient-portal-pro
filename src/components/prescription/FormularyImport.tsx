import { useState } from 'react'
import { FormularyDrug, FormularyDatabase } from '@/types/prescription'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Database, 
  Download, 
  CheckCircle,
  Warning,
  ArrowRight,
  Package
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { generateFormularyDatabase, simulateImport } from '@/lib/formulary-service'

interface FormularyImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (drugs: FormularyDrug[]) => void
}

export function FormularyImport({ open, onOpenChange, onImport }: FormularyImportProps) {
  const [step, setStep] = useState<'select' | 'preview' | 'importing' | 'complete'>('select')
  const [selectedDatabase, setSelectedDatabase] = useState<FormularyDatabase | null>(null)
  const [previewDrugs, setPreviewDrugs] = useState<FormularyDrug[]>([])
  const [selectedDrugs, setSelectedDrugs] = useState<Set<string>>(new Set())
  const [importProgress, setImportProgress] = useState(0)

  const availableDatabases: FormularyDatabase[] = [
    {
      id: 'medicare-2024',
      name: 'Medicare Part D Formulary 2024',
      description: 'Comprehensive Medicare Part D formulary with tier classification',
      drugCount: 450,
      lastUpdated: '2024-01-15'
    },
    {
      id: 'express-scripts',
      name: 'Express Scripts Standard Formulary',
      description: 'Express Scripts standard commercial formulary',
      drugCount: 380,
      lastUpdated: '2024-02-01'
    },
    {
      id: 'cvs-caremark',
      name: 'CVS Caremark Formulary',
      description: 'CVS Caremark standard formulary with specialty medications',
      drugCount: 425,
      lastUpdated: '2024-01-20'
    }
  ]

  const handleSelectDatabase = async (database: FormularyDatabase) => {
    setSelectedDatabase(database)
    setStep('preview')
    
    const drugs = await generateFormularyDatabase(database.id)
    setPreviewDrugs(drugs)
    setSelectedDrugs(new Set(drugs.map(d => d.ndc)))
  }

  const toggleDrugSelection = (ndc: string) => {
    const newSelection = new Set(selectedDrugs)
    if (newSelection.has(ndc)) {
      newSelection.delete(ndc)
    } else {
      newSelection.add(ndc)
    }
    setSelectedDrugs(newSelection)
  }

  const handleImport = async () => {
    if (selectedDrugs.size === 0) {
      toast.error('Please select at least one medication to import')
      return
    }

    setStep('importing')
    setImportProgress(0)

    const drugsToImport = previewDrugs.filter(d => selectedDrugs.has(d.ndc))
    
    await simulateImport(drugsToImport, (progress) => {
      setImportProgress(progress)
    })

    setStep('complete')
    onImport(drugsToImport)
    
    toast.success(`Successfully imported ${drugsToImport.length} medications`)
  }

  const handleClose = () => {
    setStep('select')
    setSelectedDatabase(null)
    setPreviewDrugs([])
    setSelectedDrugs(new Set())
    setImportProgress(0)
    onOpenChange(false)
  }

  const toggleSelectAll = () => {
    if (selectedDrugs.size === previewDrugs.length) {
      setSelectedDrugs(new Set())
    } else {
      setSelectedDrugs(new Set(previewDrugs.map(d => d.ndc)))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={24} weight="duotone" className="text-primary" />
            Import Drug Formulary
          </DialogTitle>
          <DialogDescription>
            Import medications from external pharmacy databases to expand your prescribing options
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                {availableDatabases.map((database) => (
                  <Card
                    key={database.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                    onClick={() => handleSelectDatabase(database)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{database.name}</CardTitle>
                          <CardDescription>{database.description}</CardDescription>
                        </div>
                        <ArrowRight size={20} className="text-muted-foreground mt-1" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>{database.drugCount} medications</span>
                        </div>
                        <div>
                          Updated: {new Date(database.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedDatabase?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDrugs.size} of {previewDrugs.length} medications selected
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                >
                  {selectedDrugs.size === previewDrugs.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <Separator />

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {previewDrugs.map((drug) => (
                    <div
                      key={drug.ndc}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      onClick={() => toggleDrugSelection(drug.ndc)}
                    >
                      <Checkbox
                        checked={selectedDrugs.has(drug.ndc)}
                        onCheckedChange={() => toggleDrugSelection(drug.ndc)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{drug.brandName}</p>
                            <p className="text-sm text-muted-foreground">{drug.genericName}</p>
                          </div>
                          <Badge variant={
                            drug.tier === 'Tier 1' ? 'default' :
                            drug.tier === 'Tier 2' ? 'secondary' :
                            'outline'
                          }>
                            {drug.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{drug.drugClass}</span>
                          <span>•</span>
                          <span>{drug.strength} {drug.dosageForm}</span>
                          <span>•</span>
                          <span className="font-mono">{drug.ndc}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                >
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedDrugs.size === 0}
                  className="gap-2"
                >
                  <Download size={18} weight="bold" />
                  Import {selectedDrugs.size} Medication{selectedDrugs.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'importing' && (
            <motion.div
              key="importing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-8"
            >
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Database size={48} weight="duotone" className="text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold">Importing Medications...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we import the selected medications
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono font-medium">{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 py-8"
            >
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle size={64} weight="duotone" className="text-accent mx-auto" />
                </motion.div>
                <h3 className="text-xl font-semibold">Import Complete!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Successfully imported {selectedDrugs.size} medications from {selectedDatabase?.name}. 
                  They are now available for prescribing.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Warning size={20} className="text-warning-moderate mt-0.5" weight="duotone" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Important Notes:</p>
                    <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Review imported medications for accuracy before prescribing</li>
                      <li>Verify drug interactions are properly configured</li>
                      <li>Confirm formulary tier information matches your needs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleClose} size="lg" className="gap-2">
                  <CheckCircle size={20} weight="bold" />
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
