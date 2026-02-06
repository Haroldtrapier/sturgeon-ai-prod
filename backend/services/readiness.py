from backend.services.db import supabase
def readiness_score(proposal_id):
    reqs = supabase.table("compliance_requirements").select("*").eq("proposal_id", proposal_id).execute().data
    checklist = supabase.table("submission_checklists").select("*").eq("proposal_id", proposal_id).execute().data
    score = 0
    score += 50 if reqs and all(r["status"] == "addressed" for r in reqs) else 0
    score += 50 if checklist and all(i["completed"] for i in checklist) else 0
    return score
