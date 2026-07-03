import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SessionProvider } from './context/SessionProvider'
import { TenantProvider } from './context/TenantContext'
import AppRouter from './AppRouter'

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <TenantProvider>
          <AppRouter />
        </TenantProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 6000,
            success: {
              iconTheme: {
                primary: '#047857',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </SessionProvider>
    </BrowserRouter>
  )
}

export default App
