import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/s
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, D
import { Input } from '@/components/ui/input'
import { SupportInquiry, SupportMessage, Patient, P
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SupportInquiry, SupportMessage, Patient, Provider, SupportInquiryCategory, SupportInquiryStatus } from '@/lib/types'
import { Headset, ChatCircle, CreditCard, DesktopTower, Question, PaperPlaneTilt, Clock, CheckCircle, Warning, UserCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function SupportDashboard() {
  const [inquiries, setInquiries] = useKV<SupportInquiry[]>('support-inquiries', [])
  const [messages, setMessages] = useKV<SupportMessage[]>('support-messages', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [providers] = useKV<Provider[]>('providers', [])
  
  const [activeFilter, setActiveFilter] = useState<SupportInquiryStatus | 'all'>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [showNewInquiryDialog, setShowNewInquiryDialog] = useState(false)
  
  const [newInquiry, setNewInquiry] = useState({
    patientId: '',
    category: 'general' as SupportInquiryCategory,
    subject: '',
    if (activeFilter
  }, [inquiries, activeFilter])
  co

        const statusOrder = { new: 4, inPro
      }
    })

    if (!selectedInquiry) retur

  }, [messages, selectedInquiry])
  const getPatientName = (patientId: string) => {
    return patient ? `${patient.firstName} ${patient.lastNa

    switch (category) {
      case 'technical': return <DesktopTower className="w-4 
      d
  }
  cons
      new: 'bg-blue-600 t

    }
  }
  const getPriorityBadge = 
      high: 'bg-red-600 text-white',
      low: 'bg-slate-500 text-white'
    return <Badge className={vari

    if (!selectedInquiry || !messageText.trim()) 
    const newMessage: SupportMessage = {
      inquiryId: selectedInquiry.id,
   

      isInternal

    setMessageText('')
    toast.success('Message sent')

    setInquiries(current => 
     
   

            } 
      )
    if (selectedInquiry?.id === inqu
    }
  }
  const handleCreateInquiry = () => {
     
    }
   

      subject: newInquiry.subject,
      status: 'new',
      createdAt: new Date().toISOStr
    }
    setInquiries(current => [...(cur
    s
  }
  c

    resolved: (inquiries || []).fil


        <div className="flex items-cente
            <h1 className="text-4xl font-bold tracking-tight flex items-c
              Administrative Support
            <p className="te
          <Dialog open={showNewIn
              <Button size
                New Inqu
            </DialogTrigger>
              <D
     

                  <Label htmlFor="patient-select">Patient</L
                    <S
                    </Se
                      {(patients 
   

                  </Select>

                  <div classNam
                    <Select
              
                    
                        <SelectIt
                        <SelectItem value="general
                    </Select>

             
       
     
                        <SelectItem value="l
                        <SelectItem value="high">High</SelectItem>
     
                </div>
   

                    value={newInquiry
                    placeholder="Brief description of the issue"
                </div>
            
     

                    placeholder="Deta
                  />

                  Create Inquiry
              </div>
          </Dialog>

          <Card className="hover:bor
              <CardTitle className="text-s
            </CardHeader>
     


            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Warning className="
            <CardContent>
   

          <Card className="hover
              <CardTitle className="text-sm font-medium">Follow-Up
            </CardHeader>
              <div className="text-3xl font-bold">{stats.followUp}</div>
            </CardContent>


          
            <CardContent>
              <p className="text-xs text-muted-fore
          </Card>

          <Card className="col-span-1">
              <CardTitle>
              </CardTitle>
            </Car
              <ScrollArea className="h-[600px]">
                
                      <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-
                    </div>
                    sortedInquir
                        key={inquiry.id}
                        cla
                       
                        }`}
                        <div className="flex ite
                            
                          </div>
                        </div>
                          {ge
                        <div className="flex i
                          <span className="
                          </span>
                      </div>
                  )}
              </ScrollArea>
          </Card>
          <Card className="col-span
              <div className="flex items-center ju
                  <CardTitle>{selectedInquiry ? selectedInqu
                    <CardDescription className="mt-1
                    </CardDescription
                </div>
                  <div className="fl
                      <Sele
                      

                        <SelectItem value="followUp">Fol
                      </SelectContent>
                  </div>
              </div>
            <CardContent>
                <div className="text-ce
                  <p className="text-m
              ) : (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">{selectedInquiry.de

                    <p className="text-sm font-medium mb-3">Communicatio
                      {inquiryMessages
                      ) : (
                        

                                msg.senderRol
                                  : 'bg-muted/50 mr-8'
                            >
                                <UserCircle className="w-4
                                {msg.is
                                )}
                              <p clas
                                {new Date(msg.timestamp).toLocal
                            </div>
                        </div>
                    </ScrollArea>

                    <div
                      

                        className="flex-1"
                    </div>
                      <la
                          type="checkb
                          onChange={(e) => set
                        />
                      </label>
                    
                      

              )}
          </Card>
      </div>
  )





















            <CardContent>
              <div className="text-3xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('inProgress')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Warning className="h-4 w-4 text-amber-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Being handled</p>
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('followUp')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-Up</CardTitle>
              <ChatCircle className="h-4 w-4 text-purple-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.followUp}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending response</p>
            </CardContent>
          </Card>

          <Card className="hover:border-green-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('resolved')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>
                {activeFilter === 'all' ? 'All Inquiries' : `${activeFilter.replace(/([A-Z])/g, ' $1').trim()} Inquiries`}
              </CardTitle>
              <CardDescription>{sortedInquiries.length} total</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-6 pt-0">
                  {sortedInquiries.length === 0 ? (
                    <div className="text-center py-12">
                      <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-3" weight="duotone" />
                      <p className="text-muted-foreground">No inquiries found</p>
                    </div>
                  ) : (
                    sortedInquiries.map(inquiry => (
                      <div
                        key={inquiry.id}
                        onClick={() => setSelectedInquiry(inquiry)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedInquiry?.id === inquiry.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-card hover:bg-muted/50 border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(inquiry.category)}
                            <span className="font-semibold text-sm">{inquiry.subject}</span>
                          </div>
                          {getPriorityBadge(inquiry.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {getPatientName(inquiry.patientId)}
                        </p>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(inquiry.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedInquiry ? selectedInquiry.subject : 'Select an Inquiry'}</CardTitle>
                  {selectedInquiry && (
                    <CardDescription className="mt-1">
                      {getPatientName(selectedInquiry.patientId)} • {selectedInquiry.category}
                    </CardDescription>
                  )}
                </div>
                {selectedInquiry && (
                  <div className="flex items-center gap-2">
                    <Select value={selectedInquiry.status} onValueChange={(v) => handleUpdateStatus(selectedInquiry.id, v as SupportInquiryStatus)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="followUp">Follow-Up</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedInquiry ? (
                <div className="text-center py-16">
                  <ChatCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" weight="duotone" />
                  <p className="text-muted-foreground">Select an inquiry from the list to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-1">Original Request</p>
                    <p className="text-sm text-muted-foreground">{selectedInquiry.description}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Communication Thread</p>
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      {inquiryMessages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
                      ) : (
                        <div className="space-y-3">
                          {inquiryMessages.map(msg => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                msg.senderRole === 'staff'
                                  ? 'bg-primary/10 ml-8'
                                  : 'bg-muted/50 mr-8'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <UserCircle className="w-4 h-4" weight="duotone" />
                                <span className="text-xs font-medium">{msg.senderName}</span>
                                {msg.isInternal && (
                                  <Badge variant="outline" className="text-xs">Internal</Badge>
                                )}
                              </div>
                              <p className="text-sm">{msg.body}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your response..."
                        rows={3}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-muted-foreground">Internal note (not visible to patient)</span>
                      </label>
                      <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                        <PaperPlaneTilt className="w-4 h-4 mr-2" weight="duotone" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
