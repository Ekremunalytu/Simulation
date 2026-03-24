import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom, pickOne } from '../shared/random'

type CellValue = 'X' | 'O' | ''
type Player = 'X' | 'O'

export interface MctsGameLabParams extends SimulationParamsBase {
  algorithm: 'mcts' | 'minimax'
  boardPreset: 'opening' | 'fork-threat' | 'endgame'
  rolloutBudget: number
  explorationConstant: number
  maxDepth: number
  playerToMove: 'x' | 'o'
}

export interface CandidateMove {
  move: number
  visits: number
  winRate: number
  score: number
  reason: string
}

export interface TreeNodeSnapshot {
  id: string
  parentId: string | null
  move: number | null
  player: Player
  depth: number
  visits: number
  winRate: number
  score: number
}

export interface SearchTraceEntry {
  step: number
  message: string
  focusMove: number | null
  value: number
  visits: number
}

export interface MctsGameLabResult extends SimulationResultBase {
  board: CellValue[]
  candidateMoves: CandidateMove[]
  treeNodes: TreeNodeSnapshot[]
  visitCounts: Array<{ move: number; visits: number }>
  winRates: Array<{ move: number; winRate: number }>
  selectedMove: number | null
  principalVariation: number[]
  searchTrace: SearchTraceEntry[]
  expandedNodeCount: number
  selectedMoveConfidence: number
  activePlayer: Player
  presetLabel: string
}

interface MinimaxNode {
  board: CellValue[]
  move: number | null
  player: Player
  depth: number
  score: number
  children: MinimaxNode[]
}

interface MctsNode {
  id: string
  board: CellValue[]
  player: Player
  parentId: string | null
  move: number | null
  visits: number
  valueSum: number
  depth: number
  childrenIds: string[]
  untriedMoves: number[]
}

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const boardPresets: Record<MctsGameLabParams['boardPreset'], { label: string; board: CellValue[] }> = {
  opening: {
    label: 'Opening',
    board: ['X', '', '', '', 'O', '', '', '', ''],
  },
  'fork-threat': {
    label: 'Fork Threat',
    board: ['X', '', '', '', 'O', '', '', '', 'X'],
  },
  endgame: {
    label: 'Endgame',
    board: ['X', 'O', 'X', 'X', 'O', '', '', '', 'O'],
  },
}

function toPlayer(playerToMove: MctsGameLabParams['playerToMove']): Player {
  return playerToMove === 'x' ? 'X' : 'O'
}

function nextPlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X'
}

function checkWinner(board: CellValue[]): Player | null {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as Player
    }
  }

  return null
}

function legalMoves(board: CellValue[]) {
  return board
    .map((cell, index) => (cell === '' ? index : -1))
    .filter((index) => index >= 0)
}

function applyMove(board: CellValue[], move: number, player: Player): CellValue[] {
  return board.map((cell, index) => (index === move ? player : cell))
}

function evaluateWinner(board: CellValue[], rootPlayer: Player, depth: number) {
  const winner = checkWinner(board)

  if (winner === rootPlayer) {
    return 12 - depth
  }
  if (winner && winner !== rootPlayer) {
    return depth - 12
  }
  if (legalMoves(board).length === 0) {
    return 0
  }

  let score = 0
  for (const [a, b, c] of winningLines) {
    const line = [board[a], board[b], board[c]]
    const rootCount = line.filter((cell) => cell === rootPlayer).length
    const oppCount = line.filter((cell) => cell === nextPlayer(rootPlayer)).length
    if (rootCount > 0 && oppCount === 0) {
      score += rootCount * rootCount
    } else if (oppCount > 0 && rootCount === 0) {
      score -= oppCount * oppCount
    }
  }

  return score
}

function immediateWinningMove(board: CellValue[], player: Player) {
  return legalMoves(board).find((move) => checkWinner(applyMove(board, move, player)) === player) ?? null
}

