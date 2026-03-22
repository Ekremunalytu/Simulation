import type { SimulationModule } from '../../types/simulation'
import { DecisionTreeVisualization } from './Visualization'

export const decisionTreeModule: SimulationModule = {
  id: 'decision-tree',
  title: 'Decision Trees',
  subtitle: 'Recursive Partitioning',
  category: 'ml',
  description:
    'Visualize how decision trees split feature space using entropy or Gini impurity. Adjust depth, sample size, and separation to observe overfitting vs underfitting.',
  icon: '🌳',
  difficulty: 'intermediate',

  defaultParams: {
    numPoints: 60,
    separation: 2,
    maxDepth: 3,
    minSamples: 5,
    criterion: 'gini',
  },

  presets: [
    { name: 'Simple', params: { numPoints: 40, separation: 3, maxDepth: 2, minSamples: 5, criterion: 'gini' } },
    { name: 'Deep', params: { numPoints: 80, separation: 1.5, maxDepth: 6, minSamples: 2, criterion: 'gini' } },
    { name: 'Entropy', params: { numPoints: 60, separation: 2, maxDepth: 3, minSamples: 5, criterion: 'entropy' } },
    { name: 'Overfit', params: { numPoints: 30, separation: 1, maxDepth: 8, minSamples: 1, criterion: 'gini' } },
  ],

  controlSchema: [
    { key: 'numPoints', label: 'Data Points', type: 'slider', min: 20, max: 150, step: 10 },
    { key: 'separation', label: 'Class Separation', type: 'slider', min: 0.5, max: 5, step: 0.5 },
    { key: 'maxDepth', label: 'Max Depth', type: 'slider', min: 1, max: 8, step: 1 },
    { key: 'minSamples', label: 'Min Samples Split', type: 'slider', min: 1, max: 20, step: 1 },
    {
      key: 'criterion',
      label: 'Split Criterion',
      type: 'select',
      options: [
        { label: 'Gini Impurity', value: 'gini' },
        { label: 'Entropy', value: 'entropy' },
      ],
    },
  ],

  formulaTeX: 'Gini(t) = 1 - Σᵢ pᵢ²',

  explanationGenerator: (params) => {
    const depth = params.maxDepth as number
    const sep = params.separation as number
    const criterion = params.criterion as string
    const minSamples = params.minSamples as number

    let text = `Using ${criterion === 'entropy' ? 'Information Gain (entropy)' : 'Gini Impurity'} as split criterion. `
    text += `Max depth = ${depth}. `

    if (depth > 5) {
      text += 'Deep trees can overfit — they memorize the training data rather than learning the pattern. '
    } else if (depth <= 2) {
      text += 'Shallow trees are simple and interpretable but may underfit complex boundaries. '
    }

    if (sep < 1.5) {
      text += 'Classes overlap significantly, making clean separation difficult. '
    } else if (sep > 3) {
      text += 'Classes are well-separated — even a simple tree can classify them accurately. '
    }

    if (minSamples <= 2) {
      text += 'Very low min_samples allows the tree to create tiny leaf nodes, increasing overfitting risk.'
    }

    return text
  },

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
}
