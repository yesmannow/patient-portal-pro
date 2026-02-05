import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { PriorAuthorization, Patient } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader,
import { Badge } from '@/components/ui/badge'
interface PriorAuthManagerProps {
}
export function PriorAuthManager({ userRole = 'billing' }: PriorAu
  const [patients] = useKV<Patient[]>('patients', [
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'low-units'>('all')



interface PriorAuthManagerProps {
  userRole?: 'billing' | 'nurse' | 'admin' | 'patient'
}


    })
    if (filterStatus === 'active') {
    } else if (filterStatus === 'expiring') {
        if (auth.status !== 'active') return false
        return endDate <= thirtyDaysFromNow && endDate > no

        if (auth.status !== 'active') return false

    }
    return filtered.sort((

    const now = new Date()

      if (auth.status !== 'active') return false
      return endDate <= thirtyDaysFromNow && endDate > now
  }, [priorAuths])
  const lowUnitsCount = useMemo(() => {
      if (auth.status !== 'active') return false
      return remaining <= 3 && remaining > 0

  const handleAddAuth = (e: React.FormEvent<HTMLFormElement>) => {
    co

      patientId: formData.get('patie
      authNumber: formData.get('authNumber') as string,
      serviceName: formData.get('serviceName'
      usedUnits: 0,
      endDate: formData.get('endDate') as string,
      createdAt: new Date().toISOString(),
    }
    setP
    toast.success('Prior authorization added s

    setPriorAuths(current =>
        auth.id === authId
          : auth
    )
  }

    const endDate = new Date(auth.endDate)


    if (auth.status === 'denied') {
    }
      return <Badge variant="secondary" 
    if (daysUntilExpiration <= 30 && daysUntilExp
    }
  }
  const getPatientName = (patientId: string)
    return patient ? `${patient.firstName} ${patient.lastN

    if (auth.statu

    const endDate = new Date(auth.endDa
    if (daysUntilExpiration <= 30 && daysUntil
  }
  return (
      <div className="flex items-center just
          <h2
        </div>

              <Button size="lg" className="gap-2">
                New Au
            </DialogTrigger>

              </DialogHeader>
                <div className
                    <Label htmlFor="patientId">Patien
                      <SelectTrigger>
                      </SelectTrigger>
                        {patients.map(patient => (
                            {patient.firstName} {patient.
                        ))}
                   
                  <div className="space-y-2">
                    <Input id="insurerId" name="i
                  <div 
                    <Input id="authNumber"
                  <div className="space-y-
     

                    <Input id="serviceName" name="serviceNa
                  <div clas
                    <Input id="totalUnits" name="totalUnits
   

                  <div className="space-y-2">
                    <Input i
                </div>
                  <Button 
                  </Button>
                
       
     

   

              <Input
                value={sea
                className="pl-10"
            </div>

                <TabsTrigger value="
                  Expiring {expiringCount > 0 && <Badge variant="secondary" className="ml-2">{expiringCount}</
     
                </TabsTrigger>
            </Tabs>
     
          {filteredAuths.length === 
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
     
              </p>
          ) : (
     
                const percentUsed = (auth.usedUnits / auth.totalUnits) * 100
   

                        <div className="flex item
                            <div className="flex items-cen
                              {getStatusBadge(auth)}
   


                          <div>
                            <span className="font-medi
                          <div>
                          
                          <div>
                            <span className="font-medium">
                            </span>
                    
   

          
                        <div cl
                            <span className="text-muted-f
             
                            <div
                              style={{
              
                     
                        </div>
                        {auth.denia
                            Denial Reason: {auth.d
                        )}
                        {canEdit 
                       
                            
                            >
                            
                              size="sm"
                             
                                if (reason) handleUpdateStatus(auth
                            >
                            </Button>
                        )}
                    </CardContent>
                )
            </div>
        </CardContent>
    </div>
}



































































































































































































