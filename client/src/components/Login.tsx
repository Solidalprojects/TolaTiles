import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login} from '../services/auth';
import { LoginCredentials } from '../types/types';


const Login = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [detailedError, setDetailedError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setDetailedError('');
    setLoading(true);

    try {
      console.log('Login attempt with:', credentials.username);
      await login(credentials);
      console.log('Login successful, navigating to dashboard');
      navigate('/auth/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login';
      let detailedErrorInfo = '';
      
      // Extract detailed error message from response if available
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        if (error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
            
            // If there's a more detailed error message, add it
            if (error.response.data.detail) {
              detailedErrorInfo = error.response.data.detail;
            }
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setDetailedError(detailedErrorInfo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Tiles Construction Admin</h2>
        
        {message && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Login Failed</p>
            <p>{message}</p>
            {detailedError && <p className="mt-2 text-sm">{detailedError}</p>}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Use your Django superuser credentials to log in</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;