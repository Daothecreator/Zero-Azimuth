// AI-Enhanced Event Orchestration Types

export interface AIEOState {
  slowLoop: SlowLoopState;
  mediumLoop: MediumLoopState;
  fastLoop: FastLoopState;
}

export interface SlowLoopState {
  model: 'arima' | 'prophet' | 'lstm';
  prediction?: PredictionWindow;
  networkTraffic: NetworkMetrics;
  confidence: number;
}

export interface MediumLoopState {
  algorithm: 'ppo';
  nodes: ManagedNode[];
  migrationCount: number;
  costPerHour: number;
  detectionRisk: number;
}

export interface FastLoopState {
  taskQueue: QueuedTask[];
  activeTasks: number;
  avgExecutionTime: number;
  successRate: number;
}

export interface PredictionWindow {
  startTime: Date;
  duration: number; // seconds
  confidence: number;
  recommendedAction: 'execute' | 'wait' | 'migrate';
}

export interface NetworkMetrics {
  packetsPerSecond: number;
  latency: number;
  timeOfDay: number;
  dayOfWeek: number;
  region: string;
}

export interface ManagedNode {
  id: string;
  provider: 'aws' | 'gcp' | 'azure' | 'oracle' | 'local';
  instanceType: string;
  cpuUsage: number;
  memoryUsage: number;
  costPerSecond: number;
  uptime: number;
}

export interface QueuedTask {
  id: string;
  type: 'search' | 'download' | 'summarize';
  priority: number;
  estimatedTime: number;
  dependencies: string[];
}
