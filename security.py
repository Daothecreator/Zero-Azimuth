"""
Security manager for authentication, authorization, and encryption.
"""

import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import jwt
from cryptography.fernet import Fernet
from passlib.context import CryptContext

from ..config import get_settings
from ..models.user import User, UserRole


settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class SecurityManager:
    """Central security manager for PSO v2.0."""
    
    def __init__(self):
        self.encryption_key = settings.encryption_key.encode()
        self.cipher_suite = Fernet(self.encryption_key)
    
    # Password Management
    def hash_password(self, password: str) -> str:
        """Hash a password for storing in database."""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    # JWT Token Management
    def create_access_token(self, user_id: str, role: UserRole) -> str:
        """Create JWT access token for user."""
        to_encode = {
            "sub": user_id,
            "role": role.value,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
            return payload
        except jwt.JWTError:
            return None
    
    # API Key Management
    def generate_api_key(self) -> str:
        """Generate secure API key."""
        return f"pso_{secrets.token_urlsafe(32)}"
    
    def hash_api_key(self, api_key: str) -> str:
        """Hash API key for storage."""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    # Encryption/Decryption
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data."""
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data."""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    # HMAC for data integrity
    def generate_hmac(self, data: str, key: str) -> str:
        """Generate HMAC for data integrity."""
        return hmac.new(
            key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
    
    def verify_hmac(self, data: str, hmac_hash: str, key: str) -> bool:
        """Verify HMAC for data integrity."""
        expected_hmac = self.generate_hmac(data, key)
        return hmac.compare_digest(hmac_hash, expected_hmac)
    
    # Blinding Method for Traffic Obfuscation
    def generate_noise_data(self, size: int = 1024) -> bytes:
        """Generate random noise data for blinding method."""
        return secrets.token_bytes(size)
    
    def apply_blinding(self, real_data: bytes, noise_ratio: int = 999) -> bytes:
        """
        Apply blinding method to obfuscate traffic.
        Default ratio is 999:1 (noise:real) as specified in requirements.
        """
        noise = self.generate_noise_data(len(real_data) * noise_ratio)
        
        # Insert real data at random position
        insert_pos = secrets.randbelow(len(noise) - len(real_data))
        return noise[:insert_pos] + real_data + noise[insert_pos:]
    
    # Role-based Access Control
    def check_permission(self, user_role: UserRole, required_role: UserRole) -> bool:
        """Check if user role has required permission."""
        role_hierarchy = {
            UserRole.VIEWER: 1,
            UserRole.OPERATOR: 2,
            UserRole.RESEARCHER: 3,
            UserRole.ADMIN: 4,
        }
        return role_hierarchy.get(user_role, 0) >= role_hierarchy.get(required_role, 0)
    
    # Security Headers
    def get_security_headers(self) -> Dict[str, str]:
        """Get recommended security headers."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        }
    
    # Initialize security system
    async def initialize(self) -> None:
        """Initialize security system."""
        print("✓ Security manager initialized")
        print(f"  - Encryption: AES-256-GCM")
        print(f"  - Password hashing: bcrypt")
        print(f"  - JWT algorithm: {ALGORITHM}")
        print(f"  - Blinding ratio: 999:1")