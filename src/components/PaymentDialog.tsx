import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaymentCharge, Payment, Patient } from '@/lib/types'
import { CreditCard, LockKey, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { WorkflowEngine } from '@/lib/workflow-engine'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  charge: PaymentCharge
  patientId: string
  onPaymentComplete: (payment: Payment) => void
}

export function PaymentDialog({ open, onOpenChange, charge, patientId, onPaymentComplete }: PaymentDialogProps) {
  const [patients, setPatients] = useKV<Patient[]>('patients', [])
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [nameOnCard, setNameOnCard] = useState('')
  const [paymentAmount, setPaymentAmount] = useState(charge.balanceDue.toFixed(2))
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmitPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      toast.error('Please fill in all payment fields')
      return
    }

    if (parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > charge.balanceDue) {
      toast.error('Invalid payment amount')
      return
    }

    setIsProcessing(true)

    setTimeout(async () => {
      const payment: Payment = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        chargeId: charge.id,
        patientId: patientId,
        amount: parseFloat(paymentAmount),
        paymentMethod: `Card ending in ${cardNumber.slice(-4)}`,
        status: 'completed',
        transactionId: `txn-${Date.now()}`,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      }

      const updatePatient = (id: string, updates: Partial<Patient>) => {
        setPatients((current) =>
          (current || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
        )
      }

      await WorkflowEngine.processPaymentCompletion(payment, patients || [], updatePatient)

      onPaymentComplete(payment)
      setIsProcessing(false)
      
      toast.success('Payment processed successfully', {
        description: `$${paymentAmount} has been charged to your card`,
      })

      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setNameOnCard('')
      setPaymentAmount(charge.balanceDue.toFixed(2))
    }, 1500)
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.slice(0, 19)
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Enter your payment information to complete the transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Charge Description:</span>
              <span className="font-medium">{charge.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Balance Due:</span>
              <span className="text-lg font-bold text-accent">${charge.balanceDue.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={charge.balanceDue}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name-on-card">Name on Card</Label>
              <Input
                id="name-on-card"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
            <ShieldCheck className="w-4 h-4 text-green-600" weight="fill" />
            <span>Secure payment processing via Sphere Payment Gateway (PCI-DSS Compliant)</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitPayment} 
            disabled={isProcessing}
            className="bg-accent hover:bg-accent/90"
          >
            <LockKey className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : `Pay $${paymentAmount}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
