from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

try:
    from services.checklist import seed_checklist, get_checklist, update_checklist_item
    from services.readiness import readiness_score
    from services.packager import package_submission
    from services.brief_gen import generate_brief
    from services.exporter import export_proposal
    from services.compliance_exporter import export_compliance
    from services.auth import get_user
except ImportError:
    from backend.services.checklist import seed_checklist, get_checklist, update_checklist_item
    from backend.services.readiness import readiness_score
    from backend.services.packager import package_submission
    from backend.services.brief_gen import generate_brief
    from backend.services.exporter import export_proposal
    from backend.services.compliance_exporter import export_compliance
    from backend.services.auth import get_user

router = APIRouter(prefix="/submission", tags=["Submission"])


class ChecklistItemUpdate(BaseModel):
    completed: bool


@router.post("/seed_checklist/{proposal_id}")
def seed(proposal_id: str, user=Depends(get_user)):
    """Seed a submission checklist for a proposal (idempotent)."""
    items = seed_checklist(proposal_id)
    return {"seeded": True, "items": items, "count": len(items)}


@router.get("/checklist/{proposal_id}")
def checklist(proposal_id: str, user=Depends(get_user)):
    """Get the submission checklist for a proposal."""
    items = get_checklist(proposal_id)
    completed = sum(1 for i in items if i.get("completed"))
    return {
        "items": items,
        "total": len(items),
        "completed": completed,
        "progress": round(completed / len(items) * 100) if items else 0,
    }


@router.put("/checklist/item/{item_id}")
def update_item(item_id: str, body: ChecklistItemUpdate, user=Depends(get_user)):
    """Update a checklist item's completed status."""
    result = update_checklist_item(item_id, body.completed)
    return {"updated": True, "item": result}


@router.get("/readiness/{proposal_id}")
def readiness(proposal_id: str, user=Depends(get_user)):
    """Get detailed submission readiness score (0-100) with breakdown."""
    result = readiness_score(proposal_id)
    return result


@router.get("/brief/{proposal_id}")
def brief(proposal_id: str, user=Depends(get_user)):
    """Generate an AI submission brief for a proposal."""
    try:
        brief_text = generate_brief(proposal_id)
        return {"brief": brief_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brief generation failed: {str(e)}")


@router.get("/package/{proposal_id}")
def package(proposal_id: str, user=Depends(get_user)):
    """
    Generate a complete submission ZIP package containing:
    - Proposal DOCX
    - Compliance matrix DOCX
    - Submission brief
    - Manifest
    """
    try:
        # Check readiness
        result = readiness_score(proposal_id)
        score = result["score"]

        if score < 50:
            return {
                "error": f"Proposal readiness too low ({score}/100). Complete more items first.",
                "readiness": result,
            }

        # Generate all documents
        pdoc = export_proposal(proposal_id)
        cdoc = export_compliance(proposal_id)
        brief_txt = generate_brief(proposal_id)

        # Package into ZIP
        zipfile_path = package_submission(
            proposal_doc=pdoc,
            compliance_doc=cdoc,
            brief_text=brief_txt,
        )

        return FileResponse(
            zipfile_path,
            filename=f"SubmissionPackage_{proposal_id[:8]}.zip",
            media_type="application/zip",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Package generation failed: {str(e)}")
