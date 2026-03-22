import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
} from '../../types/simulation'

export interface DecisionTreeParams extends SimulationParamsBase {
  numPoints: number
  separation: number
  maxDepth: number
  minSamples: number
  criterion: 'gini' | 'entropy'
}

export interface TreeNode {
  id: string
  feature?: 'x' | 'y'
  threshold?: number
  label?: string
  left?: TreeNode
  right?: TreeNode
  samples: number
  impurity: number
  depth: number
}

export interface DataPoint2D {
  x: number
  y: number
  label: number
}

export interface DecisionTreeDerivedResult extends SimulationResultBase {
  data: DataPoint2D[]
  tree: TreeNode
  nodeCount: number
  depth: number
  leafCount: number
  rootImpurity: number
  buildOrder: string[]
}

function createSeededRandom(seed: number) {
  let state = seed

  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export function generateClassificationData(
  n: number,
  separation: number,
  seed: number = 42,
): DataPoint2D[] {
  const random = createSeededRandom(seed)
  const data: DataPoint2D[] = []

  for (let index = 0; index < n; index += 1) {
    const label = index < n / 2 ? 0 : 1
    const centerX = label === 0 ? -separation : separation
    const centerY = label === 0 ? -separation * 0.5 : separation * 0.5
    const x = centerX + (random() - 0.5) * 4
    const y = centerY + (random() - 0.5) * 4
    data.push({ x, y, label })
  }

  return data
}

export function calculateGini(data: DataPoint2D[]): number {
  if (data.length === 0) {
    return 0
  }

  const counts = [0, 0]
  data.forEach((point) => {
    counts[point.label] += 1
  })

  const probabilityA = counts[0] / data.length
  const probabilityB = counts[1] / data.length

  return 1 - probabilityA * probabilityA - probabilityB * probabilityB
}

export function calculateEntropy(data: DataPoint2D[]): number {
  if (data.length === 0) {
    return 0
  }

  const counts = [0, 0]
  data.forEach((point) => {
    counts[point.label] += 1
  })

  let entropy = 0
  for (const count of counts) {
    if (count === 0) {
      continue
    }

    const probability = count / data.length
    entropy -= probability * Math.log2(probability)
  }

  return entropy
}

interface BuildTreeResult {
  tree: TreeNode
  buildOrder: string[]
}

export function buildTree(
  data: DataPoint2D[],
  maxDepth: number,
  minSamples: number,
  criterion: DecisionTreeParams['criterion'],
): TreeNode {
  return buildTreeWithOrder(data, maxDepth, minSamples, criterion).tree
}

export function buildTreeWithOrder(
  data: DataPoint2D[],
  maxDepth: number,
  minSamples: number,
  criterion: DecisionTreeParams['criterion'],
  depth: number = 0,
  idPrefix: string = '0',
): BuildTreeResult {
  const impurityFunction = criterion === 'entropy' ? calculateEntropy : calculateGini
  const impurity = impurityFunction(data)
  const majorityLabel = data.filter((point) => point.label === 0).length >= data.length / 2 ? 0 : 1

  if (depth >= maxDepth || data.length <= minSamples || impurity === 0) {
    return {
      tree: {
        id: idPrefix,
        label: majorityLabel === 0 ? 'Class A' : 'Class B',
        samples: data.length,
        impurity,
        depth,
      },
      buildOrder: [idPrefix],
    }
  }

  let bestGain = -1
  let bestFeature: 'x' | 'y' = 'x'
  let bestThreshold = 0
  let bestLeft: DataPoint2D[] = []
  let bestRight: DataPoint2D[] = []

  for (const feature of ['x', 'y'] as const) {
    const values = [...new Set(data.map((point) => point[feature]))].sort((left, right) => left - right)

    for (let index = 0; index < values.length - 1; index += 1) {
      const threshold = (values[index] + values[index + 1]) / 2
      const left = data.filter((point) => point[feature] <= threshold)
      const right = data.filter((point) => point[feature] > threshold)

      if (left.length === 0 || right.length === 0) {
        continue
      }

      const gain =
        impurity -
        (left.length / data.length) * impurityFunction(left) -
        (right.length / data.length) * impurityFunction(right)

      if (gain > bestGain) {
        bestGain = gain
        bestFeature = feature
        bestThreshold = threshold
        bestLeft = left
        bestRight = right
      }
    }
  }

  if (bestGain <= 0) {
    return {
      tree: {
        id: idPrefix,
        label: majorityLabel === 0 ? 'Class A' : 'Class B',
        samples: data.length,
        impurity,
        depth,
      },
      buildOrder: [idPrefix],
    }
  }

  const leftResult = buildTreeWithOrder(bestLeft, maxDepth, minSamples, criterion, depth + 1, `${idPrefix}L`)
  const rightResult = buildTreeWithOrder(bestRight, maxDepth, minSamples, criterion, depth + 1, `${idPrefix}R`)

  return {
    tree: {
      id: idPrefix,
      feature: bestFeature,
      threshold: bestThreshold,
      samples: data.length,
      impurity,
      depth,
      left: leftResult.tree,
      right: rightResult.tree,
    },
    buildOrder: [idPrefix, ...leftResult.buildOrder, ...rightResult.buildOrder],
  }
}

export function countNodes(node: TreeNode): number {
  if (!node.left && !node.right) {
    return 1
  }

  return 1 + (node.left ? countNodes(node.left) : 0) + (node.right ? countNodes(node.right) : 0)
}

export function treeDepth(node: TreeNode): number {
  if (!node.left && !node.right) {
    return 0
  }

  return 1 + Math.max(node.left ? treeDepth(node.left) : 0, node.right ? treeDepth(node.right) : 0)
}

export function countLeaves(node: TreeNode): number {
  if (!node.left && !node.right) {
    return 1
  }

  return (node.left ? countLeaves(node.left) : 0) + (node.right ? countLeaves(node.right) : 0)
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Drive Overfitting',
      change: 'Raise max depth and lower min samples to 1 or 2.',
      expectation: 'The tree grows many small leaves and starts memorizing the training points instead of keeping broad splits.',
    },
    {
      title: 'Make Classes Harder',
      change: 'Reduce separation below 1.5 and rebuild.',
      expectation: 'Impurity stays higher because the classes overlap more, so even deeper trees struggle to cleanly separate them.',
    },
    {
      title: 'Compare Criteria',
      change: 'Switch between Gini and entropy using the same data settings.',
      expectation: 'The split thresholds may shift slightly, but both criteria should chase purer child nodes.',
    },
  ]
}

