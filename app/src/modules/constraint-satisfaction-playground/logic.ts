import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface ConstraintSatisfactionParams extends SimulationParamsBase {
  solver: 'plain-backtracking' | 'mrv-forward-checking' | 'ac3-assisted'
  graphPreset: 'triangle' | 'australia-map' | 'dense-six-node'
  colorCount: number
  maxSteps: number
  variableOrderBias: 'static' | 'high-degree'
}

type StepType =
  | 'start'
  | 'select'
  | 'assign'
  | 'prune'
  | 'conflict'
  | 'backtrack'
  | 'solved'
  | 'failure'

interface GraphPreset {
  label: string
  variables: string[]
  edges: Array<[string, string]>
}

export interface DomainSnapshot {
  step: number
  activeVariable: string | null
  domains: Record<string, string[]>
  assignments: Record<string, string>
  type: StepType
  message: string
}

export interface ConflictRecord {
  step: number
  variable: string
  conflictingWith: string[]
  color: string
  reason: string
}

export interface DecisionTraceEntry {
  step: number
  type: StepType
  variable?: string
  color?: string
  message: string
}

export interface ConstraintSatisfactionResult extends SimulationResultBase {
  variables: string[]
  domainsByStep: DomainSnapshot[]
  assignmentsByStep: Array<Record<string, string>>
  constraintEdges: Array<[string, string]>
  conflicts: ConflictRecord[]
  backtrackCount: number
  solved: boolean
  decisionTrace: DecisionTraceEntry[]
  prunedValueCount: number
  consistencyChecks: number
  presetLabel: string
  colorPalette: string[]
}

const basePalette = ['Amber', 'Cyan', 'Lavender', 'Coral']

const graphPresets: Record<ConstraintSatisfactionParams['graphPreset'], GraphPreset> = {
  triangle: {
    label: 'Triangle',
    variables: ['A', 'B', 'C'],
    edges: [
      ['A', 'B'],
      ['B', 'C'],
      ['A', 'C'],
    ],
  },
  'australia-map': {
    label: 'Australia Map',
    variables: ['WA', 'NT', 'SA', 'Q', 'NSW', 'V', 'T'],
    edges: [
      ['WA', 'NT'],
      ['WA', 'SA'],
      ['NT', 'SA'],
      ['NT', 'Q'],
      ['SA', 'Q'],
      ['SA', 'NSW'],
      ['SA', 'V'],
      ['Q', 'NSW'],
      ['NSW', 'V'],
    ],
  },
  'dense-six-node': {
    label: 'Dense Six Node',
    variables: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [
      ['A', 'B'],
      ['A', 'C'],
      ['A', 'D'],
      ['B', 'C'],
      ['B', 'E'],
      ['B', 'F'],
      ['C', 'D'],
      ['C', 'E'],
      ['D', 'E'],
      ['D', 'F'],
      ['E', 'F'],
    ],
  },
}

function buildNeighbors(edges: Array<[string, string]>) {
  const neighbors = new Map<string, Set<string>>()

  for (const [left, right] of edges) {
    if (!neighbors.has(left)) {
      neighbors.set(left, new Set())
    }
    if (!neighbors.has(right)) {
      neighbors.set(right, new Set())
    }
    neighbors.get(left)?.add(right)
    neighbors.get(right)?.add(left)
  }

  return neighbors
}

function cloneDomains(domains: Record<string, string[]>) {
  return Object.fromEntries(
    Object.entries(domains).map(([key, values]) => [key, [...values]]),
  ) as Record<string, string[]>
}

function cloneAssignments(assignments: Record<string, string>) {
  return { ...assignments }
}

