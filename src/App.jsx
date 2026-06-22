import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from './context/SessionProvider'
import AppRouter from './AppRouter'

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRouter />
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
