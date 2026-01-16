"""
Scan and vulnerability models for pentest functionality.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID

from .base import Base


class ScanType(str, Enum):
    """Scan type enumeration."""
    PORT = "port"
    VULNERABILITY = "vulnerability"
    WEB = "web"
    NETWORK = "network"
    SERVICE = "service"
    SSL = "ssl"
    DNS = "dns"


class ScanStatus(str, Enum):
    """Scan status enumeration."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SeverityLevel(str, Enum):
    """Vulnerability severity enumeration."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Scan(Base):
    """Scan model for tracking security scans."""
    
    __tablename__ = "scans"
    
    # Foreign keys
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    project_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("projects.id")
    )
    
    # Scan details
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    scan_type: Mapped[ScanType] = mapped_column(
        SQLEnum(ScanType), 
        nullable=False, 
        index=True
    )
    status: Mapped[ScanStatus] = mapped_column(
        SQLEnum(ScanStatus), 
        default=ScanStatus.PENDING, 
        nullable=False
    )
    
    # Targets
    targets: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    ports: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    options: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Timing
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Results summary
    total_hosts: Mapped[int] = mapped_column(Integer, default=0)
    total_services: Mapped[int] = mapped_column(Integer, default=0)
    vulnerabilities_found: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="scans")
    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="scans")
    results: Mapped[List["ScanResult"]] = relationship(
        "ScanResult", 
        back_populates="scan", 
        cascade="all, delete-orphan"
    )
    vulnerabilities: Mapped[List["Vulnerability"]] = relationship(
        "Vulnerability", 
        back_populates="scan", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Scan(id={self.id}, name={self.name}, type={self.scan_type}, status={self.status})>"


class ScanResult(Base):
    """Individual scan result (host/service)."""
    
    __tablename__ = "scan_results"
    
    scan_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("scans.id"), 
        nullable=False
    )
    
    # Target information
    host: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    port: Mapped[Optional[int]] = mapped_column(Integer)
    protocol: Mapped[Optional[str]] = mapped_column(String(10))
    service: Mapped[Optional[str]] = mapped_column(String(100))
    version: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Service details
    banner: Mapped[Optional[str]] = mapped_column(Text)
    os_guess: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Raw data
    raw_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Relationships
    scan: Mapped["Scan"] = relationship("Scan", back_populates="results")
    
    def __repr__(self) -> str:
        return f"<ScanResult(id={self.id}, host={self.host}, port={self.port})>"


class Vulnerability(Base):
    """Vulnerability model for tracking security issues."""
    
    __tablename__ = "vulnerabilities"
    
    scan_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("scans.id"), 
        nullable=False
    )
    
    # Vulnerability details
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    severity: Mapped[SeverityLevel] = mapped_column(
        SQLEnum(SeverityLevel), 
        nullable=False, 
        index=True
    )
    
    # Classification
    cve_id: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    cwe_id: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    
    # Location
    host: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    port: Mapped[Optional[int]] = mapped_column(Integer)
    path: Mapped[Optional[str]] = mapped_column(String(500))
    parameter: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Evidence
    evidence: Mapped[Optional[str]] = mapped_column(Text)
    request: Mapped[Optional[str]] = mapped_column(Text)
    response: Mapped[Optional[str]] = mapped_column(Text)
    
    # Remediation
    solution: Mapped[Optional[str]] = mapped_column(Text)
    references: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Status
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    false_positive: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Raw data
    raw_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Relationships
    scan: Mapped["Scan"] = relationship("Scan", back_populates="vulnerabilities")
    
    def __repr__(self) -> str:
        return f"<Vulnerability(id={self.id}, name={self.name}, severity={self.severity})>"