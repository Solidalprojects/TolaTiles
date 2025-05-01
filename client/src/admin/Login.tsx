import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { Eye, EyeOff, Loader, Lock, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // When login component mounts, clear any existing session flag
  useEffect(() => {
    sessionStorage.removeItem('sessionAuth');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username: formData.username });
      // Use the login function from auth service
      const data = await login(formData);
      
      console.log('Login response received:', { hasToken: !!data.token, hasUser: !!data.user });
      
      // Check if user is admin before allowing access to dashboard
      if (data.user && data.user.is_staff) {
        console.log('Login successful - redirecting to dashboard');
        sessionStorage.setItem('sessionAuth', 'true');
        navigate('/auth/dashboard');
      } else {
        setError('Access denied. Admin privileges required.');
        // Clear the session auth flag if access is denied
        sessionStorage.removeItem('sessionAuth');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.message && error.message.includes('Authentication failed')) {
        setError('Invalid username or password');
      } else if (error.response) {
        // Server responded with an error
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else if (error.response.data && error.response.data.detail) {
          setError(error.response.data.detail);
        } else if (error.response.data && error.response.data.error) {
          setError(error.response.data.error);
        } else {
          setError('Authentication failed. Please try again.');
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('Server not responding. Please check your connection.');
      } else {
        // Something else happened
        setError('Login failed: ' + (error.message || 'Please try again later.'));
      }
      
      // Clear session auth flag on any error
      sessionStorage.removeItem('sessionAuth');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-600 mt-1">Sign in to access the admin dashboard</p>
        </div>
        
        {error && (
          <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <AlertCircle size={18} className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Forgot your login details?{' '}
            <button 
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => alert('Please contact the system administrator for password reset.')}
            >
              Contact Admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;