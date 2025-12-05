/**
 * Core data models for AI/ML features
 */

export type Opportunity = {
  id: string
  title: string
  agency: string
  naics?: string
}

export type CompanyProfile = {
  id: string
  name: string
}