function selectVariable(
  params: ConstraintSatisfactionParams,
  variables: string[],
  assignments: Record<string, string>,
  domains: Record<string, string[]>,
  neighbors: Map<string, Set<string>>,
) {
  const unassigned = variables.filter((variable) => !assignments[variable])

  if (params.solver === 'plain-backtracking') {
    if (params.variableOrderBias === 'high-degree') {
      return [...unassigned].sort((left, right) => {
        const degreeDiff =
          (neighbors.get(right)?.size ?? 0) - (neighbors.get(left)?.size ?? 0)

        if (degreeDiff !== 0) {
          return degreeDiff
        }

        return left.localeCompare(right)
      })[0] as string | undefined
    }

    return unassigned[0]
  }

  return [...unassigned].sort((left, right) => {
    const domainDiff = domains[left].length - domains[right].length
    if (domainDiff !== 0) {
      return domainDiff
    }

    const degreeDiff =
      (neighbors.get(right)?.size ?? 0) - (neighbors.get(left)?.size ?? 0)

    if (degreeDiff !== 0) {
      return degreeDiff
    }

    return left.localeCompare(right)
  })[0] as string | undefined
}

function orderColors(
  variable: string,
  domains: Record<string, string[]>,
  neighbors: Map<string, Set<string>>,
  assignments: Record<string, string>,
) {
  const domain = [...domains[variable]]
  const unassignedNeighbors = [...(neighbors.get(variable) ?? [])].filter(
    (neighbor) => !assignments[neighbor],
  )

  return domain.sort((left, right) => {
    const leftImpact = unassignedNeighbors.reduce(
      (total, neighbor) => total + Number(domains[neighbor].includes(left)),
      0,
    )
    const rightImpact = unassignedNeighbors.reduce(
      (total, neighbor) => total + Number(domains[neighbor].includes(right)),
      0,
    )

    if (leftImpact !== rightImpact) {
      return leftImpact - rightImpact
    }

    return left.localeCompare(right)
  })
}

function hasConflict(
  variable: string,
  color: string,
  assignments: Record<string, string>,
  neighbors: Map<string, Set<string>>,
) {
  const conflictingWith = [...(neighbors.get(variable) ?? [])].filter(
    (neighbor) => assignments[neighbor] === color,
  )

  return conflictingWith
}

interface SolveState {
  steps: number
  backtrackCount: number
  prunedValueCount: number
  consistencyChecks: number
  snapshots: DomainSnapshot[]
  conflicts: ConflictRecord[]
  decisionTrace: DecisionTraceEntry[]
}

function recordSnapshot(
  state: SolveState,
  type: StepType,
  message: string,
  activeVariable: string | null,
  domains: Record<string, string[]>,
  assignments: Record<string, string>,
  variable?: string,
  color?: string,
) {
  state.steps += 1
  state.snapshots.push({
    step: state.steps,
    activeVariable,
    domains: cloneDomains(domains),
    assignments: cloneAssignments(assignments),
    type,
    message,
  })
  state.decisionTrace.push({
    step: state.steps,
    type,
    variable,
    color,
    message,
  })
}

function forwardCheck(
  variable: string,
  color: string,
  domains: Record<string, string[]>,
  assignments: Record<string, string>,
  neighbors: Map<string, Set<string>>,
  state: SolveState,
) {
  const nextDomains = cloneDomains(domains)
  const pruned: Array<{ neighbor: string; removed: string }> = []

  for (const neighbor of neighbors.get(variable) ?? []) {
    if (assignments[neighbor]) {
      continue
    }

    const previousLength = nextDomains[neighbor].length
    nextDomains[neighbor] = nextDomains[neighbor].filter((value) => value !== color)

    if (nextDomains[neighbor].length !== previousLength) {
      pruned.push({ neighbor, removed: color })
      state.prunedValueCount += previousLength - nextDomains[neighbor].length
    }

    if (nextDomains[neighbor].length === 0) {
      return { consistent: false, domains: nextDomains, pruned }
    }
  }

  return { consistent: true, domains: nextDomains, pruned }
}

