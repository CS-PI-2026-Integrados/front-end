import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from './SessionProvider'
import { TenantProvider } from './TenantProvider'
import { ThemeProvider } from './ThemeProvider'

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SessionProvider>
          <TenantProvider>{children}</TenantProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 6000,
            }}
          />
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
