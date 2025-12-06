import { Product } from '@/types/product'
import { Cpu, Zap, Layers, Maximize, Activity } from 'lucide-react'

export default function Highlights({ product }: { product: Product }) {
  const specs = product.specs

  if (!specs || Object.keys(specs).length === 0) {
    return <p className="text-sm text-white/80">No specifications available.</p>
  }

  // Helper to get a random icon for visual variety (deterministic based on key length)
  const getIcon = (key: string) => {
    const icons = [Cpu, Zap, Layers, Maximize, Activity]
    return icons[key.length % icons.length]
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 font-display">
        <Cpu className="text-purple-400" size={20} />
        Tech Specs
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(specs).reverse().map(([key, value]) => {
          const Icon = getIcon(key)
          return (
            <div
              key={key}
              className="group relative p-3 rounded-xl bg-gray-900/50 border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <Icon size={12} className="text-purple-400" />
                  {key}
                </div>
                <div className="text-white font-medium text-sm sm:text-base truncate" title={String(value)}>
                  {value}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

