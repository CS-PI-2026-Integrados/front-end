import { BrowserRouter } from 'react-router-dom'
import { ComarcaProvider } from './context/ComarcaContext'
import AppRouter from './AppRouter'
// import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ComarcaProvider>
        <AppRouter />
      </ComarcaProvider>
    </BrowserRouter>
  )
}

export default App
