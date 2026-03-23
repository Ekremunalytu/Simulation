import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock3, Zap, BookOpen, GraduationCap } from 'lucide-react'
import { getAllModules } from '../engine/registry'
import type { Category, RegisteredSimulationModule } from '../types/simulation'

type FilterMode = 'all' | 'ml' | 'math'

interface NodePosition {
  x: number
  y: number
  column: number
  row: number
}

interface Edge {
  from: string
  to: string
}

const COLUMN_WIDTH = 280
const ROW_HEIGHT = 96
const NODE_WIDTH = 240
const NODE_HEIGHT = 72
const LEFT_PAD = 60
const TOP_PAD = 40

const difficultyLabel: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
}

function computeLayout(modules: RegisteredSimulationModule[]) {
  const idSet = new Set(modules.map((m) => m.id))
  const depths = new Map<string, number>()

  function getDepth(id: string, visited: Set<string>): number {
    if (depths.has(id)) return depths.get(id)!
    if (visited.has(id)) return 0
    visited.add(id)

    const mod = modules.find((m) => m.id === id)
    if (!mod) return 0

    const prereqs = mod.prerequisiteModuleIds.filter((pid) => idSet.has(pid))
    if (prereqs.length === 0) {
      depths.set(id, 0)
      return 0
    }

    const maxPrereqDepth = Math.max(...prereqs.map((pid) => getDepth(pid, visited)))
    const depth = maxPrereqDepth + 1
    depths.set(id, depth)
    return depth
  }

  modules.forEach((mod) => getDepth(mod.id, new Set()))

  const columnGroups = new Map<number, RegisteredSimulationModule[]>()
  modules.forEach((mod) => {
    const col = depths.get(mod.id) ?? 0
    if (!columnGroups.has(col)) columnGroups.set(col, [])
    columnGroups.get(col)!.push(mod)
  })

  const positions = new Map<string, NodePosition>()
  columnGroups.forEach((group, col) => {
    group.forEach((mod, row) => {
      positions.set(mod.id, {
        x: LEFT_PAD + col * COLUMN_WIDTH,
        y: TOP_PAD + row * ROW_HEIGHT,
        column: col,
        row,
      })
    })
  })

  const edges: Edge[] = []
  modules.forEach((mod) => {
    mod.nextModuleIds.forEach((nextId) => {
      if (idSet.has(nextId)) {
        edges.push({ from: mod.id, to: nextId })
      }
    })
  })

  const maxCol = Math.max(...Array.from(columnGroups.keys()), 0)
  const maxRowPerCol = Array.from(columnGroups.values()).map((g) => g.length)
  const maxRow = Math.max(...maxRowPerCol, 1)

  return {
    positions,
    edges,
    width: LEFT_PAD * 2 + maxCol * COLUMN_WIDTH + NODE_WIDTH,
    height: TOP_PAD * 2 + (maxRow - 1) * ROW_HEIGHT + NODE_HEIGHT,
  }
}

