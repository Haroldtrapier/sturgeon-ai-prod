import zipfile, tempfile, os

def package_submission(proposal_doc, compliance_doc, attachments=[]):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    with zipfile.ZipFile(tmp.name, 'w') as z:
        z.write(proposal_doc, "Proposal.docx")
        z.write(compliance_doc, "Compliance_Matrix.docx")
        for a in attachments:
            z.write(a["path"], a["name"])
    return tmp.name
