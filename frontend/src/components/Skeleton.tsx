import { motion } from 'framer-motion'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="h-full w-full bg-white/10 backdrop-blur-sm"></div>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-xl p-4 mb-3 border border-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-3" />
          <Skeleton className="h-4 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="ml-4">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </motion.div>
  )
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-2xl p-6 border border-white/20"
    >
      <div className="flex items-center">
        <Skeleton className="h-12 w-12 rounded-xl mr-4" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </motion.div>
  )
}
