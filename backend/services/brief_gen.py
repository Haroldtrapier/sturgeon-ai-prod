"""
Submission brief generator - creates AI-powered handoff briefs.
"""
import json

try:
    from services.llm import llm_chat
    from services.db import supabase
except ImportError:
    from backend.services.llm import llm_chat
    from backend.services.db import supabase


SYSTEM_PROMPT = """You are an expert government contracting proposal manager.
Generate a concise, professional Submission Brief that a team lead can use
as a final handoff document before proposal submission. Include:

1. **Opportunity Summary** - Title, agency, solicitation number, deadline, NAICS
2. **Win Themes** - Key discriminators and competitive advantages
3. **Risk Assessment** - Identified risks and mitigation strategies
4. **Compliance Status** - Requirements addressed vs outstanding
5. **Checklist Summary** - Items completed vs pending
6. **Submission Instructions** - Method, deadline, point of contact
7. **Recommendation** - Go/No-Go with rationale

Format with clear headings and bullet points. Be specific and actionable."""


def generate_brief(proposal_id: str) -> str:
    """Generate an AI submission brief for a proposal."""

    # Collect all relevant data
    prop_res = supabase.table("proposals") \
        .select("*, opportunities(*)") \
        .eq("id", proposal_id) \
        .single() \
        .execute()
    prop = prop_res.data or {}

    sections = supabase.table("proposal_sections") \
        .select("section_name, content") \
        .eq("proposal_id", proposal_id) \
        .order("order_index") \
        .execute().data or []

    reqs = supabase.table("compliance_requirements") \
        .select("requirement, status, section_ref") \
        .eq("proposal_id", proposal_id) \
        .execute().data or []

    checklist = []
    try:
        checklist = supabase.table("submission_checklists") \
            .select("item, completed, category") \
            .eq("proposal_id", proposal_id) \
            .execute().data or []
    except Exception:
        pass  # Table may not exist yet

    opp = prop.get("opportunities") or {}

    # Build context for the LLM
    facts = {
        "proposal_title": prop.get("title", "Unknown"),
        "proposal_status": prop.get("status", "draft"),
        "opportunity": {
            "title": opp.get("title", "Unknown"),
            "agency": opp.get("agency", "Unknown"),
            "notice_id": opp.get("notice_id", "N/A"),
            "naics_code": opp.get("naics_code", "N/A"),
            "set_aside": opp.get("set_aside", "None"),
            "response_deadline": opp.get("response_deadline", "Unknown"),
        },
        "sections_count": len(sections),
        "section_names": [s["section_name"] for s in sections],
        "compliance": {
            "total_requirements": len(reqs),
            "addressed": sum(1 for r in reqs if r["status"] == "addressed"),
            "partial": sum(1 for r in reqs if r["status"] == "partial"),
            "not_addressed": sum(1 for r in reqs if r["status"] == "not_addressed"),
        },
        "checklist": {
            "total_items": len(checklist),
            "completed": sum(1 for c in checklist if c.get("completed")),
            "pending_items": [c["item"] for c in checklist if not c.get("completed")],
        },
    }

    prompt = f"""Generate a Submission Brief for this government contract proposal.

PROPOSAL DATA:
{json.dumps(facts, indent=2, default=str)}

SECTION SUMMARIES:
{chr(10).join(f'- {s["section_name"]}: {s["content"][:150]}...' for s in sections[:8])}

Generate the brief now."""

    return llm_chat(SYSTEM_PROMPT, prompt)
