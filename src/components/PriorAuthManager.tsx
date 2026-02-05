import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { PriorAuthorization, Patient } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, MagnifyingGlass, FileText, Warning, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PriorAuthManagerProps {
  userRole?: 'billing' | 'nurse' | 'admin' | 'patient'
}

export function PriorAuthManager({ userRole = 'billing' }: PriorAuthManagerProps) {
  const [priorAuths, setPriorAuths] = useKV<PriorAuthorization[]>('prior-authorizations', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'low-units'>('all')
  const [isNewAuthOpen, setIsNewAuthOpen] = useState(false)

  const canEdit = userRole === 'billing' || userRole === 'nurse' || userRole === 'admin'

  const filteredAuths = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    let filtered = priorAuths.filter(auth => {
      const patient = patients.find(p => p.id === auth.patientId)
      const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : ''
      const authNumber = auth.authNumber.toLowerCase()
      const serviceCode = auth.serviceCode.toLowerCase()
      const query = searchQuery.toLowerCase()

      return patientName.includes(query) || authNumber.includes(query) || serviceCode.includes(query)
    })

    if (filterStatus === 'active') {
      filtered = filtered.filter(auth => auth.status === 'active')
    } else if (filterStatus === 'expiring') {
      filtered = filtered.filter(auth => {
        if (auth.status !== 'active') return false
        const endDate = new Date(auth.endDate)
        return endDate <= thirtyDaysFromNow && endDate > now
      })
    } else if (filterStatus === 'low-units') {
      filtered = filtered.filter(auth => {
        if (auth.status !== 'active') return false
        const remaining = auth.totalUnits - auth.usedUnits
        return remaining <= 3 && remaining > 0
      })
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [priorAuths, patients, searchQuery, filterStatus])

  const expiringCount = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

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
      id: `auth-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      patientId: formData.get('patientId') as string,
      insurerId: formData.get('insurerId') as string,
      authNumber: formData.get('authNumber') as string,
      serviceCode: formData.get('serviceCode') as string,
      serviceName: formData.get('serviceName') as string,
      totalUnits: parseInt(formData.get('totalUnits') as string),
      usedUnits: 0,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setPriorAuths(current => [...current, newAuth])
    setIsNewAuthOpen(false)
    toast.success('Prior authorization added successfully')
  }

  const handleUpdateStatus = (authId: string, newStatus: 'active' | 'expired' | 'denied', denialReason?: string) => {
    setPriorAuths(current =>
      current.map(auth =>
        auth.id === authId
          ? { ...auth, status: newStatus, denialReason, updatedAt: new Date().toISOString() }
          : auth
      )
    )
    toast.success(`Authorization status updated to ${newStatus}`)
  }

  const getStatusBadge = (auth: PriorAuthorization) => {
    const now = new Date()
    const endDate = new Date(auth.endDate)
    const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (auth.status === 'expired') {
      return <Badge variant="destructive" className="gap-1"><XCircle size={14} weight="fill" />Expired</Badge>
    }
    if (auth.status === 'denied') {
      return <Badge variant="destructive" className="gap-1 font-bold"><XCircle size={14} weight="fill" />Denied</Badge>
    }
    if (auth.status === 'pending') {
      return <Badge variant="secondary" className="gap-1"><Clock size={14} weight="fill" />Pending</Badge>
    }
    if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
      return <Badge variant="secondary" className="gap-1 bg-warning-moderate text-warning-moderate-foreground"><Warning size={14} weight="fill" />Expires in {daysUntilExpiration}d</Badge>
    }
    return <Badge variant="default" className="gap-1 bg-accent text-accent-foreground"><CheckCircle size={14} weight="fill" />Active</Badge>
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Prior Authorizations</h2>
          <p className="text-sm text-muted-foreground">Manage and track patient prior authorizations</p>
        </div>
        {canEdit && (
          <Dialog open={isNewAuthOpen} onOpenChange={setIsNewAuthOpen}>
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
                    <Label htmlFor="insurerId">Insurer</Label>
                    <Input id="insurerId" name="insurerId" placeholder="e.g., Blue Cross" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authNumber">Authorization Number</Label>
                    <Input id="authNumber" name="authNumber" placeholder="e.g., AUTH-123456" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceCode">Service Code (CPT/HCPCS)</Label>
                    <Input id="serviceCode" name="serviceCode" placeholder="e.g., 97110" required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input id="serviceName" name="serviceName" placeholder="e.g., Physical Therapy" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Total Units</Label>
                    <Input id="totalUnits" name="totalUnits" type="number" min="1" placeholder="e.g., 20" required />
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
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsNewAuthOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Authorization</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Authorizations</CardTitle>
            <CheckCircle size={20} className="text-accent" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priorAuths.filter(a => a.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Warning size={20} className="text-warning-moderate" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Units</CardTitle>
            <Clock size={20} className="text-muted-foreground" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowUnitsCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by patient, auth number, or service code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="expiring">Expiring</TabsTrigger>
                <TabsTrigger value="low-units">Low Units</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAuths.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
              <h3 className="text-lg font-medium mb-2">No Authorizations Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Add a new prior authorization to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAuths.map(auth => {
                const remaining = auth.totalUnits - auth.usedUnits
                const percentUsed = (auth.usedUnits / auth.totalUnits) * 100

                return (
                  <Card key={auth.id} className="border-l-4" style={{
                    borderLeftColor: auth.status === 'expired' || auth.status === 'denied' 
                      ? 'oklch(0.55 0.22 25)' 
                      : 'oklch(0.65 0.15 200)'
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{getPatientName(auth.patientId)}</h4>
                            {getStatusBadge(auth)}
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">Auth #:</span>{' '}
                              <span className="font-mono">{auth.authNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Service:</span>{' '}
                              <span>{auth.serviceName || auth.serviceCode}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Insurer:</span>{' '}
                              <span>{auth.insurerId}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Period:</span>{' '}
                              <span>{new Date(auth.startDate).toLocaleDateString()} - {new Date(auth.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Units:</span>{' '}
                              <span className={remaining <= 3 && remaining > 0 ? 'font-bold text-warning-moderate' : ''}>
                                {auth.usedUnits} / {auth.totalUnits} used ({remaining} remaining)
                              </span>
                              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent transition-all"
                                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                />
                              </div>
                            </div>
                            {auth.status === 'denied' && auth.denialReason && (
                              <div className="col-span-2 text-destructive font-bold">
                                <span className="text-muted-foreground">Denial Reason:</span>{' '}
                                {auth.denialReason}
                              </div>
                            )}
                          </div>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            {auth.status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(auth.id, 'expired')}
                                >
                                  Mark Expired
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const reason = prompt('Enter denial reason:')
                                    if (reason) handleUpdateStatus(auth.id, 'denied', reason)
                                  }}
                                >
                                  Mark Denied
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
