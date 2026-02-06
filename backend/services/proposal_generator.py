"""
Proposal Section Generator

AI-powered proposal writer that generates compliant, professional sections
aligned to extracted requirements and opportunity context.

Phase 4: Basic section generation
Phase 4.5+: Template integration, style customization, past performance
"""

from backend.services.llm import llm_chat


def generate_section(
    section_name: str,
    requirements: list[dict],
    opportunity: dict,
    company_profile: dict = None
) -> str:
    """
    Generate a proposal section addressing specific requirements.
    
    Args:
        section_name: Name of section (e.g., "Technical Approach", "Management Plan")
        requirements: List of compliance requirements to address
        opportunity: Opportunity details (title, agency, NAICS, etc.)
        company_profile: Optional company information for personalization
        
    Returns:
        Generated section content (markdown format)
    """
    
    # Build requirement list
    req_text = ""
    if requirements:
        req_text = "\n".join([
            f"- [{r.get('section_ref', 'N/A')}] {r.get('requirement', '')}"
            for r in requirements[:20]  # Limit to 20 most relevant
        ])
    else:
        req_text = "(No specific requirements extracted for this section)"
    
    # Build company context
    company_text = ""
    if company_profile:
        company_text = f"""
COMPANY PROFILE:
Name: {company_profile.get('name', 'Your Company')}
Capabilities: {company_profile.get('capabilities', 'Full-service contractor')}
Past Performance: {company_profile.get('past_performance', 'Relevant experience available')}
"""
    
    prompt = f"""
You are a professional government proposal writer with 15+ years of experience winning federal contracts.

Your task: Write a compelling, compliant proposal section.

OPPORTUNITY CONTEXT:
Title: {opportunity.get('title', 'Untitled')}
Agency: {opportunity.get('agency', 'Federal Agency')}
NAICS: {opportunity.get('naics', 'N/A')}
Type: {opportunity.get('type', 'Solicitation')}

{company_text}

SECTION TO WRITE: {section_name}

REQUIREMENTS TO ADDRESS:
{req_text}

WRITING GUIDELINES:
1. Address EVERY requirement explicitly (reference section numbers)
2. Use active voice and confident language
3. Be specific with metrics, timelines, and deliverables
4. Follow government proposal best practices:
   - Clear headings and structure
   - Compliance matrix style (Requirement → Approach → Benefit)
   - Emphasize understanding of agency mission
5. Professional tone, no marketing fluff
6. 300-500 words unless section requires more detail
7. Use markdown formatting (## for headings, bullets, bold)

OUTPUT FORMAT:
## {section_name}

[Your compliant, professional response]

### Compliance Summary
[Brief table or list showing requirement coverage]

GENERATED SECTION:
"""

    try:
        content = llm_chat(
            "You are an expert government proposal writer specializing in federal contracting.",
            prompt
        )
        
        return content
        
    except Exception as e:
        print(f"Proposal generation error: {e}")
        return f"## {section_name}\n\n*Error generating section. Please try again or write manually.*"