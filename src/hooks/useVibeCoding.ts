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
    
    // Поиск статей
    if (lowerQuery.includes('найди') || lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('ищ')) {
      return {
        intent: 'search_papers',
        entities: {
          query: query.replace(/(найди|find|search|ищ|по|about|о)/gi, '').trim(),
          year: lowerQuery.includes('2025') ? '2025' : lowerQuery.includes('2024') ? '2024' : 'any'
        }
      };
    }
    
    // Скачивание
    if (lowerQuery.includes('скачай') || lowerQuery.includes('download') || lowerQuery.includes('загруз')) {
      return {
        intent: 'download_paper',
        entities: {
          doi: '10.1000/182',
          format: lowerQuery.includes('pdf') ? 'pdf' : 'any'
        }
      };
    }
    
    // Суммаризация
    if (lowerQuery.includes('суммаризируй') || lowerQuery.includes('summarize') || lowerQuery.includes('кратко') || lowerQuery.includes('тезисы')) {
      return {
        intent: 'summarize',
        entities: {
          content: query.replace(/(суммаризируй|summarize|кратко|тезисы)/gi, '').trim()
        }
      };
    }
    
    // Выполнение кода
    if (lowerQuery.includes('запусти') || lowerQuery.includes('run') || lowerQuery.includes('execute') || lowerQuery.includes('выполни') || lowerQuery.includes('print')) {
      return {
        intent: 'execute_code',
        entities: {
          code: query.replace(/(запусти|run|execute|выполни)/gi, '').trim()
        }
      };
    }

    // Анализ
    if (lowerQuery.includes('проанализируй') || lowerQuery.includes('analyze') || lowerQuery.includes('разбери')) {
      return {
        intent: 'analyze',
        entities: {
          content: query.replace(/(проанализируй|analyze|разбери)/gi, '').trim()
        }
      };
    }

    // Получение информации (общий случай)
    if (lowerQuery.includes('что такое') || lowerQuery.includes('кто такой') || lowerQuery.includes('расскажи') || lowerQuery.includes('объясни') || lowerQuery.includes('что это')) {
      return {
        intent: 'get_info',
        entities: {
          query: query.replace(/(что такое|кто такой|расскажи|объясни|что это|о|об)/gi, '').trim()
        }
      };
    }

    // Если ничего не подошло - это всё равно работающее намерение (generic_query)
    return {
      intent: 'generic_query',
      entities: { query: query.trim() }
    };
  }, []);

  // Генерация кода на основе намерения
  const generateCode = useCallback((intent: string, entities: Record<string, string>): string => {
    const templates: Record<string, string> = {
      search_papers: `# Поиск научных статей
from pso.search import PaperSearch
search = PaperSearch()
results = search.query("${entities.query}", year="${entities.year}", limit=10)
print(f"Найдено статей: {len(results)}")
return results`,
      
      download_paper: `# Скачивание статьи
from pso.download import PaperDownloader
downloader = PaperDownloader()
paper = downloader.fetch("${entities.doi}", format="${entities.format}")
print(f"Статья скачана: {paper.get('file', 'unknown')}")
return paper`,
      
      summarize: `# Суммаризация контента
from pso.summarize import Summarizer
summarizer = Summarizer()
summary = summarizer.summarize("""${entities.content}""")
print(f"Тезисы: {summary}")
return summary`,
      
      execute_code: `# Выполнение кода
${entities.code}
`,

      analyze: `# Анализ контента
from pso.analysis import Analyzer
analyzer = Analyzer()
analysis = analyzer.analyze("""${entities.content}""")
print(f"Анализ завершён")
return analysis`,

      get_info: `# Получение информации
from pso.knowledge import KnowledgeBase
kb = KnowledgeBase()
info = kb.search("${entities.query}")
print(f"Информация о: ${entities.query}")
return info`,

      generic_query: `# Обработка запроса
from pso.agent import Agent
agent = Agent()
response = agent.process("${entities.query}")
print(f"Результат: {response}")
return response`,
      
      unknown: `# Неизвестное намерение
print("Не смог распознать запрос, но обработаю его общим методом...")
`
    };
    
    return templates[intent] || templates.generic_query;
  }, []);

  // Выполнение кода в безопасной среде
  const executeCode = useCallback((code: string): any => {
    // Симуляция выполнения
    const delay = Math.random() * 2000 + 500; // 0.5-2.5 секунды
    
    // Симуляция результата - более универсальная
    const mockResults: Record<string, any> = {
      search_papers: [
        { title: 'Quantum Computing Advances 2025', authors: ['Dr. Smith', 'Prof. Johnson'], year: 2025, doi: '10.1000/182' },
        { title: 'AI in Scientific Research', authors: ['Dr. Chen'], year: 2024, doi: '10.1001/183' },
        { title: 'Advanced Cryptography Methods', authors: ['Prof. Black'], year: 2025, doi: '10.1002/184' }
      ],
      download_paper: { status: 'success', file: 'paper_10.1000_182.pdf', size: '2.4MB', url: 'http://example.com/paper.pdf' },
      summarize: { summary: 'This paper discusses recent advances in quantum computing and their applications. Key findings include improvements in error correction and quantum supremacy demonstrations.', key_points: ['Quantum supremacy', 'Error correction', 'Scalability'] },
      execute_code: { output: 'Execution completed successfully', return_code: 0, status: 'success' },
      analyze: { insights: 'Analysis reveals key patterns and relationships', metrics: { relevance: 0.95, confidence: 0.92 }, recommendations: ['Further investigation recommended'] },
      get_info: { found: true, results: ['Information retrieved from knowledge base', 'Multiple sources available'] },
      generic_query: { processed: true, message: 'Query processed successfully', data: { status: 'completed', execution_time_ms: Math.random() * 2000 } },
      unknown: { status: 'processed', message: 'Query processed with generic handler' }
    };
    
    // Симуляция задержки
    return new Promise(resolve => {
      setTimeout(() => {
        // Определяем тип запроса по коду
        let resultType = 'generic_query';
        if (code.includes('search')) resultType = 'search_papers';
        else if (code.includes('download')) resultType = 'download_paper';
        else if (code.includes('summarize') || code.includes('Summarizer')) resultType = 'summarize';
        else if (code.includes('execute') || code.includes('print')) resultType = 'execute_code';
        else if (code.includes('analyze')) resultType = 'analyze';
        else if (code.includes('knowledge') || code.includes('search')) resultType = 'get_info';
        
        resolve(mockResults[resultType]);
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
