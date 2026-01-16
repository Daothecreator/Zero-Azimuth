import { NetworkTopology } from '@/components/NetworkTopology';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NetworkStatus() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            Сеть и производительность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Распределённая сеть фантомных узлов на базе NATS JetStream 
            с субнаносекундной синхронизацией и квантовой защитой.
          </p>
          
          <Tabs defaultValue="topology" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topology">
                Топология сети
              </TabsTrigger>
              <TabsTrigger value="performance">
                Производительность
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topology" className="space-y-4">
              <NetworkTopology />
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <PerformanceMetrics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