function minimaxSearch(
  board: CellValue[],
  player: Player,
  rootPlayer: Player,
  depthRemaining: number,
  alpha: number,
  beta: number,
  depth: number,
) {
  const winner = checkWinner(board)
  const moves = legalMoves(board)
  if (winner || moves.length === 0 || depthRemaining === 0) {
    return {
      node: {
        board,
        move: null,
        player,
        depth,
        score: evaluateWinner(board, rootPlayer, depth),
        children: [],
      } satisfies MinimaxNode,
      bestMove: null as number | null,
      explored: 1,
      pruned: 0,
      principalVariation: [] as number[],
    }
  }

  let explored = 1
  let pruned = 0
  const maximizing = player === rootPlayer
  let bestScore = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  let bestMove: number | null = null
  let bestVariation: number[] = []
  const children: MinimaxNode[] = []
  let currentAlpha = alpha
  let currentBeta = beta

  for (let index = 0; index < moves.length; index += 1) {
    const move = moves[index] as number
    const childBoard = applyMove(board, move, player)
    const child = minimaxSearch(
      childBoard,
      nextPlayer(player),
      rootPlayer,
      depthRemaining - 1,
      currentAlpha,
      currentBeta,
      depth + 1,
    )

    explored += child.explored
    pruned += child.pruned
    children.push({
      ...child.node,
      move,
    })

    if (
      (maximizing && child.node.score > bestScore) ||
      (!maximizing && child.node.score < bestScore)
    ) {
      bestScore = child.node.score
      bestMove = move
      bestVariation = [move, ...child.principalVariation]
    }

    if (maximizing) {
      currentAlpha = Math.max(currentAlpha, bestScore)
    } else {
      currentBeta = Math.min(currentBeta, bestScore)
    }

    if (currentAlpha >= currentBeta) {
      pruned += moves.length - index - 1
      break
    }
  }

  return {
    node: {
      board,
      move: null,
      player,
      depth,
      score: bestScore,
      children,
    } satisfies MinimaxNode,
    bestMove,
    explored,
    pruned,
    principalVariation: bestVariation,
  }
}

function scoreToConfidence(score: number) {
  return Math.max(0, Math.min(1, 0.5 + score / 24))
}

function selectRolloutMove(board: CellValue[], player: Player, random: () => number) {
  const winning = immediateWinningMove(board, player)
  if (winning !== null) {
    return winning
  }

  const blocking = immediateWinningMove(board, nextPlayer(player))
  if (blocking !== null) {
    return blocking
  }

  return pickOne(random, legalMoves(board))
}

function rolloutReward(board: CellValue[], rootPlayer: Player, depth: number) {
  const heuristic = evaluateWinner(board, rootPlayer, depth)
  return Math.max(0, Math.min(1, 0.5 + heuristic / 24))
}

function hashSeed(params: MctsGameLabParams) {
  const source = `${params.boardPreset}|${params.rolloutBudget}|${params.maxDepth}|${params.playerToMove}|${params.explorationConstant.toFixed(2)}`
  return [...source].reduce((sum, char) => sum + char.charCodeAt(0), 7919)
}

function buildPrincipalVariationFromTree(nodes: Map<string, MctsNode>, rootId: string) {
  const variation: number[] = []
  let currentId: string | null = rootId

  while (currentId) {
    const current = nodes.get(currentId)
    if (!current || current.childrenIds.length === 0) {
      break
    }

    const next = [...current.childrenIds]
      .map((id) => nodes.get(id))
      .filter((node): node is MctsNode => Boolean(node))
      .sort((left, right) => {
        if (right.visits !== left.visits) {
          return right.visits - left.visits
        }
        return (right.valueSum / Math.max(1, right.visits)) - (left.valueSum / Math.max(1, left.visits))
      })[0]

    if (!next || next.move === null) {
      break
    }

    variation.push(next.move)
    currentId = next.id
  }

  return variation
}

