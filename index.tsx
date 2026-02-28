import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { updateUserRoleByEmail } from './utils'; // Import the utility function

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Expose utility functions globally for easier debugging in the console
declare global {
  interface Window {
    updateUserRoleByEmail: typeof updateUserRoleByEmail;
    // Add other utility functions you might need to debug globally here
  }
}
window.updateUserRoleByEmail = updateUserRoleByEmail;
