import os
import datetime
from typing import Optional, List

from sqlalchemy import (
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
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
class Base(DeclarativeBase):
    pass

# ----------------------------------------------------------------------
# Models
# ----------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
        Index("ix_user_email", "email"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationships
    opportunities: Mapped[List["Opportunity"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    saved_opportunities: Mapped[List["SavedOpportunity"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    preferences: Mapped[List["UserPreference"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"


class Agency(Base):
    __tablename__ = "agencies"
    __table_args__ = (UniqueConstraint("name", name="uq_agency_name"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationships
    opportunities: Mapped[List["Opportunity"]] = relationship(
        back_populates="agency", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Agency id={self.id} name={self.name}>"


class Opportunity(Base):
    __tablename__ = "opportunities"
    __table_args__ = (
        Index("ix_opportunity_title", "title"),
        Index("ix_opportunity_posted_at", "posted_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    posted_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    expires_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime, nullable=True
    )

    # Foreign keys
    agency_id: Mapped[int] = mapped_column(ForeignKey("agencies.id"))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # Relationships
    agency: Mapped["Agency"] = relationship(back_populates="opportunities")
    owner: Mapped["User"] = relationship(back_populates="opportunities")
    saved_by: Mapped[List["SavedOpportunity"]] = relationship(
        back_populates="opportunity", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Opportunity id={self.id} title={self.title}>"


class SavedOpportunity(Base):
    __tablename__ = "saved_opportunities"
    __table_args__ = (
        UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    opportunity_id: Mapped[int] = mapped_column(ForeignKey("opportunities.id"))
    saved_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="saved_opportunities")
    opportunity: Mapped["Opportunity"] = relationship(back_populates="saved_by")

    def __repr__(self) -> str:
        return f"<SavedOpportunity user_id={self.user_id} opportunity_id={self.opportunity_id}>"


class UserPreference(Base):
    __tablename__ = "user_preferences"
    __table_args__ = (UniqueConstraint("user_id", "key", name="uq_user_pref_key"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    key: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="preferences")

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
# Dependency for FastAPI routes
# ----------------------------------------------------------------------
async def get_db():
    """
    Dependency that provides a database session to FastAPI routes.
    Usage: async def my_route(db: AsyncSession = Depends(get_db))
    """
    async for session in get_async_session():
        yield session

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