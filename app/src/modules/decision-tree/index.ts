import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveDecisionTreeResult,
  type DecisionTreeDerivedResult,
  type DecisionTreeParams,
} from './logic'

const DecisionTreeVisualization = lazy(async () => ({
  default: (await import('./Visualization')).DecisionTreeVisualization,
}))

const defaultParams: DecisionTreeParams = {
  numPoints: 60,
  separation: 2,
  maxDepth: 3,
  minSamples: 5,
  criterion: 'gini',
}

const presets: PresetConfig<DecisionTreeParams>[] = [
  { name: 'Basit', params: { numPoints: 40, separation: 3, maxDepth: 2, minSamples: 5, criterion: 'gini' } },
  { name: 'Derin', params: { numPoints: 80, separation: 1.5, maxDepth: 6, minSamples: 2, criterion: 'gini' } },
  { name: 'Entropy', params: { numPoints: 60, separation: 2, maxDepth: 3, minSamples: 5, criterion: 'entropy' } },
  { name: 'Aşırı Uyum', params: { numPoints: 30, separation: 1, maxDepth: 8, minSamples: 1, criterion: 'gini' } },
]

const decisionTreeDefinition = {
  id: 'decision-tree',
  title: 'Decision Trees',
  subtitle: 'Recursive Partitioning',
  category: 'ml',
  description:
    'Karar ağaçlarının özellik uzayını entropy veya Gini impurity ile nasıl böldüğünü görselleştir. Derinliği, örnek sayısını ve sınıf ayrımını değiştirerek aşırı uyum ile yetersiz uyumu karşılaştır.',
  icon: '🌳',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'numPoints', label: 'Veri Noktaları', type: 'slider', min: 20, max: 150, step: 10 },
    { key: 'separation', label: 'Sınıf Ayrımı', type: 'slider', min: 0.5, max: 5, step: 0.5 },
    { key: 'maxDepth', label: 'Maksimum Derinlik', type: 'slider', min: 1, max: 8, step: 1 },
    { key: 'minSamples', label: 'Bölme İçin Min Örnek', type: 'slider', min: 1, max: 20, step: 1 },
    {
      key: 'criterion',
      label: 'Bölme Kriteri',
      type: 'select',
      options: [
        { label: 'Gini Impurity', value: 'gini' },
        { label: 'Entropy', value: 'entropy' },
      ],
    },
  ],
  formulaTeX: 'Gini(t) = 1 - Σᵢ pᵢ²',
  derive: deriveDecisionTreeResult,
  VisualizationComponent: DecisionTreeVisualization,
  codeExample: `from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=100, n_features=2,
    n_redundant=0, n_informative=2,
    random_state=42
)

clf = DecisionTreeClassifier(
    max_depth=3,
    criterion='gini',
    min_samples_split=5
)
clf.fit(X, y)
print(f"Accuracy: {clf.score(X, y):.2f}")`,
} satisfies SimulationModule<DecisionTreeParams, DecisionTreeDerivedResult>

export const decisionTreeModule = defineSimulationModule(decisionTreeDefinition)
