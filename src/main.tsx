import ReactDOM from 'react-dom/client'
import { App } from './app'
import './index.css'
import { RootStoreProvider } from 'store/store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <RootStoreProvider>
      <App />
    </RootStoreProvider>
)
