import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PatientIntakeForm } from './PatientIntakeForm'
import { ClinicalDecisionSupport } from './ClinicalDecisionSupport'
import { SmartAppointmentScheduler } from './SmartAppointmentScheduler'
import { SecureDocumentUploader } from './SecureDocumentUploader'
import { 
  Sparkle, 
  Phone, 
  MapPin, 
  Envelope, 
  Gift, 
  Pill, 
  FirstAid, 
  ShieldCheck,
  ChartLine,
  CheckCircle,
  Robot
} from '@phosphor-icons/react'

export function APIIntegrationDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const apiCategories = [
    {
      name: 'Front Desk & Intake',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      integrations: [
        { 
          name: 'Phone Validation', 
          api: 'NumVerify / Abstract API', 
          status: 'active',
          description: 'Validates mobile numbers for SMS confirmation capability'
        },
        { 
          name: 'Address Verification', 
          api: 'Smarty / Postcodes.io', 
          status: 'active',
          description: 'USPS-standard address autocomplete and validation'
        },
        { 
          name: 'Email Validation', 
          api: 'Eva / MailboxLayer', 
          status: 'active',
          description: 'Screens for disposable emails and spam addresses'
        },
        { 
          name: 'Holiday Calendar', 
          api: 'Nager.Date API', 
          status: 'active',
          description: 'Blocks self-scheduling on public holidays'
        },
      ]
    },
    {
      name: 'Clinical & Provider',
      icon: FirstAid,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      integrations: [
        { 
          name: 'Drug Information', 
          api: 'OpenFDA', 
          status: 'active',
          description: 'Official drug labels, recalls, and adverse events'
        },
        { 
          name: 'ICD-10 Coding', 
          api: 'ClinicalTables API', 
          status: 'active',
          description: 'Automated medical coding for billing'
        },
      ]
    },
    {
      name: 'Security & Compliance',
      icon: ShieldCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      integrations: [
        { 
          name: 'Malware Scanning', 
          api: 'VirusTotal / ClamAV', 
          status: 'active',
          description: 'Real-time file scanning before upload'
        },
      ]
    },
  ]

  const automationWorkflows = [
    {
      title: '72-Hour SMS Confirmations',
      description: 'Transactional SMS sent automatically when appointment is 72 hours away',
      trigger: 'Appointment created',
      steps: ['Check appointment date', 'Validate phone number', 'Send SMS at 72hr mark', 'Process reply (1=confirm, 2=reschedule)'],
      status: 'Simulated',
    },
    {
      title: 'VoIP Screen Pop',
      description: 'Instant patient profile when incoming call matches phone number',
      trigger: 'Incoming call detected',
      steps: ['Match phone to patient', 'Load recent labs & appointments', 'Display account balance', 'Show screen pop'],
      status: 'Active',
    },
    {
      title: 'Clean Data Entry',
      description: 'All contact info validated before entering database',
      trigger: 'Patient intake form submission',
      steps: ['Validate phone for SMS', 'Check email quality', 'Verify address with USPS', 'Flag issues before save'],
      status: 'Active',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Robot className="w-8 h-8" weight="duotone" />
          API Integration Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Gold Standard Automation - External API integration for clinical workflows
        </p>
      </div>

      <Alert className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent">
        <Sparkle className="w-4 h-4" weight="duotone" />
        <AlertDescription>
          <strong>Operational Command Center:</strong> This hub demonstrates real-world API integrations 
          that automate data validation, clinical decision support, and security compliance—moving beyond 
          internal workflows to connect with external services.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intake">Intake</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apiCategories.map((category, idx) => (
              <Card key={idx} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className={`w-10 h-10 rounded-full ${category.bgColor} flex items-center justify-center`}>
                      <category.icon className={`w-5 h-5 ${category.color}`} weight="duotone" />
                    </div>
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {category.integrations.length} API{category.integrations.length > 1 ? 's' : ''} integrated
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.integrations.map((integration, iIdx) => (
                    <div key={iIdx} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{integration.name}</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{integration.description}</p>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{integration.api}</code>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine className="w-5 h-5" weight="duotone" />
                Automation Workflows
              </CardTitle>
              <CardDescription>
                End-to-end processes powered by API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationWorkflows.map((workflow, idx) => (
                <div key={idx} className="p-4 bg-muted/20 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{workflow.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                    </div>
                    <Badge variant={workflow.status === 'Active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">Trigger</Badge>
                      <span className="text-muted-foreground">{workflow.trigger}</span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs mt-1">Steps</Badge>
                      <div className="flex flex-wrap gap-2">
                        {workflow.steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-xs">
                              <span className="font-mono text-primary">{sIdx + 1}</span>
                              <span>{step}</span>
                            </div>
                            {sIdx < workflow.steps.length - 1 && (
                              <span className="text-muted-foreground">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-base">Quick Access</CardTitle>
              <CardDescription>Jump to integrated workflows</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" onClick={() => setActiveTab('intake')} className="h-auto flex-col gap-2 py-4">
                <Phone className="w-6 h-6" weight="duotone" />
                <span className="text-sm">Patient Intake</span>
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('clinical')} className="h-auto flex-col gap-2 py-4">
                <FirstAid className="w-6 h-6" weight="duotone" />
                <span className="text-sm">Clinical Support</span>
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('scheduling')} className="h-auto flex-col gap-2 py-4">
                <Gift className="w-6 h-6" weight="duotone" />
                <span className="text-sm">Smart Scheduling</span>
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('security')} className="h-auto flex-col gap-2 py-4">
                <ShieldCheck className="w-6 h-6" weight="duotone" />
                <span className="text-sm">Secure Upload</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intake">
          <PatientIntakeForm />
        </TabsContent>

        <TabsContent value="clinical">
          <ClinicalDecisionSupport />
        </TabsContent>

        <TabsContent value="scheduling">
          <SmartAppointmentScheduler />
        </TabsContent>

        <TabsContent value="security">
          <SecureDocumentUploader />
        </TabsContent>
      </Tabs>
    </div>
  )
}
