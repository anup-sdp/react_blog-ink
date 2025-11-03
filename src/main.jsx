// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import { DataCacheProvider } from './context/DataCacheContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <SidebarProvider>
          <AuthProvider>
            <DataCacheProvider>
              <AppRoutes />
            </DataCacheProvider>
          </AuthProvider>
        </SidebarProvider>    
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);

/*
  notes:
    to show messages we can use react-toastify
*/