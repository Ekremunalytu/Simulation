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
      className="surface-card space-y-4 rounded-[20px] p-5"
    >
      <div className="flex items-center gap-2">
        <CircleHelp aria-hidden="true" className="w-4 h-4 text-secondary" strokeWidth={1.5} />
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
              className="surface-panel space-y-3 rounded-[16px] p-4"
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
                      type="button"
                      aria-pressed={isPicked}
                      onClick={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [index]: optionIndex,
                        }))
                      }
                      className={`focus-ring rounded-[14px] px-3 py-3 text-left text-sm transition-[background-color,color,box-shadow] duration-200 ${
                        showCorrect
                          ? 'bg-secondary/10 text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.22)]'
                          : showWrong
                            ? 'bg-tertiary/10 text-tertiary shadow-[inset_0_0_0_1px_rgba(255,184,105,0.22)]'
                            : isPicked
                              ? 'bg-primary/10 text-on-surface shadow-[inset_0_0_0_1px_rgba(208,188,255,0.22)]'
                              : 'bg-surface-container-low text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface'
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
