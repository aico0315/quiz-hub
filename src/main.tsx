import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import './index.css'
import App from './App.tsx'

// ?block_analytics=1 でアクセスするとこのデバイスの計測をオフにする
const params = new URLSearchParams(window.location.search)
if (params.get('block_analytics') === '1') {
  localStorage.setItem('block_analytics', 'true')
}
if (!localStorage.getItem('block_analytics')) {
  inject()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
