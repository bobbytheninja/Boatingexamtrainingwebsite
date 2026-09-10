import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import '../styles/globals.css'

// When a lazy-loaded chunk is missing (e.g. after a new deployment),
// Vite fires this event. Reloading fetches the fresh index.html and
// new chunk hashes, resolving the "Importing a module script failed" error.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
