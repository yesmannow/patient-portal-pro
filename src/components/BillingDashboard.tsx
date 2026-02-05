import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaymentCharge, Patient, Payment } from '@/lib/types'
import { CreditCard, Receipt, Users, XCircle } from '@phosphor-icons/react'
import { format } from 'date-fns'

export function BillingDashboard() {
  const [charges] = useKV<PaymentCharge[]>('payment-charges', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [payments] = useKV<Payment[]>('payments', [])

  const outstandingCharges = (charges ?? [])
    .filter(c => c.balanceDue > 0)
    .sort((a, b) => b.balanceDue - a.balanceDue)

  const recentPayments = (payments ?? [])
    .filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const claimDenials = (charges ?? [])
    .filter(c => c.insuranceCovered === 0 && c.amount > 0)
    .slice(0, 10)

  const totalOutstanding = outstandingCharges.reduce((sum, c) => sum + c.balanceDue, 0)
  const totalCollected = (payments ?? [])
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const getPatient = (patientId: string) => {
    return (patients ?? []).find(p => p.id === patientId)
  }

  const chargeTypeLabels: Record<string, string> = {
    visit: 'Office Visit',
    procedure: 'Medical Procedure',
    lab: 'Laboratory Work',
    medication: 'Medication',
    copay: 'Copayment',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage payments and claims</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Receipt className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {outstandingCharges.length} unpaid charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalCollected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentPayments.length} payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claim Denials</CardTitle>
            <XCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{claimDenials.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="outstanding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding Charges</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
          <TabsTrigger value="denials">Claim Denials</TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Charges</CardTitle>
              <CardDescription>Charges with unpaid balances</CardDescription>
            </CardHeader>
            <CardContent>
              {outstandingCharges.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                  <p className="text-muted-foreground">No outstanding charges</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outstandingCharges.map(charge => {
                    const patient = getPatient(charge.patientId)
                    if (!patient) return null

                    return (
                      <Card key={charge.id} className="border-border">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {patient.firstName} {patient.lastName}
                                </h4>
                                <Badge variant="outline">
                                  {chargeTypeLabels[charge.chargeType] || charge.chargeType}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{charge.description}</p>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Date of Service</p>
                                  <p className="font-medium">
                                    {format(new Date(charge.dateOfService), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Total Charge</p>
                                  <p className="font-medium">${charge.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Paid</p>
                                  <p className="font-medium text-green-600">${charge.paidAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Balance Due</p>
                                  <p className="font-bold text-red-600">${charge.balanceDue.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Successfully processed payments</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                  <p className="text-muted-foreground">No recent payments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map(payment => {
                    const charge = (charges ?? []).find(c => c.id === payment.chargeId)
                    const patient = getPatient(payment.patientId)
                    if (!patient) return null

                    return (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <Badge className="bg-green-600 text-white">Completed</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {charge?.description || 'Payment'} • {payment.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claim Denials</CardTitle>
              <CardDescription>Claims denied by insurance requiring follow-up</CardDescription>
            </CardHeader>
            <CardContent>
              {claimDenials.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                  <p className="text-muted-foreground">No claim denials</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claimDenials.map(charge => {
                    const patient = getPatient(charge.patientId)
                    if (!patient) return null

                    return (
                      <Card key={charge.id} className="border-yellow-300 bg-yellow-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {patient.firstName} {patient.lastName}
                                </h4>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  Denied
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{charge.description}</p>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Date of Service</p>
                                  <p className="font-medium">
                                    {format(new Date(charge.dateOfService), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Charge Amount</p>
                                  <p className="font-medium">${charge.amount.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Patient Responsibility</p>
                                  <p className="font-bold text-yellow-800">${charge.patientResponsibility.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
