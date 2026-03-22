import { createSeededRandom } from './random'

export interface GridPoint {
  x: number
  y: number
}

export interface SearchGridCell extends GridPoint {
  key: string
  isWall: boolean
  weight: number
}

export interface SearchGrid {
  size: number
  start: GridPoint
  goal: GridPoint
  cells: SearchGridCell[][]
}

export type HeuristicKind = 'manhattan' | 'euclidean'

export function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`
}

export function parsePointKey(key: string): GridPoint {
  const [x, y] = key.split(',').map(Number)

  return { x, y }
}

function buildGuaranteedPath(size: number, branchBias: number, seed: number): Set<string> {
  const random = createSeededRandom(seed)
  const path = new Set<string>()
  let current: GridPoint = { x: 0, y: 0 }
  let lastMove: 'right' | 'down' | null = null

  path.add(pointKey(current))

  while (current.x < size - 1 || current.y < size - 1) {
    const canMoveRight = current.x < size - 1
    const canMoveDown = current.y < size - 1

    let move: 'right' | 'down'

    if (!canMoveDown) {
      move = 'right'
    } else if (!canMoveRight) {
      move = 'down'
    } else if (lastMove && random() < branchBias) {
      move = lastMove
    } else {
      move = random() < 0.5 ? 'right' : 'down'
    }

    current =
      move === 'right'
        ? { x: current.x + 1, y: current.y }
        : { x: current.x, y: current.y + 1 }

    path.add(pointKey(current))
    lastMove = move
  }

  return path
}

export function generateSearchGrid(options: {
  size: number
  obstacleDensity: number
  weightVariance: number
  branchBias?: number
  seed?: number
}): SearchGrid {
  const { size, obstacleDensity, weightVariance, branchBias = 0.55, seed = 42 } = options
  const random = createSeededRandom(seed)
  const guaranteedPath = buildGuaranteedPath(size, branchBias, seed + 11)
  const cells: SearchGridCell[][] = []

  for (let y = 0; y < size; y += 1) {
    const row: SearchGridCell[] = []

    for (let x = 0; x < size; x += 1) {
      const key = pointKey({ x, y })
      const isStart = x === 0 && y === 0
      const isGoal = x === size - 1 && y === size - 1
      const protectedTile = guaranteedPath.has(key)
      const edgeBuffer = x === 0 || y === 0 || x === size - 1 || y === size - 1
      const wallChance = edgeBuffer ? obstacleDensity * 0.45 : obstacleDensity
      const isWall = !isStart && !isGoal && !protectedTile && random() < wallChance
      const weight = 1 + Math.floor(random() * Math.max(1, weightVariance))

      row.push({
        x,
        y,
        key,
        isWall,
        weight,
      })
    }

    cells.push(row)
  }

  return {
    size,
    start: { x: 0, y: 0 },
    goal: { x: size - 1, y: size - 1 },
    cells,
  }
}

export function buildSearchGridFromMatrix(matrix: number[][]): SearchGrid {
  const size = matrix.length

  return {
    size,
    start: { x: 0, y: 0 },
    goal: { x: size - 1, y: size - 1 },
    cells: matrix.map((row, y) =>
      row.map((value, x) => ({
        x,
        y,
        key: pointKey({ x, y }),
        isWall: value < 0,
        weight: value < 0 ? 0 : value,
      })),
    ),
  }
}

export function getCell(grid: SearchGrid, point: GridPoint): SearchGridCell | undefined {
  return grid.cells[point.y]?.[point.x]
}

export function getNeighbors(grid: SearchGrid, point: GridPoint): SearchGridCell[] {
  const candidates: GridPoint[] = [
    { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y + 1 },
    { x: point.x - 1, y: point.y },
    { x: point.x, y: point.y - 1 },
  ]

  return candidates
    .map((candidate) => getCell(grid, candidate))
    .filter((candidate): candidate is SearchGridCell => Boolean(candidate && !candidate.isWall))
}

export function heuristicDistance(
  left: GridPoint,
  right: GridPoint,
  heuristic: HeuristicKind,
): number {
  const dx = Math.abs(left.x - right.x)
  const dy = Math.abs(left.y - right.y)

  if (heuristic === 'euclidean') {
    return Math.sqrt(dx * dx + dy * dy)
  }

  return dx + dy
}
