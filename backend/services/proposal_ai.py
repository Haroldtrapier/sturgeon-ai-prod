"""
AI-powered proposal generation service
"""
import os
from typing import Dict, Any
import httpx


async def generate_full_proposal(
    raw_requirements: str,
    company_profile: str
) -> Dict[str, Any]:
    """
    Generate a full proposal based on requirements and company profile.
    
    Args:
        raw_requirements: The raw text of the RFP/requirements
        company_profile: Company profile information
        
    Returns:
        Dictionary containing the generated proposal draft and metadata
    """
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    # Constants
    MOCK_REQUIREMENTS_PREVIEW_LENGTH = 200
    
    # If OpenAI API key is not available, return a mock response
    if not openai_api_key:
        return {
            "draft": f"[MOCK PROPOSAL]\n\nBased on requirements:\n{raw_requirements[:MOCK_REQUIREMENTS_PREVIEW_LENGTH]}...\n\nCompany: {company_profile}\n\nThis is a placeholder. Configure OPENAI_API_KEY to generate real proposals.",
            "status": "mock",
            "message": "OpenAI API key not configured"
        }
    
    # Call OpenAI API to generate proposal
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert proposal writer for government contracts and grants. Generate professional, detailed proposals."
                        },
                        {
                            "role": "user",
                            "content": f"Generate a complete proposal based on:\n\nRequirements:\n{raw_requirements}\n\nCompany Profile:\n{company_profile}"
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                data = response.json()
                # Validate response structure
                if "choices" not in data or not data["choices"]:
                    return {
                        "draft": "",
                        "status": "error",
                        "message": "Invalid response from OpenAI API"
                    }
                draft = data["choices"][0]["message"]["content"]
                return {
                    "draft": draft,
                    "status": "success",
                    "message": "Proposal generated successfully"
                }
            else:
                return {
                    "draft": "",
                    "status": "error",
                    "message": f"OpenAI API error: {response.status_code}"
                }
    except Exception as e:
        return {
            "draft": "",
            "status": "error",
            "message": f"Error generating proposal: {str(e)}"
        }
