import { useState, useEffect, useCallback } from 'react';
import type { NATSNode } from '@/types/pso.types';

export function useNATS() {
  const [nodes, setNodes] = useState<NATSNode[]>([
    {
      id: 'node-rpi-001',
      location: 'Berlin, DE',
      type: 'raspberry',
      latency: 3.2,
      active: true,
      lastSeen: new Date(),
      ip: '10.0.1.101',
      isPhantom: true
    },
    {
      id: 'node-esp-001',
      location: 'Tokyo, JP',
      type: 'esp32',
      latency: 8.7,
      active: true,
      lastSeen: new Date(),
      ip: '192.168.1.50',
      isPhantom: true
    },
    {
      id: 'node-aws-001',
      location: 'Virginia, US',
      type: 'cloud',
      latency: 12.4,
      active: true,
      lastSeen: new Date(),
      ip: '3.80.123.45',
      isPhantom: false
    },
    {
      id: 'node-gcp-001',
      location: 'Oregon, US',
      type: 'cloud',
      latency: 15.8,
      active: true,
      lastSeen: new Date(),
      ip: '35.185.192.12',
      isPhantom: false
    },
    {
      id: 'node-vps-001',
      location: 'Amsterdam, NL',
      type: 'vps',
      latency: 6.1,
      active: true,
      lastSeen: new Date(),
      ip: '95.179.128.34',
      isPhantom: true
    }
  ]);

  const [messagesPerSecond, setMessagesPerSecond] = useState(1547);
  const [clusterHealth, setClusterHealth] = useState(0.98);

  // Симуляция получения сообщения
  const publishMessage = useCallback((subject: string, payload: any) => {
    console.log(`[NATS] Publishing to ${subject}:`, payload);
    
    // Увеличиваем счетчик сообщений
    setMessagesPerSecond(prev => prev + Math.floor(Math.random() * 10));
    
    // Случайно обновляем задержку узлов
    setNodes(prev => prev.map(node => ({
      ...node,
      latency: Math.max(1, node.latency + (Math.random() - 0.5) * 2),
      lastSeen: new Date()
    })));
  }, []);

  // Подписка на тему
  const subscribe = useCallback((subject: string, callback: (msg: any) => void) => {
    console.log(`[NATS] Subscribing to ${subject}`);
    
    // Симуляция получения сообщений
    const interval = setInterval(() => {
      const mockMessage = {
        subject,
        data: {
          timestamp: new Date().toISOString(),
          nodeId: nodes[Math.floor(Math.random() * nodes.length)].id,
          type: 'heartbeat'
        }
      };
      callback(mockMessage);
    }, 5000);

    return () => clearInterval(interval);
  }, [nodes]);

  // Добавление нового узла
  const addNode = useCallback((node: Omit<NATSNode, 'id' | 'lastSeen'>) => {
    const newNode: NATSNode = {
      ...node,
      id: `node-${Date.now()}`,
      lastSeen: new Date()
    };
    
    setNodes(prev => [...prev, newNode]);
    return newNode.id;
  }, []);

  // Удаление узла
  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
  }, []);

  // Миграция узла
  const migrateNode = useCallback((nodeId: string, newLocation: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, location: newLocation, latency: Math.random() * 20 + 1 }
        : node
    ));
  }, []);

  // Обновление состояния кластера
  useEffect(() => {
    const interval = setInterval(() => {
      const activeNodes = nodes.filter(n => n.active).length;
      const totalNodes = nodes.length;
      const health = activeNodes / totalNodes;
      
      setClusterHealth(health);
      setMessagesPerSecond(prev => Math.max(1000, prev + Math.floor((Math.random() - 0.5) * 100)));
    }, 2000);

    return () => clearInterval(interval);
  }, [nodes]);

  return {
    nodes,
    messagesPerSecond,
    clusterHealth,
    publishMessage,
    subscribe,
    addNode,
    removeNode,
    migrateNode
  };
}
