import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { TestTube, CalendarCheck } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientSelector } from '@/components/booking/PatientSelector'
import { BookingInterface } from '@/components/booking/BookingInterface'
import { TestResultsDashboard } from '@/components/booking/TestResultsDashboard'
import type { Patient, TestResult } from '@/types/appointments'

export default function App() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [testResults, setTestResults] = useKV<TestResult[]>('test-results', [])

  const handleTestComplete = (result: TestResult) => {
    setTestResults((current) => [result, ...current])
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-br from-card via-secondary to-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <TestTube size={24} weight="bold" className="text-primary-foreground sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                Appointment Booking Test System
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                Test booking workflows across different medical condition types
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="booking" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="booking" className="gap-2">
              <CalendarCheck size={18} weight="bold" />
              <span className="hidden sm:inline">Booking Tests</span>
              <span className="sm:hidden">Book</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <TestTube size={18} weight="bold" />
              <span className="hidden sm:inline">Test Results</span>
              <span className="sm:hidden">Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-6 sm:space-y-8">
            <PatientSelector
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
            />

            {selectedPatient && (
              <BookingInterface
                patient={selectedPatient}
                onTestComplete={handleTestComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="results">
            <TestResultsDashboard results={testResults} onClearResults={() => setTestResults([])} />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}
