import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Patient, Prescription } from '@/types/prescription'
import { PatientSelector } from '@/components/prescription/PatientSelector'
import { PrescriptionList } from '@/components/prescription/PrescriptionList'
import { NewPrescriptionDialog } from '@/components/prescription/NewPrescriptionDialog'
import { AllergyManager } from '@/components/prescription/AllergyManager'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Plus, Pills } from '@phosphor-icons/react'

export default function App() {
  const [patients] = useKV<Patient[]>('patients', [])
  const [prescriptions, setPrescriptions] = useKV<Prescription[]>('prescriptions', [])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false)

  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const patientPrescriptions = prescriptions.filter(p => p.patientId === selectedPatientId)
  const activePrescriptions = patientPrescriptions.filter(p => p.status === 'active')

  const handleDiscontinuePrescription = (prescriptionId: string) => {
    setPrescriptions(current =>
      current.map(p =>
        p.id === prescriptionId
          ? { ...p, status: 'discontinued' as const, discontinuedDate: new Date().toISOString() }
          : p
      )
    )
  }

  const handleAddPrescription = (prescription: Prescription) => {
    setPrescriptions(current => [...current, prescription])
    setIsNewPrescriptionOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Pills size={24} weight="bold" className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                MedScript
              </h1>
              <p className="text-sm text-muted-foreground">Prescription Manager</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <PatientSelector
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />

          {selectedPatient ? (
            <div className="space-y-6">
              <AllergyManager patient={selectedPatient} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Active Prescriptions</h2>
                    <p className="text-sm text-muted-foreground">
                      {activePrescriptions.length} active medication{activePrescriptions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsNewPrescriptionOpen(true)}
                    size="lg"
                    className="gap-2"
                  >
                    <Plus size={20} weight="bold" />
                    New Prescription
                  </Button>
                </div>

                <PrescriptionList
                  prescriptions={patientPrescriptions}
                  onDiscontinue={handleDiscontinuePrescription}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
              <Pills size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No Patient Selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a patient above to view prescriptions and manage allergies
              </p>
            </div>
          )}
        </div>
      </main>

      {selectedPatient && (
        <NewPrescriptionDialog
          open={isNewPrescriptionOpen}
          onOpenChange={setIsNewPrescriptionOpen}
          patient={selectedPatient}
          activePrescriptions={activePrescriptions}
          onAddPrescription={handleAddPrescription}
        />
      )}

      <Toaster />
    </div>
  )
}
