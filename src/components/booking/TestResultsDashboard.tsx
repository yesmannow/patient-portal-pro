import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { ChartBar, Check, X, Warning, CaretDown, Trash } from '@phosphor-icons/react'
import { format } from 'date-fns'
import type { TestResult, ConditionType } from '@/types/appointments'

const getConditionColor = (type: ConditionType): string => {
  const colors: Record<ConditionType, string> = {
    'acute-injury': 'bg-orange-100 text-orange-700 border-orange-300',
    'chronic-disease': 'bg-blue-100 text-blue-700 border-blue-300',
    'preventive-care': 'bg-green-100 text-green-700 border-green-300',
    'mental-health': 'bg-purple-100 text-purple-700 border-purple-300',
    'surgical-consult': 'bg-red-100 text-red-700 border-red-300',
    'emergency': 'bg-red-200 text-red-900 border-red-400'
  }
  return colors[type]
}

const getConditionLabel = (type: ConditionType): string => {
  const labels: Record<ConditionType, string> = {
    'acute-injury': 'Acute Injury',
    'chronic-disease': 'Chronic Disease',
    'preventive-care': 'Preventive Care',
    'mental-health': 'Mental Health',
    'surgical-consult': 'Surgical Consult',
    'emergency': 'Emergency'
  }
  return labels[type]
}

interface TestResultsDashboardProps {
  results: TestResult[]
  onClearResults: () => void
}

export function TestResultsDashboard({ results, onClearResults }: TestResultsDashboardProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const stats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    warning: results.filter(r => r.status === 'warning').length
  }

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            Test Results
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.total} test{stats.total !== 1 ? 's' : ''} executed
          </p>
        </div>
        {results.length > 0 && (
          <Button variant="outline" onClick={onClearResults} className="gap-2 w-full sm:w-auto">
            <Trash size={18} weight="bold" />
            Clear All Results
          </Button>
        )}
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ChartBar size={24} weight="bold" className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success</p>
                  <p className="text-3xl font-bold text-green-600">{stats.success}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Check size={24} weight="bold" className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <X size={24} weight="bold" className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">{successRate}%</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  successRate >= 80 ? 'bg-green-100' : successRate >= 50 ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <ChartBar size={24} weight="bold" className={
                    successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-orange-600' : 'text-red-600'
                  } />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ChartBar size={48} weight="bold" className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No test results yet</p>
              <p className="text-sm mt-1">Complete appointment booking tests to see results here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <Collapsible key={result.id} open={expandedResults.has(result.id)}>
              <Card className={`transition-all duration-200 ${
                result.status === 'success' 
                  ? 'border-green-300' 
                  : result.status === 'failed'
                  ? 'border-red-300'
                  : 'border-orange-300'
              }`}>
                <CollapsibleTrigger asChild>
                  <button
                    onClick={() => toggleExpanded(result.id)}
                    className="w-full text-left"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            result.status === 'success'
                              ? 'bg-green-100'
                              : result.status === 'failed'
                              ? 'bg-red-100'
                              : 'bg-orange-100'
                          }`}>
                            {result.status === 'success' ? (
                              <Check size={20} weight="bold" className="text-green-600" />
                            ) : result.status === 'failed' ? (
                              <X size={20} weight="bold" className="text-red-600" />
                            ) : (
                              <Warning size={20} weight="bold" className="text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                              <span className="truncate">{result.patientName}</span>
                              <CaretDown
                                size={16}
                                weight="bold"
                                className={`transition-transform duration-200 shrink-0 ${
                                  expandedResults.has(result.id) ? 'rotate-180' : ''
                                }`}
                              />
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {format(new Date(result.timestamp), 'PPp')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getConditionColor(result.conditionType)} border text-xs`}>
                            {getConditionLabel(result.conditionType)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {result.appointmentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator />
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <p className={`font-semibold ${
                        result.status === 'success'
                          ? 'text-green-600'
                          : result.status === 'failed'
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}>
                        {result.message}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-medium">{result.providerName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Authorization Required</p>
                        <p className="font-medium">{result.authorizationRequired ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Authorization Provided</p>
                        <p className="font-medium">{result.authorizationProvided ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Test ID</p>
                        <p className="font-mono text-xs">{result.id}</p>
                      </div>
                    </div>

                    {result.details.validationsPassed.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-600 mb-2">
                          Validations Passed ({result.details.validationsPassed.length})
                        </p>
                        <ul className="space-y-1">
                          {result.details.validationsPassed.map((validation, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check size={16} weight="bold" className="text-green-600 shrink-0 mt-0.5" />
                              <span>{validation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.details.validationsFailed.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-red-600 mb-2">
                          Validations Failed ({result.details.validationsFailed.length})
                        </p>
                        <ul className="space-y-1">
                          {result.details.validationsFailed.map((validation, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <X size={16} weight="bold" className="text-red-600 shrink-0 mt-0.5" />
                              <span>{validation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  )
}
