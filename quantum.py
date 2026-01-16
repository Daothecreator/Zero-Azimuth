"""
Quantum security models for QKD and PQC.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
import uuid

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID

from .base import Base


class QuantumAlgorithm(str, Enum):
    """Post-quantum cryptography algorithm enumeration."""
    KYBER512 = "kyber512"
    KYBER768 = "kyber768"
    KYBER1024 = "kyber1024"
    DILITHIUM2 = "dilithium2"
    DILITHIUM3 = "dilithium3"
    DILITHIUM5 = "dilithium5"
    FALCON512 = "falcon512"
    FALCON1024 = "falcon1024"


class QuantumKeyType(str, Enum):
    """Quantum key type enumeration."""
    SYMMETRIC = "symmetric"
    ASYMMETRIC_PUBLIC = "asymmetric_public"
    ASYMMETRIC_PRIVATE = "asymmetric_private"


class QuantumSession(Base):
    """Quantum cryptography session model."""
    
    __tablename__ = "quantum_sessions"
    
    # Session identification
    session_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    
    # Quantum protocol
    algorithm: Mapped[QuantumAlgorithm] = mapped_column(
        SQLEnum(QuantumAlgorithm), 
        nullable=False
    )
    
    # Session status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    established_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Quantum parameters
    quantum_bits: Mapped[int] = mapped_column(Integer, nullable=False)
    error_rate: Mapped[Optional[float]] = mapped_column()
    key_rate: Mapped[Optional[float]] = mapped_column()
    
    # Security parameters
    authentication_method: Mapped[str] = mapped_column(String(50), nullable=False)
    integrity_check: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Metadata
    client_info: Mapped[Optional[dict]] = mapped_column(JSONB)
    protocol_version: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Relationships
    keys: Mapped[List["QuantumKey"]] = relationship(
        "QuantumKey", 
        back_populates="session", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<QuantumSession(id={self.id}, session_id={self.session_id}, algorithm={self.algorithm})>"


class QuantumKey(Base):
    """Quantum key storage model."""
    
    __tablename__ = "quantum_keys"
    
    # Foreign keys
    session_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("quantum_sessions.id"), 
        nullable=False
    )
    
    # Key details
    key_type: Mapped[QuantumKeyType] = mapped_column(
        SQLEnum(QuantumKeyType), 
        nullable=False
    )
    key_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Key material (encrypted at rest)
    key_material: Mapped[str] = mapped_column(Text, nullable=False)
    key_size: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Key metadata
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Usage tracking
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    use_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Security parameters
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    iv: Mapped[Optional[str]] = mapped_column(String(200))  # Initialization vector
    
    # Quantum verification
    qber: Mapped[Optional[float]] = mapped_column()  # Quantum Bit Error Rate
    privacy_amplification: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    session: Mapped["QuantumSession"] = relationship("QuantumSession", back_populates="keys")
    
    def __repr__(self) -> str:
        return f"<QuantumKey(id={self.id}, key_id={self.key_id}, type={self.key_type})>"


class QuantumChannel(Base):
    """Quantum channel monitoring model."""
    
    __tablename__ = "quantum_channels"
    
    # Channel identification
    channel_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    session_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("quantum_sessions.id"), 
        nullable=False
    )
    
    # Channel parameters
    photon_count: Mapped[int] = mapped_column(Integer, nullable=False)
    detection_rate: Mapped[float] = mapped_column(nullable=False)
    error_rate: Mapped[float] = mapped_column(nullable=False)
    
    # Eavesdropping detection
    eavesdropping_detected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    anomaly_score: Mapped[Optional[float]] = mapped_column()
    
    # Measurement results
    basis_alice: Mapped[Optional[str]] = mapped_column(String(1000))
    basis_bob: Mapped[Optional[str]] = mapped_column(String(1000))
    measurement_results: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Timestamp
    measured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    def __repr__(self) -> str:
        return f"<QuantumChannel(id={self.id}, channel_id={self.channel_id})>"