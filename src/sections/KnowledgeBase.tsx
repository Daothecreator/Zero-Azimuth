import { ShadowLibrary } from '@/components/ShadowLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function KnowledgeBase() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            База знаний
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Доступ к 90%+ научной литературы мира через теневые библиотеки 
            и P2P сети с рекурсивным RAG поиском.
          </p>
          <ShadowLibrary />
        </CardContent>
      </Card>
    </div>
  );
}
