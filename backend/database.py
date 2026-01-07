import os
import datetime
from typing import Optional, List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)

# ----------------------------------------------------------------------
# Async PostgreSQL engine & session configuration
# ----------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "STURGEON_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/sturgeon_ai",
)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # set True for SQL debugging
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

async def get_async_session() -> AsyncSession:
    """
    Dependency helper to get an async session.
    Typical usage with FastAPI:
        async with get_async_session() as session:
            ...
    """
    async with AsyncSessionLocal() as session:
        yield session

# ----------------------------------------------------------------------
# Base model
# ----------------------------------------------------------------------
Base = declarative_base()

# ----------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
        Index("ix_user_email", "email"),
    )

    id: int = Column(Integer, primary_key=True, index=True)
    email: str = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password: str = Column(String(255), nullable=False)
    full_name: Optional[str] = Column(String(255))
    is_active: bool = Column(Boolean, default=True, nullable=False)
    is_superuser: bool = Column(Boolean, default=False, nullable=False)
    created_at: datetime.datetime = Column(
        DateTime, default=datetime.datetime.utcnow, nullable=False
    )
    updated_at: datetime.datetime = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )

    # Relationships
    opportunities: List["Opportunity"] = relationship(
        "Opportunity", back_populates="owner", cascade="all, delete-orphan"
    )
    saved_opportunities: List["SavedOpportunity"] = relationship(
        "SavedOpportunity", back_populates="user", cascade="all, delete-orphan"
    )
    preferences: List["UserPreference"] = relationship(
        "UserPreference", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"


class Agency(Base):
    __tablename__ = "agencies"
    __table_args__ = (UniqueConstraint("name", name="uq_agency_name"),)

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(255), nullable=False, unique=True, index=True)
    description: Optional[str] = Column(Text)
    website_url: Optional[str] = Column(String(255))
    created_at: datetime.datetime = Column(
        DateTime, default=datetime.datetime.utcnow, nullable=False
    )
    updated_at: datetime.datetime = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )

    # Relationships
    opportunities: List["Opportunity"] = relationship(
        "Opportunity", back_populates="agency", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Agency id={self.id} name={self.name}>"


class Opportunity(Base):
    __tablename__ = "opportunities"
    __table_args__ = (
        Index("ix_opportunity_title", "title"),
        Index("ix_opportunity_posted_at", "posted_at"),
    )

    id: int = Column(Integer, primary_key=True, index=True)
    title: str = Column(String(255), nullable=False)
    description: Optional[str] = Column(Text)
    location: Optional[str] = Column(String(255))
    posted_at: datetime.datetime = Column(
        DateTime, default=datetime.datetime.utcnow, nullable=False
    )
    expires_at: Optional[datetime.datetime] = Column(DateTime)

    # Foreign keys
    agency_id: int = Column(Integer, ForeignKey("agencies.id"), nullable=False)
    owner_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    agency: Agency = relationship("Agency", back_populates="opportunities")
    owner: User = relationship("User", back_populates="opportunities")
    saved_by: List["SavedOpportunity"] = relationship(
        "SavedOpportunity", back_populates="opportunity", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Opportunity id={self.id} title={self.title}>"


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"
    __table_args__ = (
        UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity"),
    )

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id: int = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    saved_at: datetime.datetime = Column(
        DateTime, default=datetime.datetime.utcnow, nullable=False
    )

    # Relationships
    user: User = relationship("User", back_populates="saved_opportunities")
    opportunity: Opportunity = relationship(
        "Opportunity", back_populates="saved_by"
    )

    def __repr__(self) -> str:
        return f"<SavedOpportunity user_id={self.user_id} opportunity_id={self.opportunity_id}>"


class UserPreference(Base):
    __tablename__ = "user_preferences"
    __table_args__ = (UniqueConstraint("user_id", "key", name="uq_user_pref_key"),)

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    key: str = Column(String(100), nullable=False)
    value: str = Column(Text, nullable=False)
    updated_at: datetime.datetime = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )

    # Relationships
    user: User = relationship("User", back_populates="preferences")

    def __repr__(self) -> str:
        return f"<UserPreference user_id={self.user_id} key={self.key}>"

# ----------------------------------------------------------------------
# Utility: create all tables (run once during app startup)
# ----------------------------------------------------------------------
async def init_models() -> None:
    """
    Create database tables based on the models.
    Typically called at application start-up.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# ----------------------------------------------------------------------
# Example usage (for reference only, not executed on import)
# ----------------------------------------------------------------------
# async def example():
#     async for session in get_async_session():
#         new_user = User(email="alice@example.com", hashed_password="hashed")
#         session.add(new_user)
#         await session.commit()
#         await session.refresh(new_user)
#         print(new_user)
#
# if __name__ == "__main__":
#     import asyncio
#     asyncio.run(init_models())