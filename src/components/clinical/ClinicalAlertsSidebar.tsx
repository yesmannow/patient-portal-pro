import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  BellSlash,
  CheckCircle,
  XCircle,
  Warning,
  Info,
  Heartbeat,
  Shield,
  Pill,
  ChartBar,
  X
} from '@phosphor-icons/react'
import type { RuleAlert } from '@/types/clinical'
import { toast } from 'sonner'

interface ClinicalAlertsSidebarProps {
  alerts: RuleAlert[]
  onAcknowledge: (alertId: string) => void
  onDismiss: (alertId: string) => void
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ClinicalAlertsSidebar({ 
  alerts, 
  onAcknowledge, 
  onDismiss,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}: ClinicalAlertsSidebarProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('active')
  
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'active') return alert.status === 'active'
    if (filter === 'acknowledged') return alert.status === 'acknowledged'
    return true
  })

  const activeCount = alerts.filter(a => a.status === 'active').length

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <Warning size={20} weight="fill" className="text-destructive" />
      case 'medium':
        return <Warning size={20} weight="fill" className="text-warning" />
      case 'low':
        return <Info size={20} weight="fill" className="text-info" />
      default:
        return <Bell size={20} />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'preventive-care':
        return <Shield size={18} />
      case 'chronic-disease':
        return <Heartbeat size={18} />
      case 'medication-safety':
        return <Pill size={18} />
      case 'quality-measure':
        return <ChartBar size={18} />
      default:
        return <Bell size={18} />
    }
  }

  const getSeverityBadgeVariant = (severity: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      default:
        return 'secondary'
    }
  }

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-20 z-50">
        <Button
          onClick={onToggleCollapse}
          variant="default"
          size="lg"
          className="rounded-full shadow-lg relative"
        >
          <Bell size={24} weight="fill" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell size={24} weight="bold" className="text-primary" />
            <h3 className="text-lg font-semibold">Clinical Alerts</h3>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
            className="flex-1"
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={filter === 'acknowledged' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('acknowledged')}
            className="flex-1"
          >
            Reviewed
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            All
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellSlash size={48} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {filter === 'active' ? 'No active alerts' : 'No alerts to display'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={alert.status === 'active' ? 'border-l-4 border-l-destructive' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                            {alert.severity}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getCategoryIcon(alert.category)}
                            <span className="text-xs capitalize">
                              {alert.category.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-sm font-semibold leading-tight">
                          {alert.ruleName}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-foreground mb-3">
                    {alert.message}
                  </p>
                  
                  {alert.recommendation && (
                    <Alert className="mb-3 bg-accent/10 border-accent/30">
                      <Info size={16} className="text-accent" />
                      <AlertDescription className="text-xs">
                        <strong>Recommendation:</strong> {alert.recommendation}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>Triggered: {new Date(alert.triggeredAt).toLocaleTimeString()}</span>
                    {alert.metadata?.cqmId && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <span>CQM: {alert.metadata.cqmId}</span>
                      </>
                    )}
                  </div>

                  {alert.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          onAcknowledge(alert.id)
                          toast.success('Alert acknowledged')
                        }}
                        className="flex-1"
                      >
                        <CheckCircle size={16} weight="fill" className="mr-1" />
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onDismiss(alert.id)
                          toast.info('Alert dismissed')
                        }}
                      >
                        <XCircle size={16} />
                      </Button>
                    </div>
                  )}

                  {alert.status === 'acknowledged' && alert.acknowledgedAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle size={14} weight="fill" className="text-success" />
                      <span>Reviewed {new Date(alert.acknowledgedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
