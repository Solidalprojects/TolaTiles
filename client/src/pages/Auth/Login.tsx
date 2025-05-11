// Fixed Login.tsx with improved error handling
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios'; // Using axios for direct API calls
import { API_ENDPOINTS } from '../../api/api';
import { setStoredAuth } from '../../services/auth';
import { Eye, EyeOff, Loader, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface LocationState {
  message?: string;
  username?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Check for redirect messages
  useEffect(() => {
    // When login component mounts, clear any existing session flag
    sessionStorage.removeItem('sessionAuth');
    
    // Check for success message from registration
    const state = location.state as LocationState;
    if (state && state.message) {
      setSuccess(state.message);
      // Pre-fill username if provided from registration
      if (state.username) {
        setFormData(prev => ({ ...prev, username: state.username || '' }));
      }
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user types
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { username: formData.username });
      
      // Use axios directly instead of the login function
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, formData);
      
      if (response.data && response.data.token) {
        console.log('Login response received:', { 
          hasToken: !!response.data.token, 
          hasUser: !!response.data.user 
        });
        
        // Store token in localStorage
        setStoredAuth(response.data.token);
        
        // Store user data
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Set a session flag for additional security
        sessionStorage.setItem('sessionAuth', 'true');
        
        // Check if user is admin before allowing access to dashboard
        if (response.data.user && response.data.user.is_staff) {
          console.log('Login successful - redirecting to dashboard');
          navigate('/auth/dashboard');
        } else if (response.data.user) {
          // Redirect regular users to a different page
          console.log('Login successful - redirecting regular user');
          navigate('/');
        } else {
          setError('Invalid user data received.');
        }
      } else {
        setError('Login failed: Invalid response format');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else if (error.response.data) {
          if (error.response.data.error) {
            setError(error.response.data.error);
          } else if (error.response.data.detail) {
            setError(error.response.data.detail);
          } else if (error.response.data.non_field_errors) {
            setError(error.response.data.non_field_errors[0]);
          } else {
            setError('Authentication failed. Please try again.');
          }
        } else {
          setError(`Error ${error.response.status}: Authentication failed.`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('Server not responding. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Login failed: ${error.message || 'Please try again later.'}`);
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
          <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
          <p className="text-gray-600 mt-1">Access your account</p>
        </div>
        
        {error && (
          <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <AlertCircle size={18} className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <CheckCircle size={18} className="mr-2" />
            <span>{success}</span>
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
                name="username"
                value={formData.username}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/auth/forgot-password" className="text-blue-600 hover:text-blue-800">
                Forgot password?
              </Link>
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
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;