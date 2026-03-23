import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import type { LearningContent } from '../../types/simulation'

interface ExplanationPanelProps {
  learning: LearningContent
}

const learningCards: Array<{
  key: keyof LearningContent
  label: string
  toneClass: string
}> = [
  { key: 'summary', label: 'Özet', toneClass: 'border-primary/30 bg-primary/5 text-primary' },
  {
    key: 'interpretation',
    label: 'Yorum',
    toneClass: 'border-secondary/30 bg-secondary/5 text-secondary',
  },
  { key: 'warnings', label: 'Uyarılar', toneClass: 'border-tertiary/30 bg-tertiary/5 text-tertiary' },
  { key: 'tryNext', label: 'Sırada Ne Var', toneClass: 'border-outline/30 bg-surface-container-low text-on-surface' },
]

export function ExplanationPanel({ learning }: ExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
    >
      <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
        <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
        Çalışma Notları
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {learningCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-lg border p-4 min-h-28 ${card.toneClass}`}
          >
            <p className="text-[10px] uppercase tracking-widest font-mono mb-2 opacity-70">
              {card.label}
            </p>
            <p className="text-xs leading-relaxed">
              {learning[card.key]}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
