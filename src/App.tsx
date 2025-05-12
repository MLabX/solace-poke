/**
 * Solace Message Sender Application
 * 
 * A React application that provides a user interface for sending messages to Solace brokers.
 * Allows users to configure connection parameters, message content, and destination types.
 * 
 * @module App
 * @author Solace-Poke Team
 * @version 1.0.0
 */

import './App.css'
import ServerStatus from './components/ServerStatus'
import SolaceForm from './components/SolaceForm'

/**
 * Main application component
 * Provides a form for configuring and sending messages to Solace brokers
 * 
 * @returns {JSX.Element} The rendered application
 */
function App() {
  return (
    <div className="app-container">
      <h1>Solace Message Sender</h1>
      <ServerStatus />
      <SolaceForm />
    </div>
  )
}

export default App
