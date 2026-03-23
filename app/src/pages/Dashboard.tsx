import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getAllModules } from '../engine/registry'
import { SimulationCard } from '../components/simulation/SimulationCard'

export function Dashboard() {
  const modules = getAllModules()
  const navigate = useNavigate()

  return (
    <div className="p-8 max-w-[1480px] mx-auto space-y-8">
      <div className="space-y-4 pt-4">
        <p className="eyebrow">Öğrenme Laboratuvarı</p>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
          Simülasyon Merkezi
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl">
          Aynı koyu laboratuvar estetiğini koruyan, daha ferah ve okunaklı bir katalog. Her modül tek bir kavrama odaklanır, detaylar içeride açılır.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant border border-white/[0.05]">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {modules.length} interaktif simülasyon modülü
        </div>
      </div>

      {modules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative overflow-hidden rounded-[32px] surface-card data-perimeter p-10 md:p-12 cursor-pointer border border-white/[0.06]"
          onClick={() => navigate(`/sim/${modules[0].id}`)}
        >
          <div className="absolute top-0 right-0 p-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Öne Çıkan
            </span>
          </div>
          <div className="relative z-10 max-w-lg">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors">
              {modules[0].title}: {modules[0].subtitle}
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed mb-8">
              {modules[0].description}
            </p>
            <button className="px-6 py-3 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_#d0bcff33] transition-all">
              Simülasyonu Başlat →
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-30 pointer-events-none overflow-hidden">
            <svg className="w-full h-full text-secondary opacity-40" viewBox="0 0 400 300">
              <path d="M 50 250 Q 150 50 250 200 T 400 100" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="250" cy="200" fill="currentColor" r="4" />
            </svg>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.slice(1).map((mod, i) => (
          <SimulationCard key={mod.id} module={mod} index={i} />
        ))}
      </div>
    </div>
  )
}
