import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("LI_HUB: Neural IDE Mounting Process Initiated...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("CRITICAL: Root element not found in DOM.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("LI_HUB: React Tree Rendered Successfully.");
} catch (err) {
  console.error("LI_HUB: Failed to initialize React application:", err);
}
