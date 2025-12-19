from celery import Celery
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Opportunity, Proposal
from ..services.embeddings_ai import embed_text

celery_app = Celery("sturgeon")

@celery_app.task
def rebuild_all_embeddings():
    db: Session = SessionLocal()
    try:
        # opportunities
        for opp in db.query(Opportunity).all():
            text = f"{opp.title}\n{opp.description or ''}"
            embed_text(db, "opportunity", str(opp.id), text)

        # proposals
        for prop in db.query(Proposal).all():
            text = f"{prop.title}\n{prop.body or ''}"
            embed_text(db, "proposal", str(prop.id), text)
    finally:
        db.close()


@celery_app.task
def nightly_opportunity_scan():
    """
    Placeholder: call your marketplace services, store new opportunities,
    then embed them.
    """
    db: Session = SessionLocal()
    try:
        # TODO: call SAM/GovWin/GovSpend service functions here,
        #       insert any new opportunities into the DB,
        #       then call embed_text for each new one.
        pass
    finally:
        db.close()
