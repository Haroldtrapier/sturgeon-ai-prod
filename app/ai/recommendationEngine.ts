import {
  Opportunity,
  CompanyProfile,
  predictWinProbability,
} from '@/app/ai/mlModels'

export type RankedOpportunity = Opportunity & {
  score: number
  winProbability: number
  reasons: string[]
}

export function rankOpportunities(
  opportunities: Opportunity[],
  company: CompanyProfile
): RankedOpportunity[] {
  const ranked: RankedOpportunity[] = opportunities.map((opp) => {
    const prediction = predictWinProbability(opp, company)
    const recencyBoost = opp.dueDate
      ? Math.max(
          0,
          1 -
            Math.min(
              60,
              (new Date(opp.dueDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            ) /
              60
        )
      : 0

    const score = prediction.probability * 0.8 + recencyBoost * 0.2

    return {
      ...opp,
      score,
      winProbability: prediction.probability,
      reasons: prediction.drivers,
    }
  })

  return ranked.sort((a, b) => b.score - a.score)
}