export function deriveDecisionTreeResult(
  params: DecisionTreeParams,
): DecisionTreeDerivedResult {
  const data = generateClassificationData(params.numPoints, params.separation)
  const { tree, buildOrder } = buildTreeWithOrder(
    data,
    params.maxDepth,
    params.minSamples,
    params.criterion,
  )
  const nodeCount = countNodes(tree)
  const depth = treeDepth(tree)
  const leafCount = countLeaves(tree)
  const rootImpurity = tree.impurity

  return {
    data,
    tree,
    nodeCount,
    depth,
    leafCount,
    rootImpurity,
    buildOrder,
    metrics: [
      {
        label: 'Nodes',
        value: String(nodeCount),
        tone: nodeCount > 10 ? 'warning' : 'primary',
      },
      {
        label: 'Depth',
        value: String(depth),
        tone: depth >= params.maxDepth ? 'tertiary' : 'secondary',
      },
      {
        label: 'Leaves',
        value: String(leafCount),
        tone: 'neutral',
      },
      {
        label: 'Root Impurity',
        value: rootImpurity.toFixed(3),
        tone: rootImpurity < 0.2 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `The tree was trained on ${params.numPoints} synthetic points using ${params.criterion === 'entropy' ? 'entropy' : 'Gini impurity'} as the split criterion.`,
      interpretation:
        depth > 5
          ? 'The tree is deep enough to carve very specific regions of the feature space, which usually improves fit at the cost of generality.'
          : depth <= 2
            ? 'The tree stays shallow, so each split must explain a large portion of the structure. That keeps the model interpretable but can underfit.'
            : 'The tree has enough depth to create meaningful partitions without automatically memorizing every training point.',
      warnings:
        params.separation < 1.5
          ? 'Class overlap is high, so remaining impurity is expected. Pushing depth higher may overfit rather than solve the ambiguity.'
          : 'The classes are fairly separable, so if the tree still grows too large, the model is probably fitting noise.',
      tryNext:
        params.minSamples <= 2
          ? 'Increase min samples and rerun. You should see fewer leaves and a simpler boundary.'
          : 'Lower min samples to let the tree chase tiny pockets of data, then compare how node count explodes.',
    },
    experiments: buildExperiments(),
    timeline: {
      frames: buildOrder.map((nodeId, index) => ({
        label: index === 0 ? 'Root split' : `Reveal ${nodeId}`,
      })),
    },
  }
}
