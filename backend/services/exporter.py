from docx import Document
from backend.services.db import supabase
import tempfile
import os

def export_proposal(proposal_id: str):
    doc = Document("backend/templates/proposal.docx")

    sections = supabase.table("proposal_sections") \
        .select("*") \
        .eq("proposal_id", proposal_id) \
        .execute().data

    for s in sections:
        doc.add_heading(s["section_name"], level=1)
        doc.add_paragraph(s["content"])

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    doc.save(tmp.name)
    return tmp.name