function mctsSearch(
  board: CellValue[],
  rootPlayer: Player,
  params: MctsGameLabParams,
) {
  const rootId = 'root'
  const root: MctsNode = {
    id: rootId,
    board,
    player: rootPlayer,
    parentId: null,
    move: null,
    visits: 0,
    valueSum: 0,
    depth: 0,
    childrenIds: [],
    untriedMoves: legalMoves(board),
  }
  const nodes = new Map<string, MctsNode>([[rootId, root]])
  const random = createSeededRandom(hashSeed(params))
  const trace: SearchTraceEntry[] = []

  for (let iteration = 1; iteration <= params.rolloutBudget; iteration += 1) {
    let currentId = rootId
    const path = [rootId]

    while (true) {
      const current = nodes.get(currentId)
      if (!current) {
        break
      }

      const winner = checkWinner(current.board)
      if (winner || legalMoves(current.board).length === 0 || current.depth >= params.maxDepth) {
        break
      }

      if (current.untriedMoves.length > 0) {
        const move = current.untriedMoves.shift() as number
        const childBoard = applyMove(current.board, move, current.player)
        const childId = `${current.id}-${move}-${current.childrenIds.length}`
        const child: MctsNode = {
          id: childId,
          board: childBoard,
          player: nextPlayer(current.player),
          parentId: current.id,
          move,
          visits: 0,
          valueSum: 0,
          depth: current.depth + 1,
          childrenIds: [],
          untriedMoves: legalMoves(childBoard),
        }
        current.childrenIds.push(childId)
        nodes.set(childId, child)
        currentId = childId
        path.push(childId)
        break
      }

      const parentVisits = Math.max(1, current.visits)
      const bestChild = current.childrenIds
        .map((id) => nodes.get(id))
        .filter((node): node is MctsNode => Boolean(node))
        .sort((left, right) => {
          const leftScore =
            left.visits === 0
              ? Number.POSITIVE_INFINITY
              : left.valueSum / left.visits +
                params.explorationConstant * Math.sqrt(Math.log(parentVisits) / left.visits)
          const rightScore =
            right.visits === 0
              ? Number.POSITIVE_INFINITY
              : right.valueSum / right.visits +
                params.explorationConstant * Math.sqrt(Math.log(parentVisits) / right.visits)

          if (rightScore !== leftScore) {
            return rightScore - leftScore
          }

          return (left.move ?? 0) - (right.move ?? 0)
        })[0]

      if (!bestChild) {
        break
      }

      currentId = bestChild.id
      path.push(bestChild.id)
    }

    const leaf = nodes.get(currentId)
    if (!leaf) {
      continue
    }

    let rolloutBoard = [...leaf.board]
    let rolloutPlayer = leaf.player
    let rolloutDepth = leaf.depth
    while (
      !checkWinner(rolloutBoard) &&
      legalMoves(rolloutBoard).length > 0 &&
      rolloutDepth < params.maxDepth
    ) {
      const move = selectRolloutMove(rolloutBoard, rolloutPlayer, random)
      rolloutBoard = applyMove(rolloutBoard, move, rolloutPlayer)
      rolloutPlayer = nextPlayer(rolloutPlayer)
      rolloutDepth += 1
    }

    const winner = checkWinner(rolloutBoard)
    const reward =
      winner === rootPlayer
        ? 1
        : winner && winner !== rootPlayer
          ? 0
          : rolloutReward(rolloutBoard, rootPlayer, rolloutDepth)

    for (const id of path) {
      const node = nodes.get(id)
      if (!node) {
        continue
      }
      node.visits += 1
      node.valueSum += reward
    }

    if (iteration <= 12 || iteration % Math.max(10, Math.floor(params.rolloutBudget / 8)) === 0) {
      trace.push({
        step: iteration,
        message:
          leaf.move === null
            ? `Root rollout tamamlandı, reward ${reward.toFixed(2)}`
            : `Move ${leaf.move} üzerinden rollout yapıldı, reward ${reward.toFixed(2)}`,
        focusMove: leaf.move,
        value: reward,
        visits: nodes.get(rootId)?.visits ?? 0,
      })
    }
  }

  const rootNode = nodes.get(rootId) as MctsNode
  const candidateMoves = rootNode.childrenIds
    .map((id) => nodes.get(id))
    .filter((node): node is MctsNode => Boolean(node))
    .map((node) => ({
      move: node.move as number,
      visits: node.visits,
      winRate: node.visits === 0 ? 0 : node.valueSum / node.visits,
      score: node.visits === 0 ? 0 : node.valueSum / node.visits,
      reason:
        node.visits === 0
          ? 'Henüz rollout yok'
          : `UCT sonrası ${node.visits} ziyaret ve ${(100 * (node.valueSum / node.visits)).toFixed(1)}% win rate`,
    }))
    .sort((left, right) => {
      if (right.visits !== left.visits) {
        return right.visits - left.visits
      }
      if (right.winRate !== left.winRate) {
        return right.winRate - left.winRate
      }
      return left.move - right.move
    })

  const selectedMove = candidateMoves[0]?.move ?? null
  const selectedMoveConfidence =
    rootNode.visits === 0 ? 0 : (candidateMoves[0]?.visits ?? 0) / rootNode.visits

  return {
    candidateMoves,
    treeNodes: [...nodes.values()].map((node) => ({
      id: node.id,
      parentId: node.parentId,
      move: node.move,
      player: node.player,
      depth: node.depth,
      visits: node.visits,
      winRate: node.visits === 0 ? 0 : node.valueSum / node.visits,
      score: node.visits === 0 ? 0 : node.valueSum / node.visits,
    })),
    searchTrace: trace,
    selectedMove,
    selectedMoveConfidence,
    principalVariation: buildPrincipalVariationFromTree(nodes, rootId),
    expandedNodeCount: nodes.size,
  }
}

