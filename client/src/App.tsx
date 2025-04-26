import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/home'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
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
        <Route
          path="/auth/login"
          element={
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50">
                <Login />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/auth/dashboard"
          element={
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50">
                <Dashboard />
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