import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Receipt, CheckCircle, XCircle } from '@phosphor-icons/react'
import { PaymentCharge, Payment, Patient } from '@/lib/types'
import { PaymentDialog } from './PaymentDialog'

interface PaymentHistoryProps {
  patientId: string
}

const chargeTypeLabels: Record<string, string> = {
  visit: 'Office Visit',
  procedure: 'Medical Procedure',
  lab: 'Laboratory Work',
  medication: 'Medication',
  copay: 'Copayment',
}

export function PaymentHistory({ patientId }: PaymentHistoryProps) {
  const [charges] = useKV<PaymentCharge[]>('payment-charges', [])
  const [selectedCharge, setSelectedCharge] = useState<PaymentCharge | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const patientCharges = (charges ?? []).filter(c => c.patientId === patientId)
    .sort((a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime())

  const totalBalance = patientCharges.reduce((sum, c) => sum + c.balanceDue, 0)
  const totalPaid = patientCharges.reduce((sum, c) => sum + c.paidAmount, 0)

  const handlePayNow = (charge: PaymentCharge) => {
    setSelectedCharge(charge)
    setPaymentDialogOpen(true)
  }

  const handlePaymentComplete = () => {
    setPaymentDialogOpen(false)
    setSelectedCharge(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground">View and manage your account balance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balance</CardTitle>
            <CardDescription>Amount due for services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              ${totalBalance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {patientCharges.filter(c => c.balanceDue > 0).length} unpaid charge(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Paid</CardTitle>
            <CardDescription>Lifetime payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalPaid.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Across {patientCharges.length} charge(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Charges</CardTitle>
          <CardDescription>View your billing history and make payments</CardDescription>
        </CardHeader>
        <CardContent>
          {patientCharges.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
              <p className="text-muted-foreground">No charges found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientCharges.map((charge) => (
                <Card key={charge.id} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {chargeTypeLabels[charge.chargeType] || charge.chargeType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(charge.dateOfService).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium mb-2">{charge.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-muted-foreground text-xs">Total Charge</p>
                            <p className="font-semibold">${charge.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Insurance Paid</p>
                            <p className="font-semibold text-green-600">${charge.insuranceCovered.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">You Paid</p>
                            <p className="font-semibold">${charge.paidAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Balance Due</p>
                            <p className="font-semibold text-accent">${charge.balanceDue.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {charge.balanceDue > 0 ? (
                          <Button onClick={() => handlePayNow(charge)} className="bg-accent hover:bg-accent/90">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        ) : (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" weight="fill" />
                            Paid in Full
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCharge && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          charge={selectedCharge}
          patientId={patientId}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}
