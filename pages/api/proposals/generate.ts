import type { NextApiRequest, NextApiResponse } from 'next';

type GenerateRequestBody = {
  rawRequirements: string;
  title?: string;
};

type GenerateResult = {
  proposalId: string;
  analysis: string;
  outline: string;
  draft: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResult | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rawRequirements, title } = req.body as GenerateRequestBody;

    if (!rawRequirements || rawRequirements.trim().length === 0) {
      return res.status(400).json({ error: 'Requirements are required' });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock proposal data
    const proposalId = `prop_${Date.now()}`;
    
    const analysis = generateMockAnalysis(rawRequirements, title);
    const outline = generateMockOutline(rawRequirements, title);
    const draft = generateMockDraft(rawRequirements, title);

    return res.status(200).json({
      proposalId,
      analysis,
      outline,
      draft,
    });
  } catch (error) {
    console.error('Error generating proposal:', error);
    return res.status(500).json({ error: 'Failed to generate proposal' });
  }
}

function generateMockAnalysis(requirements: string, title?: string): string {
  return `Requirements Analysis${title ? ` for "${title}"` : ''}

Key Requirements Identified:
- Primary objective: Address the core needs outlined in the solicitation
- Compliance: Meet all mandatory requirements
- Technical approach: Demonstrate capability and expertise
- Past performance: Showcase relevant experience

Requirements Summary:
${requirements.substring(0, 200)}${requirements.length > 200 ? '...' : ''}

Critical Success Factors:
1. Clear understanding of client needs
2. Demonstrated technical capability
3. Competitive pricing structure
4. Strong past performance record

Risk Assessment:
- Low risk: Team has relevant experience
- Medium risk: Timeline may be aggressive
- Mitigation: Allocate appropriate resources`;
}

function generateMockOutline(requirements: string, title?: string): string {
  return `Proposal Outline${title ? ` - ${title}` : ''}

I. Executive Summary
   A. Overview
   B. Key Benefits
   C. Differentiators

II. Technical Approach
   A. Understanding of Requirements
   B. Proposed Solution
   C. Methodology
   D. Innovation

III. Management Plan
   A. Project Organization
   B. Key Personnel
   C. Schedule
   D. Quality Assurance

IV. Past Performance
   A. Relevant Projects
   B. Client References
   C. Lessons Learned

V. Cost Proposal
   A. Pricing Structure
   B. Cost Breakdown
   C. Value Proposition

VI. Conclusion`;
}

function generateMockDraft(requirements: string, title?: string): string {
  return `DRAFT PROPOSAL${title ? ` - ${title}` : ''}

EXECUTIVE SUMMARY

We are pleased to submit this proposal in response to your solicitation. Our team brings extensive experience and proven capabilities to deliver exceptional results that meet and exceed your requirements.

Our approach is centered on understanding your unique needs and delivering a solution that is:
- Technically sound and innovative
- Cost-effective and within budget
- Delivered on time with superior quality

TECHNICAL APPROACH

Based on our analysis of the requirements:
${requirements.substring(0, 150)}${requirements.length > 150 ? '...' : ''}

We propose a comprehensive solution that addresses each requirement systematically. Our methodology has been refined through years of successful project delivery.

QUALIFICATIONS

Our team consists of highly qualified professionals with:
- 10+ years of relevant industry experience
- Proven track record of successful project delivery
- Industry certifications and expertise
- Strong client relationships and references

CONCLUSION

We are confident that our proposed solution represents the best value for your organization. We look forward to the opportunity to discuss this proposal further and answer any questions you may have.

Thank you for your consideration.`;
}
