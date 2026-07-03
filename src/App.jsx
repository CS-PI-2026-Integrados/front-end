import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SessionProvider } from './context/SessionProvider'
import AppRouter from './AppRouter'

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </SessionProvider>
    </BrowserRouter>
  )
}

export default App
