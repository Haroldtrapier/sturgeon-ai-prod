from docx import Document
from backend.services.db import supabase
import tempfile

def export_compliance(proposal_id: str):
    doc = Document("backend/templates/compliance_matrix.docx")
    table = doc.add_table(rows=1, cols=3)
    hdr = table.rows[0].cells
    hdr[0].text = "Requirement"
    hdr[1].text = "Section"
    hdr[2].text = "Status"

    reqs = supabase.table("compliance_requirements") \
        .select("*") \
        .eq("proposal_id", proposal_id) \
        .execute().data

    for r in reqs:
        row = table.add_row().cells
        row[0].text = r["requirement"]
        row[1].text = r["section_ref"] or ""
        row[2].text = r["status"]

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
    doc.save(tmp.name)
    return tmp.name
