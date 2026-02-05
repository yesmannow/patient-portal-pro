import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { PriorAuthorization, Patient } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, MagnifyingGlass, FileText, Warning, CheckCircle, XCircle, Clock } from '@phosphor-icons

  userRole?: 'billing' | 'nurse' | 'admin' | 'patient'


  const [searchQuery, setSearchQu
  const [isNewAuthOpen, setIsNewAuthOpen] = useState(f
 

    const thirtyDaysFromNow = new Date()

      const patient = patients.find(p => p.id === aut
      const authNumber = auth.authNumber.toLowerCase
      const query = searchQuery.toLowerCase()
      return patientName.includes(query) || authNumber.incl

      filtered = filtered.filter(auth => auth.status === 'active')

        const endDate = new Date(auth.e
      })
      filtered = filtered.filter(auth =>
        const remaining = auth.totalUnits - auth.usedUnits

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
      authNumber: formData.get('authNumber') as string,

      usedUnits: 0,
      endDate: formData.get('endDate') as string
      createdAt: new Date().toISOString(),
    }
    setPriorA
    toast.success(

    setPriorAuths(current =>
        auth.id === authId
          : auth
    )
  }
  const getSt
    const endDate 

      return <Badge variant="destructive" className="gap-1"><XCirc
    if (auth.status ==
    }

    if (daysUntilExpiration <= 30 && days
    }
  }
  const getPatientName = (patientId: string) => {
    return patient ? `${patient.firstName} ${patient.la

    <div className="space-y-6">
        <div>
          <p classN
        {canEdit && (
            <DialogTrigger asChild>
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
      <Card>
          <div className
              <MagnifyingGlass className="abs
                placeholder="Search by patient, auth number, or ser
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            <Tabs value={filterStatus} onValu
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="expiring">Expiring</TabsTrigger>
              </TabsList
          </div>
        <CardContent>
            <div className="text-center py-12">
              <h3 classN
                {searc
            </div>
            <div className="space-y-3">
                const rema

                  <Card key={auth.id} className="border-l-4" style
                      
                  }}>
                      <div c
                   
          
            

                            </div>
              
                            </div>
                              <span className="text-muted-foreground">Insurer:</span>{' 
                            </div>
                       
                       
                              <span className="text-muted-foreground">Units:</span>{' '}
                        
               
              
                                />
                            </div>
                              <div className="col-span-2 text-destructive font-bold"
                       
                       
                        </div>
                        
               
              
                                  onClick={() => handleUpdateStatus(auth.id, 'expi
                                  Mark Expired
                                <Button
                       
                       
                                  }}
                        
               
            

            
              })}
          )}
      </Card>
  )























































































































