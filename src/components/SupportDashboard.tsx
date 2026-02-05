import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
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
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  const filteredInquiries = useMemo(() => {
    const base = inquiries || []
    if (activeFilter === 'all') return base
    return base.filter(i => i.status === activeFilter)
  }, [inquiries, activeFilter])

  const sortedInquiries = useMemo(() => {
    return [...filteredInquiries].sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      if (a.status !== b.status) {
        const statusOrder = { new: 4, inProgress: 3, followUp: 2, resolved: 1 }
        return statusOrder[b.status] - statusOrder[a.status]
      }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })
  }, [filteredInquiries])

  const inquiryMessages = useMemo(() => {
    if (!selectedInquiry) return []
    return (messages || [])
      .filter(m => m.inquiryId === selectedInquiry.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [messages, selectedInquiry])

  const getPatientName = (patientId: string) => {
    const patient = (patients || []).find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  }

  const getCategoryIcon = (category: SupportInquiryCategory) => {
    switch (category) {
      case 'billing': return <CreditCard className="w-4 h-4" weight="duotone" />
      case 'technical': return <DesktopTower className="w-4 h-4" weight="duotone" />
      case 'insurance': return <Question className="w-4 h-4" weight="duotone" />
      default: return <ChatCircle className="w-4 h-4" weight="duotone" />
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
      high: 'bg-red-600 text-white',
      medium: 'bg-amber-500 text-white',
      low: 'bg-slate-500 text-white'
    }
    return <Badge className={variants[priority]} variant="outline">{priority}</Badge>
  }

  const handleSendMessage = () => {
    if (!selectedInquiry || !messageText.trim()) return

    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
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
  }

  const handleUpdateStatus = (inquiryId: string, newStatus: SupportInquiryStatus) => {
    setInquiries(current => 
      (current || []).map(i => 
        i.id === inquiryId 
          ? { 
              ...i, 
              status: newStatus, 
              updatedAt: new Date().toISOString(),
              ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString(), resolvedBy: 'Support Team' } : {})
            } 
          : i
      )
    )
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null)
    }
    toast.success(`Status updated to ${newStatus}`)
  }

  const handleCreateInquiry = () => {
    if (!newInquiry.patientId || !newInquiry.subject || !newInquiry.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const inquiry: SupportInquiry = {
      id: `inquiry-${Date.now()}-${Math.random().toString(36).substring(7)}`,
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
    setNewInquiry({ patientId: '', category: 'general', subject: '', description: '', priority: 'medium' })
    setShowNewInquiryDialog(false)
    toast.success('Support inquiry created')
  }

  const stats = useMemo(() => ({
    new: (inquiries || []).filter(i => i.status === 'new').length,
    inProgress: (inquiries || []).filter(i => i.status === 'inProgress').length,
    followUp: (inquiries || []).filter(i => i.status === 'followUp').length,
    resolved: (inquiries || []).filter(i => i.status === 'resolved').length
  }), [inquiries])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Headset className="w-10 h-10 text-primary" weight="duotone" />
              Administrative Support Portal
            </h1>
            <p className="text-muted-foreground mt-2">Non-clinical customer service inquiries</p>
          </div>
          <Dialog open={showNewInquiryDialog} onOpenChange={setShowNewInquiryDialog}>
            <DialogTrigger asChild>
              <Button size="lg">
                <ChatCircle className="w-5 h-5 mr-2" weight="duotone" />
                New Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Support Inquiry</DialogTitle>
                <DialogDescription>Log a new non-clinical customer service request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient</Label>
                  <Select value={newInquiry.patientId} onValueChange={(v) => setNewInquiry(prev => ({ ...prev, patientId: v }))}>
                    <SelectTrigger id="patient-select">
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
                    <Label htmlFor="category-select">Category</Label>
                    <Select value={newInquiry.category} onValueChange={(v) => setNewInquiry(prev => ({ ...prev, category: v as SupportInquiryCategory }))}>
                      <SelectTrigger id="category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="insurance">Insurance Questions</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority-select">Priority</Label>
                    <Select value={newInquiry.priority} onValueChange={(v) => setNewInquiry(prev => ({ ...prev, priority: v as 'low' | 'medium' | 'high' }))}>
                      <SelectTrigger id="priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-input">Subject</Label>
                  <Input 
                    id="subject-input"
                    value={newInquiry.subject}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description-input">Description</Label>
                  <Textarea 
                    id="description-input"
                    value={newInquiry.description}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed explanation of the support request"
                    rows={4}
                  />
                </div>

                <Button onClick={handleCreateInquiry} className="w-full" size="lg">
                  Create Inquiry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('new')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" weight="duotone" />
            </CardHeader>
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
