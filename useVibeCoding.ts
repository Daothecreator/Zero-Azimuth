import { useState, useCallback } from 'react';

export interface VibeResult {
  query: string;
  intent: string;
  entities: Record<string, string>;
  generatedCode: string;
  result?: any;
  executionTime: number;
}

export function useVibeCoding() {
  const [history, setHistory] = useState<VibeResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Распознавание намерения
  const extractIntent = useCallback((query: string): { intent: string; entities: Record<string, string> } => {
    const lowerQuery = query.toLowerCase();
    
    // Простые правила для демонстрации
    if (lowerQuery.includes('найди') || lowerQuery.includes('find') || lowerQuery.includes('search')) {
      return {
        intent: 'search_papers',
        entities: {
          query: query.replace(/(найди|find|search|по|about)/gi, '').trim(),
          year: lowerQuery.includes('2025') ? '2025' : lowerQuery.includes('2024') ? '2024' : 'any'
        }
      };
    }
    
    if (lowerQuery.includes('скачай') || lowerQuery.includes('download')) {
      return {
        intent: 'download_paper',
        entities: {
          doi: '10.1000/182', // Заглушка
          format: lowerQuery.includes('pdf') ? 'pdf' : 'any'
        }
      };
    }
    
    if (lowerQuery.includes('суммаризируй') || lowerQuery.includes('summarize')) {
      return {
        intent: 'summarize',
        entities: {
          content: query.replace(/(суммаризируй|summarize)/gi, '').trim()
        }
      };
    }
    
    if (lowerQuery.includes('запусти') || lowerQuery.includes('run') || lowerQuery.includes('execute')) {
      return {
        intent: 'execute_code',
        entities: {
          code: query.replace(/(запусти|run|execute)/gi, '').trim()
        }
      };
    }
    
    return {
      intent: 'unknown',
      entities: { query }
    };
  }, []);

  // Генерация кода на основе намерения
  const generateCode = useCallback((intent: string, entities: Record<string, string>): string => {
    const templates: Record<string, string> = {
      search_papers: `# Поиск научных статей
from pso.search import PaperSearch
search = PaperSearch()
results = search.query("${entities.query}", year="${entities.year}", limit=10)
return results`,
      
      download_paper: `# Скачивание статьи
from pso.download import PaperDownloader
downloader = PaperDownloader()
paper = downloader.fetch("${entities.doi}", format="${entities.format}")
return paper`,
      
      summarize: `# Суммаризация контента
from pso.summarize import Summarizer
summarizer = Summarizer()
summary = summarizer.summarize("""${entities.content}""")
return summary`,
      
      execute_code: `# Выполнение кода
${entities.code}
`,
      
      unknown: `# Неизвестное намерение
print("Не могу распознать намерение. Попробуйте переформулировать.")
`
    };
    
    return templates[intent] || templates.unknown;
  }, []);

  // Выполнение кода в безопасной среде
  const executeCode = useCallback((code: string): any => {
    // Симуляция выполнения
    const delay = Math.random() * 2000 + 500; // 0.5-2.5 секунды
    
    // Симуляция результата
    const mockResults: Record<string, any> = {
      search_papers: [
        { title: 'Quantum Computing Advances 2025', authors: ['Dr. Smith', 'Prof. Johnson'], year: 2025, doi: '10.1000/182' },
        { title: 'AI in Scientific Research', authors: ['Dr. Chen'], year: 2024, doi: '10.1001/183' }
      ],
      download_paper: { status: 'success', file: 'paper_10.1000_182.pdf', size: '2.4MB' },
      summarize: { summary: 'This paper discusses recent advances in quantum computing...', key_points: ['Quantum supremacy', 'Error correction'] },
      execute_code: { output: 'Hello, PSO!', return_code: 0 },
      unknown: { error: 'Unknown intent' }
    };
    
    // Симуляция задержки
    return new Promise(resolve => {
      setTimeout(() => {
        const intent = Object.keys(mockResults).find(key => code.includes(key)) || 'unknown';
        resolve(mockResults[intent]);
      }, delay);
    });
  }, []);

  // Основной процесс Vibe Coding
  const processQuery = useCallback(async (query: string): Promise<VibeResult> => {
    setIsProcessing(true);
    
    try {
      // 1. Извлекаем намерение
      const { intent, entities } = extractIntent(query);
      
      // 2. Генерируем код
      const generatedCode = generateCode(intent, entities);
      
      // 3. Выполняем код
      const result = await executeCode(generatedCode);
      
      const executionTime = Date.now();
      
      const vibeResult: VibeResult = {
        query,
        intent,
        entities,
        generatedCode,
        result,
        executionTime
      };
      
      // Сохраняем в историю
      setHistory(prev => [vibeResult, ...prev.slice(0, 9)]); // Последние 10
      
      return vibeResult;
    } finally {
      setIsProcessing(false);
    }
  }, [extractIntent, generateCode, executeCode]);

  return {
    history,
    isProcessing,
    processQuery,
    extractIntent,
    generateCode
  };
}