function reviseArc(
  left: string,
  right: string,
  domains: Record<string, string[]>,
) {
  let revised = false
  const filtered = domains[left].filter((leftValue) => {
    const supported = domains[right].some((rightValue) => rightValue !== leftValue)
    if (!supported) {
      revised = true
    }
    return supported
  })

  return {
    revised,
    domain: filtered,
    removed: revised ? domains[left].filter((value) => !filtered.includes(value)) : [],
  }
}

function runAc3(
  variables: string[],
  edges: Array<[string, string]>,
  domains: Record<string, string[]>,
  neighbors: Map<string, Set<string>>,
  state: SolveState,
  assignments: Record<string, string>,
) {
  const queue: Array<[string, string]> = edges.flatMap(([left, right]) => [
    [left, right] as [string, string],
    [right, left] as [string, string],
  ])
  const nextDomains = cloneDomains(domains)

  while (queue.length > 0) {
    const arc = queue.shift()
    if (!arc) {
      continue
    }

    const [left, right] = arc
    const revision = reviseArc(left, right, nextDomains)
    state.consistencyChecks += 1

    if (!revision.revised) {
      continue
    }

    nextDomains[left] = revision.domain
    state.prunedValueCount += revision.removed.length
    recordSnapshot(
      state,
      'prune',
      `${left} domaininden ${revision.removed.join(', ')} AC-3 ile elendi.`,
      left,
      nextDomains,
      assignments,
      left,
    )

    if (nextDomains[left].length === 0) {
      return { consistent: false, domains: nextDomains }
    }

    for (const neighbor of neighbors.get(left) ?? []) {
      if (neighbor !== right) {
        queue.push([neighbor, left])
      }
    }
  }

  for (const variable of variables) {
    if (nextDomains[variable].length === 0) {
      return { consistent: false, domains: nextDomains }
    }
  }

  return { consistent: true, domains: nextDomains }
}

