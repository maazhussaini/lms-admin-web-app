import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center items-center space-x-6 mb-8">
          <a href="https://vite.dev" target="_blank" className="transition-transform hover:scale-110">
            <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" className="transition-transform hover:scale-110">
            <img src={reactLogo} className="h-16 w-16 animate-spin" alt="React logo" />
          </a>
        </div>
        
        <h1 className="text-3xl font-heading font-bold text-neutral-800 mb-8">LMS Student Portal</h1>
        
        <div className="bg-neutral-50 rounded-xl p-6 mb-6">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-neutral-600">
            Edit <code className="bg-neutral-200 px-2 py-1 rounded text-sm font-mono">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        
        <p className="text-neutral-500 text-sm">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App
