from backend.services.db import supabase
CHECKLIST_ITEMS = [
  "All SHALL/MUST addressed",
  "All sections generated",
  "Formatting verified",
  "Compliance matrix exported",
  "Attachments included",
  "Page limits verified",
  "Submission method confirmed (SAM/Email/Portal)",
  "Deadline verified (time zone)"
]
def seed_checklist(proposal_id):
    recs = [{"proposal_id": proposal_id, "item": i} for i in CHECKLIST_ITEMS]
    supabase.table("submission_checklists").insert(recs).execute()
