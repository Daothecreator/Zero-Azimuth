import { AIEOVisualization } from '@/components/AIEOVisualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AIEOControl() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            AI-Enhanced Event Orchestration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Трёхуровневая система управления событиями, работающая быстрее, 
            чем системы глобальной слежки успевают зафиксировать активность.
          </p>
          <AIEOVisualization />
        </CardContent>
      </Card>
    </div>
  );
}
