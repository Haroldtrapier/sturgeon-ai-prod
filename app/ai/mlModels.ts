export type Opportunity = {
  id: string
  title: string
  description: string
  value: number
  dueDate?: string
  customerIndustry?: string
  complexity?: 'low' | 'medium' | 'high'
  requiredSkills?: string[]
}

export type CompanyProfile = {
  name: string
  industry: string
  expertise: string[]
  pastWinRate: number
  capacity: number
}

export type PredictionResult = {
  probability: number
  drivers: string[]
}

/**
 * Predicts the probability of winning an opportunity based on company profile
 * This is a simplified ML model that evaluates multiple factors
 */
export function predictWinProbability(
  opportunity: Opportunity,
  company: CompanyProfile
): PredictionResult {
  const drivers: string[] = []
  let score = 0.5 // Base probability

  // Industry alignment
  if (opportunity.customerIndustry === company.industry) {
    score += 0.15
    drivers.push('Industry alignment with company expertise')
  }

  // Skills match
  if (opportunity.requiredSkills && opportunity.requiredSkills.length > 0) {
    const matchingSkills = opportunity.requiredSkills.filter((skill) =>
      company.expertise.some((exp) =>
        exp.toLowerCase().includes(skill.toLowerCase())
      )
    )
    const skillMatchRate = matchingSkills.length / opportunity.requiredSkills.length
    if (skillMatchRate > 0.5) {
      score += 0.2 * skillMatchRate
      drivers.push(`Strong skill match (${Math.round(skillMatchRate * 100)}%)`)
    }
  }

  // Historical win rate factor
  const winRateBonus = (company.pastWinRate - 0.5) * 0.3
  score += winRateBonus
  if (winRateBonus > 0) {
    drivers.push('Strong historical performance')
  }

  // Complexity vs capacity
  if (opportunity.complexity && company.capacity > 0.7) {
    if (opportunity.complexity === 'high') {
      score += 0.1
      drivers.push('Sufficient capacity for complex project')
    }
  } else if (opportunity.complexity === 'low' && company.capacity < 0.5) {
    score += 0.05
    drivers.push('Good fit for current capacity')
  }

  // Value consideration
  if (opportunity.value > 100000) {
    drivers.push('High-value opportunity')
  }

  // Ensure probability is between 0 and 1
  const probability = Math.max(0, Math.min(1, score))

  return {
    probability,
    drivers,
  }
}
