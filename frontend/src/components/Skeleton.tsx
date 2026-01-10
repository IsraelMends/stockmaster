export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-64 mb-1" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="ml-4">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
      <div className="flex items-center">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="ml-5 w-0 flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}
