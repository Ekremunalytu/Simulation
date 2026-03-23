import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface MinimaxAlphaBetaParams extends SimulationParamsBase {
  pruning: boolean
  depthLimit: number
  scenario: 'immediate-win' | 'forced-block' | 'fork-threat' | 'deep-tree'
  opponentStyle: 'optimal' | 'imperfect'
}

type CellValue = 'X' | 'O' | ''
type Player = 'X' | 'O'

export interface GameTreeNode {
  id: string
  board: CellValue[]
  player: Player
  move?: number
  utility: number
  depth: number
  alpha: number
  beta: number
  pruned: boolean
  children: GameTreeNode[]
}

export interface MinimaxAlphaBetaResult extends SimulationResultBase {
  board: CellValue[]
  tree: GameTreeNode
  evaluationOrder: string[]
  playbackOrder: string[]
  chosenMove: number | null
  evaluatedNodes: number
  prunedNodes: number
  utilityScore: number
}

interface SolveResult {
  node: GameTreeNode
  evaluationOrder: string[]
  bestMove: number | null
  evaluatedNodes: number
  prunedNodes: number
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

const scenarios: Record<MinimaxAlphaBetaParams['scenario'], CellValue[]> = {
  'immediate-win': ['X', 'X', '', 'O', 'O', '', '', '', ''],
  'forced-block': ['O', 'O', '', 'X', '', '', '', '', 'X'],
  'fork-threat': ['X', '', '', '', 'O', '', '', '', 'X'],
  'deep-tree': ['X', '', 'O', '', '', '', '', '', ''],
}

function checkWinner(board: CellValue[]): Player | null {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as Player
    }
  }

  return null
}

function legalMoves(board: CellValue[]): number[] {
  return board
    .map((cell, index) => (cell === '' ? index : -1))
    .filter((index) => index >= 0)
}

function heuristicEvaluation(board: CellValue[]): number {
  const winner = checkWinner(board)
  if (winner === 'X') {
    return 10
  }
  if (winner === 'O') {
    return -10
  }

  let score = 0
  for (const [a, b, c] of winningLines) {
    const line = [board[a], board[b], board[c]]
    const xCount = line.filter((cell) => cell === 'X').length
    const oCount = line.filter((cell) => cell === 'O').length

    if (xCount > 0 && oCount === 0) {
      score += xCount * xCount
    } else if (oCount > 0 && xCount === 0) {
      score -= oCount * oCount
    }
  }

  return score
}

function applyMove(board: CellValue[], move: number, player: Player): CellValue[] {
  return board.map((cell, index) => (index === move ? player : cell))
}

function nextPlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X'
}

function solveGameTree(
  board: CellValue[],
  player: Player,
  depthLimit: number,
  alpha: number,
  beta: number,
  params: MinimaxAlphaBetaParams,
  depth: number,
  id: string,
): SolveResult {
  const winner = checkWinner(board)
  const moves = legalMoves(board)
  const shouldStopBecauseOpponentIsImperfect =
    params.opponentStyle === 'imperfect' && player === 'O' && depth > 0

  if (winner || depthLimit === 0 || moves.length === 0 || shouldStopBecauseOpponentIsImperfect) {
    const utility =
      winner === 'X'
        ? 10 - depth
        : winner === 'O'
          ? depth - 10
          : heuristicEvaluation(board)

    return {
      node: {
        id,
        board,
        player,
        utility,
        depth,
        alpha,
        beta,
        pruned: false,
        children: [],
      },
      evaluationOrder: [id],
      bestMove: null,
      evaluatedNodes: 1,
      prunedNodes: 0,
    }
  }

  let currentAlpha = alpha
  let currentBeta = beta
  let utility = player === 'X' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  let bestMove: number | null = null
  let evaluatedNodes = 1
  let prunedNodes = 0
  const evaluationOrder = [id]
  const children: GameTreeNode[] = []

  for (let index = 0; index < moves.length; index += 1) {
    const move = moves[index] as number

    if (params.pruning && currentAlpha >= currentBeta) {
      for (const skippedMove of moves.slice(index)) {
        const childBoard = applyMove(board, skippedMove, player)
        const childId = `${id}-${skippedMove}`
        children.push({
          id: childId,
          board: childBoard,
          player: nextPlayer(player),
          move: skippedMove,
          utility: heuristicEvaluation(childBoard),
          depth: depth + 1,
          alpha: currentAlpha,
          beta: currentBeta,
          pruned: true,
          children: [],
        })
        evaluationOrder.push(childId)
        prunedNodes += 1
      }

      break
    }

    const childBoard = applyMove(board, move, player)
    const childId = `${id}-${move}`
    const childResult = solveGameTree(
      childBoard,
      nextPlayer(player),
      depthLimit - 1,
      currentAlpha,
      currentBeta,
      params,
      depth + 1,
      childId,
    )

    const childNode: GameTreeNode = {
      ...childResult.node,
      move,
    }

    children.push(childNode)
    evaluationOrder.push(...childResult.evaluationOrder)
    evaluatedNodes += childResult.evaluatedNodes
    prunedNodes += childResult.prunedNodes

    if (player === 'X') {
      if (childNode.utility > utility) {
        utility = childNode.utility
        bestMove = move
      }
      currentAlpha = Math.max(currentAlpha, utility)
    } else {
      if (childNode.utility < utility) {
        utility = childNode.utility
        bestMove = move
      }
      currentBeta = Math.min(currentBeta, utility)
    }
  }

  return {
    node: {
      id,
      board,
      player,
      utility,
      depth,
      alpha: currentAlpha,
      beta: currentBeta,
      pruned: false,
      children,
    },
    evaluationOrder,
    bestMove,
    evaluatedNodes,
    prunedNodes,
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Pruning Karsilastirmasi',
      change: 'Ayni scenario ve depth limit ile pruning toggle unu acip kapat.',
      expectation:
        'Secilen move ayni kalirken evaluated node sayisi duser; Alpha-Beta kaliteyi degistirmeden search maliyetini azaltir.',
    },
    {
      title: 'Depth Hassasiyeti',
      change: 'Depth limit i artir ve deep-tree scenario sunu tekrar calistir.',
      expectation:
        'Search tree hizla buyur. Daha derin bakis daha iyi utility tahmini saglar ama branching factor cost u belirginlesir.',
    },
    {
      title: 'Imperfect Opponent',
      change: 'Opponent style i imperfect sec ve fork-threat scenario sunda tekrar analiz et.',
      expectation:
        'O rakibinin sinirli bakis yaptigi varsayilinca root utility ve secilen move farkli olabilir; minimax varsayimlarinin politika sonucunu nasil etkiledigi netlesir.',
    },
  ]
}

