import { motion } from 'framer-motion'
import { AlertTriangle, FunctionSquare, Sigma } from 'lucide-react'
import type { TheoryContent } from '../../types/simulation'

interface FormulaPanelProps {
  formula?: string
  label?: string
  theory?: TheoryContent
}

export function FormulaPanel({ formula, label, theory }: FormulaPanelProps) {
  if (theory) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2 flex items-center gap-2">
              <FunctionSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              Teori ve Formüller
            </h4>
            <p className="text-[10px] text-outline uppercase tracking-widest">
              {theory.formulaLabel ?? label ?? 'Ana denklem'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-widest text-outline">Odak</p>
            <p className="text-xs text-secondary">Adım adım matematik akışı</p>
          </div>
        </div>

        <div className="rounded-2xl bg-primary/6 border border-primary/15 px-5 py-6 mb-5">
          <code className="font-mono text-lg md:text-xl text-primary block text-center">
            {theory.primaryFormula}
          </code>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="space-y-4">
            <section className="rounded-xl bg-surface-container-low p-4">
              <div className="flex items-center gap-2 mb-3 text-outline">
                <Sigma className="w-3.5 h-3.5" strokeWidth={1.5} />
                <h5 className="text-[10px] uppercase tracking-widest font-bold">Türetim Akışı</h5>
              </div>
              <ol className="space-y-2">
                {theory.derivationSteps.map((step, index) => (
                  <li key={`${index}-${step}`} className="flex gap-3 text-xs leading-relaxed text-on-surface">
                    <span className="font-mono text-secondary min-w-6">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-xl bg-secondary/6 border border-secondary/12 p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-2">
                Yorum
              </p>
              <p className="text-xs leading-relaxed text-on-surface">
                {theory.interpretation}
              </p>
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl bg-surface-container-low p-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-outline mb-3">
                Sembol Sözlüğü
              </p>
              <div className="space-y-3">
                {theory.symbols.map((item) => (
                  <div key={`${item.symbol}-${item.meaning}`} className="flex gap-3 items-start">
                    <code className="font-mono text-xs text-primary min-w-16">{item.symbol}</code>
                    <p className="text-xs leading-relaxed text-on-surface-variant">{item.meaning}</p>
                  </div>
                ))}
              </div>
            </section>

            {theory.pitfalls?.length ? (
              <section className="rounded-xl bg-tertiary/6 border border-tertiary/12 p-4">
                <div className="flex items-center gap-2 mb-3 text-tertiary">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <p className="text-[10px] uppercase tracking-widest font-bold">Sık Hatalar</p>
                </div>
                <ul className="space-y-2">
                  {theory.pitfalls.map((pitfall) => (
                    <li key={pitfall} className="text-xs leading-relaxed text-on-surface">
                      {pitfall}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!formula) {
    return null
  }

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
