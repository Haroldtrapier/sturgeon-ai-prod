"""
Submission readiness scorer - calculates how ready a proposal is for submission.
"""
from typing import Dict

try:
    from services.db import supabase
except ImportError:
    from backend.services.db import supabase


def readiness_score(proposal_id: str) -> Dict:
    """
    Calculate submission readiness score (0-100) with detailed breakdown.

    Scoring weights:
    - Proposal sections exist and have content: 25 points
    - Compliance requirements all addressed: 30 points
    - Submission checklist completed: 25 points
    - Proposal metadata complete: 20 points
    """

    breakdown = {}
    total = 0

    # ── 1. Proposal sections (25 pts) ─────────────────────────
    sections = supabase.table("proposal_sections") \
        .select("section_name, content") \
        .eq("proposal_id", proposal_id) \
        .execute().data or []

    if sections:
        with_content = sum(1 for s in sections if s.get("content") and len(s["content"]) > 50)
        section_pct = with_content / len(sections) if sections else 0
        section_score = round(section_pct * 25)
    else:
        section_score = 0
        section_pct = 0

    breakdown["sections"] = {
        "score": section_score,
        "max": 25,
        "total": len(sections),
        "with_content": sum(1 for s in sections if s.get("content") and len(s["content"]) > 50),
    }
    total += section_score

    # ── 2. Compliance requirements (30 pts) ───────────────────
    reqs = supabase.table("compliance_requirements") \
        .select("status") \
        .eq("proposal_id", proposal_id) \
        .execute().data or []

    if reqs:
        addressed = sum(1 for r in reqs if r.get("status") == "addressed")
        partial = sum(1 for r in reqs if r.get("status") == "partial")
        compliance_pct = (addressed + partial * 0.5) / len(reqs) if reqs else 0
        compliance_score = round(compliance_pct * 30)
    else:
        compliance_score = 0
        compliance_pct = 0

    breakdown["compliance"] = {
        "score": compliance_score,
        "max": 30,
        "total": len(reqs),
        "addressed": sum(1 for r in reqs if r.get("status") == "addressed"),
        "partial": sum(1 for r in reqs if r.get("status") == "partial"),
        "not_addressed": sum(1 for r in reqs if r.get("status") == "not_addressed"),
    }
    total += compliance_score

    # ── 3. Submission checklist (25 pts) ──────────────────────
    checklist = []
    try:
        checklist = supabase.table("submission_checklists") \
            .select("completed") \
            .eq("proposal_id", proposal_id) \
            .execute().data or []
    except Exception:
        pass

    if checklist:
        completed = sum(1 for c in checklist if c.get("completed"))
        checklist_pct = completed / len(checklist)
        checklist_score = round(checklist_pct * 25)
    else:
        checklist_score = 0
        checklist_pct = 0

    breakdown["checklist"] = {
        "score": checklist_score,
        "max": 25,
        "total": len(checklist),
        "completed": sum(1 for c in checklist if c.get("completed")),
    }
    total += checklist_score

    # ── 4. Proposal metadata (20 pts) ─────────────────────────
    prop = supabase.table("proposals") \
        .select("title, status, opportunity_id") \
        .eq("id", proposal_id) \
        .single() \
        .execute().data or {}

    meta_checks = [
        bool(prop.get("title")),
        bool(prop.get("opportunity_id")),
        prop.get("status") in ("review", "submitted"),
        len(sections) >= 3,
    ]
    meta_score = round(sum(meta_checks) / len(meta_checks) * 20)

    breakdown["metadata"] = {
        "score": meta_score,
        "max": 20,
        "checks_passed": sum(meta_checks),
        "total_checks": len(meta_checks),
    }
    total += meta_score

    # ── Result ────────────────────────────────────────────────
    if total >= 90:
        status = "ready"
        recommendation = "Proposal is ready for submission."
    elif total >= 70:
        status = "almost_ready"
        recommendation = "Proposal needs minor items completed before submission."
    elif total >= 40:
        status = "in_progress"
        recommendation = "Significant work remains before submission."
    else:
        status = "not_ready"
        recommendation = "Proposal is in early stages. Complete core sections first."

    return {
        "score": total,
        "max_score": 100,
        "status": status,
        "recommendation": recommendation,
        "breakdown": breakdown,
    }
