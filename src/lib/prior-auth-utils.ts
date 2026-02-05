import { PriorAuthorization, Appointment } from '@/lib/types'
import { unitTracker } from '@/lib/workflow-engine'

export function processAppointmentCompletion(
  appointment: Appointment,
  priorAuths: PriorAuthorization[],
  updatePriorAuth: (authId: string, updates: Partial<PriorAuthorization>) => void
): void {
  const relatedAuth = priorAuths.find(
    auth => 
      auth.patientId === appointment.patientId &&
      auth.status === 'active' &&
      new Date(auth.startDate) <= new Date(appointment.dateTime) &&
      new Date(auth.endDate) >= new Date(appointment.dateTime)
  )

  if (relatedAuth) {
    const updatedAuth = unitTracker(relatedAuth, 1)
    updatePriorAuth(relatedAuth.id, {
      usedUnits: updatedAuth.usedUnits,
      status: updatedAuth.status,
      updatedAt: updatedAuth.updatedAt,
    })
  }
}

export function checkAuthorizationForCase(
  patientId: string,
  priorAuths: PriorAuthorization[]
): PriorAuthorization | null {
  const activeAuths = priorAuths.filter(
    auth => auth.patientId === patientId && auth.status === 'active'
  )

  if (activeAuths.length === 0) {
    return null
  }

  return activeAuths.sort((a, b) => {
    const aRemaining = a.totalUnits - a.usedUnits
    const bRemaining = b.totalUnits - b.usedUnits
    return bRemaining - aRemaining
  })[0]
}

export function getAuthorizationSummary(auth: PriorAuthorization): {
  remaining: number
  percentUsed: number
  daysUntilExpiration: number
  isExpiringSoon: boolean
  isLowUnits: boolean
} {
  const now = new Date()
  const endDate = new Date(auth.endDate)
  const remaining = auth.totalUnits - auth.usedUnits
  const percentUsed = (auth.usedUnits / auth.totalUnits) * 100
  const daysUntilExpiration = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    remaining,
    percentUsed,
    daysUntilExpiration,
    isExpiringSoon: daysUntilExpiration <= 30 && daysUntilExpiration > 0,
    isLowUnits: remaining <= 3 && remaining > 0,
  }
}
