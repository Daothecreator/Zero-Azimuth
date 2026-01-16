"""
Knowledge base and shadow library models.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID

from .base import Base


class ShadowLibraryType(str, Enum):
    """Shadow library type enumeration."""
    SCI_HUB = "sci_hub"
    LIBGEN = "libgen"
    ANNA_ARCHIVE = "anna_archive"
    Z_LIBRARY = "z_library"
    SCI_NET = "sci_net"


class PaperStatus(str, Enum):
    """Research paper status enumeration."""
    PENDING = "pending"
    DOWNLOADING = "downloading"
    DOWNLOADED = "downloaded"
    FAILED = "failed"
    NOT_FOUND = "not_found"


class KnowledgeBase(Base):
    """Knowledge base categories and collections."""
    
    __tablename__ = "knowledge_bases"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Relationships
    papers: Mapped[List["ResearchPaper"]] = relationship(
        "ResearchPaper", 
        back_populates="knowledge_base", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<KnowledgeBase(id={self.id}, name={self.name}, category={self.category})>"


class ResearchPaper(Base):
    """Research paper model with shadow library integration."""
    
    __tablename__ = "research_papers"
    
    # Paper details
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    authors: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    abstract: Mapped[Optional[str]] = mapped_column(Text)
    publication_year: Mapped[Optional[int]] = mapped_column(Integer)
    journal: Mapped[Optional[str]] = mapped_column(String(200))
    doi: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    
    # Identifiers
    pmid: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    arxiv_id: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    isbn: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Shadow library access
    sci_hub_url: Mapped[Optional[str]] = mapped_column(String(500))
    libgen_id: Mapped[Optional[str]] = mapped_column(String(50))
    anna_archive_id: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Download status
    download_status: Mapped[PaperStatus] = mapped_column(
        SQLEnum(PaperStatus), 
        default=PaperStatus.PENDING, 
        nullable=False
    )
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64))
    
    # Metadata
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    citations: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    references: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Full-text search
    full_text: Mapped[Optional[str]] = mapped_column(Text)
    
    # Foreign keys
    knowledge_base_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("knowledge_bases.id")
    )
    
    # Relationships
    knowledge_base: Mapped[Optional["KnowledgeBase"]] = relationship(
        "KnowledgeBase", 
        back_populates="papers"
    )
    downloads: Mapped[List["ShadowLibrary"]] = relationship(
        "ShadowLibrary", 
        back_populates="paper", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<ResearchPaper(id={self.id}, title={self.title[:50]}...)>"


class ShadowLibrary(Base):
    """Shadow library download tracking."""
    
    __tablename__ = "shadow_libraries"
    
    # Library information
    library_type: Mapped[ShadowLibraryType] = mapped_column(
        SQLEnum(ShadowLibraryType), 
        nullable=False
    )
    external_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Download details
    download_url: Mapped[Optional[str]] = mapped_column(String(1000))
    download_headers: Mapped[Optional[dict]] = mapped_column(JSONB)
    download_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Status and metadata
    status: Mapped[PaperStatus] = mapped_column(
        SQLEnum(PaperStatus), 
        default=PaperStatus.PENDING, 
        nullable=False
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # File information
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64))
    file_format: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Foreign keys
    paper_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("research_papers.id"), 
        nullable=False
    )
    
    # Relationships
    paper: Mapped["ResearchPaper"] = relationship("ResearchPaper", back_populates="downloads")
    
    def __repr__(self) -> str:
        return f"<ShadowLibrary(id={self.id}, type={self.library_type}, paper_id={self.paper_id})>"


class KnowledgeTag(Base):
    """Tags for knowledge base organization."""
    
    __tablename__ = "knowledge_tags"
    
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(7))  # Hex color
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[Optional[str]] = mapped_column(String(50))
    
    def __repr__(self) -> str:
        return f"<KnowledgeTag(id={self.id}, name={self.name})>"