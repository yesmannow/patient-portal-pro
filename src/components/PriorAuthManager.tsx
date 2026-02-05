import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { PriorAuthorization, Patient, ProviderRole } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, Plus, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PriorAuthManagerProps {
  userRole?: ProviderRole
}

export function PriorAuthManager({ userRole = 'billing' }: PriorAuthManagerProps) {
  const [priorAuths, setPriorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'low-units'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const canEdit = userRole === 'billing' || userRole === 'admin'

  const filteredAuths = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let filtered = priorAuths.filter(auth => {
      if (searchTerm) {
        const patient = patients.find(p => p.id === auth.patientId)
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : ''
        const searchLower = searchTerm.toLowerCase()
        if (!patientName.includes(searchLower) && !auth.authNumber.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      if (filterStatus === 'all') return true

      if (filterStatus === 'active') {
        return auth.status === 'active'
      } else if (filterStatus === 'expiring') {
        if (auth.status !== 'active') return false
        const endDate = new Date(auth.endDate)
        return endDate <= thirtyDaysFromNow && endDate > now
      } else if (filterStatus === 'low-units') {
        if (auth.status !== 'active') return false
        const remaining = auth.totalUnits - auth.usedUnits
        return remaining <= 3 && remaining > 0
      }

      return true
    })

    return filtered.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  }, [priorAuths, filterStatus, searchTerm, patients])

  const expiringCount = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return priorAuths.filter(auth => {
      if (auth.status !== 'active') return false
      const endDate = new Date(auth.endDate)
      return endDate <= thirtyDaysFromNow && endDate > now
    }).length
  }, [priorAuths])

  const lowUnitsCount = useMemo(() => {
    return priorAuths.filter(auth => {
      if (auth.status !== 'active') return false
      const remaining = auth.totalUnits - auth.usedUnits
      return remaining <= 3 && remaining > 0
    }).length
  }, [priorAuths])

  const handleAddAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newAuth: PriorAuthorization = {
      id: `auth-${Date.now()}`,
      patientId: formData.get('patientId') as string,
      insurerId: formData.get('insurerId') as string,
      authNumber: formData.get('authNumber') as string,
      serviceCode: formData.get('serviceCode') as string || '',
      serviceName: formData.get('serviceName') as string,
      totalUnits: parseInt(formData.get('totalUnits') as string),
      usedUnits: 0,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setPriorAuths((current) => [...current, newAuth])
    toast.success('Prior authorization added successfully')
    setDialogOpen(false)
    e.currentTarget.reset()
  }

  const handleUpdateStatus = (authId: string, status: 'denied' | 'expired', denialReason?: string) => {
    setPriorAuths((current) =>
      current.map(auth =>
        auth.id === authId
          ? { ...auth, status, denialReason, updatedAt: new Date().toISOString() }
          : auth
      )
    )
  }

  const getStatusBadge = (auth: PriorAuthorization) => {
    const endDate = new Date(auth.endDate)
    const now = new Date()
    const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (auth.status === 'expired') {
      return <Badge variant="secondary">Expired</Badge>
    }

    if (auth.status === 'denied') {
      return <Badge variant="destructive">Denied</Badge>
    }

    if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
      return <Badge className="bg-warning-moderate text-warning-moderate-foreground">Expiring Soon</Badge>
    }

    return <Badge className="bg-accent text-accent-foreground">Active</Badge>
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  }

  const getProgressBarColor = (percentUsed: number) => {
    if (percentUsed > 90) return 'bg-destructive'
    if (percentUsed > 75) return 'bg-warning-moderate'
    return 'bg-accent'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Prior Authorizations</h2>
          <p className="text-sm text-muted-foreground">Manage insurance authorizations and units</p>
        </div>
        {canEdit && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus size={20} weight="bold" />
                New Authorization
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Prior Authorization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAuth} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient</Label>
                    <Select name="patientId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurerId">Insurer ID</Label>
                    <Input id="insurerId" name="insurerId" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authNumber">Authorization Number</Label>
                    <Input id="authNumber" name="authNumber" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceCode">Service Code</Label>
                    <Input id="serviceCode" name="serviceCode" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input id="serviceName" name="serviceName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Total Units</Label>
                    <Input id="totalUnits" name="totalUnits" type="number" required min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Authorization
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by patient name or auth number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expiring">
                Expiring {expiringCount > 0 && <Badge variant="secondary" className="ml-2">{expiringCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="low-units">
                Low Units {lowUnitsCount > 0 && <Badge variant="secondary" className="ml-2">{lowUnitsCount}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filterStatus} className="space-y-4">
              {filteredAuths.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText size={48} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
                  <p className="text-muted-foreground">
                    No authorizations found
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAuths.map(auth => {
                    const remaining = auth.totalUnits - auth.usedUnits
                    const percentUsed = (auth.usedUnits / auth.totalUnits) * 100
                    const progressBarColor = getProgressBarColor(percentUsed)

                    return (
                      <Card key={auth.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="space-y-1">
                                  <h3 className="font-semibold">{getPatientName(auth.patientId)}</h3>
                                  <p className="text-sm text-muted-foreground">{auth.serviceName}</p>
                                </div>
                              </div>
                              {getStatusBadge(auth)}
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Auth #:</span> {auth.authNumber}
                              </div>
                              <div>
                                <span className="font-medium">End Date:</span> {new Date(auth.endDate).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Units:</span> {remaining} / {auth.totalUnits} remaining
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Units Used</span>
                                <span className={cn(
                                  "font-medium",
                                  percentUsed > 90 && "text-destructive"
                                )}>
                                  {auth.usedUnits} / {auth.totalUnits} ({percentUsed.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full transition-all duration-300",
                                    progressBarColor,
                                    percentUsed > 90 && "animate-pulse"
                                  )}
                                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                />
                              </div>
                              {percentUsed > 90 && (
                                <p className="text-xs text-destructive font-medium">
                                  ⚠️ Critical: Over 90% of units used
                                </p>
                              )}
                            </div>

                            {auth.denialReason && (
                              <p className="text-sm text-destructive">
                                Denial Reason: {auth.denialReason}
                              </p>
                            )}

                            {canEdit && auth.status === 'active' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(auth.id, 'expired')}
                                >
                                  Mark Expired
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const reason = prompt('Enter denial reason:')
                                    if (reason) handleUpdateStatus(auth.id, 'denied', reason)
                                  }}
                                >
                                  Mark Denied
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
