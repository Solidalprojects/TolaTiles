import Navbar from './components/Navbar'
import Home from './pages/home'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

function App() {
  
  return (
    <Router>
      <Routes>
      <Route
            path="/"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />
      </Routes>
    </Router>

  )
}

export default App
