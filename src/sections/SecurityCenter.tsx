import { QuantumSecurity } from '@/components/QuantumSecurity';
import { BlindingDemo } from '@/components/BlindingDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SecurityCenter() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Центр безопасности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Многоуровневая система защиты, использующая квантовые технологии 
            и методы обфускации для достижения невидимости.
          </p>
          
          <Tabs defaultValue="quantum" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quantum">
                Квантовая защита
              </TabsTrigger>
              <TabsTrigger value="blinding">
                Метод ослепления
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quantum" className="space-y-4">
              <QuantumSecurity />
            </TabsContent>

            <TabsContent value="blinding" className="space-y-4">
              <BlindingDemo />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
