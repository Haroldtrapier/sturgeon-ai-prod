import type { NextApiRequest, NextApiResponse } from "next";

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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rawRequirements, title } = req.body as GenerateRequestBody;

    if (!rawRequirements || typeof rawRequirements !== "string") {
      return res.status(400).json({ error: "rawRequirements is required" });
    }

    // Generate a unique proposal ID
    const proposalId = `PROP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Simulate AI processing - In production, this would call an AI service
    // For now, we'll generate mock responses based on the input
    const analysis = generateAnalysis(rawRequirements, title);
    const outline = generateOutline(rawRequirements, title);
    const draft = generateDraft(rawRequirements, title);

    const result: GenerateResult = {
      proposalId,
      analysis,
      outline,
      draft,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error generating proposal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function generateAnalysis(requirements: string, title?: string): string {
  const wordCount = requirements.split(/\s+/).length;
  const hasTitle = title && title.trim().length > 0;
  
  return `REQUIREMENTS ANALYSIS
${hasTitle ? `\nOpportunity: ${title}` : ""}

Document Overview:
- Total words: ${wordCount}
- Estimated complexity: ${wordCount > 500 ? "High" : wordCount > 200 ? "Medium" : "Low"}

Key Requirements Identified:
${extractKeyRequirements(requirements)}

Compliance Considerations:
- All requirements must be addressed in the proposal
- Technical specifications need detailed response
- Delivery timelines should be clearly defined

Risk Assessment:
- Medium risk based on requirements complexity
- Adequate resources needed for timely delivery
- Quality assurance processes recommended`;
}

function generateOutline(requirements: string, title?: string): string {
  const hasTitle = title && title.trim().length > 0;
  
  return `PROPOSAL OUTLINE
${hasTitle ? `\nFor: ${title}` : ""}

I. EXECUTIVE SUMMARY
   - Overview of proposed solution
   - Key benefits and value proposition

II. TECHNICAL APPROACH
   - Methodology and framework
   - Implementation strategy
   - Quality assurance measures

III. MANAGEMENT PLAN
   - Project organization
   - Timeline and milestones
   - Resource allocation

IV. PAST PERFORMANCE
   - Relevant experience
   - Success stories
   - Client references

V. PRICING
   - Cost breakdown
   - Payment terms
   - Value justification

VI. APPENDICES
   - Supporting documentation
   - Technical specifications
   - Certifications and credentials`;
}

function generateDraft(requirements: string, title?: string): string {
  const hasTitle = title && title.trim().length > 0;
  
  return `PROPOSAL DRAFT
${hasTitle ? `\nRE: ${title}` : ""}

EXECUTIVE SUMMARY

We are pleased to submit this proposal in response to your requirements. Our organization brings extensive experience and proven capabilities to deliver exceptional results that meet and exceed your expectations.

UNDERSTANDING OF REQUIREMENTS

Based on our analysis of the provided requirements, we understand that you need a comprehensive solution that addresses the following key areas:

${extractKeyRequirements(requirements)}

PROPOSED SOLUTION

Our approach is structured to deliver maximum value through:

1. Strategic Planning: We will work closely with your team to ensure alignment with organizational goals and objectives.

2. Technical Excellence: Our solution leverages industry best practices and cutting-edge technologies to deliver robust, scalable results.

3. Quality Assurance: Every deliverable undergoes rigorous testing and validation to ensure it meets the highest standards.

4. Ongoing Support: We provide comprehensive support throughout the project lifecycle and beyond.

PROJECT TIMELINE

We propose a phased approach with clear milestones:
- Phase 1: Planning and Requirements Validation (Weeks 1-2)
- Phase 2: Implementation (Weeks 3-8)
- Phase 3: Testing and Quality Assurance (Weeks 9-10)
- Phase 4: Deployment and Training (Weeks 11-12)

CONCLUSION

We are confident that our solution represents the best value for your organization. Our team is ready to begin immediately upon contract award.

Thank you for considering our proposal. We look forward to the opportunity to serve you.`;
}

function extractKeyRequirements(requirements: string): string {
  // Simple extraction of first few sentences or key points
  const sentences = requirements
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 20)
    .slice(0, 5);
  
  if (sentences.length === 0) {
    return "- Comprehensive solution delivery\n- Quality standards compliance\n- Timely project completion";
  }
  
  return sentences.map((s, i) => `- ${s.trim()}`).join("\n");
}
