import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, } from 'react-router';
import './index.css'
import AppRoutes from './AppRoutes.jsx'
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</AuthProvider>		
	</StrictMode>,
)
