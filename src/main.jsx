// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <SidebarProvider>
          <AuthProvider>          
            <AppRoutes />          
          </AuthProvider>
        </SidebarProvider>    
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);