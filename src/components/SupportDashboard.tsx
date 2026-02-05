import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChatCircle, 
  DesktopTower, 
  PaperPlaneTilt, 
  CheckCircle, 
  UserCircle,
  Question,
  Headset,
  CreditCard,
  Clock,
  Warning
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import type { SupportInquiry, Patient, SupportInquiryStatus, SupportInquiryCategory } from '@/lib/types';

interface SupportMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'staff';
  body: string;
  timestamp: string;
  isInternal?: boolean;
}

export function SupportDashboard() {
  const [inquiries, setInquiries] = useKV<SupportInquiry[]>('support-inquiries', []);
  const [patients, setPatients] = useKV<Patient[]>('support-patients', []);
  const [messages, setMessages] = useKV<SupportMessage[]>('support-messages', []);
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null);
  const [isInternal, setIsInternal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [activeFilter, setActiveFilter] = useState<SupportInquiryStatus | 'all'>('all');

  const sortedInquiries = useMemo(() => {
    const statusOrder: Record<SupportInquiryStatus, number> = { 
      new: 0, 
      inProgress: 1, 
      followUp: 2,
      resolved: 3 
    };
    return [...(inquiries || [])].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    if (activeFilter === 'all') return sortedInquiries;
    return sortedInquiries.filter(inq => inq.status === activeFilter);
  }, [sortedInquiries, activeFilter]);

  const inquiryMessages = useMemo(() => {
    if (!selectedInquiry) return [];
    return (messages || []).filter(msg => msg.inquiryId === selectedInquiry.id);
  }, [messages, selectedInquiry]);

  const stats = useMemo(() => ({
    new: (inquiries || []).filter(i => i.status === 'new').length,
    inProgress: (inquiries || []).filter(i => i.status === 'inProgress').length,
    followUp: (inquiries || []).filter(i => i.status === 'followUp').length,
    resolved: (inquiries || []).filter(i => i.status === 'resolved').length
  }), [inquiries]);

  const getPatientName = (patientId: string) => {
    const patient = (patients || []).find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getCategoryIcon = (category: SupportInquiryCategory) => {
    switch (category) {
      case 'technical': return <DesktopTower className="w-4 h-4" weight="duotone" />;
      case 'billing': return <CreditCard className="w-4 h-4" weight="duotone" />;
      case 'insurance': return <Question className="w-4 h-4" weight="duotone" />;
      default: return <Headset className="w-4 h-4" weight="duotone" />;
    }
  };

  const getStatusBadge = (status: SupportInquiryStatus) => {
    const variants = {
      new: 'bg-blue-600 text-white',
      inProgress: 'bg-amber-600 text-white',
      followUp: 'bg-purple-600 text-white',
      resolved: 'bg-green-600 text-white'
    };
    return <Badge className={variants[status]}>{status.replace(/([A-Z])/g, ' $1').trim()}</Badge>;
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const variants = {
      low: 'bg-slate-500 text-white',
      medium: 'bg-slate-600 text-white',
      high: 'bg-red-600 text-white'
    };
    return <Badge className={variants[priority]}>{priority}</Badge>;
  };

  const handleSendMessage = () => {
    if (!selectedInquiry || !messageText.trim()) return;

    const newMessage: SupportMessage = {
      id: `msg-${Date.now()}`,
      inquiryId: selectedInquiry.id,
      senderId: 'staff-001',
      senderName: 'Support Team',
      senderRole: 'staff',
      body: messageText,
      timestamp: new Date().toISOString(),
      isInternal
    };

    setMessages(current => [...(current || []), newMessage]);
    setMessageText('');
    setIsInternal(false);
    toast.success('Message sent');

    setInquiries(current =>
      (current || []).map(inq =>
        inq.id === selectedInquiry.id
          ? { ...inq, status: 'inProgress' as SupportInquiryStatus }
          : inq
      )
    );
  };

  const handleUpdateStatus = (inquiryId: string, newStatus: SupportInquiryStatus) => {
    setInquiries(current =>
      (current || []).map(inq =>
        inq.id === inquiryId ? { ...inq, status: newStatus } : inq
      )
    );
    if (selectedInquiry?.id === inquiryId) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-br from-card via-secondary to-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-purple-600 shadow-lg">
              <Headset size={24} weight="bold" className="text-white sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.02em' }}>
                Support Portal
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                Administrative customer service system
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('new')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" weight="duotone" />
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
  );
}
