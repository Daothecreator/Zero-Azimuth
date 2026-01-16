import { useState } from 'react';
import { useQuantumCrypto } from '@/hooks/useQuantumCrypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Atom, Shield, Lock, Key, Zap, 
  CheckCircle, AlertCircle, RefreshCw, Eye,
  Binary, CircleDot
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function QuantumSecurity() {
  const { quantumState, metrics, generateQuantumKey } = useQuantumCrypto();
  const [activeTab, setActiveTab] = useState('qkd');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Генерация нового квантового ключа
  const handleGenerateKey = () => {
    const key = generateQuantumKey(256);
    setGeneratedKey(key.keyData);
  };

  // Форматирование ключа для отображения
  const formatKey = (key: string): string => {
    if (key.length <= 16) return key;
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  // Получение цвета для уровня безопасности
  const getSecurityColor = (level: number): string => {
    if (level > 0.95) return 'text-green-400';
    if (level > 0.85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Метрики безопасности */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Eye className="w-3 h-3" />
              Аномалий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-mono ${metrics.anomalyScore < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
              {(metrics.anomalyScore * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              Риск обнаружения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono text-green-400">
              {(metrics.detectionProbability * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Lock className="w-3 h-3" />
              Шифрование
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono text-cyan-400">
              {metrics.encryptionStrength}-bit
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Shield className="w-3 h-3" />
              Ослепление
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono text-purple-400">
              {(metrics.blindingEffectiveness * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Atom className="w-3 h-3" />
              Квантовая защита
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-mono ${getSecurityColor(metrics.quantumSecurityLevel)}`}>
              {(metrics.quantumSecurityLevel * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основной контент */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qkd">
            <Key className="w-4 h-4 mr-2" />
            QKD
          </TabsTrigger>
          <TabsTrigger value="pqc">
            <Binary className="w-4 h-4 mr-2" />
            PQC
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <CircleDot className="w-4 h-4 mr-2" />
            Сессии
          </TabsTrigger>
        </TabsList>

        {/* QKD - Квантовое распределение ключей */}
        <TabsContent value="qkd" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  Квантовый канал
                </CardTitle>
                <Badge 
                  variant={quantumState.fiberChannelStatus === 'connected' ? 'default' : 'destructive'}
                >
                  {quantumState.fiberChannelStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Визуализация квантового ключа */}
              <div className="p-4 bg-black rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-cyan-400">Квантовый ключ</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleGenerateKey}
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Сгенерировать
                  </Button>
                </div>
                
                {generatedKey ? (
                  <div className="space-y-2">
                    <div className="font-mono text-xs bg-cyan-500/10 p-3 rounded break-all">
                      {formatKey(generatedKey)}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Ключ сгенерирован через QKD</span>
                      <Badge variant="outline" className="ml-auto">256-bit</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Atom className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Нажмите для генерации квантового ключа
                  </div>
                )}
              </div>

              {/* Принцип работы QKD */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="font-semibold mb-1">1. Отправка</div>
                  <div className="text-muted-foreground">
                    Фотоны с поляризацией кодируют биты
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="font-semibold mb-1">2. Измерение</div>
                  <div className="text-muted-foreground">
                    Случайные базы для измерения
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="font-semibold mb-1">3. Фильтрация</div>
                  <div className="text-muted-foreground">
                    Совпадающие базы формируют ключ
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="font-semibold mb-1">4. Проверка</div>
                  <div className="text-muted-foreground">
                    Обнаружение перехвата
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PQC - Постквантовая криптография */}
        <TabsContent value="pqc" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dilithium */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Dilithium-3
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Безопасность</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400">
                    NIST Standard
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Размер подписи</span>
                  <span className="font-mono">3.3 KB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Публичный ключ</span>
                  <span className="font-mono">1.9 KB</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Lock className="w-3 h-3 mr-1" />
                  Создать ключевую пару
                </Button>
              </CardContent>
            </Card>

            {/* Kyber */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  Kyber-1024
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Безопасность</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400">
                    NIST Standard
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Размер ключа</span>
                  <span className="font-mono">1.6 KB</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Шифрован. текст</span>
                  <span className="font-mono">1.6 KB</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Zap className="w-3 h-3 mr-1" />
                  Обмен ключами
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Гибридная схема */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Atom className="w-4 h-4" />
                Гибридная схема: QKD + PQC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-black rounded-lg border border-green-500/30">
                <div className="text-xs text-green-400 mb-2">Протокол защиты:</div>
                <div className="space-y-1 text-xs font-mono">
                  <div>1. QKD → Генерация квантового ключа</div>
                  <div>2. AES-256 → Шифрование данных квантовым ключом</div>
                  <div>3. Dilithium → Подпись зашифрованных данных</div>
                  <div>4. Kyber → Шифрование квантового ключа для передачи</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Защита от атак "intercept now, decrypt later"
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Активные сессии */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-yellow-400" />
                  Активные квантовые сессии
                </CardTitle>
                <Badge variant="outline">
                  {quantumState.activeSessions.length} активных
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {quantumState.activeSessions.length > 0 ? (
                <div className="space-y-2">
                  {quantumState.activeSessions.map((session) => (
                    <div key={session.sessionId} className="p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{session.sessionId.slice(-8)}</span>
                          <Badge variant="outline" className="text-xs">
                            {session.pqcAlgorithm}
                          </Badge>
                          {session.qkdSuccess && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.keyLength}-bit
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        До: {session.expiresAt.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CircleDot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Нет активных сессий
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
