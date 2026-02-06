from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from backend.services.db import supabase
from backend.services.checklist import seed_checklist
from backend.services.readiness import readiness_score
from backend.services.packager import package_submission
from backend.services.brief_gen import generate_brief
from backend.services.exporter import export_proposal
from backend.services.compliance_exporter import export_compliance
from backend.services.auth import get_user
import tempfile

router = APIRouter(prefix="/submission")

@router.post("/seed_checklist/{proposal_id}")
def seed(proposal_id: str, user=Depends(get_user)):
    # RLS will restrict to allowed proposals
    seed_checklist(proposal_id)
    return {"seeded": True}

@router.get("/readiness/{proposal_id}")
def readiness(proposal_id: str, user=Depends(get_user)):
    score = readiness_score(proposal_id)
    return {"readiness": score}

@router.get("/brief/{proposal_id}")
def brief(proposal_id: str, user=Depends(get_user)):
    brief = generate_brief(proposal_id)
    return {"brief": brief}

@router.get("/package/{proposal_id}")
def package(proposal_id: str, user=Depends(get_user)):
    score = readiness_score(proposal_id)
    if score < 100:
        return {"error": "Not submission-ready (score < 100). Complete all items first."}
    pdoc = export_proposal(proposal_id)
    cdoc = export_compliance(proposal_id)
    # TODO: add support for real attachments
    brief_txt = generate_brief(proposal_id)
    # Save temp brief file
    bfile = tempfile.NamedTemporaryFile(delete=False, suffix=".txt")
    with open(bfile.name, "w") as f:
        f.write(brief_txt)
    zipfile_path = package_submission(pdoc, cdoc, attachments=[{"path": bfile.name, "name": "SubmissionBrief.txt"}])
    return FileResponse(zipfile_path, filename="SubmissionPackage.zip")
