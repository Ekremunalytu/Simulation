import { Target } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ChallengeScenario } from '../../types/simulation'

interface ChallengePanelProps {
  challenges: ChallengeScenario[]
}

export function ChallengePanel({ challenges }: ChallengePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="surface-card space-y-4 rounded-[20px] p-5"
    >
      <div className="flex items-center gap-2">
        <Target aria-hidden="true" className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h4 className="eyebrow">Challenge Mode</h4>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {challenges.map((challenge) => (
          <article
            key={challenge.title}
            className="surface-panel space-y-3 rounded-[16px] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="text-base font-semibold text-on-surface">{challenge.title}</h5>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  {challenge.prompt}
                </p>
              </div>
              {challenge.suggestedPresetName ? (
                <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary whitespace-nowrap shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]">
                  {challenge.suggestedPresetName}
                </span>
              ) : null}
            </div>
            <div className="rounded-[14px] bg-surface-container-low px-3 py-3 shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
              <p className="text-xs font-mono text-outline">Başarı Kriteri</p>
              <p className="text-sm text-on-surface mt-2 leading-relaxed">
                {challenge.successCriteria}
              </p>
            </div>
          </article>
        ))}
      </div>
    </motion.section>
  )
}
