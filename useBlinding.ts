import { useState, useCallback } from 'react';
import type { BlindingState } from '@/types/quantum.types';

export function useBlinding() {
  const [blindingState, setBlindingState] = useState<BlindingState>({
    active: true,
    noiseRatio: 0.999,
    realQueries: 1,
    noiseQueries: 999,
    templates: [
      {
        id: 'tpl-001',
        template: 'What is the {term} effect in quantum mechanics?',
        category: 'physics',
        expectedResult: 'The {term} effect refers to the quantum mechanical phenomenon where...',
        usageCount: 42
      },
      {
        id: 'tpl-002',
        template: 'Calculate the derivative of {term}',
        category: 'math',
        expectedResult: 'The derivative of {term} is...',
        usageCount: 38
      },
      {
        id: 'tpl-003',
        template: 'Applications of {term} in industry',
        category: 'physics',
        expectedResult: '{term} has numerous applications including...',
        usageCount: 27
      },
      {
        id: 'tpl-004',
        template: '{term1} vs {term2} comparison',
        category: 'physics',
        expectedResult: 'Comparison between {term1} and {term2}...',
        usageCount: 19
      },
      {
        id: 'tpl-005',
        template: 'History of {term} research',
        category: 'biology',
        expectedResult: 'Research on {term} began in...',
        usageCount: 31
      }
    ],
    entropy: 7.8
  });

  const scientificTerms = [
    'photoelectric', 'tunneling', 'entanglement', 'superposition',
    'interference', 'decoherence', 'coherence', 'polarization',
    'wave function', 'quantum state', 'spin', 'orbital',
    'energy level', 'band gap', 'fermion', 'boson',
    'quark', 'lepton', 'neutrino', 'photon',
    'electron', 'proton', 'neutron', 'atom',
    'molecule', 'crystal', 'lattice', 'phonon'
  ];

  // Генерация шумового запроса
  const generateNoiseQuery = useCallback((): string => {
    const template = blindingState.templates[Math.floor(Math.random() * blindingState.templates.length)];
    const term1 = scientificTerms[Math.floor(Math.random() * scientificTerms.length)];
    const term2 = scientificTerms[Math.floor(Math.random() * scientificTerms.length)];

    let query = template.template;
    query = query.replace('{term}', term1);
    query = query.replace('{term1}', term1);
    query = query.replace('{term2}', term2);

    // Увеличиваем счетчик использования
    setBlindingState(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      )
    }));

    return query;
  }, [blindingState.templates]);

  // Смешивание реального запроса с шумом
  const blindQuery = useCallback((realQuery: string): { queries: string[]; realPosition: number } => {
    const noiseCount = 999;
    const noiseQueries = Array.from({ length: noiseCount }, () => generateNoiseQuery());
    
    // Вставляем реальный запрос в случайную позицию
    const realPosition = Math.floor(Math.random() * noiseCount);
    const queries = [...noiseQueries.slice(0, realPosition), realQuery, ...noiseQueries.slice(realPosition)];

    setBlindingState(prev => ({
      ...prev,
      realQueries: prev.realQueries + 1,
      noiseQueries: prev.noiseQueries + noiseCount
    }));

    return { queries, realPosition };
  }, [generateNoiseQuery]);

  // Переключение активности ослепления
  const toggleBlinding = useCallback(() => {
    setBlindingState(prev => ({
      ...prev,
      active: !prev.active
    }));
  }, []);

  // Экспорт состояния для анализа
  const exportBlindingStats = useCallback(() => {
    return {
      totalQueries: blindingState.realQueries + blindingState.noiseQueries,
      realQueries: blindingState.realQueries,
      noiseQueries: blindingState.noiseQueries,
      noiseRatio: blindingState.noiseRatio,
      averageEntropy: blindingState.entropy,
      mostUsedTemplates: blindingState.templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 3)
    };
  }, [blindingState]);

  return {
    blindingState,
    generateNoiseQuery,
    blindQuery,
    toggleBlinding,
    exportBlindingStats
  };
}
