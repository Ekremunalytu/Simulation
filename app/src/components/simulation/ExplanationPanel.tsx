import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

interface ExplanationPanelProps {
  text: string
}

export function ExplanationPanel({ text }: ExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
    >
      <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
        <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
        Real-Time Feedback
      </h4>
      <div className="p-3 bg-secondary/5 rounded-lg border-l-2 border-secondary">
        <p className="text-xs text-secondary/90 font-medium leading-relaxed">{text}</p>
      </div>
    </motion.div>
  )
}
