"""
Compliance Requirement Extraction Service

Core intelligence for GovCon proposal automation.
Extracts explicit SHALL/MUST/REQUIRED statements from RFP/solicitation text.

This is the highest-value agent in government contracting:
- Identifies mandatory requirements
- Captures section references
- Enables compliance matrix generation
- Prevents missed requirements (killer in GovCon)
"""

from backend.services.llm import llm_chat
import re


def extract_requirements(rfp_text: str) -> list[dict]:
    """
    Extract compliance requirements from solicitation text.
    
    Args:
        rfp_text: Full text of RFP/solicitation document
        
    Returns:
        List of requirements with structure:
        [
            {
                "requirement": "Contractor shall provide...",
                "section_ref": "Section 3.2.1",
                "keyword": "SHALL"  # SHALL, MUST, REQUIRED
            }
        ]
    """
    
    if not rfp_text or len(rfp_text.strip()) < 50:
        return []
    
    prompt = f"""
You are a government contracting compliance analyst with expertise in federal acquisition regulations.

Your task: Extract EVERY explicit mandatory requirement from the solicitation below.

RULES:
1. Only extract statements containing: SHALL, MUST, REQUIRED, WILL (in mandatory context)
2. Capture the COMPLETE requirement text (subject + verb + object)
3. Include section references when present (e.g., "Section 3.2", "C.3.1", "L.1")
4. Preserve exact wording - do NOT paraphrase
5. Number each requirement sequentially
6. Skip general statements without specific deliverables

OUTPUT FORMAT:
1. [Section X.X] Complete requirement text containing SHALL/MUST/REQUIRED
2. [Section Y.Y] Next complete requirement text
...

SOLICITATION TEXT:
{rfp_text[:15000]}  

EXTRACTED REQUIREMENTS:
"""

    try:
        raw_response = llm_chat(
            "You are an expert compliance analyst extracting mandatory requirements from government solicitations.",
            prompt
        )
        
        requirements = []
        
        # Parse numbered list format
        lines = raw_response.split("\n")
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines and headers
            if not line or line.startswith("EXTRACTED") or line.startswith("---"):
                continue
            
            # Match numbered format: "1. [Section X] Requirement text"
            match = re.match(r'^\d+\.\s*(?:\[(.*?)\])?\s*(.+)$', line)
            
            if match:
                section_ref = match.group(1) or ""
                requirement = match.group(2).strip()
                
                # Validate it contains mandatory keywords
                if any(kw in requirement.upper() for kw in ["SHALL", "MUST", "REQUIRED", "WILL"]):
                    
                    # Determine keyword type
                    keyword = "SHALL"
                    if "MUST" in requirement.upper():
                        keyword = "MUST"
                    elif "REQUIRED" in requirement.upper():
                        keyword = "REQUIRED"
                    elif "WILL" in requirement.upper():
                        keyword = "WILL"
                    
                    requirements.append({
                        "requirement": requirement,
                        "section_ref": section_ref,
                        "keyword": keyword
                    })
        
        # Fallback: If no numbered format, try to extract any line with keywords
        if len(requirements) == 0:
            for line in lines:
                line = line.strip()
                if any(kw in line.upper() for kw in ["SHALL", "MUST", "REQUIRED"]) and len(line) > 20:
                    requirements.append({
                        "requirement": line,
                        "section_ref": "",
                        "keyword": "SHALL"
                    })
        
        return requirements[:100]  # Cap at 100 requirements for initial version
        
    except Exception as e:
        print(f"Compliance extraction error: {e}")
        return []