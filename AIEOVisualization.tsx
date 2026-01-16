import { useAIEO } from '@/hooks/useAIEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Zap, Clock, Server, Shield, 
  TrendingUp, AlertTriangle, CheckCircle,
  Cpu, MemoryStick, Wallet, Gauge
} from 'lucide-react';

export function AIEOVisualization() {
  const { state, prediction, migrateNodes } = useAIEO();

  const getRiskColor = (risk: number) => {
    if (risk < 0.03) return 'text-green-400';
    if (risk < 0.05) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'text-green-400';
    if (confidence > 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Tabs defaultValue="slow" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="slow">
          <Clock className="w-4 h-4 mr-2" />
          Slow Loop
        </TabsTrigger>
        <TabsTrigger value="medium">
          <Activity className="w-4 h-4 mr-2" />
          Medium Loop
        </TabsTrigger>
        <TabsTrigger value="fast">
          <Zap className="w-4 h-4 mr-2" />
          Fast Loop
        </TabsTrigger>
      </TabsList>

      {/* Slow Loop - Прогностический */}
      <TabsContent value="slow" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Текущая модель */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Активная модель: {state.slowLoop.model.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Уверенность прогноза</span>
                <Badge variant="outline" className={getConfidenceColor(state.slowLoop.confidence)}>
                  {(state.slowLoop.confidence * 100).toFixed(1)}%
                </Badge>
              </div>
              <div 
                className="h-2 bg-secondary rounded-full overflow-hidden"
                style={{ width: '100%' }}
              >
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${state.slowLoop.confidence * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Сетевые метрики */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Сетевой трафик
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Пакеты/сек</div>
                  <div className="font-mono text-cyan-400">
                    {state.slowLoop.networkTraffic.packetsPerSecond.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Задержка</div>
                  <div className="font-mono text-cyan-400">
                    {state.slowLoop.networkTraffic.latency.toFixed(1)}ms
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Предсказание */}
        {prediction && (
          <Card className="border-cyan-500/50 bg-cyan-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
                Прогноз "окна тишины"
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Начало</div>
                  <div className="font-mono">
                    {prediction.startTime.toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Длительность</div>
                  <div className="font-mono">
                    {prediction.duration}s
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Действие</div>
                  <Badge className={
                    prediction.recommendedAction === 'execute' ? 'bg-green-500' :
                    prediction.recommendedAction === 'wait' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }>
                    {prediction.recommendedAction}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 p-3 bg-background rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Рекомендация</div>
                <div className="text-sm">
                  {prediction.recommendedAction === 'execute' 
                    ? 'Идеальное время для выполнения задач. Риск обнаружения минимален.'
                    : prediction.recommendedAction === 'wait'
                    ? 'Системы мониторинга активны. Рекомендуется подождать.'
                    : 'Необходима миграция узлов для обеспечения безопасности.'
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Medium Loop - Реактивный */}
      <TabsContent value="medium" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Статистика управления */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="w-4 h-4" />
                Узлы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-cyan-400">
                {state.mediumLoop.nodes.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Миграций: {state.mediumLoop.migrationCount}
              </div>
            </CardContent>
          </Card>

          {/* Риск обнаружения */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Риск обнаружения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-mono ${getRiskColor(state.mediumLoop.detectionRisk)}`}>
                {(state.mediumLoop.detectionRisk * 100).toFixed(1)}%
              </div>
              <div 
                className="h-2 bg-secondary rounded-full overflow-hidden mt-2"
                style={{ width: '100%' }}
              >
                <div 
                  className={`h-full transition-all duration-300 ${
                    state.mediumLoop.detectionRisk > 0.05 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${state.mediumLoop.detectionRisk * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Стоимость */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Стоимость/час
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-green-400">
                ${state.mediumLoop.costPerHour.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Дешевле на 95% чем обычные решения
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Узлы */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Активные узлы
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={migrateNodes}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Мигрировать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.mediumLoop.nodes.map((node) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${node.cpuUsage > 80 ? 'bg-red-500' : node.cpuUsage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div>
                      <div className="font-mono text-sm">{node.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {node.provider} • {node.instanceType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {node.cpuUsage}%
                    </div>
                    <div className="flex items-center gap-1">
                      <MemoryStick className="w-3 h-3" />
                      {node.memoryUsage}%
                    </div>
                    <div className="font-mono">
                      ${node.costPerSecond.toFixed(4)}/s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Fast Loop - Исполнительный */}
      <TabsContent value="fast" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Среднее время
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-cyan-400">
                {state.fastLoop.avgExecutionTime.toFixed(1)}s
              </div>
              <div className="text-xs text-muted-foreground">
                Цель: &lt; 10s
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Успешность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-green-400">
                {(state.fastLoop.successRate * 100).toFixed(1)}%
              </div>
              <div 
                className="h-2 bg-secondary rounded-full overflow-hidden mt-2"
                style={{ width: '100%' }}
              >
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${state.fastLoop.successRate * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Активные задачи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono text-yellow-400">
                {state.fastLoop.activeTasks}
              </div>
              <div className="text-xs text-muted-foreground">
                В очереди: {state.fastLoop.taskQueue.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Очередь задач */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Очередь задач
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.fastLoop.taskQueue.length > 0 ? (
              <div className="space-y-2">
                {state.fastLoop.taskQueue.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{task.id}</span>
                      <span className="capitalize">{task.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="outline">{task.estimatedTime}s</Badge>
                      <div 
                        className="w-16 h-2 bg-secondary rounded-full overflow-hidden"
                        style={{ width: '64px' }}
                      >
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${task.priority * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                Очередь пуста
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
