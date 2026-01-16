"""
Hardware device management models.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import Boolean, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID

from .base import Base


class DeviceType(str, Enum):
    """Hardware device type enumeration."""
    BLUETOOTH = "bluetooth"
    WIFI = "wifi"
    USB = "usb"
    SERIAL = "serial"
    RFID = "rfid"
    SDR = "sdr"
    GPIO = "gpio"


class DeviceStatus(str, Enum):
    """Device connection status enumeration."""
    DISCONNECTED = "disconnected"
    CONNECTED = "connected"
    PAIRED = "paired"
    AUTHENTICATED = "authenticated"
    ERROR = "error"


class HardwareDevice(Base):
    """Hardware device model."""
    
    __tablename__ = "hardware_devices"
    
    # Device identification
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    device_type: Mapped[DeviceType] = mapped_column(
        SQLEnum(DeviceType), 
        nullable=False
    )
    
    # Hardware identifiers
    mac_address: Mapped[Optional[str]] = mapped_column(String(17), index=True)
    serial_number: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    vendor_id: Mapped[Optional[str]] = mapped_column(String(10))
    product_id: Mapped[Optional[str]] = mapped_column(String(10))
    
    # Device information
    manufacturer: Mapped[Optional[str]] = mapped_column(String(200))
    model: Mapped[Optional[str]] = mapped_column(String(200))
    firmware_version: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Connection status
    status: Mapped[DeviceStatus] = mapped_column(
        SQLEnum(DeviceStatus), 
        default=DeviceStatus.DISCONNECTED, 
        nullable=False
    )
    
    # Device capabilities
    capabilities: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    supported_protocols: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Metadata
    discovered_by: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    
    # Tags for organization
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    
    # Relationships
    sessions: Mapped[List["HardwareSession"]] = relationship(
        "HardwareSession", 
        back_populates="device", 
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<HardwareDevice(id={self.id}, name={self.name}, type={self.device_type})>"


class HardwareSession(Base):
    """Hardware session model for active device connections."""
    
    __tablename__ = "hardware_sessions"
    
    device_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("hardware_devices.id"), 
        nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=False
    )
    
    # Session details
    session_token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    
    # Connection information
    connection_string: Mapped[Optional[str]] = mapped_column(String(500))
    interface: Mapped[Optional[str]] = mapped_column(String(50))
    baud_rate: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Session status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    established_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    last_activity: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Data transfer
    bytes_sent: Mapped[int] = mapped_column(Integer, default=0)
    bytes_received: Mapped[int] = mapped_column(Integer, default=0)
    packets_sent: Mapped[int] = mapped_column(Integer, default=0)
    packets_received: Mapped[int] = mapped_column(Integer, default=0)
    
    # Configuration
    config: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Error tracking
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    last_error: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    device: Mapped["HardwareDevice"] = relationship("HardwareDevice", back_populates="sessions")
    
    def __repr__(self) -> str:
        return f"<HardwareSession(id={self.id}, session_token={self.session_token})>"


class BluetoothDevice(HardwareDevice):
    """Bluetooth-specific device information."""
    
    __tablename__ = "bluetooth_devices"
    
    device_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("hardware_devices.id"), 
        primary_key=True
    )
    
    # Bluetooth-specific fields
    device_class: Mapped[Optional[int]] = mapped_column(Integer)
    device_type: Mapped[Optional[str]] = mapped_column(String(50))  # classic, ble, dual
    appearance: Mapped[Optional[int]] = mapped_column(Integer)
    tx_power: Mapped[Optional[int]] = mapped_column(Integer)
    rssi: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Services and characteristics
    services: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    characteristics: Mapped[Optional[List[dict]]] = mapped_column(JSONB)
    
    # Pairing information
    paired: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    bonded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    def __repr__(self) -> str:
        return f"<BluetoothDevice(id={self.device_id}, mac={self.mac_address})>"


class WiFiDevice(HardwareDevice):
    """WiFi-specific device information."""
    
    __tablename__ = "wifi_devices"
    
    device_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("hardware_devices.id"), 
        primary_key=True
    )
    
    # WiFi-specific fields
    ssid: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    bssid: Mapped[Optional[str]] = mapped_column(String(17), index=True)
    channel: Mapped[Optional[int]] = mapped_column(Integer)
    frequency: Mapped[Optional[int]] = mapped_column(Integer)
    signal_strength: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Security
    security_type: Mapped[Optional[str]] = mapped_column(String(50))  # open, wep, wpa, wpa2, wpa3
    encryption: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Connection info
    connected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ip_config: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    # Scan results
    nearby_networks: Mapped[Optional[List[dict]]] = mapped_column(JSONB)
    
    def __repr__(self) -> str:
        return f"<WiFiDevice(id={self.device_id}, ssid={self.ssid})>"


class USBDevice(HardwareDevice):
    """USB-specific device information."""
    
    __tablename__ = "usb_devices"
    
    device_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("hardware_devices.id"), 
        primary_key=True
    )
    
    # USB-specific fields
    device_class: Mapped[Optional[int]] = mapped_column(Integer)
    device_subclass: Mapped[Optional[int]] = mapped_column(Integer)
    device_protocol: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Interface information
    interface_class: Mapped[Optional[int]] = mapped_column(Integer)
    interface_subclass: Mapped[Optional[int]] = mapped_column(Integer)
    interface_protocol: Mapped[Optional[int]] = mapped_column(Integer)
    
    # USB properties
    speed: Mapped[Optional[str]] = mapped_column(String(20))  # low, full, high, super, super+
    max_packet_size: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Configuration
    configuration: Mapped[Optional[int]] = mapped_column(Integer)
    interface: Mapped[Optional[int]] = mapped_column(Integer)
    
    def __repr__(self) -> str:
        return f"<USBDevice(id={self.device_id}, vendor={self.vendor_id}, product={self.product_id})>"