import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Case, Message, SupportInquiry, SupportMessage, Patient, Provider } from '@/lib/types'
import { Tray, MagnifyingGlass, Funnel, ChatCircle, Stethoscope, Headset } from '@phosphor-icons/react'

type UnifiedMessage = {
  id: string
  type: 'clinical' | 'support'
  relatedId: string
  patientId: string
  patientName: string
  subject: string
  lastMessage: string
  lastMessageTime: string
  status: string
  category?: string
  unreadCount: number
}

export function UnifiedInbox() {
  const [cases] = useKV<Case[]>('cases', [])
  const [messages] = useKV<Message[]>('messages', [])
  const [supportInquiries] = useKV<SupportInquiry[]>('support-inquiries', [])
  const [supportMessages] = useKV<SupportMessage[]>('support-messages', [])
  const [patients] = useKV<Patient[]>('patients', [])
  const [providers] = useKV<Provider[]>('providers', [])
  
  const [filterType, setFilterType] = useState<'all' | 'clinical' | 'support'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getPatientName = (patientId: string) => {
    const patient = (patients || []).find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'
  }

  const unifiedMessages = useMemo(() => {
    const unified: UnifiedMessage[] = []

    (cases || []).forEach(c => {
      const caseMessages = (messages || []).filter(m => m.caseId === c.id)
      const lastMsg = caseMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]

      unified.push({
        id: c.id,
        type: 'clinical',
        relatedId: c.id,
        patientId: c.patientId,
        patientName: getPatientName(c.patientId),
        subject: c.subject,
        lastMessage: lastMsg?.body || c.description,
        lastMessageTime: lastMsg?.timestamp || c.createdAt,
        status: c.status,
        category: c.caseType,
        unreadCount: 0
      })
    });

    (supportInquiries || []).forEach(s => {
      const inquiryMessages = (supportMessages || []).filter(m => m.inquiryId === s.id)
      const lastMsg = inquiryMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]

      unified.push({
        id: s.id,
        type: 'support',
        relatedId: s.id,
        patientId: s.patientId,
        patientName: getPatientName(s.patientId),
        subject: s.subject,
        lastMessage: lastMsg?.body || s.description,
        lastMessageTime: lastMsg?.timestamp || s.createdAt,
        status: s.status,
        category: s.category,
        unreadCount: 0
      })
    })

    return unified.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )
  }, [cases, messages, supportInquiries, supportMessages, patients])

  const filteredMessages = useMemo(() => {
    let filtered = unifiedMessages

    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.subject.toLowerCase().includes(query) ||
        m.patientName.toLowerCase().includes(query) ||
        m.lastMessage.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [unifiedMessages, filterType, statusFilter, searchQuery])

  const stats = useMemo(() => ({
    total: unifiedMessages.length,
    clinical: unifiedMessages.filter(m => m.type === 'clinical').length,
    support: unifiedMessages.filter(m => m.type === 'support').length,
    active: unifiedMessages.filter(m => 
      m.status === 'open' || m.status === 'inProgress' || m.status === 'awaitingProvider'
    ).length
  }), [unifiedMessages])

  const getMessageIcon = (type: 'clinical' | 'support') => {
    return type === 'clinical' 
      ? <Stethoscope className="w-4 h-4" weight="duotone" />
      : <Headset className="w-4 h-4" weight="duotone" />
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-600 text-white',
      inProgress: 'bg-amber-600 text-white',
      awaitingPatient: 'bg-purple-600 text-white',
      awaitingProvider: 'bg-orange-600 text-white',
      resolved: 'bg-green-600 text-white',
      new: 'bg-blue-600 text-white',
      followUp: 'bg-purple-600 text-white'
    }
    return colors[status] || 'bg-gray-600 text-white'
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Tray className="w-10 h-10 text-primary" weight="duotone" />
            Unified Inbox
          </h1>
          <p className="text-muted-foreground mt-2">All patient communications in one place</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterType('all')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Tray className="h-4 w-4 text-muted-foreground" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All conversations</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setFilterType('clinical')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clinical Cases</CardTitle>
              <Stethoscope className="h-4 w-4 text-blue-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.clinical}</div>
              <p className="text-xs text-muted-foreground mt-1">Health-related</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-purple-500 transition-colors" onClick={() => setFilterType('support')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Inquiries</CardTitle>
              <Headset className="h-4 w-4 text-purple-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.support}</div>
              <p className="text-xs text-muted-foreground mt-1">Non-clinical</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <ChatCircle className="h-4 w-4 text-green-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Messages</CardTitle>
                <CardDescription>{filteredMessages.length} conversations</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="awaitingProvider">Awaiting Provider</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="clinical">
                  Clinical ({stats.clinical})
                </TabsTrigger>
                <TabsTrigger value="support">
                  Support ({stats.support})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filterType} className="mt-4">
                <ScrollArea className="h-[600px]">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-16">
                      <Tray className="w-16 h-16 text-muted-foreground mx-auto mb-4" weight="duotone" />
                      <p className="text-muted-foreground">No messages found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredMessages.map(msg => (
                        <div
                          key={msg.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getMessageIcon(msg.type)}
                              <div>
                                <h4 className="font-semibold text-sm">{msg.subject}</h4>
                                <p className="text-xs text-muted-foreground">{msg.patientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${msg.type === 'clinical' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
                                {msg.type}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(msg.status)}`}>
                                {msg.status.replace(/([A-Z])/g, ' $1').trim()}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {msg.lastMessage}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="capitalize">{msg.category}</span>
                            <span>{new Date(msg.lastMessageTime).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
