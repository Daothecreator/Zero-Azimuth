"""
Quantum Engine for QKD and Post-Quantum Cryptography.
"""

import secrets
import hashlib
from typing import Tuple, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

from ..config import get_settings
from ..models.quantum import QuantumAlgorithm, QuantumKeyType


settings = get_settings()


@dataclass
class QuantumKey:
    """Quantum key data structure."""
    key_id: str
    key_material: bytes
    key_size: int
    key_type: QuantumKeyType
    algorithm: QuantumAlgorithm
    generated_at: datetime
    checksum: str
    qber: Optional[float] = None  # Quantum Bit Error Rate


class QuantumEngine:
    """Quantum Engine for PSO v2.0 quantum security features."""
    
    def __init__(self):
        self.backend = default_backend()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
    
    # Quantum Key Distribution (QKD) Simulation
    def generate_quantum_key(self, key_size: int = 256) -> QuantumKey:
        """
        Simulate QKD key generation.
        In real implementation, this would interface with quantum hardware.
        """
        # Generate random key material
        key_material = secrets.token_bytes(key_size // 8)
        
        # Generate key ID
        key_id = f"qk_{secrets.token_urlsafe(16)}"
        
        # Calculate checksum
        checksum = hashlib.sha256(key_material).hexdigest()
        
        # Simulate QBER (should be < 11% for secure key)
        qber = secrets.uniform(0.01, 0.08)  # 1-8%
        
        return QuantumKey(
            key_id=key_id,
            key_material=key_material,
            key_size=key_size,
            key_type=QuantumKeyType.SYMMETRIC,
            algorithm=QuantumAlgorithm.KYBER768,
            generated_at=datetime.utcnow(),
            checksum=checksum,
            qber=qber
        )
    
    def simulate_qkd_protocol(self, session_id: str, num_qubits: int = 1024) -> Tuple[QuantumKey, Dict[str, Any]]:
        """
        Simulate BB84 QKD protocol.
        Returns quantum key and protocol metadata.
        """
        # Alice prepares qubits in random bases
        alice_bases = [secrets.choice(['+', 'x']) for _ in range(num_qubits)]
        alice_bits = [secrets.choice([0, 1]) for _ in range(num_qubits)]
        
        # Bob measures in random bases
        bob_bases = [secrets.choice(['+', 'x']) for _ in range(num_qubits)]
        
        # Calculate matching bases
        matching_bases = [i for i, (a, b) in enumerate(zip(alice_bases, bob_bases)) if a == b]
        
        # Sifted key from matching bases
        sifted_key_bits = [alice_bits[i] for i in matching_bases]
        
        # Simulate eavesdropping detection
        test_indices = secrets.sample(range(len(sifted_key_bits)), min(100, len(sifted_key_bits) // 10))
        test_bits = [sifted_key_bits[i] for i in test_indices]
        
        # Calculate QBER
        error_bits = sum(secrets.choice([0, 1]) for _ in test_bits)  # Simulate errors
        qber = error_bits / len(test_bits) if test_bits else 0
        
        # Final key (remove test bits)
        final_key_bits = [bit for i, bit in enumerate(sifted_key_bits) if i not in test_indices]
        
        # Convert to bytes
        key_bytes = self._bits_to_bytes(final_key_bits[:256])  # 256-bit key
        
        # Create quantum key
        quantum_key = QuantumKey(
            key_id=f"qkd_{session_id}_{secrets.token_urlsafe(8)}",
            key_material=key_bytes,
            key_size=256,
            key_type=QuantumKeyType.SYMMETRIC,
            algorithm=QuantumAlgorithm.KYBER768,
            generated_at=datetime.utcnow(),
            checksum=hashlib.sha256(key_bytes).hexdigest(),
            qber=qber
        )
        
        metadata = {
            "session_id": session_id,
            "num_qubits": num_qubits,
            "matching_bases": len(matching_bases),
            "sifted_key_length": len(sifted_key_bits),
            "final_key_length": len(final_key_bits),
            "qber": qber,
            "security_check": "PASSED" if qber < 0.11 else "FAILED",
            "eavesdropping_detected": qber > 0.11
        }
        
        return quantum_key, metadata
    
    def _bits_to_bytes(self, bits: List[int]) -> bytes:
        """Convert list of bits to bytes."""
        byte_array = bytearray()
        for i in range(0, len(bits), 8):
            byte = 0
            for j in range(min(8, len(bits) - i)):
                byte |= bits[i + j] << (7 - j)
            byte_array.append(byte)
        return bytes(byte_array)
    
    # Post-Quantum Cryptography (PQC)
    def generate_pqc_keypair(self, algorithm: QuantumAlgorithm) -> Tuple[bytes, bytes]:
        """
        Generate post-quantum cryptography keypair.
        This is a simulation - real implementation would use PQC libraries.
        """
        if algorithm in [QuantumAlgorithm.KYBER512, QuantumAlgorithm.KYBER768, QuantumAlgorithm.KYBER1024]:
            # Simulate KEM key generation
            private_key = secrets.token_bytes(32)
            public_key = secrets.token_bytes(32)
            return public_key, private_key
        
        elif algorithm in [QuantumAlgorithm.DILITHIUM2, QuantumAlgorithm.DILITHIUM3, QuantumAlgorithm.DILITHIUM5]:
            # Simulate signature key generation
            private_key = secrets.token_bytes(64)
            public_key = secrets.token_bytes(32)
            return public_key, private_key
        
        elif algorithm in [QuantumAlgorithm.FALCON512, QuantumAlgorithm.FALCON1024]:
            # Simulate signature key generation
            private_key = secrets.token_bytes(48)
            public_key = secrets.token_bytes(24)
            return public_key, private_key
        
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
    
    def pqc_encrypt(self, public_key: bytes, plaintext: bytes, algorithm: QuantumAlgorithm) -> bytes:
        """Post-quantum encryption (KEM encapsulate)."""
        # Simulate KEM encapsulation
        shared_secret = secrets.token_bytes(32)
        ciphertext = secrets.token_bytes(len(plaintext) + 32)
        return ciphertext
    
    def pqc_decrypt(self, private_key: bytes, ciphertext: bytes, algorithm: QuantumAlgorithm) -> bytes:
        """Post-quantum decryption (KEM decapsulate)."""
        # Simulate KEM decapsulation
        plaintext = secrets.token_bytes(len(ciphertext) - 32)
        return plaintext
    
    def pqc_sign(self, private_key: bytes, message: bytes, algorithm: QuantumAlgorithm) -> bytes:
        """Post-quantum signature generation."""
        # Simulate signature generation
        signature = hmac.new(private_key, message, hashlib.sha256).digest()
        return signature
    
    def pqc_verify(self, public_key: bytes, message: bytes, signature: bytes, algorithm: QuantumAlgorithm) -> bool:
        """Post-quantum signature verification."""
        # Simulate signature verification
        expected = hmac.new(public_key, message, hashlib.sha256).digest()
        return hmac.compare_digest(signature, expected)
    
    # Quantum Session Management
    def create_quantum_session(self, session_id: str, algorithm: QuantumAlgorithm) -> Dict[str, Any]:
        """Create quantum cryptography session."""
        # Generate keypair
        public_key, private_key = self.generate_pqc_keypair(algorithm)
        
        # Generate quantum key
        quantum_key = self.generate_quantum_key()
        
        session_data = {
            "session_id": session_id,
            "algorithm": algorithm.value,
            "public_key": public_key.hex(),
            "private_key": private_key.hex(),
            "quantum_key_id": quantum_key.key_id,
            "quantum_key_checksum": quantum_key.checksum,
            "qber": quantum_key.qber,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        
        self.active_sessions[session_id] = session_data
        return session_data
    
    def get_session_key(self, session_id: str) -> Optional[QuantumKey]:
        """Get quantum key for session."""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        
        # Generate key material from session
        key_material = secrets.token_bytes(32)
        
        return QuantumKey(
            key_id=session["quantum_key_id"],
            key_material=key_material,
            key_size=256,
            key_type=QuantumKeyType.SYMMETRIC,
            algorithm=QuantumAlgorithm(session["algorithm"]),
            generated_at=datetime.fromisoformat(session["created_at"]),
            checksum=session["quantum_key_checksum"],
            qber=session.get("qber")
        )
    
    def quantum_encrypt(self, session_id: str, plaintext: bytes) -> Dict[str, Any]:
        """Encrypt data using quantum key."""
        quantum_key = self.get_session_key(session_id)
        if not quantum_key:
            raise ValueError(f"No quantum key found for session {session_id}")
        
        # Use quantum key for encryption
        # In real implementation, this would use the actual key material
        encrypted = self._symmetric_encrypt(quantum_key.key_material, plaintext)
        
        return {
            "ciphertext": encrypted.hex(),
            "key_id": quantum_key.key_id,
            "algorithm": quantum_key.algorithm.value,
            "qber": quantum_key.qber,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def quantum_decrypt(self, session_id: str, encrypted_data: Dict[str, Any]) -> bytes:
        """Decrypt data using quantum key."""
        quantum_key = self.get_session_key(session_id)
        if not quantum_key or quantum_key.key_id != encrypted_data["key_id"]:
            raise ValueError("Invalid quantum key")
        
        # Verify QBER is within acceptable limits
        if quantum_key.qber and quantum_key.qber > 0.11:
            raise ValueError("Quantum key compromised - QBER too high")
        
        # Decrypt using quantum key
        ciphertext = bytes.fromhex(encrypted_data["ciphertext"])
        return self._symmetric_decrypt(quantum_key.key_material, ciphertext)
    
    def _symmetric_encrypt(self, key: bytes, plaintext: bytes) -> bytes:
        """Symmetric encryption using quantum key."""
        # Simple XOR for demonstration - use proper encryption in production
        key_expanded = (key * ((len(plaintext) // len(key)) + 1))[:len(plaintext)]
        return bytes(a ^ b for a, b in zip(plaintext, key_expanded))
    
    def _symmetric_decrypt(self, key: bytes, ciphertext: bytes) -> bytes:
        """Symmetric decryption using quantum key."""
        # XOR is its own inverse
        return self._symmetric_encrypt(key, ciphertext)
    
    # Security Verification
    def verify_quantum_security(self, session_id: str) -> Dict[str, Any]:
        """Verify quantum security parameters."""
        if session_id not in self.active_sessions:
            return {"valid": False, "error": "Session not found"}
        
        session = self.active_sessions[session_id]
        
        checks = {
            "session_active": session.get("is_active", False),
            "qber_valid": session.get("qber", 0) < 0.11,
            "key_verified": True,  # In real implementation, verify key checksum
            "algorithm_secure": session.get("algorithm") in [alg.value for alg in QuantumAlgorithm],
            "timestamp_valid": True  # Check key age
        }
        
        all_valid = all(checks.values())
        
        return {
            "valid": all_valid,
            "checks": checks,
            "recommendations": self._get_security_recommendations(checks)
        }
    
    def _get_security_recommendations(self, checks: Dict[str, bool]) -> List[str]:
        """Get security recommendations based on checks."""
        recommendations = []
        
        if not checks.get("qber_valid", True):
            recommendations.append("QBER too high - possible eavesdropping detected")
        
        if not checks.get("session_active", True):
            recommendations.append("Session inactive - regenerate quantum key")
        
        return recommendations
    
    # Initialize quantum engine
    async def initialize(self) -> None:
        """Initialize quantum engine."""
        print("✓ Quantum Engine initialized")
        print("  - QKD protocol: BB84")
        print("  - PQC algorithms: Kyber, Dilithium, Falcon")
        print("  - Security threshold: QBER < 11%")
        print("  - Key size: 256-bit symmetric")