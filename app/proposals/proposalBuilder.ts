// app/proposals/proposalBuilder.ts

import { Opportunity, CompanyProfile } from '@/app/ai/mlModels'

export type ProposalSection = {
  id: string
  title: string
  body: string
}

export type DraftProposal = {
  opportunityId: string
  companyId: string
  title: string
  sections: ProposalSection[]
}

/**
 * Create a structured draft proposal as Markdown-style text sections.
 * You can later plug this into OpenAI to expand each section.
 */
export function buildDraftProposal(
  opp: Opportunity,
  company: CompanyProfile
): DraftProposal {
  const title = `${company.name} – Proposal for ${opp.title}`

  const sections: ProposalSection[] = [
    {
      id: 'exec-summary',
      title: 'Executive Summary',
      body: `This proposal outlines how ${company.name} will deliver high-quality services to ${opp.agency} for "${opp.title}".`,
    },
    {
      id: 'understanding',
      title: 'Understanding of the Requirements',
      body: `We understand that the government requires support in ${opp.title} under NAICS ${opp.naics ?? 'N/A'}.`,
    },
    {
      id: 'approach',
      title: 'Technical Approach & Methodology',
      body: `Our approach is structured around planning, execution, quality assurance, and continuous improvement.`,
    },
    {
      id: 'management',
      title: 'Management & Staffing',
      body: `Our project management structure ensures clear communication, risk management, and timely delivery.`,
    },
    {
      id: 'past-performance',
      title: 'Relevant Past Performance',
      body: `We leverage prior performance that is similar in scope and complexity to this requirement.`,
    },
    {
      id: 'pricing',
      title: 'Pricing & Assumptions',
      body: `Pricing will be aligned with the solicitation and any applicable schedules or rate cards.`,
    },
  ]

  return {
    opportunityId: opp.id,
    companyId: company.id,
    title,
    sections,
  }
}
