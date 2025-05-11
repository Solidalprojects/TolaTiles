// Fixed Register.tsx with direct API call
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios for direct API calls
import { API_ENDPOINTS } from '../../api/api';
import { Eye, EyeOff, Loader, Lock, User, AlertCircle, Mail, UserPlus, Check, X } from 'lucide-react';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear form error when user types
    if (formError) {
      setFormError(null);
    }
    
    // Check password strength if password field is being updated
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    
    // Check if passwords match when either password field changes
    if (name === 'password_confirm' || (name === 'password' && formData.password_confirm)) {
      validatePasswordMatch(name === 'password' ? value : formData.password, name === 'password_confirm' ? value : formData.password_confirm);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const errors: string[] = [];
    let strength = 0;
    
    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Contains lowercase
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Contains number or special character
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      errors.push('Password must contain at least one number or special character');
    }
    
    setPasswordStrength(strength);
    setPasswordErrors(errors);
  };

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (password && confirmPassword && password !== confirmPassword) {
      setFormError('Passwords do not match');
    } else if (formError === 'Passwords do not match') {
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate form
  if (formData.password !== formData.password_confirm) {
    setFormError('Passwords do not match');
    return;
  }
  
  if (passwordStrength < 75) {
    setFormError('Password is not strong enough');
    return;
  }
  
  try {
    setIsLoading(true);
    setFormError(null);
    
    // Use fetch API for direct control
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name || '',
        last_name: formData.last_name || ''
      })
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      // Handle API error responses
      throw { response: { data, status: response.status } };
    }
    
    console.log('Registration successful:', data);
    
    // Redirect to login with success message
    navigate('/auth/login', { 
      state: { 
        message: 'Registration successful! Please log in.',
        username: formData.username 
      } 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Extract error from response if available
    const responseData = error.response?.data;
    
    if (responseData) {
      // Process specific field errors
      if (responseData.username) {
        setFormError(`Username error: ${responseData.username}`);
      } else if (responseData.email) {
        setFormError(`Email error: ${responseData.email}`);
      } else if (responseData.password) {
        setFormError(`Password error: ${responseData.password}`);
      } else if (responseData.detail) {
        setFormError(responseData.detail);
      } else if (responseData.error) {
        setFormError(responseData.error);
      } else {
        setFormError('Registration failed. Please check your information and try again.');
      }
    } else if (error.message) {
      setFormError(error.message);
    } else {
      setFormError('An error occurred during registration. Please try again later.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
          <p className="text-gray-600 mt-1">Join us and start exploring</p>
        </div>
        
        {formError && (
          <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <AlertCircle size={18} className="mr-2" />
            <span>{formError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">Username *</label>
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
                placeholder="Choose a username"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your email address"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Name fields in a grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="First name"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Last name"
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password *</label>
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
                placeholder="Create a strong password"
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
            
            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength < 50 ? 'bg-red-500' : 
                      passwordStrength < 75 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                
                {/* Password requirements feedback */}
                <div className="mt-2 space-y-1">
                  {passwordErrors.map((error, index) => (
                    <div key={index} className="flex items-center text-xs text-red-600">
                      <X size={14} className="mr-1" />
                      <span>{error}</span>
                    </div>
                  ))}
                  
                  {passwordStrength === 100 && (
                    <div className="flex items-center text-xs text-green-600">
                      <Check size={14} className="mr-1" />
                      <span>Password meets all requirements</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Confirm Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password_confirm">Confirm Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                I agree to the <a href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
              </label>
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} className="mr-2" />
                Create Account
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;