'use client'

import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return <RQProvider client={queryClient}>{children}</RQProvider>
}
