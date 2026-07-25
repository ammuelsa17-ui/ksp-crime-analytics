import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

let rootMounted = false;

function mountRoot() {
  if (rootMounted) return;
  const container = document.getElementById('root');
  if (!container) return;

  rootMounted = true;
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

// 1. Try mounting immediately
mountRoot();

// 2. Guaranteed fallback polling for Safari & async module execution
if (!rootMounted) {
  document.addEventListener('DOMContentLoaded', mountRoot);
  window.addEventListener('load', mountRoot);
  const timer = setInterval(() => {
    mountRoot();
    if (rootMounted) clearInterval(timer);
  }, 50);
}
