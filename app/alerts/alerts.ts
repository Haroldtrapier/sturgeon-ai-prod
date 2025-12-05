import { Opportunity, CompanyProfile } from '@/app/ai/mlModels'

export type AlertType = 'deadline' | 'high-fit' | 'watchlist'

export type Alert = {
  id: string
  type: AlertType
  opportunityId: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  dueDate?: string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function generateAlerts(
  opportunities: Opportunity[],
  company: CompanyProfile,
  today: Date = new Date()
): Alert[] {
  const alerts: Alert[] = []
  const todayMs = today.getTime()

  for (const opp of opportunities) {
    if (opp.dueDate) {
      const dueMs = new Date(opp.dueDate).getTime()
      const diffDays = (dueMs - todayMs) / MS_PER_DAY

      if (diffDays <= 7 && diffDays >= 0) {
        alerts.push({
          id: `deadline-${opp.id}`,
          type: 'deadline',
          opportunityId: opp.id,
          message: `Proposal due in ${Math.ceil(
            diffDays
          )} day(s) for "${opp.title}".`,
          severity: diffDays <= 3 ? 'critical' : 'warning',
          dueDate: opp.dueDate,
        })
      }
    }

    // high-fit based on simple rules: NAICS + target agency
    const isNaicsFit =
      opp.naics && company.primaryNaics?.includes(opp.naics)
    const isAgencyFit =
      company.targetAgencies?.includes(opp.agency) ?? false

    if (isNaicsFit && isAgencyFit) {
      alerts.push({
        id: `fit-${opp.id}`,
        type: 'high-fit',
        opportunityId: opp.id,
        message: `High-fit opportunity detected at ${opp.agency}: "${opp.title}".`,
        severity: 'info',
      })
    }
  }

  return alerts
}
