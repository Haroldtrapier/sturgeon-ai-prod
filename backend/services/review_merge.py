"""
Review merge service - incorporates human reviewer feedback into proposal sections
using AI to intelligently merge notes with existing content.
"""
try:
    from services.llm import llm_chat
    from services.db import supabase
except ImportError:
    from backend.services.llm import llm_chat
    from backend.services.db import supabase


SYSTEM_PROMPT = """You are an expert government proposal editor. A human reviewer
has provided feedback on a proposal section. Your job is to revise the section
incorporating the reviewer's notes while:

1. Maintaining the original structure and formatting
2. Preserving technical accuracy
3. Addressing every point in the reviewer's notes
4. Keeping the same professional tone
5. Not adding information that wasn't in the original or the notes
6. Marking any unresolvable conflicts for human decision

Return ONLY the revised section text, ready to insert into the proposal."""


def merge_review(section_text: str, notes: str) -> str:
    """
    Merge reviewer notes into a proposal section using AI.

    Args:
        section_text: The current section content
        notes: Reviewer's feedback and suggested changes

    Returns:
        Revised section text incorporating the feedback
    """
    if not notes or not notes.strip():
        return section_text

    prompt = f"""Revise this proposal section based on the reviewer's notes.

CURRENT SECTION:
---
{section_text}
---

REVIEWER NOTES:
---
{notes}
---

Generate the revised section now."""

    return llm_chat(SYSTEM_PROMPT, prompt)


def merge_and_save(proposal_id: str, section_id: str, notes: str) -> dict:
    """
    Fetch a section, merge reviewer notes, and save the updated content.

    Returns the updated section record.
    """
    # Fetch current section
    section_res = supabase.table("proposal_sections") \
        .select("*") \
        .eq("id", section_id) \
        .eq("proposal_id", proposal_id) \
        .single() \
        .execute()

    section = section_res.data
    if not section:
        raise ValueError(f"Section {section_id} not found for proposal {proposal_id}")

    original_content = section.get("content", "")

    # Merge using AI
    revised_content = merge_review(original_content, notes)

    # Save the updated section
    update_res = supabase.table("proposal_sections") \
        .update({
            "content": revised_content,
            "review_notes": notes,
            "review_status": "merged",
        }) \
        .eq("id", section_id) \
        .execute()

    return update_res.data[0] if update_res.data else {}
