// HotelPro - Main React Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Bootstrap 5 & Bootstrap Icons Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// Bootstrap JavaScript bundle for modals, dropdowns, and toggles
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Application Custom Polish Styles
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
