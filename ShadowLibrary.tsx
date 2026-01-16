import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, Search, Download, ExternalLink,
  Shield, Globe, Database, FileText,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  source: 'annas' | 'scihub' | 'libgen' | 'scinet';
  size?: string;
  downloads?: number;
}

export function ShadowLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('annas');

  // Мок данные для демонстрации
  const mockPapers: Paper[] = [
    {
      id: '1',
      title: 'Quantum Computing Advances in 2025: A Comprehensive Review',
      authors: ['Dr. Elena Rodriguez', 'Prof. Zhang Wei', 'Dr. Sarah Chen'],
      year: 2025,
      doi: '10.1038/s41586-025-12345-6',
      source: 'annas',
      size: '2.4MB',
      downloads: 1547
    },
    {
      id: '2',
      title: 'Post-Quantum Cryptography: Implementation and Security Analysis',
      authors: ['Prof. Michael Brown', 'Dr. Alexey Volkov'],
      year: 2025,
      doi: '10.1109/SP.2025.98765',
      source: 'scihub',
      size: '1.8MB',
      downloads: 892
    },
    {
      id: '3',
      title: 'AI-Enhanced Event Orchestration for Distributed Systems',
      authors: ['Dr. Kim Sung-ho', 'Prof. Maria Garcia'],
      year: 2024,
      doi: '10.1145/3579639.3589567',
      source: 'libgen',
      size: '3.1MB',
      downloads: 2341
    },
    {
      id: '4',
      title: 'Blinding Techniques for Cloud Security: A Novel Approach',
      authors: ['Dr. James Wilson', 'Dr. Priya Patel'],
      year: 2025,
      source: 'scinet',
      downloads: 456
    }
  ];

  // Поиск статей
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Симуляция поиска
    setTimeout(() => {
      const filtered = mockPapers.filter(paper => 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 1500);
  };

  // Скачивание статьи
  const handleDownload = (paper: Paper) => {
    console.log('Downloading paper:', paper);
    // Симуляция скачивания
  };

  // Получение иконки для источника
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'annas': return <Database className="w-4 h-4" />;
      case 'scihub': return <BookOpen className="w-4 h-4" />;
      case 'libgen': return <Globe className="w-4 h-4" />;
      case 'scinet': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Получение цвета для источника
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'annas': return 'bg-blue-500/20 text-blue-400';
      case 'scihub': return 'bg-green-500/20 text-green-400';
      case 'libgen': return 'bg-purple-500/20 text-purple-400';
      case 'scinet': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="w-4 h-4" />
            Поиск в теневых библиотеках
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Название, автор, DOI..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Поиск по Anna's Archive, Sci-Hub, Library Genesis и Sci-Net
          </div>
        </CardContent>
      </Card>

      {/* Источники */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="annas">
            <Database className="w-4 h-4 mr-2" />
            Anna's Archive
          </TabsTrigger>
          <TabsTrigger value="scihub">
            <BookOpen className="w-4 h-4 mr-2" />
            Sci-Hub
          </TabsTrigger>
          <TabsTrigger value="libgen">
            <Globe className="w-4 h-4 mr-2" />
            LibGen
          </TabsTrigger>
          <TabsTrigger value="scinet">
            <Shield className="w-4 h-4 mr-2" />
            Sci-Net
          </TabsTrigger>
        </TabsList>

        <TabsContent value="annas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Anna's Archive
                </CardTitle>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                  88M+ документов
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Мета-репозиторий, зеркалирующий LibGen и Sci-Hub. 
                Практически невозможно закрыть целиком.
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Доступность: 99.9%</span>
                <Shield className="w-3 h-3 text-cyan-400 ml-4" />
                <span>Безопасность: HIGH</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scihub" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-400" />
                  Sci-Hub
                </CardTitle>
                <Badge variant="outline" className="bg-green-500/20 text-green-400">
                  85M+ статей
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Первый пиратский сервис научных статей. 
                Доступ к платным журналам через DOI.
              </div>
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span>Требует зеркала</span>
                <Shield className="w-3 h-3 text-cyan-400 ml-4" />
                <span>Безопасность: MEDIUM</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="libgen" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Library Genesis
                </CardTitle>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                  5M+ книг
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Электронная библиотека книг и учебников. 
                Фокус на учебной литературе.
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Доступность: 95%</span>
                <Shield className="w-3 h-3 text-cyan-400 ml-4" />
                <span>Безопасность: HIGH</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scinet" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  Sci-Net P2P
                </CardTitle>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400">
                  P2P Network
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                P2P сеть для обмена свежими статьями 2025-2026. 
                Использует крипто-токены для мотивации.
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Последние статьи</span>
                <Shield className="w-3 h-3 text-cyan-400 ml-4" />
                <span>Безопасность: MAX</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Результаты поиска
              </CardTitle>
              <Badge variant="outline">
                {searchResults.length} найдено
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {searchResults.map((paper) => (
                  <div 
                    key={paper.id} 
                    className="p-4 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getSourceColor(paper.source)}>
                            {getSourceIcon(paper.source)}
                            <span className="ml-1">{paper.source}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {paper.year}
                          </span>
                          {paper.downloads && (
                            <span className="text-xs text-muted-foreground">
                              ↓ {paper.downloads.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-2">
                          {paper.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {paper.authors.join(', ')}
                        </p>
                        {paper.doi && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-cyan-400">DOI:</span>
                            <span className="font-mono">{paper.doi}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleDownload(paper)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Скачать
                        </Button>
                        {paper.doi && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://doi.org/${paper.doi}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              Успешность поиска
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-green-400">
              99.7%
            </div>
            <div 
              className="h-2 bg-secondary rounded-full overflow-hidden mt-2"
              style={{ width: '100%' }}
            >
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: '99.7%' }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              Среднее время
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-cyan-400">
              1.2s
            </div>
            <div className="text-xs text-muted-foreground">от запроса до результата</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1 text-muted-foreground">
              <Database className="w-3 h-3" />
              Доступно
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-purple-400">
              90%+
            </div>
            <div className="text-xs text-muted-foreground">всей научной литературы</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
