import React from 'react'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
      <div className="bg-white rounded-brand-lg shadow-card p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-deep-ocean mb-4">
          🐟 AquaLearn
        </h1>
        <p className="text-dark-navy mb-6">
          Learn aquaculture. Grow your future.
        </p>
        <button className="w-full bg-deep-ocean text-white py-3 px-4 rounded-brand font-medium hover:bg-deep-ocean/90 transition">
          Start Learning
        </button>
      </div>
    </div>
  )
}

export default App