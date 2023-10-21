import ReactDOM from 'react-dom/client'
import { App } from './app'
import { qaseJsonp } from 'utils/jsonp/qase-jsonp';
import './index.css'

declare global {
      interface Window { qaseJsonp: (d:any) => void; }
}
  

window.qaseJsonp = qaseJsonp;


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <App />
);