import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1206',
              color: '#f5e6c8',
              border: '1px solid #c8832a',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#c8832a', secondary: '#1a1206' } },
            error: { iconTheme: { primary: '#e05a3a', secondary: '#1a1206' } },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
