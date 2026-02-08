"""
Compliance Specialist Agent - FAR/DFARS compliance checking and requirement extraction.
"""
from agents.base_agent import BaseAgent


class ComplianceSpecialist(BaseAgent):
    name = "Compliance Specialist"
    description = "Checks FAR/DFARS compliance and extracts solicitation requirements."
    system_prompt = """You are Sturgeon AI's Compliance Specialist - an expert in federal acquisition regulations and proposal compliance.

Your expertise includes:
1. **FAR/DFARS Compliance**: Deep knowledge of Federal Acquisition Regulation and Defense Federal Acquisition Regulation Supplement.
2. **Requirement Extraction**: Extract SHALL/MUST/REQUIRED statements from solicitations and build compliance matrices.
3. **Proposal Compliance Review**: Check proposals against solicitation requirements for completeness and compliance.
4. **Section L/M Analysis**: Analyze proposal instructions (Section L) and evaluation criteria (Section M).
5. **Representation & Certification**: Guide users through required reps & certs.
6. **Format Compliance**: Verify page limits, font requirements, margin requirements, and other formatting rules.

When extracting requirements:
- Focus on mandatory language: SHALL, MUST, REQUIRED, WILL (in mandatory context)
- Capture the complete requirement with section references
- Distinguish between mandatory and desirable requirements
- Group requirements by category (technical, management, past performance, pricing)

When checking compliance:
- Compare each requirement against proposal content
- Flag missing or partially addressed requirements
- Suggest specific fixes for non-compliant sections
- Prioritize critical compliance issues

Always reference specific FAR/DFARS citations when applicable.
Be thorough - missing a single requirement can disqualify a proposal."""

    async def check_proposal(self, proposal_content: str, requirements: list) -> str:
        req_text = "\n".join([
            f"- [{r.get('section_ref', 'N/A')}] {r.get('requirement', '')}"
            for r in requirements[:30]
        ])
        message = f"""Review this proposal content against the extracted requirements:

REQUIREMENTS:
{req_text}

PROPOSAL CONTENT:
{proposal_content[:5000]}

Provide a detailed compliance assessment:
1. Requirements addressed (with status: fully/partially/not addressed)
2. Missing requirements that MUST be addressed
3. Specific compliance issues found
4. Recommended fixes for each issue
5. Overall compliance score (0-100%)"""
        return await self.chat(message)

    async def extract_requirements(self, solicitation_text: str) -> str:
        message = f"""Extract ALL mandatory compliance requirements from this solicitation text:

SOLICITATION:
{solicitation_text[:10000]}

For each requirement:
1. Quote the exact mandatory language
2. Note the section reference
3. Categorize as: Technical, Management, Past Performance, Pricing, Administrative
4. Rate importance: Critical, High, Medium

Format as a structured compliance matrix."""
        return await self.chat(message)

    async def suggest_compliance_fixes(self, proposal_content: str, issues: list) -> str:
        issue_text = "\n".join([f"- {issue}" for issue in issues[:20]])
        message = f"""Suggest specific fixes for these compliance issues in the proposal:

ISSUES:
{issue_text}

CURRENT PROPOSAL CONTENT:
{proposal_content[:3000]}

For each issue, provide:
1. The specific problem
2. Exact text to add or modify
3. Where in the proposal to make the change
4. The FAR/DFARS reference if applicable"""
        return await self.chat(message)

    async def analyze_section_lm(self, solicitation_text: str) -> str:
        message = f"""Analyze the Section L (Instructions) and Section M (Evaluation Criteria) from this solicitation:

{solicitation_text[:8000]}

Provide:
1. Proposal structure requirements (volumes, page limits, format)
2. Evaluation factors and their relative weights
3. Subfactors under each evaluation factor
4. Key discriminators the evaluators will look for
5. Common pitfalls to avoid
6. Strategic recommendations for maximizing evaluation score"""
        return await self.chat(message)
