// Core PSO Types

export interface PSOState {
  status: 'phantom' | 'active' | 'detected' | 'migrating';
  nodeCount: number;
  quantumKeyAvailable: boolean;
  blindingActive: boolean;
  lastMigration: Date;
  anomalyScore: number;
}

export interface NATSNode {
  id: string;
  location: string;
  type: 'raspberry' | 'esp32' | 'vps' | 'cloud';
  latency: number;
  active: boolean;
  lastSeen: Date;
  ip: string;
  isPhantom: boolean;
}

export interface TaskExecution {
  id: string;
  query: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  results?: any;
  nodeId?: string;
  blindingRatio: number;
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
