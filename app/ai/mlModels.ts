export type Opportunity = {
  id: string
  title: string
  agency: string
  naics?: string
  dueDate?: string
}

export type CompanyProfile = {
  primaryNaics?: string[]
  targetAgencies?: string[]
}
