import React from 'react';
import ReactDOM from 'react-dom/client'; // Use react-dom/client for React 18+
import App from './App'; // Import your main App component

// Get the root element from public/index.html where the React app will be mounted
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render your App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
