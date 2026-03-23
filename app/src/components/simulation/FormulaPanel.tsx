import { motion } from 'framer-motion'
import { FunctionSquare } from 'lucide-react'

interface FormulaPanelProps {
  formula: string
  label?: string
}

export function FormulaPanel({ formula, label }: FormulaPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
    >
      <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
        <FunctionSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
        Güncelleme Kuralı
      </h4>
      <div className="flex flex-col items-center justify-center py-4">
        <code className="font-mono text-xl text-primary">{formula}</code>
        {label && (
          <p className="text-center text-[10px] text-outline mt-4 uppercase tracking-widest">{label}</p>
        )}
      </div>
    </motion.div>
  )
}
