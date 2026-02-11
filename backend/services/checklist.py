"""
Submission checklist service - seeds and manages pre-submission checklists.
"""
try:
    from services.db import supabase
except ImportError:
    from backend.services.db import supabase


CHECKLIST_ITEMS = [
    {"item": "All SHALL/MUST requirements addressed", "category": "compliance"},
    {"item": "All proposal sections generated and reviewed", "category": "content"},
    {"item": "Technical approach clearly articulated", "category": "content"},
    {"item": "Past performance references included", "category": "content"},
    {"item": "Pricing/cost volume completed", "category": "pricing"},
    {"item": "Compliance matrix exported and verified", "category": "compliance"},
    {"item": "Document formatting meets solicitation requirements", "category": "formatting"},
    {"item": "Page limits verified for each volume", "category": "formatting"},
    {"item": "Font size and margins meet requirements", "category": "formatting"},
    {"item": "All required attachments included", "category": "attachments"},
    {"item": "Certifications and representations current", "category": "attachments"},
    {"item": "SAM.gov registration active and current", "category": "eligibility"},
    {"item": "NAICS code eligibility confirmed", "category": "eligibility"},
    {"item": "Set-aside eligibility verified", "category": "eligibility"},
    {"item": "Submission method confirmed (SAM/email/portal)", "category": "submission"},
    {"item": "Submission deadline verified with time zone", "category": "submission"},
    {"item": "Point of contact information included", "category": "submission"},
    {"item": "Final review by authorized representative", "category": "review"},
]


def seed_checklist(proposal_id: str) -> list:
    """Seed a submission checklist for a proposal. Returns created items."""
    # Check if checklist already exists
    existing = supabase.table("submission_checklists") \
        .select("id") \
        .eq("proposal_id", proposal_id) \
        .limit(1) \
        .execute().data

    if existing:
        # Return existing checklist
        result = supabase.table("submission_checklists") \
            .select("*") \
            .eq("proposal_id", proposal_id) \
            .order("created_at") \
            .execute()
        return result.data or []

    records = [
        {
            "proposal_id": proposal_id,
            "item": ci["item"],
            "category": ci["category"],
            "completed": False,
        }
        for ci in CHECKLIST_ITEMS
    ]

    result = supabase.table("submission_checklists").insert(records).execute()
    return result.data or []


def get_checklist(proposal_id: str) -> list:
    """Get the submission checklist for a proposal."""
    result = supabase.table("submission_checklists") \
        .select("*") \
        .eq("proposal_id", proposal_id) \
        .order("created_at") \
        .execute()
    return result.data or []


def update_checklist_item(item_id: str, completed: bool) -> dict:
    """Mark a checklist item as completed or not."""
    result = supabase.table("submission_checklists") \
        .update({"completed": completed}) \
        .eq("id", item_id) \
        .execute()
    return result.data[0] if result.data else {}
