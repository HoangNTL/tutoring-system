import { BrowserRouter } from 'react-router-dom'

import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap'
import AppRouter from '@/routes/AppRouter'

export default function App() {
  useAuthBootstrap()

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
