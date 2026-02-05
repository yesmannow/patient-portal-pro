import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
  Desktop
  CheckCircle,
  Question,
  CreditCard,
  Warning
import { toas
import type
interface 
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
  const [activeFilter, 
 

      followUp: 2,
    };
  }, [inquiries]);
  const filteredInquiries = useMemo(() => {
    return sortedInquiries.filter(inq => inq.status === activeFilter);

    if (!selectedInquiry) return [];
  }, [messages, selectedInquiry]);

    inProgress: (inquiries || []).filter(
    resolved: (inquiries || []).filter(i => i.status === 'resolv

    const patient = (
  };
  const getCategor
      
      case 'insurance': return <Question className="w-4 h-4" weight="duotone" />;
    }

    const variants = {
      inProgress: 'bg-amber-600 text-white',
      resolved: 'bg-green-600 text-white'
    return <Badge className={variants[

    const variants = {
      medium: 'bg-slate-600 text-whi
    };
  };

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
                
              
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer" onClick={() => setActiveFilter('new')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" weight="duotone" />
                <div clas






























































































































































































  );

