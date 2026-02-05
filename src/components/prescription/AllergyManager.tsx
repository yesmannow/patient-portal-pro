import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, Allergy } from '@/types/prescription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AllergyManagerProps {
  patient: Patient
}

export function AllergyManager({ patient }: AllergyManagerProps) {
  const [patients, setPatients] = useKV<Patient[]>('patients', [])
  const [isAdding, setIsAdding] = useState(false)
  const [newAllergen, setNewAllergen] = useState('')
  const [newReaction, setNewReaction] = useState('')
  const [newSeverity, setNewSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild')

  const handleAddAllergy = () => {
    if (!newAllergen.trim() || !newReaction.trim()) {
      toast.error('Please enter both allergen and reaction')
      return
    }

    const allergy: Allergy = {
      id: `allergy-${Date.now()}`,
      allergen: newAllergen.trim(),
      reaction: newReaction.trim(),
      severity: newSeverity,
      dateReported: new Date().toISOString()
    }

    setPatients(current =>
      current.map(p =>
        p.id === patient.id
          ? { ...p, allergies: [...p.allergies, allergy] }
          : p
      )
    )

    setNewAllergen('')
    setNewReaction('')
    setNewSeverity('mild')
    setIsAdding(false)
    toast.success('Allergy added successfully')
  }

  const handleRemoveAllergy = (allergyId: string) => {
    setPatients(current =>
      current.map(p =>
        p.id === patient.id
          ? { ...p, allergies: p.allergies.filter(a => a.id !== allergyId) }
          : p
      )
    )
    toast.success('Allergy removed')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-warning-severe text-warning-severe-foreground'
      case 'moderate':
        return 'bg-warning-moderate text-warning-moderate-foreground'
      case 'mild':
        return 'bg-warning-minor text-warning-minor-foreground'
      default:
        return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Warning size={24} weight="bold" className="text-warning-severe" />
            <CardTitle>Patient Allergies</CardTitle>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm" variant="outline" className="gap-2">
              <Plus size={16} weight="bold" />
              Add Allergy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {patient.allergies.length === 0 && !isAdding && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No documented allergies. Click "Add Allergy" to record patient allergies.
            </p>
          </div>
        )}

        {patient.allergies.length > 0 && (
          <div className="space-y-3">
            {patient.allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{allergy.allergen}</p>
                    <Badge className={getSeverityColor(allergy.severity)}>
                      {allergy.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reported: {new Date(allergy.dateReported).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveAllergy(allergy.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <X size={20} weight="bold" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="rounded-lg border border-border bg-muted/20 p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergen">Allergen</Label>
              <Input
                id="allergen"
                placeholder="e.g., Penicillin, Peanuts, Latex"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reaction">Reaction</Label>
              <Input
                id="reaction"
                placeholder="e.g., Anaphylaxis, Rash, Swelling"
                value={newReaction}
                onChange={(e) => setNewReaction(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={newSeverity} onValueChange={(v) => setNewSeverity(v as any)}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddAllergy} className="flex-1">
                Add Allergy
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false)
                  setNewAllergen('')
                  setNewReaction('')
                  setNewSeverity('mild')
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
