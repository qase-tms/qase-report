import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { RootStoreProvider } from './store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RootStoreProvider>
      <App />
    </RootStoreProvider>
  </React.StrictMode>
)
