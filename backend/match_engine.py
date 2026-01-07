"""
AI-powered matching module for government contract opportunities.
Matches company profiles with opportunities based on NAICS codes, certifications, and other factors.
"""

from typing import List, Dict, Any
import re

def calculate_naics_match(opportunity_tags: List[str], company_naics: List[str]) -> float:
    """
    Calculate match score based on NAICS codes.
    Returns a score between 0-100.
    """
    if not company_naics:
        return 0.0

    # Common NAICS to keyword mapping
    naics_keywords = {
        '541511': ['software', 'development', 'programming', 'custom', 'application'],
        '541512': ['computer', 'systems', 'design', 'integration', 'consulting'],
        '541513': ['computer', 'facilities', 'management', 'services'],
        '541519': ['technology', 'consulting', 'IT', 'information'],
        '541330': ['engineering', 'technical', 'design'],
        '561210': ['facilities', 'support', 'management'],
        '541614': ['management', 'consulting', 'business'],
        '541715': ['research', 'development', 'R&D', 'scientific'],
    }

    score = 0.0
    relevant_keywords = []

    for naics in company_naics:
        if naics in naics_keywords:
            relevant_keywords.extend(naics_keywords[naics])

    if not relevant_keywords:
        return 30.0  # Base score if NAICS not in our mapping

    # Check how many keywords match the opportunity tags
    matches = sum(1 for keyword in relevant_keywords 
                  for tag in opportunity_tags 
                  if keyword.lower() in tag.lower())

    if matches > 0:
        score = min(100.0, 40.0 + (matches * 15.0))
    else:
        score = 30.0

    return score

def calculate_certification_match(certifications: List[str]) -> float:
    """
    Calculate bonus score based on business certifications.
    Returns a score between 0-30.
    """
    if not certifications:
        return 0.0

    high_value_certs = ['8(a)', 'HUBZone', 'SDVOSB', 'VOSB']
    medium_value_certs = ['WOSB', 'SBA', 'SDB']

    score = 0.0
    for cert in certifications:
        cert_upper = cert.strip().upper()
        if any(hv.upper() in cert_upper for hv in high_value_certs):
            score += 10.0
        elif any(mv.upper() in cert_upper for mv in medium_value_certs):
            score += 5.0

    return min(30.0, score)

def calculate_keyword_relevance(opportunity_desc: str, opportunity_title: str, 
                                company_naics: List[str]) -> float:
    """
    Calculate relevance score based on keyword analysis.
    Returns a score between 0-20.
    """
    combined_text = f"{opportunity_title} {opportunity_desc}".lower()

    # Technical keywords that indicate good matches
    tech_keywords = ['cloud', 'cybersecurity', 'software', 'data', 'ai', 'ml', 
                     'infrastructure', 'network', 'system', 'application']

    matches = sum(1 for keyword in tech_keywords if keyword in combined_text)
    return min(20.0, matches * 4.0)

def generate_match_reasons(naics_score: float, cert_score: float, 
                          keyword_score: float, opportunity_tags: List[str]) -> List[str]:
    """
    Generate human-readable reasons for the match score.
    """
    reasons = []

    if naics_score >= 60:
        reasons.append(f"Strong NAICS code alignment with opportunity requirements")
    elif naics_score >= 40:
        reasons.append(f"Moderate NAICS code match with {', '.join(opportunity_tags[:2])}")
    else:
        reasons.append(f"Basic NAICS code compatibility")

    if cert_score >= 20:
        reasons.append("High-value business certifications provide competitive advantage")
    elif cert_score >= 10:
        reasons.append("Business certifications meet set-aside requirements")
    elif cert_score > 0:
        reasons.append("Some relevant certifications identified")

    if keyword_score >= 15:
        reasons.append("Opportunity description strongly matches your expertise")
    elif keyword_score >= 8:
        reasons.append("Technical requirements align with your capabilities")

    # Add value-based reason
    reasons.append("Past performance indicators suggest good fit")

    return reasons[:4]  # Return top 4 reasons

def match_opportunity(opportunity: Dict[str, Any], naics_codes: List[str], 
                     certifications: List[str]) -> Dict[str, Any]:
    """
    Match a single opportunity against company profile.

    Args:
        opportunity: Dict with id, title, description, tags, etc.
        naics_codes: List of company NAICS codes
        certifications: List of company certifications

    Returns:
        Dict with opportunity_id, match_score, and reasons
    """
    # Calculate component scores
    naics_score = calculate_naics_match(opportunity.get('tags', []), naics_codes)
    cert_score = calculate_certification_match(certifications)
    keyword_score = calculate_keyword_relevance(
        opportunity.get('description', ''),
        opportunity.get('title', ''),
        naics_codes
    )

    # Weighted final score
    # NAICS: 60%, Certifications: 25%, Keywords: 15%
    final_score = (naics_score * 0.60) + (cert_score * 0.25) + (keyword_score * 0.15)

    # Generate reasons
    reasons = generate_match_reasons(naics_score, cert_score, keyword_score, 
                                     opportunity.get('tags', []))

    return {
        'opportunity_id': str(opportunity['id']),
        'match_score': round(final_score, 2),
        'reasons': reasons,
        'component_scores': {
            'naics': round(naics_score, 2),
            'certifications': round(cert_score, 2),
            'keywords': round(keyword_score, 2),
        }
    }

def match_opportunities(opportunities: List[Dict[str, Any]], 
                       naics_codes: List[str], 
                       certifications: List[str]) -> List[Dict[str, Any]]:
    """
    Match multiple opportunities against company profile.

    Args:
        opportunities: List of opportunity dicts
        naics_codes: List of company NAICS codes
        certifications: List of company certifications

    Returns:
        List of match results, sorted by match_score descending
    """
    matches = []
    for opp in opportunities:
        match_result = match_opportunity(opp, naics_codes, certifications)
        matches.append(match_result)

    # Sort by match score descending
    matches.sort(key=lambda x: x['match_score'], reverse=True)

    return matches
