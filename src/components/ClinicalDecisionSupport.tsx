import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { APIServices, DrugInfo, ICDCode } from '@/lib/api-services'
import { Pill, FirstAid, MagnifyingGlass, Warning, Sparkle, ListChecks } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function ClinicalDecisionSupport() {
  const [drugSearch, setDrugSearch] = useState('')
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null)
  const [diagnosisSearch, setDiagnosisSearch] = useState('')
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleDrugSearch = async () => {
    if (!drugSearch.trim()) {
      toast.error('Please enter a drug name')
      return
    }

    setIsLoading(true)
    try {
      const result = await APIServices.getDrugInfo(drugSearch)
      if (result) {
        setDrugInfo(result)
        toast.success('Drug information retrieved from OpenFDA')
      } else {
        toast.warning('No drug information found')
        setDrugInfo(null)
      }
    } catch (error) {
      toast.error('Failed to retrieve drug information')
      setDrugInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiagnosisSearch = async () => {
    if (!diagnosisSearch.trim()) {
      toast.error('Please enter a diagnosis or symptom')
      return
    }

    setIsLoading(true)
    try {
      const results = await APIServices.searchICD10(diagnosisSearch)
      if (results.length > 0) {
        setIcdCodes(results)
        toast.success(`Found ${results.length} matching ICD-10 codes`)
      } else {
        toast.warning('No matching ICD-10 codes found')
        setIcdCodes([])
      }
    } catch (error) {
      toast.error('Failed to search ICD-10 codes')
      setIcdCodes([])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinical Decision Support</h1>
        <p className="text-muted-foreground mt-1">AI Scribe & E-Prescribing with OpenFDA and ICD-10 Integration</p>
      </div>

      <Alert className="bg-accent/10 border-accent">
        <Sparkle className="w-4 h-4" weight="duotone" />
        <AlertDescription>
          <strong>Gold Standard Automation:</strong> Access official FDA drug labels, recall enforcement reports, 
          and automated ICD-10 coding suggestions to support clinical documentation and billing.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" weight="duotone" />
              Drug Information (OpenFDA)
            </CardTitle>
            <CardDescription>
              Query official FDA drug labels and safety information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drug-search">Drug Name</Label>
              <div className="flex gap-2">
                <Input
                  id="drug-search"
                  value={drugSearch}
                  onChange={e => setDrugSearch(e.target.value)}
                  placeholder="e.g., Lisinopril, Metformin"
                  onKeyDown={e => e.key === 'Enter' && handleDrugSearch()}
                />
                <Button onClick={handleDrugSearch} disabled={isLoading}>
                  <MagnifyingGlass className="w-4 h-4" weight="bold" />
                </Button>
              </div>
            </div>

            {drugInfo && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{drugInfo.brandName}</h3>
                    <p className="text-sm text-muted-foreground">{drugInfo.genericName}</p>
                  </div>
                  <Badge variant="outline">FDA Approved</Badge>
                </div>

                <Separator />

                {drugInfo.activeIngredients.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Active Ingredients</Label>
                    <ul className="mt-2 space-y-1">
                      {drugInfo.activeIngredients.map((ingredient, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {drugInfo.warnings.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Warning className="w-4 h-4 text-amber-600" weight="fill" />
                      Warnings & Precautions
                    </Label>
                    <ul className="mt-2 space-y-1">
                      {drugInfo.warnings.slice(0, 3).map((warning, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {drugInfo.adverseEvents.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Common Adverse Events</Label>
                    <div className="mt-2 space-y-2">
                      {drugInfo.adverseEvents.map((event, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{event.symptom}</span>
                          <Badge variant="secondary" className="text-xs">
                            {event.frequency}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {drugInfo.recalls.length > 0 && (
                  <Alert variant="destructive">
                    <Warning className="w-4 h-4" weight="fill" />
                    <AlertDescription>
                      <strong>Recall Alert:</strong> {drugInfo.recalls.length} recall(s) on record
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FirstAid className="w-5 h-5" weight="duotone" />
              ICD-10 Code Lookup
            </CardTitle>
            <CardDescription>
              Automated medical coding for billing and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis-search">Diagnosis or Symptom</Label>
              <div className="flex gap-2">
                <Input
                  id="diagnosis-search"
                  value={diagnosisSearch}
                  onChange={e => setDiagnosisSearch(e.target.value)}
                  placeholder="e.g., Hypertension, Diabetes"
                  onKeyDown={e => e.key === 'Enter' && handleDiagnosisSearch()}
                />
                <Button onClick={handleDiagnosisSearch} disabled={isLoading}>
                  <MagnifyingGlass className="w-4 h-4" weight="bold" />
                </Button>
              </div>
            </div>

            {icdCodes.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" weight="duotone" />
                  <Label className="text-sm font-semibold">Suggested Codes</Label>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {icdCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono font-semibold text-primary">
                              {code.code}
                            </code>
                            {code.billable && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Billable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground mb-1">{code.description}</p>
                          <Badge variant="secondary" className="text-xs">
                            {code.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(code.code)}
                          className="flex-shrink-0"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Clinical Workflow Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Pill className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">E-Prescribing Support</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Query drug interactions, warnings, and recall status before prescribing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FirstAid className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">Automated Billing</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Type diagnosis → Get ICD-10 code → Auto-populate claim forms
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Warning className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">Safety Alerts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time FDA recall and adverse event monitoring
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkle className="w-4 h-4 text-primary" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Scribe Integration</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enrich clinical notes with official drug and diagnosis data
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
