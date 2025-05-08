/**
 * Application Entry Point
 * 
 * This is the main entry file for the React application.
 * It renders the App component into the DOM and sets up React StrictMode.
 * 
 * @module main
 * @author Solace-Poke Team
 * @version 1.0.0
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Get the root DOM element where the React app will be mounted
// The non-null assertion (!) is used because we're certain the element exists
const rootElement = document.getElementById('root')!

// Create a React root and render the App component inside StrictMode
// StrictMode enables additional development-only checks for potential problems
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
