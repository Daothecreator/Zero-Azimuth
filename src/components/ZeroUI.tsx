import { useState, useRef, useEffect } from 'react';
import { useVibeCoding, type VibeResult } from '@/hooks/useVibeCoding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Terminal, Sparkles, Code, Clock, CheckCircle } from 'lucide-react';

interface ZeroUIProps {
  onTaskExecute?: (task: VibeResult) => void;
}

export function ZeroUI({ onTaskExecute }: ZeroUIProps) {
  const [input, setInput] = useState('');
  const [currentResult, setCurrentResult] = useState<VibeResult | null>(null);
  const [showCode, setShowCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { history, isProcessing, processQuery } = useVibeCoding();

  // Фокус на input при загрузке
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Обработка отправки
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const query = input.trim();
    setInput('');

    try {
      const result = await processQuery(query);
      setCurrentResult(result);
      onTaskExecute?.(result);
    } catch (error) {
      console.error('Vibe coding error:', error);
    }
  };

  // Форматирование времени выполнения
  const formatExecutionTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Определение цвета для intent
  const getIntentColor = (intent: string): string => {
    const colors: Record<string, string> = {
      'search_papers': 'bg-blue-500',
      'download_paper': 'bg-green-500',
      'summarize': 'bg-purple-500',
      'execute_code': 'bg-orange-500',
      'unknown': 'bg-gray-500'
    };
    return colors[intent] || colors.unknown;
  };

  return (
    <div className="space-y-4">
      {/* Текущий запрос */}
      {currentResult && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="text-green-400">$ pso execute</span>
              </CardTitle>
              <Badge variant="outline" className={getIntentColor(currentResult.intent)}>
                {currentResult.intent}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <span className="text-cyan-400">Query:</span> {currentResult.query}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatExecutionTime(currentResult.executionTime)}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Executed
              </span>
            </div>

            {/* Результат */}
            {currentResult.result && (
              <div className="mt-4 p-3 bg-background rounded-md border">
                <div className="text-xs font-mono text-green-400 mb-2">Result:</div>
                <pre className="text-xs text-foreground whitespace-pre-wrap">
                  {JSON.stringify(currentResult.result, null, 2)}
                </pre>
              </div>
            )}

            {/* Сгенерированный код */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="text-xs"
            >
              <Code className="w-3 h-3 mr-1" />
              {showCode ? 'Hide' : 'Show'} Generated Code
            </Button>

            {showCode && (
              <div className="mt-2 p-3 bg-black rounded-md border font-mono text-xs">
                <div className="text-gray-500 mb-1"># Generated Python 3.11</div>
                <pre className="text-cyan-400 whitespace-pre-wrap">{currentResult.generatedCode}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Поле ввода */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите запрос на естественном языке..."
              className="pl-10 bg-black border-green-500/30 text-green-400 placeholder:text-green-500/40"
              disabled={isProcessing}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Примеры: "Найди статьи по квантовым моторам 2025" | "Скачай DOI 10.1000/182" | "Суммаризируй последние новости"
        </div>
      </form>

      {/* История */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              История запросов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setCurrentResult(item)}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[60%]">{item.query}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getIntentColor(item.intent)} text-white`}>
                          {item.intent}
                        </Badge>
                        <span className="text-muted-foreground">
                          {formatExecutionTime(item.executionTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
