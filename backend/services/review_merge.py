def merge_review(section_text: str, notes: str):
    return f"""
HUMAN REVIEW NOTES:
{notes}

REVISED SECTION:
{section_text}
"""