function EdgePath({ from, to }: { from: NodePosition; to: NodePosition }) {
  const x1 = from.x + NODE_WIDTH
  const y1 = from.y + NODE_HEIGHT / 2
  const x2 = to.x
  const y2 = to.y + NODE_HEIGHT / 2

  const midX = (x1 + x2) / 2

  const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`

  return (
    <path
      d={d}
      fill="none"
      stroke="url(#edgeGrad)"
      strokeWidth={1.5}
      strokeOpacity={0.25}
      markerEnd="url(#arrowhead)"
    />
  )
}

function ModuleNode({
  mod,
  pos,
  index,
  onClick,
}: {
  mod: RegisteredSimulationModule
  pos: NodePosition
  index: number
  onClick: () => void
}) {
  const isMl = mod.category === 'ml'
  const accentBorder = isMl ? 'rgba(208, 188, 255, 0.15)' : 'rgba(76, 215, 246, 0.15)'
  const accentDot = isMl ? '#d0bcff' : '#4cd7f6'

  return (
    <motion.g
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.35 }}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <rect
        x={pos.x}
        y={pos.y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={14}
        fill="#101012"
        stroke={accentBorder}
        strokeWidth={1}
      />

      <circle cx={pos.x + 18} cy={pos.y + NODE_HEIGHT / 2} r={4} fill={accentDot} opacity={0.7} />

      <text
        x={pos.x + 30}
        y={pos.y + 24}
        fill="#e7e3e0"
        fontSize={13}
        fontFamily="'Space Grotesk', sans-serif"
        fontWeight={600}
      >
        {mod.icon} {mod.title.length > 22 ? mod.title.slice(0, 20) + '…' : mod.title}
      </text>

      <text
        x={pos.x + 30}
        y={pos.y + 44}
        fill="#7d7688"
        fontSize={10}
        fontFamily="'JetBrains Mono', monospace"
      >
        {mod.estimatedMinutes} dk
      </text>

      <text
        x={pos.x + 85}
        y={pos.y + 44}
        fill={
          mod.difficulty === 'beginner'
            ? '#6ee7b7'
            : mod.difficulty === 'intermediate'
              ? '#fbbf24'
              : '#fb7185'
        }
        fontSize={10}
        fontFamily="'JetBrains Mono', monospace"
      >
        {difficultyLabel[mod.difficulty]}
      </text>

      {mod.recommendedStarter && (
        <circle cx={pos.x + NODE_WIDTH - 16} cy={pos.y + 16} r={4} fill="#4cd7f6" opacity={0.8} />
      )}
    </motion.g>
  )
}

export function LearningPathPage() {
  const [filter, setFilter] = useState<FilterMode>('all')
  const navigate = useNavigate()

  const allModules = useMemo(() => getAllModules(), [])

  const filteredModules = useMemo(() => {
    if (filter === 'all') return allModules
    const cat: Category = filter
    return allModules.filter((m) => m.category === cat)
  }, [allModules, filter])

  const { positions, edges, width, height } = useMemo(
    () => computeLayout(filteredModules),
    [filteredModules],
  )

  const mlCount = allModules.filter((m) => m.category === 'ml').length
  const mathCount = allModules.filter((m) => m.category === 'math').length

  const filters: { key: FilterMode; label: string; count: number }[] = [
    { key: 'all', label: 'Tüm Dersler', count: allModules.length },
    { key: 'ml', label: 'Yapay Zeka', count: mlCount },
    { key: 'math', label: 'Calculus 2', count: mathCount },
  ]

  return (
    <div className="p-6 md:p-8 max-w-[1580px] mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow">Kavram Haritası</p>
            <h1 className="font-headline text-2xl md:text-3xl font-semibold tracking-tight">
              Öğrenme Haritası
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Her düğüm bir simülasyon modülünü, her ok bir önkoşul ilişkisini gösterir.
              Soldan sağa ilerleyerek konuları derinleştirebilirsin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/70" />
                Yapay Zeka
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary/70" />
                Calculus 2
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary opacity-80" />
                Başlangıç noktası
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-surface-container-low p-1 border border-white/[0.04] w-fit">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors inline-flex items-center gap-2 ${
                filter === f.key
                  ? 'bg-surface-container-high text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f.label}
              <span className="font-mono text-xs opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="surface-card rounded-[18px] border border-white/[0.05] overflow-hidden"
      >
        <div className="px-5 md:px-6 pt-5 pb-4 border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="eyebrow">Bağımlılık Grafi</p>
            <span className="font-mono text-xs text-on-surface-variant">
              {filteredModules.length} modül
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              Başlangıç
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
              Orta
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
              İleri
            </span>
          </div>
        </div>

        <div className="overflow-auto no-scrollbar p-4">
          <svg
            width={Math.max(width, 800)}
            height={Math.max(height, 400)}
            viewBox={`0 0 ${Math.max(width, 800)} ${Math.max(height, 400)}`}
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d0bcff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#4cd7f6" stopOpacity={0.5} />
              </linearGradient>
              <marker
                id="arrowhead"
                markerWidth={8}
                markerHeight={6}
                refX={7}
                refY={3}
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#7d7688" fillOpacity={0.4} />
              </marker>
            </defs>

            <g>
              {edges.map((edge) => {
                const fromPos = positions.get(edge.from)
                const toPos = positions.get(edge.to)
                if (!fromPos || !toPos) return null
                return (
                  <EdgePath
                    key={`${edge.from}-${edge.to}`}
                    from={fromPos}
                    to={toPos}
                  />
                )
              })}
            </g>

            <g>
              {filteredModules.map((mod, index) => {
                const pos = positions.get(mod.id)
                if (!pos) return null
                return (
                  <ModuleNode
                    key={mod.id}
                    mod={mod}
                    pos={pos}
                    index={index}
                    onClick={() => navigate(`/sim/${mod.id}`)}
                  />
                )
              })}
            </g>
          </svg>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="surface-panel rounded-[16px] border border-white/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-on-surface">Toplam Süre</h3>
          </div>
          <p className="font-mono text-2xl text-on-surface">
            {filteredModules.reduce((sum, m) => sum + m.estimatedMinutes, 0)} dk
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            {filteredModules.length} modül toplamı
          </p>
        </div>

        <div className="surface-panel rounded-[16px] border border-white/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-secondary" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-on-surface">Başlangıç Noktaları</h3>
          </div>
          <p className="font-mono text-2xl text-on-surface">
            {filteredModules.filter((m) => m.prerequisiteModuleIds.length === 0 || m.recommendedStarter).length}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Önkoşulsuz modüller
          </p>
        </div>

        <div className="surface-panel rounded-[16px] border border-white/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-tertiary" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-on-surface">İleri Seviye</h3>
          </div>
          <p className="font-mono text-2xl text-on-surface">
            {filteredModules.filter((m) => m.difficulty === 'advanced').length}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Derinleşme modülleri
          </p>
        </div>
      </motion.div>
    </div>
  )
}
