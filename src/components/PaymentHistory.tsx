import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Receipt, CheckCircle, XC
import { PaymentCharge, Payment, Patient } from '@/lib/types'
import { CreditCard, Receipt, CheckCircle, XCircle } from '@phosphor-icons/react'
import { PaymentDialog } from './PaymentDialog'
}

  visit: 'Office Visit',
  patientId: string
 

const chargeTypeLabels: Record<string, string> = {
  visit: 'Office Visit',


    setSelectedCharge(charg
  }
 

  }
  return (
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Paymen
        </div>
          <div className="text-right">

        )}

        <Card>

          </CardHeader>

              {patientCharges.filter(c => c.balance
          </CardContent>

   

          <CardContent>
              ${patientCharges.reduce((sum, c) => sum + c.p
            <p className="text-
            </p>
   

          
          </CardHeader>
            <div className="text-2xl font-bold">
            <
          </CardContent>
      </div>
      <Card>
          <CardTitle>Recent Charg
        </CardHeader>
          {patientCharges.length === 0 ? (
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duo
            </di
          
            

                        <div className="flex item
              
                          <span className="text-xs text-muted-foreground">
                          </span>
                        <p className="font-medium mb-2">{charge.d
                       
                       
                          <div>
                            <p className="font-semibold text-g
                          <div>
                
                        
               

              
                          <Button onClick={() => handlePayNow(charge)} className="bg-accent 
                            Pay Now
                        ) : (
                       
                       
                      </div>
                  </CardContent>
              ))}
          )}
      </Card>
      {selectedC
          open={paymentD
          charg

      )}
  )








































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
