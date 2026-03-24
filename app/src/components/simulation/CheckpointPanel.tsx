import { useState } from 'react'
import { CheckCircle2, CircleHelp, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CheckpointQuestion } from '../../types/simulation'

interface CheckpointPanelProps {
  questions: CheckpointQuestion[]
}

export function CheckpointPanel({ questions }: CheckpointPanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="surface-card p-5 rounded-[16px] border border-white/[0.05] space-y-4"
    >
      <div className="flex items-center gap-2">
        <CircleHelp className="w-4 h-4 text-secondary" strokeWidth={1.5} />
        <h4 className="eyebrow">Checkpoint Soruları</h4>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const selected = selectedAnswers[index]
          const isAnswered = Number.isInteger(selected)
          const isCorrect = selected === question.correctAnswerIndex

          return (
            <article
              key={question.prompt}
              className="surface-panel rounded-[14px] border border-white/[0.04] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-outline">Soru {index + 1}</p>
                  <p className="text-sm text-on-surface mt-2 leading-relaxed">{question.prompt}</p>
                </div>
                {isAnswered ? (
                  isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" strokeWidth={1.75} />
                  ) : (
                    <XCircle className="w-4 h-4 text-tertiary shrink-0" strokeWidth={1.75} />
                  )
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {question.options.map((option, optionIndex) => {
                  const isPicked = selected === optionIndex
                  const isRightOption = optionIndex === question.correctAnswerIndex
                  const showCorrect = isAnswered && isRightOption
                  const showWrong = isAnswered && isPicked && !isRightOption

                  return (
                    <button
                      key={option}
                      onClick={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [index]: optionIndex,
                        }))
                      }
                      className={`rounded-[14px] px-3 py-3 text-left text-sm transition-colors border ${
                        showCorrect
                          ? 'border-secondary/35 bg-secondary/10 text-secondary'
                          : showWrong
                            ? 'border-tertiary/35 bg-tertiary/10 text-tertiary'
                            : isPicked
                              ? 'border-primary/28 bg-primary/10 text-on-surface'
                              : 'border-white/[0.04] bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {isAnswered ? (
                <p
                  className={`rounded-[14px] px-3 py-3 text-sm leading-relaxed ${
                    isCorrect
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {question.explanation}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </motion.section>
  )
}
