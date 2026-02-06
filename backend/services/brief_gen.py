from backend.services.llm import llm_chat
from backend.services.db import supabase

def generate_brief(proposal_id):
    # Collect facts
    prop = supabase.table("proposals").select("*", "opportunities(*)").eq("id", proposal_id).single().execute().data
    sections = supabase.table("proposal_sections").select("*").eq("proposal_id", proposal_id).execute().data
    checklist = supabase.table("submission_checklists").select("*").eq("proposal_id", proposal_id).execute().data
    reqs = supabase.table("compliance_requirements").select("*").eq("proposal_id", proposal_id).execute().data
    facts = {
      "opportunity": prop.get("opportunities", {}),
      "sections": sections,
      "checklist": checklist,
      "requirements": reqs
    }
    prompt = f"""
Generate a 1–2 page Submission Brief with:
- Opportunity summary
- Win themes
- Risks
- Final checklist status
- Submission instructions
Facts: {facts}
"""
    return llm_chat("Expert proposal closer, generates handoff briefs.", prompt)
