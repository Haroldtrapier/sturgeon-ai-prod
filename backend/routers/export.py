from fastapi import APIRouter
from fastapi.responses import FileResponse
from backend.services.exporter import export_proposal
from backend.services.compliance_exporter import export_compliance

router = APIRouter(prefix="/export")

@router.get("/proposal/{proposal_id}")
def proposal_doc(proposal_id: str):
    path = export_proposal(proposal_id)
    return FileResponse(path, filename="proposal.docx")

@router.get("/compliance/{proposal_id}")
def compliance_doc(proposal_id: str):
    path = export_compliance(proposal_id)
    return FileResponse(path, filename="compliance_matrix.docx")
