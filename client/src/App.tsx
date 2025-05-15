// client/src/App.tsx with updated Dashboard route
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, JSX } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/home';
import Dashboard from './components/Dashboard';
import Login from './pages/Auth/Login'; 
import Register from './pages/Auth/Register';
import TileDetail from './pages/TileDetail';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact'; 
import { isAuthenticated } from './services/auth';
import './App.css';
import ProductCategory from './pages/ProductCategory';
import ProductTypeProvider from './context/ProductCategoriesContext';

// Protected route component with improved auth state management
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Force re-evaluation of auth status with a state
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      console.log("ProtectedRoute auth check:", authenticated);
      setIsAuth(authenticated);
      setCheckingAuth(false);
    };
    
    checkAuth();
    
    // Set up an interval to periodically check auth status (optional)
    const authCheckInterval = setInterval(checkAuth, 5000);
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, []);
  
  if (checkingAuth) {
    // Show loading while checking auth
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuth) {
    // Redirect to login if not authenticated
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }
  
  console.log("Authenticated, rendering protected content");
  return children;
};

// Public route component with improved auth state management
const PublicOnlyRoute = ({ children }: { children: JSX.Element }) => {
  // Force re-evaluation of auth status with a state
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      console.log("PublicOnlyRoute auth check:", authenticated);
      setIsAuth(authenticated);
      setCheckingAuth(false);
    };
    
    checkAuth();
  }, []);
  
  if (checkingAuth) {
    // Show loading while checking auth
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (isAuth) {
    // Redirect to dashboard if already authenticated
    console.log("Already authenticated, redirecting to dashboard");
    return <Navigate to="/auth/dashboard" replace />;
  }
  
  console.log("Not authenticated, rendering public content");
  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Don't clear authentication data on app initialization
    // This ensures the user stays logged in when they visit the site
    // clearAllAuthData();
    
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
    <ProductTypeProvider>
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
          
          {/* Tile Detail Routes */}
          <Route
            path="/tiles/:id"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <TileDetail />
                </main>
                <Footer />
              </>
            }
          />
          
          <Route
            path="/tiles/slug/:slug"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <TileDetail />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Project Detail Routes */}
          <Route
            path="/projects/:id"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <ProjectDetail />
                </main>
                <Footer />
              </>
            }
          />
          
          <Route
            path="/projects/slug/:slug"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <ProjectDetail />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Auth login route */}
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
          
          {/* Auth register route */}
          <Route
            path="/auth/register"
            element={
              <PublicOnlyRoute>
                <>
                  <Navbar />
                  <main className="min-h-screen bg-gray-50">
                    <Register />
                  </main>
                  <Footer />
                </>
              </PublicOnlyRoute>
            }
          />
          
          {/* Protected dashboard route - Updated to use Dashboard without wrapping Navbar/Footer */}
          <Route
            path="/auth/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* About Us Page with Testimonials and Team */}
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <About />
                </main>
                <Footer />
              </>
            }
          />
          
          {/* Projects listing page */}
          <Route
            path="/projects"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <Projects />
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
                  <Contact />
                </main>
                <Footer />
              </>
            }
          />

          {/* Product category routes */}
          <Route
            path="/products/:slug"
            element={
              <>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  <ProductCategory />
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
    </ProductTypeProvider>
  );
}

export default App;