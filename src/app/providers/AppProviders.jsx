import { BrowserRouter } from 'react-router-dom'
import { Toaster as HotToaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from '@/shared/components/ui/sonner'
import { SessionProvider } from '@/features/authentication'
import { TenantProvider } from '@/features/institutions'
import { ThemeProvider } from './ThemeProvider'

export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SessionProvider>
          <TenantProvider>{children}</TenantProvider>
          <HotToaster
            position="top-right"
            toastOptions={{
              duration: 6000,
            }}
          />
          <SonnerToaster position="top-right" richColors />
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
