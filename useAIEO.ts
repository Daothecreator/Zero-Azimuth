import { useState, useEffect, useCallback } from 'react';
import type { AIEOState, PredictionWindow } from '@/types/aieo.types';

export function useAIEO() {
  const [state, setState] = useState<AIEOState>({
    slowLoop: {
      model: 'lstm',
      networkTraffic: {
        packetsPerSecond: 1500,
        latency: 12,
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        region: 'us-east-1'
      },
      confidence: 0.92
    },
    mediumLoop: {
      algorithm: 'ppo',
      nodes: [
        {
          id: 'node-aws-1',
          provider: 'aws',
          instanceType: 't2.micro',
          cpuUsage: 23,
          memoryUsage: 45,
          costPerSecond: 0.0001,
          uptime: 3600
        },
        {
          id: 'node-gcp-1',
          provider: 'gcp',
          instanceType: 'e2-micro',
          cpuUsage: 31,
          memoryUsage: 52,
          costPerSecond: 0.00008,
          uptime: 1800
        }
      ],
      migrationCount: 12,
      costPerHour: 0.28,
      detectionRisk: 0.03
    },
    fastLoop: {
      taskQueue: [
        {
          id: 'task-001',
          type: 'search',
          priority: 0.9,
          estimatedTime: 2.5,
          dependencies: []
        }
      ],
      activeTasks: 3,
      avgExecutionTime: 4.2,
      successRate: 0.997
    }
  });

  const [prediction, setPrediction] = useState<PredictionWindow | null>(null);

  // Симуляция прогностического анализа
  const generatePrediction = useCallback(() => {
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 60) + 10;
    const startTime = new Date(now.getTime() + randomMinutes * 60000);
    const duration = Math.floor(Math.random() * 120) + 60; // 1-3 минуты
    const confidence = Math.random() * 0.3 + 0.7; // 0.7 - 1.0

    const actions: Array<'execute' | 'wait' | 'migrate'> = ['execute', 'wait', 'migrate'];
    const recommendedAction = actions[Math.floor(Math.random() * actions.length)];

    return {
      startTime,
      duration,
      confidence: parseFloat(confidence.toFixed(2)),
      recommendedAction
    };
  }, []);

  // Обновление состояния каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        slowLoop: {
          ...prev.slowLoop,
          networkTraffic: {
            ...prev.slowLoop.networkTraffic,
            packetsPerSecond: 1000 + Math.floor(Math.random() * 1000),
            latency: 8 + Math.random() * 10,
            timeOfDay: new Date().getHours()
          },
          confidence: Math.min(0.99, prev.slowLoop.confidence + (Math.random() - 0.5) * 0.1)
        },
        mediumLoop: {
          ...prev.mediumLoop,
          nodes: prev.mediumLoop.nodes.map(node => ({
            ...node,
            cpuUsage: Math.max(5, Math.min(95, node.cpuUsage + (Math.random() - 0.5) * 10)),
            memoryUsage: Math.max(10, Math.min(90, node.memoryUsage + (Math.random() - 0.5) * 8))
          })),
          detectionRisk: Math.max(0.01, Math.min(0.1, prev.mediumLoop.detectionRisk + (Math.random() - 0.5) * 0.01))
        },
        fastLoop: {
          ...prev.fastLoop,
          avgExecutionTime: Math.max(1, prev.fastLoop.avgExecutionTime + (Math.random() - 0.5) * 0.5),
          successRate: Math.max(0.99, Math.min(0.999, prev.fastLoop.successRate + (Math.random() - 0.5) * 0.001))
        }
      }));

      // Обновляем предсказание каждые 30 секунд
      if (Math.random() < 0.17) { // ~каждые 30 сек
        setPrediction(generatePrediction());
      }
    }, 5000);

    // Инициализируем первое предсказание
    setPrediction(generatePrediction());

    return () => clearInterval(interval);
  }, [generatePrediction]);

  const executeTask = useCallback((task: string) => {
    console.log('AIEO: Executing task:', task);
  }, []);

  const migrateNodes = useCallback(() => {
    setState(prev => ({
      ...prev,
      mediumLoop: {
        ...prev.mediumLoop,
        migrationCount: prev.mediumLoop.migrationCount + 1,
        nodes: prev.mediumLoop.nodes.map(node => ({
          ...node,
          id: `${node.provider}-${Date.now()}`,
          uptime: 0
        }))
      }
    }));
  }, []);

  return {
    state,
    prediction,
    executeTask,
    migrateNodes
  };
}
