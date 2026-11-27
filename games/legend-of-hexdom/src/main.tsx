// Placeholder until stage 3 (UI). The engine and data are built and tested first; this page only
// says which build is deployed. It is not on the shelf.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

declare const __BUILD__: string | undefined;
const BUILD = typeof __BUILD__ === 'string' ? __BUILD__ : 'dev';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, background: '#f8f6f0', color: '#1f2421', minHeight: '100dvh' }}>
      <h1 style={{ margin: 0 }}>Legend of Hexdom</h1>
      <div style={{ fontSize: 9, opacity: 0.28 }}>{BUILD}</div>
      <p>In development: the engine and data are being built. Nothing to play yet.</p>
    </main>
  </StrictMode>,
);
