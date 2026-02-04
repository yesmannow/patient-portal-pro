import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Case, CaseStatus } from '@/lib/types'
import { CheckCircle } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface ProviderCaseCardProps {
  case: Case
  onClick: () => void
  onStatusChange: (caseId: string, newStatus: CaseStatus) => void
}

const statusColors = {
  'Open': 'bg-[var(--status-open)] text-white',
  'In Review': 'bg-[var(--status-review)] text-white',
  'Waiting on Client': 'bg-[var(--status-waiting)] text-white',
  'Resolved': 'bg-[var(--status-resolved)] text-white',
}

const priorityColors = {
  high: 'border-l-[var(--priority-high)]',
  medium: 'border-l-[var(--priority-medium)]',
  low: 'border-l-[var(--priority-low)]',
}

export function ProviderCaseCard({ case: caseItem, onClick, onStatusChange }: ProviderCaseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className={`cursor-pointer border-l-4 ${priorityColors[caseItem.priority]} hover:border-primary/30 hover:shadow-md transition-all`}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{caseItem.subject}</h3>
                <Badge variant="outline" className="text-xs">
                  {caseItem.priority.toUpperCase()}
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
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Waiting on Client">Waiting on Client</SelectItem>
                  <SelectItem value="Resolved">
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
