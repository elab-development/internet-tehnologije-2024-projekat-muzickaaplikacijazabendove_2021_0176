import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import LoadingOverlay from './components/LoadingOverlay.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <App />
          <LoadingOverlay />
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
  </StrictMode>
);
