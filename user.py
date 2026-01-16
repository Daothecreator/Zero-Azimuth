"""
User management models with role-based access control.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID

from .base import Base


class UserRole(str, Enum):
    """User role enumeration."""
    ADMIN = "admin"
    RESEARCHER = "researcher"
    OPERATOR = "operator"
    VIEWER = "viewer"


class User(Base):
    """User model for authentication and authorization."""
    
    __tablename__ = "users"
    
    # Authentication
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Profile
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    
    # Role and permissions
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), 
        default=UserRole.VIEWER, 
        nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Security settings
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    api_key: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    
    # Quantum security
    quantum_public_key: Mapped[Optional[str]] = mapped_column(Text)
    quantum_private_key: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    sessions: Mapped[List["UserSession"]] = relationship(
        "UserSession", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    projects: Mapped[List["ProjectMember"]] = relationship(
        "ProjectMember", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    scans: Mapped[List["Scan"]] = relationship(
        "Scan", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    exploits: Mapped[List["ExploitExecution"]] = relationship(
        "ExploitExecution", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"


class UserSession(Base):
    """User session for tracking active sessions."""
    
    __tablename__ = "user_sessions"
    
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    
    # Session metadata
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    device_info: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Session status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sessions")
    
    def __repr__(self) -> str:
        return f"<UserSession(id={self.id}, user_id={self.user_id}, active={self.is_active})>"


class Permission(Base):
    """Permission model for fine-grained access control."""
    
    __tablename__ = "permissions"
    
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resource: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    
    def __repr__(self) -> str:
        return f"<Permission(id={self.id}, name={self.name})>"


class UserPermission(Base):
    """User-specific permissions (override role defaults)."""
    
    __tablename__ = "user_permissions"
    
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    permission_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("permissions.id"), 
        nullable=False
    )
    granted: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    def __repr__(self) -> str:
        return f"<UserPermission(id={self.id}, user_id={self.user_id}, granted={self.granted})>"