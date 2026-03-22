export interface TreeNode {
  id: string
  feature?: string
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

// Generate 2-class data
export function generateClassificationData(n: number, separation: number, seed: number = 42): DataPoint2D[] {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  const data: DataPoint2D[] = []
  for (let i = 0; i < n; i++) {
    const label = i < n / 2 ? 0 : 1
    const cx = label === 0 ? -separation : separation
    const cy = label === 0 ? -separation * 0.5 : separation * 0.5
    const x = cx + (rand() - 0.5) * 4
    const y = cy + (rand() - 0.5) * 4
    data.push({ x, y, label })
  }
  return data
}

function gini(data: DataPoint2D[]): number {
  if (data.length === 0) return 0
  const counts = [0, 0]
  data.forEach((p) => counts[p.label]++)
  const p0 = counts[0] / data.length
  const p1 = counts[1] / data.length
  return 1 - p0 * p0 - p1 * p1
}

function entropy(data: DataPoint2D[]): number {
  if (data.length === 0) return 0
  const counts = [0, 0]
  data.forEach((p) => counts[p.label]++)
  let ent = 0
  for (const c of counts) {
    if (c > 0) {
      const p = c / data.length
      ent -= p * Math.log2(p)
    }
  }
  return ent
}

export function buildTree(
  data: DataPoint2D[],
  maxDepth: number,
  minSamples: number,
  criterion: string,
  depth: number = 0,
  idPrefix: string = '0'
): TreeNode {
  const impurityFn = criterion === 'entropy' ? entropy : gini
  const imp = impurityFn(data)
  const majorityLabel = data.filter((p) => p.label === 0).length >= data.length / 2 ? 0 : 1

  // Base cases
  if (depth >= maxDepth || data.length <= minSamples || imp === 0) {
    return {
      id: idPrefix,
      label: majorityLabel === 0 ? 'Class A' : 'Class B',
      samples: data.length,
      impurity: imp,
      depth,
    }
  }

  // Try splits on x and y
  let bestGain = -1
  let bestFeature = 'x'
  let bestThreshold = 0
  let bestLeft: DataPoint2D[] = []
  let bestRight: DataPoint2D[] = []

  for (const feature of ['x', 'y'] as const) {
    const values = [...new Set(data.map((p) => p[feature]))].sort((a, b) => a - b)
    for (let i = 0; i < values.length - 1; i++) {
      const threshold = (values[i] + values[i + 1]) / 2
      const left = data.filter((p) => p[feature] <= threshold)
      const right = data.filter((p) => p[feature] > threshold)
      if (left.length === 0 || right.length === 0) continue

      const gain = imp - (left.length / data.length) * impurityFn(left) - (right.length / data.length) * impurityFn(right)
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
      id: idPrefix,
      label: majorityLabel === 0 ? 'Class A' : 'Class B',
      samples: data.length,
      impurity: imp,
      depth,
    }
  }

  return {
    id: idPrefix,
    feature: bestFeature,
    threshold: bestThreshold,
    samples: data.length,
    impurity: imp,
    depth,
    left: buildTree(bestLeft, maxDepth, minSamples, criterion, depth + 1, idPrefix + 'L'),
    right: buildTree(bestRight, maxDepth, minSamples, criterion, depth + 1, idPrefix + 'R'),
  }
}

export function countNodes(node: TreeNode): number {
  if (!node.left && !node.right) return 1
  return 1 + (node.left ? countNodes(node.left) : 0) + (node.right ? countNodes(node.right) : 0)
}

export function treeDepth(node: TreeNode): number {
  if (!node.left && !node.right) return 0
  return 1 + Math.max(node.left ? treeDepth(node.left) : 0, node.right ? treeDepth(node.right) : 0)
}
