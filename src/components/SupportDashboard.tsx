import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Headset,
  Clock,
  ArrowsClockwise,
  CheckCircle,
  Question,
  CreditCard,
  Warning,
  DesktopTower,
  PaperPlaneRight
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { SupportInquiry, Patient, SupportInquiryStatus, SupportInquiryCategory, SupportMessage } from '@/lib/types';

export function SupportDashboard() {
  const [inquiries, setInquiries] = useKV<SupportInquiry[]>('support-inquiries', []);
  const [messages, setMessages] = useKV<SupportMessage[]>('support-messages', []);
  const [patients, setPatients] = useKV<Patient[]>('patients', []);
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null);
  const [activeFilter, setActiveFilter] = useState<SupportInquiryStatus>('new');
  const [messageText, setMessageText] = useState('');
  const [isInternal, setIsInternal] = useState(false);

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
              <div className="text-2xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground">Unassigned inquiries</p>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('inProgress')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <ArrowsClockwise className="h-4 w-4 text-amber-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Active conversations</p>
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('followUp')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Follow Up</CardTitle>
              <Warning className="h-4 w-4 text-purple-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.followUp}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="hover:border-green-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('resolved')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" weight="duotone" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Completed inquiries</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Inquiry Queue</CardTitle>
              <CardDescription>Filter: {activeFilter}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {filteredInquiries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No {activeFilter} inquiries
                    </p>
                  ) : (
                    filteredInquiries.map(inquiry => (
                      <Card
                        key={inquiry.id}
                        className={`cursor-pointer transition-colors hover:border-primary ${
                          selectedInquiry?.id === inquiry.id ? 'border-primary bg-accent/5' : ''
                        }`}
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(inquiry.category)}
                                <span className="font-medium text-sm">{inquiry.subject}</span>
                              </div>
                              {getPriorityBadge(inquiry.priority)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getPatientName(inquiry.patientId)}
                            </p>
                            <div className="flex items-center justify-between">
                              {getStatusBadge(inquiry.status)}
                              <span className="text-xs text-muted-foreground">
                                {new Date(inquiry.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Message Thread</CardTitle>
                  {selectedInquiry && (
                    <CardDescription>
                      {selectedInquiry.subject} - {getPatientName(selectedInquiry.patientId)}
                    </CardDescription>
                  )}
                </div>
                {selectedInquiry && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedInquiry.status}
                      onValueChange={(value) => handleUpdateStatus(selectedInquiry.id, value as SupportInquiryStatus)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="followUp">Follow Up</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedInquiry ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <Headset size={48} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
                    <p className="text-muted-foreground">Select an inquiry to view messages</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(selectedInquiry.category)}
                          <span className="font-semibold">{selectedInquiry.subject}</span>
                        </div>
                        <p className="text-sm text-foreground">{selectedInquiry.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(selectedInquiry.createdAt).toLocaleString()}
                          </span>
                          {getPriorityBadge(selectedInquiry.priority)}
                        </div>
                      </div>

                      {inquiryMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg ${
                            msg.senderRole === 'staff'
                              ? 'bg-primary/10 ml-8'
                              : 'bg-accent/10 mr-8'
                          } ${msg.isInternal ? 'border-2 border-amber-500' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{msg.senderName}</span>
                            {msg.isInternal && (
                              <Badge className="bg-amber-600 text-white text-xs">Internal Note</Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{msg.body}</p>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="space-y-3 border-t pt-4">
                    <div>
                      <Label htmlFor="message-text">Reply</Label>
                      <Textarea
                        id="message-text"
                        placeholder="Type your response..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={4}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="internal-note"
                          checked={isInternal}
                          onCheckedChange={setIsInternal}
                        />
                        <Label htmlFor="internal-note" className="text-sm cursor-pointer">
                          Internal note (not visible to patient)
                        </Label>
                      </div>
                      <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                        <PaperPlaneRight className="w-4 h-4 mr-2" weight="bold" />
                        Send
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