function buildTimeline(evaluationOrder: string[]): SimulationTimeline {
  return {
    frames: evaluationOrder.map((id, index) => ({
        label: `${index + 1}. değerlendir ${id}`,
    })),
  }
}

function compressPlaybackOrder(evaluationOrder: string[], maxFrames: number = 180): string[] {
  if (evaluationOrder.length <= maxFrames) {
    return evaluationOrder
  }

  const stride = Math.ceil(evaluationOrder.length / maxFrames)
  const sampled = evaluationOrder.filter((_, index) => index % stride === 0)
  const last = evaluationOrder.at(-1)

  if (last && sampled.at(-1) !== last) {
    sampled.push(last)
  }

  return sampled
}

export function deriveMinimaxAlphaBetaResult(
  params: MinimaxAlphaBetaParams,
): MinimaxAlphaBetaResult {
  const board = [...scenarios[params.scenario]]
  const solved = solveGameTree(
    board,
    'X',
    params.depthLimit,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    params,
    0,
    '0',
  )
  const playbackOrder = compressPlaybackOrder(solved.evaluationOrder)

  return {
    board,
    tree: solved.node,
    evaluationOrder: solved.evaluationOrder,
    playbackOrder,
    chosenMove: solved.bestMove,
    evaluatedNodes: solved.evaluatedNodes,
    prunedNodes: solved.prunedNodes,
    utilityScore: solved.node.utility,
    metrics: [
      {
        label: 'Seçilen Hamle',
        value: solved.bestMove === null ? 'Yok' : `Hücre ${solved.bestMove}`,
        tone: 'primary',
      },
      {
        label: 'Değerlendirilen Düğümler',
        value: String(solved.evaluatedNodes),
        tone: 'secondary',
      },
      {
        label: 'Budanan Düğümler',
        value: String(solved.prunedNodes),
        tone: params.pruning ? 'tertiary' : 'neutral',
      },
      {
        label: 'Utility Skoru',
        value: solved.node.utility.toFixed(1),
        tone: solved.node.utility >= 0 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `Root oyuncu X, ${params.scenario} scenario sunda ${params.depthLimit} ply arama ile sonraki move u seciyor.`,
      interpretation:
        params.pruning
          ? 'Alpha-Beta pruning, zaten daha kotu oldugu anlasilan alt agaclari keserek ayni minimax kararini daha az node ile hesaplar.'
          : 'Klasik minimax tum ilgili alt agaci acarak en iyi en-kotu durum kararini bulur; bu dogru ama pahali bir arama davranisidir.',
      warnings:
        params.opponentStyle === 'imperfect'
          ? 'Imperfect opponent varsayimi, rakibin her zaman en iyi move u sececegi garantisini bozar. Bu durumda utility yorumu saf minimax optimali degil, model varsayimina baglidir.'
          : 'Depth limit dusukse utility yalnizca gorulen ufuk kadar guvenilirdir. Daha derin tehditler horizon disinda kalabilir.',
      tryNext:
        params.pruning
          ? 'Pruning i kapatip ayni chosen move un daha fazla node ile nasil elde edildigine bak.'
          : 'Pruning i ac ve evaluated node sayisi ile utility sonucunun ayni kalip kalmadigini karsilastir.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(playbackOrder),
  }
}
