import uuid
from sqlalchemy import Column, String, Text, DateTime, func
from database import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    user_id = Column(String, nullable=False)

    raw_text = Column(Text, nullable=True)
    generated_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
