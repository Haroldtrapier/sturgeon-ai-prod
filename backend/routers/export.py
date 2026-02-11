from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
import os

try:
    from services.exporter import export_proposal
    from services.compliance_exporter import export_compliance
    from services.auth import get_user
except ImportError:
    from backend.services.exporter import export_proposal
    from backend.services.compliance_exporter import export_compliance
    from backend.services.auth import get_user

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/proposal/{proposal_id}")
def proposal_doc(proposal_id: str, user=Depends(get_user)):
    """Export a proposal to a formatted DOCX document."""
    try:
        path = export_proposal(proposal_id)
        return FileResponse(
            path,
            filename=f"proposal_{proposal_id[:8]}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/compliance/{proposal_id}")
def compliance_doc(proposal_id: str, user=Depends(get_user)):
    """Export a compliance traceability matrix to DOCX."""
    try:
        path = export_compliance(proposal_id)
        return FileResponse(
            path,
            filename=f"compliance_matrix_{proposal_id[:8]}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
