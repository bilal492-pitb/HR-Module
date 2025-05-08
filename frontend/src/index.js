import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeDemoDataIfNeeded } from './services/apiService';

// Set demo mode if needed
const detectDemoMode = () => {
  const hostname = window.location.hostname;
  const isDemoEnvironment = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.includes('demo') || 
    hostname.includes('staging') || 
    hostname.includes('netlify') || 
    hostname.includes('github.io');
  
  if (isDemoEnvironment) {
    localStorage.setItem('apiMode', 'demo');
    console.log('Demo mode activated: The app is running with mock data');
    
    // Initialize mock data
    initializeDemoDataIfNeeded();
    
    // Show development instructions in console
    if (process.env.NODE_ENV === 'development') {
      console.log('%c💡 Demo Mode Active 💡', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
      console.log('This app is running in demo mode with mock data stored in localStorage.');
      console.log('To use mock data without a backend API, keep the apiMode as "demo".');
      console.log('To test with a real backend API, set apiMode to "api" in localStorage.');
      console.log('\nDemo Credentials:');
      console.log('- Admin: username="admin", password="admin123"');
      console.log('- HR Manager: username="hrmanager", password="hr123"');
      console.log('- Manager: username="manager", password="manager123"');
      console.log('- Employee: username="employee", password="employee123"');
    }
    
    return true;
  }
  return false;
};

// Check for demo mode on startup
detectDemoMode();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 