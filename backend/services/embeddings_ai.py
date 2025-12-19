from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, Session
from datetime import datetime
from typing import List
from .openai_client import get_embedding  # you already should have this

Base = declarative_base()

class EmbeddingRecord(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    object_type = Column(String(50), index=True)  # "opportunity", "proposal", etc.
    object_id = Column(String(64), index=True)
    vector = Column(Text, nullable=False)  # store as JSON string or use vector type if PG
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def embed_text(session: Session, object_type: str, object_id: str, text: str) -> EmbeddingRecord:
    """Create or update an embedding for the given object."""
    vec: List[float] = get_embedding(text)

    record = (
        session.query(EmbeddingRecord)
        .filter_by(object_type=object_type, object_id=object_id)
        .one_or_none()
    )

    serialized = ",".join(str(x) for x in vec)  # simple serialization

    if record is None:
        record = EmbeddingRecord(
            object_type=object_type,
            object_id=object_id,
            vector=serialized,
        )
        session.add(record)
    else:
        record.vector = serialized

    session.commit()
    session.refresh(record)
    return record
