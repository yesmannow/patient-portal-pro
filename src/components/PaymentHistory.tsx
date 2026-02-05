import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentCharge, Payment, Patient } from '@/lib/types'
import { CreditCard, Receipt, CheckCircle, XCircle } from '@phosphor-icons/react'
import { PaymentDialog } from './PaymentDialog'
import { format } from 'date-fns'

interface PaymentHistoryProps {
  patientId: string
}

const chargeTypeLabels: Record<string, string> = {
  visit: 'Office Visit',
  procedure: 'Procedure',
  lab: 'Lab Work',
  medication: 'Medication',
  copay: 'Copay',
}

export function PaymentHistory({ patientId }: PaymentHistoryProps) {
  const [charges] = useKV<PaymentCharge[]>('payment-charges', [])
  const [payments, setPayments] = useKV<Payment[]>('payments', [])
  const [patients, setPatients] = useKV<Patient[]>('patients', [])
  const [selectedCharge, setSelectedCharge] = useState<PaymentCharge | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const patientCharges = (charges || [])
    .filter(c => c.patientId === patientId)
    .sort((a, b) => new Date(b.dateOfService).getTime() - new Date(a.dateOfService).getTime())

  const totalBalanceDue = patientCharges.reduce((sum, c) => sum + c.balanceDue, 0)

  const handlePayNow = (charge: PaymentCharge) => {
    setSelectedCharge(charge)
    setPaymentDialogOpen(true)
  }

  const handlePaymentComplete = (payment: Payment) => {
    setPayments((current) => [...(current || []), payment])
    setPaymentDialogOpen(false)
    setSelectedCharge(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground mt-1">View charges and manage your account balance</p>
        </div>
        {totalBalanceDue > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Balance Due</p>
            <p className="text-3xl font-bold text-accent">${totalBalanceDue.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Receipt className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalanceDue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {patientCharges.filter(c => c.balanceDue > 0).length} unpaid charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid YTD</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${patientCharges.reduce((sum, c) => sum + c.paidAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(payments || []).filter(p => p.patientId === patientId && p.status === 'completed').length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Coverage</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${patientCharges.reduce((sum, c) => sum + c.insuranceCovered, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Year to date</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Charges</CardTitle>
          <CardDescription>Detailed breakdown of charges and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {patientCharges.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
              <p className="text-muted-foreground">No charges on record</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patientCharges.map((charge) => (
                <Card key={charge.id} className="border-l-4" style={{ borderLeftColor: charge.balanceDue > 0 ? 'oklch(0.60 0.20 25)' : 'oklch(0.60 0.12 145)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {chargeTypeLabels[charge.chargeType]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(charge.dateOfService), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="font-medium mb-2">{charge.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
