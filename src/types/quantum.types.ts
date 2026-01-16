// Quantum Security Types

export interface QuantumState {
  qkdAvailable: boolean;
  pqcEnabled: boolean;
  quantumKeyPool: QuantumKey[];
  activeSessions: QuantumSession[];
  fiberChannelStatus: 'connected' | 'disconnected' | 'error';
}

export interface QuantumKey {
  keyId: string;
  keyData: string;
  length: number;
  generatedAt: Date;
  used: boolean;
  qkdSuccess: boolean;
  errorRate: number;
}

export interface QuantumSession {
  sessionId: string;
  quantumKey: string;
  pqcAlgorithm: 'dilithium' | 'falcon';
  qkdSuccess: boolean;
  keyLength: number;
  establishedAt: Date;
  expiresAt: Date;
}

export interface BlindingState {
  active: boolean;
  noiseRatio: number;
  realQueries: number;
  noiseQueries: number;
  templates: NoiseTemplate[];
  entropy: number;
}

export interface NoiseTemplate {
  id: string;
  template: string;
  category: 'physics' | 'math' | 'biology' | 'chemistry';
  expectedResult: string;
  usageCount: number;
}

export interface SecurityMetrics {
  anomalyScore: number;
  detectionProbability: number;
  encryptionStrength: number;
  blindingEffectiveness: number;
  quantumSecurityLevel: number;
}
