import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            },
            success: {
              style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
              iconTheme: { primary: '#16a34a', secondary: '#white' }
            },
            error: {
              style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
              iconTheme: { primary: '#dc2626', secondary: 'white' }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
