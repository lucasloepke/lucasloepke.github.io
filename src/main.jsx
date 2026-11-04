import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The crawlable copy has done its job once JS runs; left in place it adds hidden
// tab stops and a second <main>/<h1> for screen readers.
document.getElementById('seo-crawl')?.remove()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