function solveColoring(
  params: ConstraintSatisfactionParams,
  preset: GraphPreset,
  palette: string[],
) {
  const neighbors = buildNeighbors(preset.edges)
  const initialDomains = Object.fromEntries(
    preset.variables.map((variable) => [variable, [...palette]]),
  ) as Record<string, string[]>
  const state: SolveState = {
    steps: 0,
    backtrackCount: 0,
    prunedValueCount: 0,
    consistencyChecks: 0,
    snapshots: [],
    conflicts: [],
    decisionTrace: [],
  }

  recordSnapshot(
    state,
    'start',
    `${preset.label} CSP senaryosu başlatıldı.`,
    null,
    initialDomains,
    {},
  )

  let rootDomains = initialDomains

  if (params.solver === 'ac3-assisted') {
    const anchorVariable = preset.variables[0]
    if (anchorVariable) {
      rootDomains = cloneDomains(rootDomains)
      const removed = rootDomains[anchorVariable].slice(1)
      rootDomains[anchorVariable] = [palette[0] as string]
      state.prunedValueCount += removed.length
      recordSnapshot(
        state,
        'prune',
        `${anchorVariable} için symmetry-break uygulanıp domain ${palette[0]} ile sabitlendi.`,
        anchorVariable,
        rootDomains,
        {},
        anchorVariable,
      )
    }

    const ac3 = runAc3(preset.variables, preset.edges, rootDomains, neighbors, state, {})
    rootDomains = ac3.domains
  }

  function search(
    assignments: Record<string, string>,
    domains: Record<string, string[]>,
  ): { solved: boolean; assignments: Record<string, string>; domains: Record<string, string[]> } {
    if (state.steps >= params.maxSteps) {
      return { solved: false, assignments, domains }
    }

    if (Object.keys(assignments).length === preset.variables.length) {
      recordSnapshot(
        state,
        'solved',
        'Tüm değişkenler tutarlı biçimde renklendirildi.',
        null,
        domains,
        assignments,
      )
      return { solved: true, assignments, domains }
    }

    const variable = selectVariable(
      params,
      preset.variables,
      assignments,
      domains,
      neighbors,
    )

    if (!variable) {
      return { solved: false, assignments, domains }
    }

    recordSnapshot(
      state,
      'select',
      `${variable} değişkeni sıradaki karar düğümü olarak seçildi.`,
      variable,
      domains,
      assignments,
      variable,
    )

    const candidateColors =
      params.solver === 'plain-backtracking'
        ? domains[variable]
        : orderColors(variable, domains, neighbors, assignments)

    for (const color of candidateColors) {
      state.consistencyChecks += 1
      const conflictingWith = hasConflict(variable, color, assignments, neighbors)

      if (conflictingWith.length > 0) {
        const conflict: ConflictRecord = {
          step: state.steps + 1,
          variable,
          conflictingWith,
          color,
          reason: `${variable}=${color} komşu eşleşmesi yüzünden çatıştı.`,
        }
        state.conflicts.push(conflict)
        recordSnapshot(
          state,
          'conflict',
          `${variable}=${color} seçimi ${conflictingWith.join(', ')} ile çatıştı.`,
          variable,
          domains,
          assignments,
          variable,
          color,
        )
        continue
      }

      const nextAssignments = cloneAssignments(assignments)
      nextAssignments[variable] = color
      const assignedDomains = cloneDomains(domains)
      assignedDomains[variable] = [color]

      recordSnapshot(
        state,
        'assign',
        `${variable} değişkenine ${color} atandı.`,
        variable,
        assignedDomains,
        nextAssignments,
        variable,
        color,
      )

      let nextDomains = assignedDomains
      let consistent = true

      if (params.solver !== 'plain-backtracking') {
        const checked = forwardCheck(
          variable,
          color,
          nextDomains,
          nextAssignments,
          neighbors,
          state,
        )
        nextDomains = checked.domains
        consistent = checked.consistent

        if (checked.pruned.length > 0) {
          recordSnapshot(
            state,
            'prune',
            `${variable}=${color} sonrası komşu domainleri daraltıldı.`,
            variable,
            nextDomains,
            nextAssignments,
            variable,
            color,
          )
        }
      }

      if (consistent && params.solver === 'ac3-assisted') {
        const ac3 = runAc3(
          preset.variables,
          preset.edges,
          nextDomains,
          neighbors,
          state,
          nextAssignments,
        )
        consistent = ac3.consistent
        nextDomains = ac3.domains
      }

      if (consistent) {
        const solved = search(nextAssignments, nextDomains)
        if (solved.solved) {
          return solved
        }
      }

      state.backtrackCount += 1
      recordSnapshot(
        state,
        'backtrack',
        `${variable}=${color} dalı geri sarıldı.`,
        variable,
        domains,
        assignments,
        variable,
        color,
      )
    }

    return { solved: false, assignments, domains }
  }

  const outcome = search({}, rootDomains)

  if (!outcome.solved) {
    recordSnapshot(
      state,
      'failure',
      state.steps >= params.maxSteps
        ? 'Maksimum adım sınırına ulaşıldı; çözüm tamamlanamadı.'
        : 'Bu renk sayısı altında tutarlı atama bulunamadı.',
      null,
      outcome.domains,
      outcome.assignments,
    )
  }

  return {
    presetLabel: preset.label,
    palette,
    outcome,
    state,
  }
}

