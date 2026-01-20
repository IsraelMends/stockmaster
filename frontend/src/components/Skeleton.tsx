import { motion } from 'framer-motion'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-200/50 dark:via-slate-700/50 to-transparent"></div>
      <div className="h-full w-full bg-slate-200 dark:bg-slate-700"></div>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3 border border-slate-200 dark:border-slate-700"
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-20" />
    </motion.div>
  )
}