function buildMinimaxResult(
  board: CellValue[],
  rootPlayer: Player,
  params: MctsGameLabParams,
) {
  const solved = minimaxSearch(
    board,
    rootPlayer,
    rootPlayer,
    params.maxDepth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    0,
  )
  const candidateMoves = solved.node.children
    .map((child) => ({
      move: child.move as number,
      visits: 1,
      winRate: scoreToConfidence(child.score),
      score: child.score,
      reason: `Depth ${params.maxDepth} minimax skoru ${child.score.toFixed(1)}`,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }
      return left.move - right.move
    })

  return {
    candidateMoves,
    treeNodes: solved.node.children.map((child, index) => ({
      id: `child-${index}`,
      parentId: 'root',
      move: child.move,
      player: child.player,
      depth: child.depth,
      visits: 1,
      winRate: scoreToConfidence(child.score),
      score: child.score,
    })),
    searchTrace: candidateMoves.map((candidate, index) => ({
      step: index + 1,
      message: `Move ${candidate.move} minimax ile ${candidate.score.toFixed(1)} skor aldı.`,
      focusMove: candidate.move,
      value: candidate.score,
      visits: 1,
    })),
    selectedMove: solved.bestMove,
    selectedMoveConfidence: candidateMoves[0]?.winRate ?? 0,
    principalVariation: solved.principalVariation,
    expandedNodeCount: solved.explored + solved.pruned,
  }
}

