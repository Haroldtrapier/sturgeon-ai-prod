"""
Celery tasks for background processing
"""
from celery import Celery
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Opportunity, Proposal
from .services.embeddings_ai import embed_text

celery_app = Celery("sturgeon")


@celery_app.task
def rebuild_all_embeddings():
    """
    Rebuild embeddings for all opportunities and proposals.
    
    This task iterates through all opportunities and proposals in the database
    and generates/updates their embeddings for similarity search and matching.
    Uses chunked processing to avoid memory issues with large datasets.
    """
    db: Session = SessionLocal()
    try:
        # Process opportunities in chunks to avoid memory issues
        chunk_size = 100
        offset = 0
        while True:
            opportunities = db.query(Opportunity).limit(chunk_size).offset(offset).all()
            if not opportunities:
                break
            
            for opp in opportunities:
                text = f"{opp.title}\n{opp.description or ''}"
                embed_text(db, "opportunity", str(opp.id), text)
            
            offset += chunk_size

        # Process proposals in chunks to avoid memory issues
        offset = 0
        while True:
            proposals = db.query(Proposal).limit(chunk_size).offset(offset).all()
            if not proposals:
                break
            
            for prop in proposals:
                # Combine title, executive_summary, and technical_approach
                text_parts = [prop.title]
                if prop.executive_summary:
                    text_parts.append(prop.executive_summary)
                if prop.technical_approach:
                    text_parts.append(prop.technical_approach)
                text = "\n".join(text_parts)
                embed_text(db, "proposal", str(prop.id), text)
            
            offset += chunk_size
    finally:
        db.close()


@celery_app.task
def nightly_opportunity_scan():
    """
    Placeholder: call your marketplace services, store new opportunities,
    then embed them.
    
    This task would:
    1. Call SAM.gov API to fetch new opportunities
    2. Call GovWin/GovSpend APIs if configured
    3. Store new opportunities in the database
    4. Generate embeddings for new opportunities
    5. Send alerts to users with matching saved searches
    """
    db: Session = SessionLocal()
    try:
        # TODO: call SAM/GovWin/GovSpend service functions here,
        #       insert any new opportunities into the DB,
        #       then call embed_text for each new one.
        pass
    finally:
        db.close()
