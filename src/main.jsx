import React from 'react'
import ReactDOM from 'react-dom/client'
// The "./" tells the computer to look in the same "src" folder for App.jsx
import App from './App.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
