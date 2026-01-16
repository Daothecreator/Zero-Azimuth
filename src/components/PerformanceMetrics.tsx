import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Clock, Zap, Target,
  TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function PerformanceMetrics() {
  const [latencyData, setLatencyData] = useState<any[]>([]);
  const [throughputData, setThroughputData] = useState<any[]>([]);
  const [detectionRiskData, setDetectionRiskData] = useState<any[]>([]);

  // Генерация данных для графиков
  useEffect(() => {
    const generateData = () => {
      const now = Date.now();
      const newLatency = Array.from({ length: 20 }, (_, i) => ({
        time: new Date(now - (19 - i) * 5000).toLocaleTimeString(),
        value: Math.random() * 10 + 5 + Math.sin(i * 0.5) * 3
      }));

      const newThroughput = Array.from({ length: 20 }, (_, i) => ({
        time: new Date(now - (19 - i) * 5000).toLocaleTimeString(),
        value: Math.random() * 500 + 1000 + Math.sin(i * 0.3) * 200
      }));

      const newDetectionRisk = Array.from({ length: 20 }, (_, i) => ({
        time: new Date(now - (19 - i) * 5000).toLocaleTimeString(),
        value: Math.max(0.01, Math.random() * 0.05 + Math.sin(i * 0.7) * 0.02)
      }));

      setLatencyData(newLatency);
      setThroughputData(newThroughput);
      setDetectionRiskData(newDetectionRisk);
    };

    generateData();
    const interval = setInterval(generateData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Метрики производительности
  const metrics = [
    {
      label: 'Query Response Time',
      value: '1.2s',
      target: '< 10s',
      status: 'success',
      icon: Clock,
      progress: 88
    },
    {
      label: 'Node Migration Time',
      value: '8.5s',
      target: '< 30s',
      status: 'success',
      icon: Activity,
      progress: 72
    },
    {
      label: 'Quantum Key Gen',
      value: '0.3s',
      target: '< 1s',
      status: 'success',
      icon: Zap,
      progress: 70
    },
    {
      label: 'Task Success Rate',
      value: '99.7%',
      target: '> 99%',
      status: 'success',
      icon: Target,
      progress: 99.7
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Icon className="w-3 h-3" />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xl font-mono ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {metric.target}
                  </Badge>
                </div>
                <div 
                  className="h-2 bg-secondary rounded-full overflow-hidden"
                  style={{ width: '100%' }}
                >
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Графики производительности */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Задержка */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Задержка (Latency)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                  />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="Latency (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Пропускная способность */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Пропускная способность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                  />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Messages/sec"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Риск обнаружения */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Риск обнаружения системами контроля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detectionRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  fontSize={10}
                  tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => `${(value * 100).toFixed(2)}%`}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.3}
                  name="Detection Risk"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Средний риск: {(detectionRiskData.reduce((acc, d) => acc + d.value, 0) / detectionRiskData.length * 100).toFixed(2)}%
            </span>
            <Badge variant="outline" className="bg-green-500/20 text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              В пределах нормы
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Сравнение с альтернативами */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Сравнение с альтернативами
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Система</th>
                  <th className="text-left py-2 font-medium">Скорость</th>
                  <th className="text-left py-2 font-medium">Скрытность</th>
                  <th className="text-left py-2 font-medium">Стоимость</th>
                  <th className="text-left py-2 font-medium">Доступ</th>
                  <th className="text-left py-2 font-medium">Оценка</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 font-medium text-cyan-400">PSO</td>
                  <td className="py-3">1-10 сек</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-green-500/20 text-green-400">
                      HIGH
                    </Badge>
                  </td>
                  <td className="py-3 font-mono text-green-400">$0</td>
                  <td className="py-3">90%+</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-green-500/20 text-green-400">
                      9.8/10
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3">Tor + VPN</td>
                  <td className="py-3">30-60 сек</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                      MEDIUM
                    </Badge>
                  </td>
                  <td className="py-3">$5-50/мес</td>
                  <td className="py-3">50%</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                      6.5/10
                    </Badge>
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3">Proxy</td>
                  <td className="py-3">10-30 сек</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/20 text-red-400">
                      LOW
                    </Badge>
                  </td>
                  <td className="py-3">$0-10/мес</td>
                  <td className="py-3">30%</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/20 text-red-400">
                      4.2/10
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3">Direct</td>
                  <td className="py-3">1-5 сек</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/20 text-red-400">
                      NONE
                    </Badge>
                  </td>
                  <td className="py-3">Бесплатно</td>
                  <td className="py-3">10%</td>
                  <td className="py-3">
                    <Badge variant="outline" className="bg-red-500/20 text-red-400">
                      2.1/10
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
