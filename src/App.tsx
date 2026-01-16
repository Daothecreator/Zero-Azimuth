import { useState } from 'react';
import { ZeroUI } from '@/components/ZeroUI';
import { Dashboard } from '@/sections/Dashboard';
import { AIEOControl } from '@/sections/AIEOControl';
import { SecurityCenter } from '@/sections/SecurityCenter';
import { KnowledgeBase } from '@/sections/KnowledgeBase';
import { NetworkStatus } from '@/sections/NetworkStatus';
import { Button } from '@/components/ui/button';
import { 
  Terminal, Shield, BookOpen, Network, 
  Activity, Menu, X
} from 'lucide-react';
import type { VibeResult } from '@/hooks/useVibeCoding';

type TabType = 'dashboard' | 'zero-ui' | 'aieo' | 'security' | 'knowledge' | 'network';

const tabs: { id: TabType; label: string; icon: typeof Terminal }[] = [
  { id: 'dashboard', label: 'Панель управления', icon: Activity },
  { id: 'zero-ui', label: 'Zero-UI', icon: Terminal },
  { id: 'aieo', label: 'AIEO', icon: Activity },
  { id: 'security', label: 'Безопасность', icon: Shield },
  { id: 'knowledge', label: 'База знаний', icon: BookOpen },
  { id: 'network', label: 'Сеть', icon: Network },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastTask, setLastTask] = useState<VibeResult | null>(null);

  const handleTaskExecute = (task: VibeResult) => {
    setLastTask(task);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'zero-ui':
        return <ZeroUI onTaskExecute={handleTaskExecute} />;
      case 'aieo':
        return <AIEOControl />;
      case 'security':
        return <SecurityCenter />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'network':
        return <NetworkStatus />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-card border-r border-border flex-shrink-0`}>
          <div className="p-4 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-purple-500 to-green-500 rounded-lg flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">PSO</div>
                <div className="text-xs text-muted-foreground">Phantom Orchestrator</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className={`w-full justify-start ${
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{tab.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Status */}
            <div className="mt-auto pt-4 border-t border-border">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">PHANTOM MODE</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Quantum Key: ACTIVE<br />
                Blinding: ACTIVE<br />
                Nodes: 5 online
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'zero-ui' && 'Вводите запросы на естественном языке'}
                  {activeTab === 'aieo' && 'AI-Enhanced Event Orchestration'}
                  {activeTab === 'security' && 'Квантовая безопасность и методы обфускации'}
                  {activeTab === 'knowledge' && 'Доступ к теневым библиотекам'}
                  {activeTab === 'network' && 'Топология и производительность сети'}
                  {activeTab === 'dashboard' && 'Общая статистика и состояние системы'}
                </p>
              </div>
            </div>

            {/* Last task indicator */}
            {lastTask && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">
                  Последняя задача: {lastTask.intent} ({lastTask.executionTime}ms)
                </span>
              </div>
            )}
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
