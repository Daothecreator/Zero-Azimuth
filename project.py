"""
Project management models.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID

from .base import Base


class ProjectStatus(str, Enum):
    """Project status enumeration."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectType(str, Enum):
    """Project type enumeration."""
    PENTEST = "pentest"
    RED_TEAM = "red_team"
    BLUE_TEAM = "blue_team"
    RESEARCH = "research"
    OSINT = "osint"
    FORENSICS = "forensics"


class Project(Base):
    """Project model for organizing security work."""
    
    __tablename__ = "projects"
    
    # Project details
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[ProjectStatus] = mapped_column(
        SQLEnum(ProjectStatus), 
        default=ProjectStatus.DRAFT, 
        nullable=False
    )
    project_type: Mapped[ProjectType] = mapped_column(
        SQLEnum(ProjectType), 
        nullable=False, 
        index=True
    )
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    targets: Mapped[Optional[list]] = mapped_column(JSONB)
    scope: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Metadata
    tags: Mapped[Optional[list]] = mapped_column(JSONB)
    priority: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Relationships
    members: Mapped[List["ProjectMember"]] = relationship(
        "ProjectMember", 
        back_populates="project", 
        cascade="all, delete-orphan"
    )
    scans: Mapped[List["Scan"]] = relationship(
        "Scan", 
        back_populates="project", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name={self.name}, type={self.project_type})>"


class ProjectMember(Base):
    """Project member relationship model."""
    
    __tablename__ = "project_members"
    
    project_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("projects.id"), 
        nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    
    # Role in project
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="member")
    permissions: Mapped[Optional[list]] = mapped_column(JSONB)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="members")
    user: Mapped["User"] = relationship("User", back_populates="projects")
    
    def __repr__(self) -> str:
        return f"<ProjectMember(id={self.id}, project_id={self.project_id}, user_id={self.user_id})>"