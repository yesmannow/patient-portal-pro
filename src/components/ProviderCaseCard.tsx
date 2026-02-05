import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Case, CaseStatus } from '@/lib/types'
import { CheckCircle, Warning, Clock } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface ProviderCaseCardProps {
  case: Case
  onClick: () => void
  onStatusChange: (caseId: string, newStatus: CaseStatus) => void
}

const statusColors = {
  'open': 'bg-blue-500 text-white',
  'awaitingPatient': 'bg-amber-500 text-white',
  'awaitingProvider': 'bg-purple-500 text-white',
  'resolved': 'bg-green-600 text-white',
}

const urgencyColors = {
  urgent: 'border-l-red-600',
  timeSensitive: 'border-l-amber-500',
  routine: 'border-l-blue-500',
}

const urgencyLabels = {
  urgent: 'Urgent',
  timeSensitive: 'Time-Sensitive',
  routine: 'Routine',
}

const caseTypeLabels = {
  question: 'Question',
  followUp: 'Follow-Up',
  billing: 'Billing',
  clinicalConcern: 'Clinical Concern',
  admin: 'Administrative',
}

export function ProviderCaseCard({ case: caseItem, onClick, onStatusChange }: ProviderCaseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className={`cursor-pointer border-l-4 ${urgencyColors[caseItem.urgency]} hover:border-primary/30 hover:shadow-md transition-all`}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{caseItem.subject}</h3>
                <Badge variant="outline" className="text-xs">
                  {caseTypeLabels[caseItem.caseType]}
                </Badge>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  {caseItem.urgency === 'urgent' && <Warning className="w-3 h-3" weight="fill" />}
                  {caseItem.urgency === 'timeSensitive' && <Clock className="w-3 h-3" weight="fill" />}
                  {urgencyLabels[caseItem.urgency]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {caseItem.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Case #{caseItem.id.slice(-6)}</span>
                <span>•</span>
                <span>Created {format(new Date(caseItem.createdAt), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>Updated {format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
              <Select 
                value={caseItem.status} 
                onValueChange={(value) => onStatusChange(caseItem.id, value as CaseStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="awaitingPatient">Awaiting Patient</SelectItem>
                  <SelectItem value="awaitingProvider">Awaiting Provider</SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" weight="fill" />
                      Resolved
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
