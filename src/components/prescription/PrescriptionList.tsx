import { Prescription } from '@/types/prescription'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Pills, X, ClockCounterClockwise, CheckCircle } from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface PrescriptionListProps {
  prescriptions: Prescription[]
  onDiscontinue: (id: string) => void
}

export function PrescriptionList({ prescriptions, onDiscontinue }: PrescriptionListProps) {
  const activePrescriptions = prescriptions.filter(p => p.status === 'active')
  const inactivePrescriptions = prescriptions.filter(p => p.status !== 'active')

  if (prescriptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
        <Pills size={40} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No prescriptions on file</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activePrescriptions.length > 0 && (
        <div className="space-y-3">
          {activePrescriptions.map((prescription) => (
            <Card key={prescription.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Pills size={20} weight="bold" className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{prescription.medication.name}</h3>
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            <CheckCircle size={14} weight="fill" className="mr-1" />
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{prescription.medication.genericName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {prescription.medication.drugClass}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Dosage</p>
                        <p className="font-mono text-sm font-medium">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Frequency</p>
                        <p className="text-sm">{prescription.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
                        <p className="text-sm">{prescription.duration}</p>
                      </div>
                    </div>

                    {prescription.instructions && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Instructions</p>
                          <p className="text-sm">{prescription.instructions}</p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ClockCounterClockwise size={14} />
                      Prescribed: {new Date(prescription.prescribedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                        <X size={16} weight="bold" />
                        Discontinue
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Discontinue Prescription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to discontinue {prescription.medication.name}? This action will mark the prescription as inactive.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDiscontinue(prescription.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Discontinue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {inactivePrescriptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Discontinued / Completed</h3>
          {inactivePrescriptions.map((prescription) => (
            <Card key={prescription.id} className="opacity-60">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Pills size={18} weight="bold" className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{prescription.medication.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {prescription.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{prescription.dosage} • {prescription.frequency}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Discontinued: {prescription.discontinuedDate ? new Date(prescription.discontinuedDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
