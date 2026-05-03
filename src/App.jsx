import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import AppRouter from './AppRouter';
// import './App.css';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRouter />
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
