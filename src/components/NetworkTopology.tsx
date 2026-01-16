import { useState, useEffect } from 'react';
import { useNATS } from '@/hooks/useNATS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Network, Server, Cpu, Wifi, Globe,
  Activity, Gauge, MapPin, Zap, Shield,
  ArrowRight, RefreshCw, Plus, Minus
} from 'lucide-react';

export function NetworkTopology() {
  const { nodes, messagesPerSecond, clusterHealth, migrateNode, addNode, removeNode } = useNATS();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animatedHealth, setAnimatedHealth] = useState(clusterHealth);

  // Анимация здоровья кластера
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedHealth(prev => {
        const diff = clusterHealth - prev;
        return prev + diff * 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [clusterHealth]);

  // Получение иконки для типа узла
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'raspberry': return <Cpu className="w-4 h-4" />;
      case 'esp32': return <Wifi className="w-4 h-4" />;
      case 'vps': return <Server className="w-4 h-4" />;
      case 'cloud': return <Globe className="w-4 h-4" />;
      default: return <Network className="w-4 h-4" />;
    }
  };

  // Получение цвета для узла
  const getNodeColor = (node: any) => {
    if (!node.active) return 'bg-red-500/20 border-red-500/50';
    if (node.latency < 5) return 'bg-green-500/20 border-green-500/50';
    if (node.latency < 15) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-orange-500/20 border-orange-500/50';
  };

  // Получение цвета латентности
  const getLatencyColor = (latency: number): string => {
    if (latency < 5) return 'text-green-400';
    if (latency < 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Статистика кластера */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Activity className="w-3 h-3" />
              Сообщений/сек
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono text-cyan-400">
              {messagesPerSecond.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Gauge className="w-3 h-3" />
              Здоровье
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono text-green-400">
              {(animatedHealth * 100).toFixed(1)}%
            </div>
            <div 
              className="h-2 bg-secondary rounded-full overflow-hidden mt-1"
              style={{ width: '100%' }}
            >
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${animatedHealth * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Server className="w-3 h-3" />
              Узлов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono text-purple-400">
              {nodes.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {nodes.filter(n => n.active).length} активных
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3" />
              Средняя задержка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono text-yellow-400">
              {(nodes.reduce((acc, node) => acc + node.latency, 0) / nodes.length).toFixed(1)}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Топология сети */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="w-4 h-4" />
              NATS JetStream Топология
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const newNode = {
                    location: `Node-${Date.now()}`,
                    type: 'vps' as const,
                    latency: Math.random() * 20 + 1,
                    active: true,
                    ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    isPhantom: Math.random() > 0.5
                  };
                  addNode(newNode);
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  getNodeColor(node)
                } ${selectedNode === node.id ? 'ring-2 ring-cyan-400' : ''}`}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                {/* Заголовок узла */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      node.active ? 'bg-green-500' : 'bg-red-500'
                    } animate-pulse`} />
                    <span className="font-mono text-sm">{node.id}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={node.isPhantom ? 'bg-purple-500/20 text-purple-400' : ''}
                  >
                    {node.isPhantom ? 'PHANTOM' : 'REAL'}
                  </Badge>
                </div>

                {/* Тип и местоположение */}
                <div className="flex items-center gap-2 mb-2">
                  {getNodeIcon(node.type)}
                  <span className="capitalize text-sm">{node.type}</span>
                  <span className="text-muted-foreground">•</span>
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm">{node.location}</span>
                </div>

                {/* IP адрес */}
                <div className="font-mono text-xs text-muted-foreground mb-3">
                  {node.ip}
                </div>

                {/* Метрики */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Задержка</div>
                    <div className={`font-mono ${getLatencyColor(node.latency)}`}>
                      {node.latency.toFixed(1)}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Последняя активность</div>
                    <div className="font-mono">
                      {Math.floor((Date.now() - node.lastSeen.getTime()) / 1000)}s назад
                    </div>
                  </div>
                </div>

                {/* Действия */}
                {selectedNode === node.id && (
                  <div className="mt-4 pt-3 border-t border-border flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        migrateNode(node.id, `New-Location-${Date.now()}`);
                      }}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Мигрировать
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Схема потока данных */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Поток данных (MQTT over WSS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-black rounded-lg">
            {/* Пользователь */}
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-xs">User</div>
            </div>

            {/* Стрелка */}
            <ArrowRight className="w-8 h-8 text-muted-foreground" />

            {/* WebSocket */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-xs">WSS (443)</div>
              <div className="text-xs text-muted-foreground">HTTPS трафик</div>
            </div>

            {/* Стрелка */}
            <ArrowRight className="w-8 h-8 text-muted-foreground" />

            {/* MQTT */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-xs">MQTT</div>
              <div className="text-xs text-muted-foreground">Внутри WSS</div>
            </div>

            {/* Стрелка */}
            <ArrowRight className="w-8 h-8 text-muted-foreground" />

            {/* NATS */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <Server className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-xs">NATS</div>
              <div className="text-xs text-muted-foreground">JetStream</div>
            </div>

            {/* Стрелка */}
            <ArrowRight className="w-8 h-8 text-muted-foreground" />

            {/* Узлы */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                <Cpu className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-xs">Phantom Nodes</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Для внешних систем это выглядит как обычный HTTPS трафик
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