function buildLearning(
  params: ConstraintSatisfactionParams,
  result: ConstraintSatisfactionResult,
) : LearningContent {
  return {
    summary: result.solved
      ? `${result.presetLabel} grafı ${params.solver} ile ${result.backtrackCount} geri sarma adımında çözüldü.`
      : `${result.presetLabel} grafı ${params.colorCount} renkle ${params.solver} altında tutarlı biçimde çözülemedi.`,
    interpretation: result.solved
      ? `${result.prunedValueCount} domain değeri elendi ve ${result.consistencyChecks} tutarlılık kontrolü yapıldı. Heuristic solverlar, özellikle yoğun graf yapılarında karar uzayını daha erken daraltır.`
      : `Çatışma kayıtları, hangi düğümün hangi renkte tıkandığını gösteriyor. Eğer pruning düşük ama backtrack yüksekse solver çok geç fark ettiği çatışmalar yüzünden zaman kaybediyor.`,
    warnings:
      params.solver === 'plain-backtracking'
        ? 'Plain backtracking doğru çalışsa da domain pruning yapmadığı için çatışmaları geç keşfeder.'
        : 'Heuristic yardımı aramayı küçültür; ancak yanlış yorumlandığında “daima çözüm var” hissi verebilir. Yetersiz renk sayısında en iyi pruning bile çözüm üretemez.',
    tryNext:
      params.graphPreset === 'dense-six-node'
        ? 'Aynı grafı önce plain backtracking, sonra AC-3 assisted ile çalıştır. Backtrack ve pruned value farkını karşılaştır.'
        : 'Renk sayısını bir azaltıp solver modları arasında geçiş yap. Hangi noktada conflict yerine prune görmeye başladığını izle.',
  }
}

function buildMetrics(result: ConstraintSatisfactionResult): SimulationMetric[] {
  return [
    {
      label: 'Durum',
      value: result.solved ? 'Solved' : 'No Solution',
      tone: result.solved ? 'secondary' : 'warning',
    },
    {
      label: 'Backtracks',
      value: String(result.backtrackCount),
      tone: 'primary',
    },
    {
      label: 'Pruned Values',
      value: String(result.prunedValueCount),
      tone: 'tertiary',
    },
    {
      label: 'Checks',
      value: String(result.consistencyChecks),
      tone: 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Naive vs Heuristic',
      change: 'Dense Six Node presetinde plain backtracking ile MRV + forward checking sonuçlarını karşılaştır.',
      expectation: 'Heuristic solver daha az backtrack ile daha erken pruning yapar.',
    },
    {
      title: 'Renk Darboğazı',
      change: 'Triangle grafında color count değerini 2 yap.',
      expectation: 'Solver hangi strateji seçilirse seçilsin conflict ve failure hattı görünür olur.',
    },
    {
      title: 'AC-3 Etkisi',
      change: 'Australia Map senaryosunda AC-3 assisted modunu aç.',
      expectation: 'Bazı domain değerleri daha atama yapılmadan elenir ve arama ağacı daralır.',
    },
  ]
}

function buildTimeline(snapshots: DomainSnapshot[]): SimulationTimeline {
  return {
    frames: snapshots.map((snapshot) => ({
      label: `${snapshot.step}. ${snapshot.type}`,
    })),
  }
}

export function deriveConstraintSatisfactionResult(
  params: ConstraintSatisfactionParams,
): ConstraintSatisfactionResult {
  const preset = graphPresets[params.graphPreset]
  const palette = basePalette.slice(0, params.colorCount)
  const solved = solveColoring(params, preset, palette)

  const assignmentsByStep = solved.state.snapshots.map((snapshot) => snapshot.assignments)
  const result: ConstraintSatisfactionResult = {
    variables: preset.variables,
    domainsByStep: solved.state.snapshots,
    assignmentsByStep,
    constraintEdges: preset.edges,
    conflicts: solved.state.conflicts,
    backtrackCount: solved.state.backtrackCount,
    solved: solved.outcome.solved,
    decisionTrace: solved.state.decisionTrace,
    prunedValueCount: solved.state.prunedValueCount,
    consistencyChecks: solved.state.consistencyChecks,
    presetLabel: preset.label,
    colorPalette: palette,
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(solved.state.snapshots),
  }

  result.learning = buildLearning(params, result)
  result.metrics = buildMetrics(result)

  return result
}
