import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { store } from '@/app/store/store'
import { queryClient } from '@/shared/api/queryClient'
import { Toaster } from '@/shared/ui/sonner'

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
        <Toaster />
      </QueryClientProvider>
    </Provider>
  )
}