function buildLearning(
  params: MctsGameLabParams,
  result: MctsGameLabResult,
) : LearningContent {
  return {
    summary:
      params.algorithm === 'mcts'
        ? `${result.presetLabel} tahtasında MCTS ${result.expandedNodeCount} düğüm açtı ve ${result.selectedMove} hamlesini seçti.`
        : `${result.presetLabel} tahtasında minimax ${result.selectedMove} hamlesini en yüksek skorla öne çıkardı.`,
    interpretation:
      params.algorithm === 'mcts'
        ? `Seçili hamle, rollout bütçesi içinde en çok ziyareti ve en güçlü win rate tahminini topladı. Confidence ${(result.selectedMoveConfidence * 100).toFixed(1)}%.`
        : `Minimax, sınırlı derinlik içinde deterministik utility kıyaslaması yaptı. Principal variation ${result.principalVariation.join(' → ') || '-'}.`,
    warnings:
      params.algorithm === 'mcts'
        ? 'MCTS win rate tahmini rollout politikasına ve bütçeye duyarlıdır; düşük rollout sayısı erken ve gürültülü kararlar üretebilir.'
        : 'Minimax, evaluation function ve depth sınırı yüzünden horizon effect yaşayabilir.',
    tryNext:
      'Aynı presette önce minimax, sonra MCTS çalıştır. Rollout budget yükseldikçe candidate move güveninin nasıl değiştiğini karşılaştır.',
  }
}

function buildMetrics(
  params: MctsGameLabParams,
  result: MctsGameLabResult,
): SimulationMetric[] {
  return [
    {
      label: 'Algorithm',
      value: params.algorithm.toUpperCase(),
      tone: 'primary',
    },
    {
      label: 'Selected Move',
      value: result.selectedMove === null ? '-' : String(result.selectedMove),
      tone: 'secondary',
    },
    {
      label: 'Confidence',
      value: `${(result.selectedMoveConfidence * 100).toFixed(1)}%`,
      tone: 'tertiary',
    },
    {
      label: 'Expanded Nodes',
      value: String(result.expandedNodeCount),
      tone: 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Minimax vs MCTS',
      change: 'Aynı board presetinde algorithm değerini değiştir.',
      expectation: 'Minimax skor tabanlı, MCTS ise visit/win-rate tabanlı karar verir.',
    },
    {
      title: 'Rollout Budget',
      change: 'MCTS modunda rollout budget değerini yükselt.',
      expectation: 'Root child visit dağılımı daha keskin hale gelir ve confidence artar.',
    },
    {
      title: 'Fork Threat',
      change: 'Fork threat presetinde player to move değerini x ve o arasında değiştir.',
      expectation: 'Bir tarafta blok hamlesi, diğer tarafta tehdit oluşturan veya kazandıran hamle öne çıkabilir.',
    },
  ]
}

function buildTimeline(trace: SearchTraceEntry[]): SimulationTimeline {
  return {
    frames: trace.map((entry) => ({
      label: `${entry.step}. ${entry.focusMove === null ? 'rollout' : `move ${entry.focusMove}`}`,
    })),
  }
}

export function deriveMctsGameLabResult(params: MctsGameLabParams): MctsGameLabResult {
  const preset = boardPresets[params.boardPreset]
  const board = [...preset.board]
  const activePlayer = toPlayer(params.playerToMove)
  const solved =
    params.algorithm === 'mcts'
      ? mctsSearch(board, activePlayer, params)
      : buildMinimaxResult(board, activePlayer, params)

  const result: MctsGameLabResult = {
    board,
    candidateMoves: solved.candidateMoves,
    treeNodes: solved.treeNodes,
    visitCounts: solved.candidateMoves.map((item) => ({ move: item.move, visits: item.visits })),
    winRates: solved.candidateMoves.map((item) => ({ move: item.move, winRate: item.winRate })),
    selectedMove: solved.selectedMove,
    principalVariation: solved.principalVariation,
    searchTrace: solved.searchTrace,
    expandedNodeCount: solved.expandedNodeCount,
    selectedMoveConfidence: solved.selectedMoveConfidence,
    activePlayer,
    presetLabel: preset.label,
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(solved.searchTrace),
  }

  result.learning = buildLearning(params, result)
  result.metrics = buildMetrics(params, result)

  return result
}
