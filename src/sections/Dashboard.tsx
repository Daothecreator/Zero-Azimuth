import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Shield, Zap, Globe, 
  Lock, Cpu, Database, Network,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
          Фантомный Суверенный Оркестратор
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Живой цифровой организм, предоставляющий мгновенный доступ к глобальным знаниям 
          через квантово-защищённые каналы
        </p>
      </div>

      {/* Статус PSO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Activity className="w-3 h-3" />
              Статус
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-400">PHANTOM MODE</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Shield className="w-3 h-3" />
              Безопасность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-green-400">98.5%</div>
            <div className="text-xs text-muted-foreground">Квантовая защита</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3" />
              Скорость
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-cyan-400">1.2s</div>
            <div className="text-xs text-muted-foreground">Среднее время ответа</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Globe className="w-3 h-3" />
              Покрытие
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-purple-400">90%+</div>
            <div className="text-xs text-muted-foreground">Научной литературы</div>
          </CardContent>
        </Card>
      </div>

      {/* Архитектура */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4" />
            Архитектура PSO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Zero-UI */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">Zero-UI Layer</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Vibe Coding Engine</li>
                <li>• Natural Language → Code</li>
                <li>• Liquid Content</li>
                <li>• Adaptive Invisibility</li>
              </ul>
            </div>

            {/* AIEO */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="font-medium">AIEO Layer</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Slow Loop (ARIMA, Prophet, LSTM)</li>
                <li>• Medium Loop (PPO RL)</li>
                <li>• Fast Loop (1-10 сек)</li>
                <li>• Predictive Analysis</li>
              </ul>
            </div>

            {/* Transport */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-green-400" />
                <span className="font-medium">Transport Layer</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• NATS JetStream</li>
                <li>• MQTT over WSS</li>
                <li>• Phantom Nodes</li>
                <li>• P2P Protocols</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Безопасность */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Многоуровневая безопасность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Квантовая защита */}
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">Квантовое распределение ключей (QKD)</div>
                  <div className="text-xs text-muted-foreground">
                    Физически защищает от перехвата
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                ACTIVE
              </Badge>
            </div>

            {/* Ослепление */}
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="font-medium">Метод Blinding (Ослепление)</div>
                  <div className="text-xs text-muted-foreground">
                    999 шумовых запросов на 1 реальный
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                ACTIVE
              </Badge>
            </div>

            {/* Постквантовая криптография */}
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Постквантовая криптография</div>
                  <div className="text-xs text-muted-foreground">
                    Dilithium, Kyber (NIST стандарт)
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                ACTIVE
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Сравнение */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Сравнение с системами контроля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="font-medium text-green-400">PSO</span>
              </div>
              <div className="text-3xl font-mono">1-10 сек</div>
              <div className="text-xs text-muted-foreground">Время выполнения задачи</div>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="font-medium text-red-400">XKeyscore & Co</span>
              </div>
              <div className="text-3xl font-mono">45 сек</div>
              <div className="text-xs text-muted-foreground">Время реакции систем</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-center">
            PSO работает в 4.5 раза быстрее, чем системы контроля успевают среагировать
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
