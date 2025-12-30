import React from 'react'
import ReactDOM from 'react-dom/client'
// The './' is essential—it tells Vite to look in the SAME folder (src)
import App from './App.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
