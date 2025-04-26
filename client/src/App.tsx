import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, JSX } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/home';
import Dashboard from './components/Dashboard';
import Login from './admin/Login';
import { isAuthenticated } from './services/auth';
import './App.css';

// Protected route component to handle authentication
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" replace />;
  }
  
  return children;
};

// Public route component that redirects to dashboard if already logged in
const PublicOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const authenticated = isAuthenticated();
  
  if (authenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/auth/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time or check initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        {/* Public routes */}
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
        
        {/* Auth routes */}
        <Route
          path="/auth/login"
          element={
            <PublicOnlyRoute>
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <Login />
                </main>
                <Footer />
              </>
            </PublicOnlyRoute>
          }
        />
        
        {/* Protected routes */}
        <Route
          path="/auth/dashboard"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <Dashboard />
                </main>
                <Footer />
              </>
            </ProtectedRoute>
          }
        />
        
        {/* Category routes */}
        <Route
          path="/categories"
          element={
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Tile Categories</h1>
                  <p className="text-lg text-gray-600 mb-12">
                    Browse through our extensive collection of premium tile categories for your next project.
                  </p>
                  <div className="text-center py-16">
                    <p className="text-gray-500">Categories page content will be implemented here.</p>
                  </div>
                </div>
              </main>
              <Footer />
            </>
          }
        />
        
        {/* Projects routes */}
        <Route
          path="/projects"
          element={
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Projects</h1>
                  <p className="text-lg text-gray-600 mb-12">
                    Explore our featured tile installation projects and get inspired for your own space.
                  </p>
                  <div className="text-center py-16">
                    <p className="text-gray-500">Projects page content will be implemented here.</p>
                  </div>
                </div>
              </main>
              <Footer />
            </>
          }
        />
        
        {/* Contact page */}
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
                  <p className="text-lg text-gray-600 mb-12">
                    Get in touch with our team for any inquiries or to schedule a consultation.
                  </p>
                  <div className="text-center py-16">
                    <p className="text-gray-500">Contact form will be implemented here.</p>
                  </div>
                </div>
              </main>
              <Footer />
            </>
          }
        />
        
        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <Link 
                    to="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Return Home
                  </Link>
                </div>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;