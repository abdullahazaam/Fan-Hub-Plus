import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CardExperience } from './components/CardExperience'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <CardExperience />
  </StrictMode>,
)
