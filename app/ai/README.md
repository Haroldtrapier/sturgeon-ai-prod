# AI Recommendation Engine

This module provides AI-powered recommendation capabilities for ranking business opportunities.

## Overview

The recommendation engine evaluates opportunities based on multiple factors including:
- Industry alignment
- Skills match
- Historical performance
- Project complexity vs. capacity
- Opportunity value
- Due date recency

## Usage

### Basic Example

```typescript
import { rankOpportunities } from '@/app/ai/recommendationEngine'
import { Opportunity, CompanyProfile } from '@/app/ai/mlModels'

// Define your opportunities
const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Enterprise CRM Implementation',
    description: 'Large scale CRM deployment',
    value: 250000,
    dueDate: '2024-01-15',
    customerIndustry: 'technology',
    complexity: 'high',
    requiredSkills: ['CRM', 'Cloud', 'Integration'],
  },
  // ... more opportunities
]

// Define your company profile
const company: CompanyProfile = {
  name: 'Tech Solutions Inc',
  industry: 'technology',
  expertise: ['CRM', 'Cloud', 'Data Science'],
  pastWinRate: 0.65,
  capacity: 0.8,
}

// Get ranked opportunities
const ranked = rankOpportunities(opportunities, company)

// Use the results
ranked.forEach((opp) => {
  console.log(`${opp.title}: Score ${opp.score}`)
  console.log(`Win Probability: ${opp.winProbability * 100}%`)
  console.log(`Reasons: ${opp.reasons.join(', ')}`)
})
```

## Types

### Opportunity

```typescript
type Opportunity = {
  id: string
  title: string
  description: string
  value: number
  dueDate?: string // ISO date string
  customerIndustry?: string
  complexity?: 'low' | 'medium' | 'high'
  requiredSkills?: string[]
}
```

### CompanyProfile

```typescript
type CompanyProfile = {
  name: string
  industry: string
  expertise: string[] // List of company skills/expertise areas
  pastWinRate: number // Historical win rate (0.0 to 1.0)
  capacity: number // Current capacity (0.0 to 1.0)
}
```

### RankedOpportunity

```typescript
type RankedOpportunity = Opportunity & {
  score: number // Overall ranking score (0.0 to 1.0+)
  winProbability: number // Predicted win probability (0.0 to 1.0)
  reasons: string[] // Explanation of ranking factors
}
```

## Scoring Algorithm

The ranking algorithm combines two main factors:

1. **Win Probability (80% weight)**: Calculated using `predictWinProbability()` which evaluates:
   - Industry alignment (+15% if matches)
   - Skills match (up to +20% based on match rate)
   - Historical performance (±30% based on past win rate)
   - Complexity vs. capacity fit (up to +10%)

2. **Recency Boost (20% weight)**: Opportunities with closer due dates receive higher scores:
   - Calculated as: `1 - min(60, days_until_due) / 60`
   - Maximum boost for opportunities due within 0 days
   - Minimum boost for opportunities due in 60+ days

Final score = `winProbability * 0.8 + recencyBoost * 0.2`

Opportunities are returned sorted by score in descending order (highest score first).
