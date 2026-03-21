import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import HomePlanner from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HomePlanner />
  </StrictMode>,
)
