import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
  SupportInquiry, 
  Patient, 
  SupportInquiryStatus 
import { 
  ChatCircle, 
  DesktopTower, 
  PaperPlan
  CheckCircle, 
  UserCircle,
} from '@phosphor-ic

  const [in
  const [patie
  const [selec
  const [isInter
  const [sho
    patientId: '',
    subje
    priority: '

    if (activ
  }, [
  const sortedInquiries = useM
      const statusOrder = { ne

    })

    if (!selectedInquiry) return []
  }, [messages, selectedInquiry])
  
    inProgress: (inquiries || []).filter(i => i.status === 'inProgress').length,
    resolved: (inquiries || []).filter(i => i.status

    const patient = (patients || []).find(p => p.id === patientId)
  }
  const getCategoryIcon = (category: SupportInqu
      case 'techni
      case 'insurance': return <Question className
    }

    const variants = {
    

    return <Badge className={variants[statu

    const variants = {
      medium: 'bg-slate-600 tex

  }
  const handleSendMessage = () => {

      id: `msg-${Date.now()}`,
      senderId: 'staff-001',
      senderRole: 'staff',
      
    }

    setIsInternal(false)
    if (!selectedInquiry) return []
    return (messages || []).filter(msg => msg.inquiryId === selectedInquiry.id)
  }, [messages, selectedInquiry])

  const stats = useMemo(() => ({
    new: (inquiries || []).filter(i => i.status === 'new').length,
    inProgress: (inquiries || []).filter(i => i.status === 'inProgress').length,
    followUp: (inquiries || []).filter(i => i.status === 'followUp').length,
    resolved: (inquiries || []).filter(i => i.status === 'resolved').length
  }), [inquiries])

  const getPatientName = (patientId: string) => {
    const patient = (patients || []).find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  }

  const getCategoryIcon = (category: SupportInquiryCategory) => {
    switch (category) {
      case 'technical': return <DesktopTower className="w-4 h-4" weight="duotone" />
      case 'billing': return <CreditCard className="w-4 h-4" weight="duotone" />
      case 'insurance': return <Question className="w-4 h-4" weight="duotone" />
      default: return <Headset className="w-4 h-4" weight="duotone" />
    }
  }

  const getStatusBadge = (status: SupportInquiryStatus) => {
    const variants = {
      new: 'bg-blue-600 text-white',
      inProgress: 'bg-amber-600 text-white',
      followUp: 'bg-purple-600 text-white',
      resolved: 'bg-green-600 text-white'
    }
    return <Badge className={variants[status]}>{status.replace(/([A-Z])/g, ' $1').trim()}</Badge>
  }

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const variants = {
      low: 'bg-slate-500 text-white',
      medium: 'bg-slate-600 text-white',
      high: 'bg-red-600 text-white'
    }
    return <Badge className={variants[priority]}>{priority}</Badge>
  }

  const handleSendMessage = () => {
    if (!selectedInquiry || !messageText.trim()) return

    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      inquiryId: selectedInquiry.id,
      senderId: 'staff-001',
      senderName: 'Support Team',
      senderRole: 'staff',
      body: messageText,
      timestamp: new Date().toISOString(),
      isInternal
    }

    setMessages(current => [...(current || []), newMessage])
    setMessageText('')
    setIsInternal(false)
    toast.success('Message sent')

    setInquiries(current =>
      (current || []).map(inq =>
        inq.id === selectedInquiry.id
      description: '',
    })
  }
  ret

          <div className="flex
              <Headset className="w-10 h-10 text-purple-600" weight="duotone" />
     
   

                </Button>
              <DialogConten
                  <DialogTitle>C
                </DialogHead
             
                    <
                        <SelectV
                      <SelectContent>
                          <SelectItem key={p.id} value={p.id}>
                          </SelectItem>
             
               
       
     

                        </SelectTrigger>
                          <SelectItem valu
                 
                        </
                    </div>
                    <div className="space-y-2">
                      <Select value={newInquiry.priority} onValueChange={(v) =>
               
     

                        </SelectCon
   

                    <Label htmlFor="s
                      id="subject"
                      onChange={(e) => setNewInquiry(pr
            


                      id="description
                      onChange
                      rows={4}
                  </div>
                <DialogFooter>
                    Cancel
                  <B
                  </Button>
              </DialogContent>
          </div>
     

            <CardHeader className="flex flex-row items-cen
              <Clock className="h-
            <CardCo
              <p cla
          </Card>
          <Card cl
              <CardTit
            </CardHeader
      
            </CardContent>


          
            <CardContent>
              <p className="text-xs text-muted-foreground mt-
          </C
          <Card className="hover:border-green-500 transition-color
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
              <div className="text-3xl font
            </Car
        </div>
        <div className="grid grid-col
            <CardHeader>
                <CardTitle>Inquiries</CardTitle>
              </div>
                <Button v
                </Button>
            </CardHeader>
              <ScrollArea clas
                  {sortedInquiries.length === 0 ? (
                      <ChatCircle className="w-12 h-12 text-muted-foreground mb-3" weight="duotone
                    </div>
                    sortedInquiries.map((inquiry
                        key={inquiry.id}
                        className={`p-4 rounded-lg border cu
                        }`}
                        <div className="flex items
                            {getCategoryIcon(inquiry.category)}
                          </div>
                        </div>
                          {getPatientName(inquiry.pa
                        <div className="flex items-center just
                          <span className="text-xs tex
                          </span>
                      </div
                  )}
              </ScrollArea>
          </Card>

              <div className="flex items-center justify-be
                  {selectedInquiry && (
                      {getPatientName(selectedInquiry.patientId)
                  )}
                {selectedInquiry && (
                    <Select value={select
                        <SelectValue />
                      <SelectContent>
                        <SelectItem value="inProgress">In Progress</Select
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </Select>
                )}
            </CardHeader>
              {!selectedInquiry
                  <ChatCir

                <div className="space-y-4">
                    <p className="text-sm font-medium mb-1">Orig
                  </div>
                  <ScrollArea className="h-[400px] bo
                      <p className="text-
                      <div className="sp
                          <div
                            className={`p-3 rounded-lg ${
                            }`}
                            <div className="flex items-center gap-2 
                              {msg.isInt
                               
                          
                        

                  </ScrollArea>
                  <div className="space-y-2">
                      plac
                      onChange={(e
                    />
                      <label className="flex items-center gap-2 text-sm">
                          type="checkbox"
                      
                        

                        <PaperPlaneTilt class
                      </Button>
                  </div>
              )}
          </Card>
      </div>
  )























            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('inProgress')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <ChatCircle className="h-4 w-4 text-amber-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Active conversations</p>
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('followUp')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Follow-Up</CardTitle>
              <Warning className="h-4 w-4 text-purple-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.followUp}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="hover:border-green-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('resolved')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inquiries</CardTitle>
                <Badge variant="outline">{filteredInquiries.length}</Badge>
              </div>
              {activeFilter !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => setActiveFilter('all')}>
                  Show All
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-6 pt-0">
                  {sortedInquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ChatCircle className="w-12 h-12 text-muted-foreground mb-3" weight="duotone" />
                      <p className="text-sm text-muted-foreground">No inquiries found</p>
                    </div>
                  ) : (
                    sortedInquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        onClick={() => setSelectedInquiry(inquiry)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary ${
                          selectedInquiry?.id === inquiry.id ? 'border-primary bg-accent/50' : 'bg-card'
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
                  {selectedInquiry && (
                    <CardTitle className="text-lg mb-1">
                      {getPatientName(selectedInquiry.patientId)} • {selectedInquiry.subject}
                    </CardTitle>
                  )}
                </div>
                {selectedInquiry && (
                  <div className="flex items-center gap-2">
                    <Select value={selectedInquiry.status} onValueChange={(v) => handleUpdateStatus(selectedInquiry.id, v as SupportInquiryStatus)}>
                      <SelectTrigger className="w-[180px]">
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
                <div className="flex flex-col items-center justify-center h-[600px] text-center">
                  <ChatCircle className="w-16 h-16 text-muted-foreground mb-4" weight="duotone" />
                  <p className="text-muted-foreground">Select an inquiry to view details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Original Request</p>
                    <p className="text-sm text-muted-foreground">{selectedInquiry.description}</p>
                  </div>

                  <ScrollArea className="h-[400px] border rounded-lg p-4">
                    {inquiryMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
                    ) : (
                      <div className="space-y-3">
                        {inquiryMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg ${
                              msg.senderRole === 'staff' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{msg.senderName}</span>
                              {msg.isInternal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-muted-foreground">Internal note (not visible to patient)</span>
                      </label>
                      <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                        <PaperPlaneTilt className="w-4 h-4 mr-2" />
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
