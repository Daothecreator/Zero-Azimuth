"""
Network target and session management models.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, INET, UUID

from .base import Base


class TargetStatus(str, Enum):
    """Network target status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    COMPROMISED = "compromised"
    UNDER_INVESTIGATION = "under_investigation"


class TargetType(str, Enum):
    """Network target type enumeration."""
    HOST = "host"
    NETWORK = "network"
    RANGE = "range"
    DOMAIN = "domain"


class SessionType(str, Enum):
    """Network session type enumeration."""
    SHELL = "shell"
    METERPRETER = "meterpreter"
    WEB_SHELL = "web_shell"
    RDP = "rdp"
    SSH = "ssh"


class NetworkTarget(Base):
    """Network target model for pentest targets."""
    
    __tablename__ = "network_targets"
    
    # Target identification
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    target_type: Mapped[TargetType] = mapped_column(
        SQLEnum(TargetType), 
        nullable=False
    )
    
    # Network information
    ip_address: Mapped[Optional[str]] = mapped_column(INET)
    hostname: Mapped[Optional[str]] = mapped_column(String(255))
    domain: Mapped[Optional[str]] = mapped_column(String(255))
    mac_address: Mapped[Optional[str]] = mapped_column(String(17))
    
    # Network range (for CIDR notation)
    cidr: Mapped[Optional[str]] = mapped_column(String(18))
    
    # Service information
    open_ports: Mapped[Optional[List[int]]] = mapped_column(ARRAY(Integer))
    services: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    os_family: Mapped[Optional[str]] = mapped_column(String(50))
    os_version: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Status and metadata
    status: Mapped[TargetStatus] = mapped_column(
        SQLEnum(TargetStatus), 
        default=TargetStatus.ACTIVE, 
        nullable=False
    )
    is_compromised: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    compromise_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    credentials: Mapped[Optional[List[dict]]] = mapped_column(JSONB)  # Stored encrypted
    
    # Tags for organization
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Relationships
    sessions: Mapped[List["NetworkSession"]] = relationship(
        "NetworkSession", 
        back_populates="target", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<NetworkTarget(id={self.id}, name={self.name}, type={self.target_type})>"


class NetworkSession(Base):
    """Network session model for active connections."""
    
    __tablename__ = "network_sessions"
    
    target_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("network_targets.id"), 
        nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    
    # Session details
    session_type: Mapped[SessionType] = mapped_column(
        SQLEnum(SessionType), 
        nullable=False
    )
    session_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    
    # Connection details
    local_host: Mapped[str] = mapped_column(String(255), nullable=False)
    local_port: Mapped[int] = mapped_column(Integer, nullable=False)
    remote_host: Mapped[str] = mapped_column(String(255), nullable=False)
    remote_port: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Session status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    established_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    last_activity: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Authentication
    username: Mapped[Optional[str]] = mapped_column(String(100))
    auth_method: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Session capabilities
    interactive: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    elevated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Metadata
    platform: Mapped[Optional[str]] = mapped_column(String(50))
    architecture: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Relationships
    target: Mapped["NetworkTarget"] = relationship("NetworkTarget", back_populates="sessions")
    
    def __repr__(self) -> str:
        return f"<NetworkSession(id={self.id}, session_id={self.session_id}, type={self.session_type})>"


class NetworkRoute(Base):
    """Network route model for infrastructure mapping."""
    
    __tablename__ = "network_routes"
    
    # Route information
    destination: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    gateway: Mapped[Optional[str]] = mapped_column(String(255))
    interface: Mapped[Optional[str]] = mapped_column(String(50))
    metric: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Network details
    netmask: Mapped[Optional[str]] = mapped_column(String(50))
    cidr: Mapped[Optional[str]] = mapped_column(String(18))
    
    # Type
    route_type: Mapped[str] = mapped_column(String(20), nullable=False)  # direct, indirect, etc.
    protocol: Mapped[Optional[str]] = mapped_column(String(20))  # static, dynamic
    
    # Discovery information
    discovered_by: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    # Metadata
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    def __repr__(self) -> str:
        return f"<NetworkRoute(id={self.id}, destination={self.destination})>"