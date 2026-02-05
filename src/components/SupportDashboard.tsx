import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, Sel
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
  SupportInquiry, 
  Patient, 
  SupportInquiryCategory, 
} from '@/lib/types'
  Headset, 
  CreditC
  Question, 
  Clock, 
  Warning, 
  Plus
  SupportInquiryCategory, 
  SupportInquiryStatus 
} from '@/lib/types'
import { 
  Headset, 
  ChatCircle, 
  CreditCard, 
  DesktopTower, 
  Question, 
  PaperPlaneTilt, 
  Clock, 
  CheckCircle, 
  Warning, 
  UserCircle,
  Plus
} from '@phosphor-icons/react'
    patientId: '',
    subject: '',


    if (activeFilter === 'all') return inquiries || []
  }, [inquiries, activeFilter])
  const sortedInquiries = useMemo(() => {
    return [...filteredInquiries].sort((a, b) => {
  
    })

    if (!selectedInquiry) return []
  }, [messages, selectedInquiry])
  const stats = useMemo(() => ({
  
    resolved: (inquiries || []).filter(i => i.st

    const patient = (patients || []).find(p => p.i
  }
  const getCategoryI
      case 'technical': return <DesktopTower classN
    


    const variants = {
      inProgress: 'bg-amber-600 text-white',
      resolved: 'bg-green-600 t


    const variants = {
      medium: 'bg-slate-600 text-white',
    }
      if (statusDiff !== 0) return statusDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [filteredInquiries])

  const inquiryMessages = useMemo(() => {
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
          ? { ...inq, updatedAt: new Date().toISOString() }
          : inq
      )
    )

    if (selectedInquiry?.id) {
      setSelectedInquiry(prev => prev ? { ...prev, updatedAt: new Date().toISOString() } : null)
    }
  }

  const handleUpdateStatus = (inquiryId: string, newStatus: SupportInquiryStatus) => {
    setInquiries(current =>
      (current || []).map(inq =>
        inq.id === inquiryId
          ? {
              ...inq,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : inq.resolvedAt,
              resolvedBy: newStatus === 'resolved' ? 'Support Team' : inq.resolvedBy
            }
          : inq
      )
    )

    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(prev => prev ? { 
        ...prev, 
        status: newStatus,
        updatedAt: new Date().toISOString(),
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : prev.resolvedAt,
        resolvedBy: newStatus === 'resolved' ? 'Support Team' : prev.resolvedBy
      } : null)
    }

    toast.success('Status updated')
  }

  const handleCreateInquiry = () => {
    if (!newInquiry.patientId || !newInquiry.subject || !newInquiry.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const inquiry: SupportInquiry = {
      id: `inq-${Date.now()}`,
      patientId: newInquiry.patientId,
      category: newInquiry.category,
      subject: newInquiry.subject,
      description: newInquiry.description,
      status: 'new',
      priority: newInquiry.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setInquiries(current => [...(current || []), inquiry])
    setShowNewInquiryDialog(false)
    setNewInquiry({
      patientId: '',
      category: 'general',
      subject: '',
      description: '',
      priority: 'medium'
    })
    toast.success('Inquiry created successfully')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Headset className="w-10 h-10 text-primary" weight="duotone" />
              Administrative Support Portal
            </h1>
            <Dialog open={showNewInquiryDialog} onOpenChange={setShowNewInquiryDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Inquiry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Inquiry</DialogTitle>
                  <DialogDescription>Submit a new non-clinical support request</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select value={newInquiry.patientId} onValueChange={(v) => setNewInquiry(prev => ({ ...prev, patientId: v }))}>
                      <SelectTrigger id="patient">
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {(patients || []).map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newInquiry.category} onValueChange={(v) => setNewInquiry(prev => ({ ...prev, category: v as SupportInquiryCategory }))}>
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
        <div className="gr

              <Clock className="h-4 w-4 text-bl
            <CardContent>
              <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
          </Card>
          <Card className="hover:border-a
              <CardTitle className="text
            </CardHeader>
              <div className="text-3xl font-bold">{stats.inProgres
            </CardContent>

            <CardHeader className="flex 
              <ChatCircle class
            <CardContent>
              <p classNa

          <Card className="hover:border-green
              <CardTitle className="text-sm font-medium">Res
            </CardHeader>
              <div className="text
            </CardContent>
        </div>
        <div className="grid grid-cols-3 gap-6">
            <CardHeade
                {activeF

            <CardContent className="p-0">
                <div className="space-y-2 p-6 pt-0">
                    <div clas
                      <p className="te
                  ) : (
                      <div
                        onClick={() => setSelectedInquiry(inquiry)}
                          sele
                      
                      >

                            <span className="font-semibold text-sm">{inquir
                          {getPrio
                        <p 
                      
                          {get
                     
                
                    ))
              


            <CardHeader>
                <div>
                  {selectedInquiry && (
                      {getPatientName(selectedInquiry.patientId)} • {selec
                  )}
                {selected
                    <Select value={selectedInquiry.status} onValueC
                        <SelectValue />
                      <Sel
                 

                    </Select>
                )}
            </CardHeader>
              {!selectedInquiry ? (
                  <ChatCi
                </div>
                <div className="space-y-4">
                    <p className="text-sm font-medium mb-1">Original Request</p>
                  </div>
                 

                        <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
                        <div className="space-y-3">
                            <div
                              className={`p-3 rounded-lg ${
                         
                         
                              <div className="flex items-center gap-2 mb
                                <span className="text-xs font-medium">{msg.senderNam
                          
                 

                              </p>
                          ))}
                      )}
                  </div>
                  <div cl
                      <Te
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={3}
                      />
                 
              

                          className="rounded"
                        <span className
                      <B
                        S
                    </div>
                </div>
            </CardContent>
        </div>
    </div>
}























































































































































