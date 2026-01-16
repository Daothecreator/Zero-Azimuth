import { useState } from 'react';
import { useBlinding } from '@/hooks/useBlinding';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, EyeOff, Shuffle, Filter, Database,
  AlertTriangle, CheckCircle, XCircle,
  Activity, Percent
} from 'lucide-react';

export function BlindingDemo() {
  const { blindingState, generateNoiseQuery, blindQuery, toggleBlinding } = useBlinding();
  const [realQuery, setRealQuery] = useState('');
  const [blindedResult, setBlindedResult] = useState<{ queries: string[]; realPosition: number } | null>(null);
  const [showAllQueries, setShowAllQueries] = useState(false);

  // Обработка реального запроса
  const handleBlindQuery = () => {
    if (!realQuery.trim()) return;
    
    const result = blindQuery(realQuery);
    setBlindedResult(result);
  };

  // Генерация только шумовых запросов
  const handleGenerateNoise = () => {
    const noise = Array.from({ length: 10 }, () => generateNoiseQuery());
    setBlindedResult({ queries: noise, realPosition: -1 });
  };

  return (
    <div className="space-y-4">
      {/* Статистика ослепления */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Activity className="w-3 h-3" />
              Статус
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {blindingState.active ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-400">Активно</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-400">Выключено</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Percent className="w-3 h-3" />
              Соотношение шума
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono text-purple-400">
              {(blindingState.noiseRatio * 100).toFixed(1)}%
            </div>
            <div 
              className="h-2 bg-secondary rounded-full overflow-hidden mt-1"
              style={{ width: '100%' }}
            >
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${blindingState.noiseRatio * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Database className="w-3 h-3" />
              Реальных запросов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono text-cyan-400">
              {blindingState.realQueries}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Shuffle className="w-3 h-3" />
              Энтропия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono text-yellow-400">
              {blindingState.entropy}
            </div>
            <div className="text-xs text-muted-foreground">бит</div>
          </CardContent>
        </Card>
      </div>

      {/* Демонстрация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ввод реального запроса */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-400" />
              Реальный запрос
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={realQuery}
              onChange={(e) => setRealQuery(e.target.value)}
              placeholder="Введите ваш реальный запрос..."
              className="border-green-500/30"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleBlindQuery}
                disabled={!realQuery.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Смешать с шумом
              </Button>
              <Button 
                onClick={handleGenerateNoise}
                variant="outline"
              >
                <Database className="w-4 h-4 mr-2" />
                Только шум
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Управление */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Управление
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={toggleBlinding}
              variant={blindingState.active ? 'destructive' : 'default'}
              className="w-full"
            >
              {blindingState.active ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Выключить ослепление
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Включить ослепление
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Провайдер видит {blindingState.noiseQueries} запросов</div>
              <div>• Реальных запросов: {blindingState.realQueries}</div>
              <div>• Невозможно отличить реальный от шумового</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Результат ослепления */}
      {blindedResult && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Смешанный поток запросов
              </CardTitle>
              <Badge variant="outline">
                {blindedResult.queries.length} всего
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className={`h-64 ${showAllQueries ? 'h-96' : 'h-64'}`}>
              <div className="space-y-1 font-mono text-xs">
                {blindedResult.queries.map((query, index) => {
                  const isReal = index === blindedResult.realPosition;
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        isReal 
                          ? 'bg-green-500/20 border border-green-500/50' 
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={isReal ? 'text-green-400' : 'text-muted-foreground'}>
                          [{index + 1}] {query}
                        </span>
                        {isReal && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400">
                            РЕАЛЬНЫЙ
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Провайдер не может определить, какой запрос реальный
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAllQueries(!showAllQueries)}
              >
                {showAllQueries ? 'Скрыть' : 'Показать все'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Шаблоны шума */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Шаблоны шумовых запросов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {blindingState.templates.map((template) => (
              <div 
                key={template.id} 
                className="p-3 bg-muted/50 rounded-md text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-muted-foreground">
                    {template.id}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <div className="mb-2">{template.template}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Использований: {template.usageCount}</span>
                  <Badge variant="outline" className="text-xs">
                    Заранее известный результат
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
