export type Opportunity = {
  id: string
  title: string
  agency: string
  value: number
  naics?: string
  psc?: string
  dueDate?: string // ISO
  vehicle?: string
  pastPerformanceSimilarity?: number // 0–1
  strategicFitScore?: number // 0–1 (from your own rules)
}

export type CompanyProfile = {
  id: string
  name: string
  isSDVOSB?: boolean
  is8a?: boolean
  isHubZone?: boolean
  isWosb?: boolean
  primaryNaics?: string[]
  targetAgencies?: string[]
  maxCapacity?: number
}

export type WinPrediction = {
  opportunityId: string
  probability: number // 0–1
  drivers: string[]
}

export type TrendSignal = {
  segment: string
  direction: 'up' | 'down' | 'flat'
  confidence: number // 0–1
  notes: string
}

/**
 * Rule-based "v1 model" so we can ship now.
 * Replace internals later with real ML (e.g., call out to a hosted model).
 */
export function predictWinProbability(
  opp: Opportunity,
  company: CompanyProfile
): WinPrediction {
  let prob = 0.35
  const drivers: string[] = []

  // NAICS fit
  if (company.primaryNaics?.includes(opp.naics ?? '')) {
    prob += 0.15
    drivers.push('Primary NAICS match')
  }

  // Target agency
  if (company.targetAgencies?.includes(opp.agency)) {
    prob += 0.1
    drivers.push('Target agency alignment')
  }

  // Past performance similarity
  if (opp.pastPerformanceSimilarity !== undefined) {
    const boost = 0.2 * opp.pastPerformanceSimilarity
    prob += boost
    drivers.push(`Past performance similarity: +${boost.toFixed(2)}`)
  }

  // Small business edge
  if (company.isSDVOSB || company.is8a || company.isHubZone || company.isWosb) {
    prob += 0.05
    drivers.push('Small business / set-aside eligibility')
  }

  // Strategic fit score (0–1)
  if (opp.strategicFitScore !== undefined) {
    const boost = 0.15 * opp.strategicFitScore
    prob += boost
    drivers.push(`Strategic fit: +${boost.toFixed(2)}`)
  }

  // Clamp
  prob = Math.max(0.05, Math.min(0.95, prob))

  return {
    opportunityId: opp.id,
    probability: prob,
    drivers,
  }
}

/**
 * Very simple trend analysis to get you started.
 * Later you can feed historical award data in and replace this logic.
 */
export function analyzeAwardTrends(
  awards: { agency: string; naics?: string; value: number; date: string }[]
): TrendSignal[] {
  if (!awards.length) return []

  const byAgency = new Map<string, number>()
  for (const a of awards) {
    byAgency.set(a.agency, (byAgency.get(a.agency) ?? 0) + a.value)
  }

  const total = Array.from(byAgency.values()).reduce((acc, v) => acc + v, 0)

  return Array.from(byAgency.entries()).map(([agency, sum]) => {
    const share = sum / total
    let direction: 'up' | 'down' | 'flat' = 'flat'
    if (share > 0.2) direction = 'up'
    else if (share < 0.05) direction = 'down'

    return {
      segment: agency,
      direction,
      confidence: 0.6,
      notes: `Agency ${agency} represents ${(share * 100).toFixed(
        1
      )}% of recent award value`,
    }
  })
}
