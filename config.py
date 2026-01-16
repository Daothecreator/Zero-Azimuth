"""
PSO v2.0 - Configuration
"""

import os
from pathlib import Path
from typing import List, Optional

from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "PSO v2.0"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    TESTING: bool = Field(default=False, env="TESTING")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    WORKERS: int = Field(default=1, env="WORKERS")
    
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    REDIS_URL: str = Field(..., env="REDIS_URL")
    
    # NATS
    NATS_URL: str = Field(..., env="NATS_URL")
    NATS_SERVERS: List[str] = Field(default_factory=list, env="NATS_SERVERS")
    
    # Security
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRATION_HOURS: int = Field(default=24, env="JWT_EXPIRATION_HOURS")
    
    PQC_PRIVATE_KEY: str = Field(..., env="PQC_PRIVATE_KEY")
    PQC_PUBLIC_KEY: str = Field(default="", env="PQC_PUBLIC_KEY")
    
    # Password security
    BCRYPT_ROUNDS: int = Field(default=12, env="BCRYPT_ROUNDS")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    # Session security
    MAX_LOGIN_ATTEMPTS: int = Field(default=5, env="MAX_LOGIN_ATTEMPTS")
    LOCKOUT_DURATION: int = Field(default=300, env="LOCKOUT_DURATION")
    SESSION_TIMEOUT: int = Field(default=3600, env="SESSION_TIMEOUT")
    
    # Node settings
    NODE_ID: str = Field(default="pso-node-001", env="NODE_ID")
    NODE_LOCATION: str = Field(default="unknown", env="NODE_LOCATION")
    NODE_PROVIDER: str = Field(default="local", env="NODE_PROVIDER")
    
    # Upload settings
    MAX_UPLOAD_SIZE: int = Field(default=104857600, env="MAX_UPLOAD_SIZE")  # 100MB
    UPLOAD_PATH: str = Field(default="/app/uploads", env="UPLOAD_PATH")
    
    # Scan settings
    MAX_CONCURRENT_SCANS: int = Field(default=10, env="MAX_CONCURRENT_SCANS")
    SCAN_TIMEOUT: int = Field(default=300, env="SCAN_TIMEOUT")
    
    # Quantum settings
    QUANTUM_KEY_LENGTH: int = Field(default=256, env="QUANTUM_KEY_LENGTH")
    QKD_ERROR_THRESHOLD: float = Field(default=0.11, env="QKD_ERROR_THRESHOLD")
    
    # Blinding settings
    BLINDING_RATIO: float = Field(default=0.999, env="BLINDING_RATIO")
    NOISE_QUERIES: int = Field(default=999, env="NOISE_QUERIES")
    
    # Network settings
    DEFAULT_INTERFACE: str = Field(default="eth0", env="DEFAULT_INTERFACE")
    LISTEN_PORT: int = Field(default=8000, env="LISTEN_PORT")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="/app/logs/pso.log", env="LOG_FILE")
    
    # Feature flags
    ENABLE_PENTEST: bool = Field(default=True, env="ENABLE_PENTEST")
    ENABLE_OSINT: bool = Field(default=True, env="ENABLE_OSINT")
    ENABLE_CRYPTO: bool = Field(default=True, env="ENABLE_CRYPTO")
    ENABLE_HARDWARE: bool = Field(default=True, env="ENABLE_HARDWARE")
    ENABLE_EXPLOITS: bool = Field(default=True, env="ENABLE_EXPLOITS")
    ENABLE_P2P: bool = Field(default=True, env="ENABLE_P2P")
    
    # API Keys (опционально)
    SHODAN_API_KEY: str = Field(default="", env="SHODAN_API_KEY")
    CENSYS_API_ID: str = Field(default="", env="CENSYS_API_ID")
    CENSYS_API_SECRET: str = Field(default="", env="CENSYS_API_SECRET")
    TWITTER_BEARER_TOKEN: str = Field(default="", env="TWITTER_BEARER_TOKEN")
    GITHUB_TOKEN: str = Field(default="", env="GITHUB_TOKEN")
    
    # Metasploit (опционально)
    MSF_RPC_HOST: str = Field(default="localhost", env="MSF_RPC_HOST")
    MSF_RPC_PORT: int = Field(default=55553, env="MSF_RPC_PORT")
    MSF_RPC_USER: str = Field(default="msf", env="MSF_RPC_USER")
    MSF_RPC_PASSWORD: str = Field(default="", env="MSF_RPC_PASSWORD")
    
    # Quantum RNG (опционально)
    QRNG_DEVICE: str = Field(default="/dev/qrng", env="QRNG_DEVICE")
    
    # CORS
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"], env="CORS_ORIGINS")
    
    # SSL/TLS
    SSL_CERTFILE: str = Field(default="", env="SSL_CERTFILE")
    SSL_KEYFILE: str = Field(default="", env="SSL_KEYFILE")
    
    @validator("NATS_SERVERS", pre=True)
    def parse_nats_servers(cls, v):
        if isinstance(v, str):
            return [server.strip() for server in v.split(",")]
        return v
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


# Export for easy import
settings = get_settings()
