import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_ANALYZER = """
You are a government contracting requirements analyst.
You read solicitations / RFQs and extract key requirements, evaluation factors,
and compliance items.
"""

SYSTEM_OUTLINER = """
You are a proposal architect.
You design a clear, compliant outline that responds to the government's
requirements and evaluation factors.
"""

SYSTEM_WRITER = """
You are a senior government proposal writer.
You write concise, compliant, persuasive proposal text following the outline.
Use professional but plain language.
"""

async def analyze_requirements(raw_requirements: str) -> str:
    resp = openai.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": SYSTEM_ANALYZER},
            {"role": "user", "content": raw_requirements},
        ],
    )
    return resp.choices[0].message["content"]


async def build_outline(analysis: str, company_profile: str) -> str:
    prompt = f"""
ANALYSIS:
{analysis}

COMPANY PROFILE:
{company_profile}

Create a detailed section-by-section outline for the proposal.
Include suggested headings and subheadings mapped to evaluation factors.
/// Include any suggested mapping back to the key requirements.
"""
    resp = openai.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": SYSTEM_OUTLINER},
            {"role": "user", "content": prompt},
        ],
    )
    return resp.choices[0].message["content"]


async def write_proposal(outline: str, company_profile: str) -> str:
    prompt = f"""
OUTLINE:
{outline}

COMPANY PROFILE:
{company_profile}

Write a full narrative proposal following the outline.
Do NOT invent pricing; focus on technical / management approach, past performance,
and capabilities. Use headings from the outline.
"""
    resp = openai.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": SYSTEM_WRITER},
            {"role": "user", "content": prompt},
        ],
    )
    return resp.choices[0].message["content"]


async def generate_full_proposal(raw_requirements: str, company_profile: str) -> dict:
    """
    Multi-agent pipeline:
    1) Analyzer „ 2) Outliner „ 3) Writer
    Returns all 3 so you can store/inspect them.
    """
    analysis = await analyze_requirements(raw_requirements)
    outline = await build_outline(analysis, company_profile)
    draft = await write_proposal(outline, company_profile)
    return {
        "analysis": analysis,
        "outline": outline,
        "draft": draft,
    }
