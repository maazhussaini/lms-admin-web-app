// c:\Users\Azeem\Documents\lms-project\lms-admin-web-app\student-frontend\src\pages\LoginPage\LoginPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// Use proper component imports with path aliases
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';
import StateDisplay from '@/components/common/StateDisplay';
import { useAuth } from '@/context/AuthContext';

// Import assets using proper path structure
import logo from '@public/orbed_logo.svg';
import sideVector from '@public/signin_vector.png';
import bgImage from '@public/bg.png';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginPageProps {
  onLoginSubmit?: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSubmit,
  loading: propLoading = false,
  error: propError = null 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Get return URL from location state
  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl || '/courses';

  // Sync auth error with local error state
  useEffect(() => {
    if (authError && !isSubmitting) {
      setLoginError(authError);
    }
  }, [authError, isSubmitting]);

  const handleInputChange = useCallback((field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    
    // Mark as interacted for better UX
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear login errors when user starts correcting their input
    if ((field === 'email' || field === 'password') && loginError) {
      setLoginError(null);
      // Do not call clearError() here, let error persist until user corrects input
    }
  }, [formErrors, hasInteracted, loginError /* removed authError, clearError */]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<LoginFormData> = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isLoading || propLoading) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginError(null);
    // Do not clearError() here, let error persist until successful login

    try {
      // Use the provided onLoginSubmit prop if available, otherwise use auth context
      if (onLoginSubmit) {
        await onLoginSubmit(formData);
      } else {
        // Use auth context login function - this makes the actual API call
        await login(
          formData.email.trim(),
          formData.password
        );
      }
      // On successful login, clear errors and navigate
      clearError();
      setLoginError(null);
      navigate(returnUrl, { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      
      // Extract error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Set local error state to ensure it displays
      setLoginError(errorMessage);
      // Do not clearError() here
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onLoginSubmit, isSubmitting, isLoading, propLoading, validateForm, login, clearError, navigate, returnUrl]);

  const togglePasswordVisibility = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle keyboard events
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    setShowPassword(prev => !prev);
  }, []);

  // Get error message for display - prioritize local error state
  const getErrorMessage = (): string | null => {
    const displayError = loginError || authError || propError;
    
    if (displayError) {
      if (displayError.includes('Invalid credentials') || 
          displayError.includes('401') || 
          displayError.includes('authentication') ||
          displayError.includes('email address or password')) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      if (displayError.includes('RATE_LIMIT_EXCEEDED') || displayError.includes('Too many')) {
        return 'Too many login attempts. Please try again later.';
      }
      if (displayError.includes('Network Error') || 
          displayError.includes('fetch') || 
          displayError.includes('timeout')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      if (displayError.includes('student accounts')) {
        return 'This login is only for student accounts. Please use the appropriate portal for your account type.';
      }
      return displayError;
    }
    return null;
  };

  // Utility classes following the design system
  const containerClasses = 'flex flex-col md:flex-row min-h-screen overflow-hidden';
  const leftSectionClasses = 'hidden md:flex md:w-[50%] items-center justify-center relative bg-white p-8';
  const rightSectionClasses = 'w-full md:w-[50%] flex items-center justify-center p-6 sm:p-8 md:p-4 bg-white';
  
  const backgroundContainerClasses = clsx(
    'w-full h-full rounded-3xl flex items-center justify-center relative shadow-lg overflow-hidden',
    'bg-cover bg-center bg-no-repeat'
  );

  const isFormLoading = isSubmitting || isLoading || propLoading;
  const currentError = getErrorMessage();

  return (
    <PageTransition>
      <div className={containerClasses}>
        {/* Left section with background image container */}
        <div className={leftSectionClasses}>
          <div 
            className={backgroundContainerClasses}
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={sideVector} 
                alt="Learn Smarter, Grow Faster" 
                className="w-full h-full object-contain"
                style={{ maxHeight: '85vh', maxWidth: '85%' }} 
              />
            </div>
          </div>
        </div>

        {/* Right section with login form */}
        <div className={rightSectionClasses}>
          <div className="max-w-2xl w-full px-6 sm:px-8 md:px-4 lg:px-6">
            {/* Logo Section */}
            <motion.div 
              className="flex justify-center md:justify-start mb-8 sm:mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <img src={logo} alt="orb-Ed Logo" className="h-24" />
            </motion.div>
            
            {/* Welcome Message */}
            <motion.div 
              className="mb-10 sm:mb-8 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 sm:mb-3">
                Welcome Back!
              </h1>
              <p className="text-base sm:text-lg text-neutral-600">
                Continue learning, join live classes, and stay ahead with your courses.
                <br />Your progress is just a click away.
              </p>
            </motion.div>

            {/* Error Display using StateDisplay component */}
            {currentError && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="alert"
                aria-live="polite"
              >
                <StateDisplay 
                  label={currentError} 
                  state="error" 
                  size="md"
                  showDot={true}
                  animation="scale"
                />
              </motion.div>
            )}
            
            {/* Login Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 sm:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Email Field using Input component */}
              <div className="w-full">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Enter Your Email Address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={isFormLoading}
                  required
                  error={formErrors.email}
                  size="lg"
                  autoComplete="email"
                  animate={true}
                  className="w-full"
                />
              </div>
              
              {/* Password Field using Input component */}
              <div className="w-full">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  disabled={isFormLoading}
                  required
                  error={formErrors.password}
                  size="lg"
                  autoComplete="current-password"
                  animate={true}
                  className="w-full"
                  rightIcon={
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      onKeyDown={togglePasswordVisibility}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={clsx(
                        "text-neutral-500 hover:text-neutral-700 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded",
                        "p-2 -m-2 cursor-pointer select-none",
                        "relative z-20 pointer-events-auto",
                        "flex items-center justify-center",
                        "min-w-[24px] min-h-[24px]",
                        {
                          "opacity-50 cursor-not-allowed": isFormLoading
                        }
                      )}
                      disabled={isFormLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                      style={{ pointerEvents: isFormLoading ? 'none' : 'auto' }}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  }
                />
              </div>
              
              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-neutral-600 hover:text-primary-600"
                  onClick={() => navigate('/forgot-password')}
                  disabled={isFormLoading}
                >
                  Forgot Password?
                </Button>
              </div>
              
              {/* Submit Button using Button component */}
              <div className="w-full">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  isLoading={isFormLoading}
                  loadingText="Signing In..."
                  disabled={!formData.email.trim() || !formData.password || isFormLoading}
                  animationVariant="emphatic"
                  className="w-full bg-[#4a2a82] hover:bg-[#3b2168] focus:ring-[#4a2a82] py-4 text-lg"
                >
                  Sign In
                </Button>
              </div>
            </motion.form>
            
            {/* Sign Up Link */}
            <motion.div 
              className="mt-10 sm:mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-neutral-600 text-base">
                You Don't Have An Account Yet?{" "}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-[#4a2a82] font-bold hover:text-[#3b2168] p-0 h-auto"
                  onClick={() => navigate('/signup')}
                  disabled={isFormLoading}
                >
                  Sign Up
                </Button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;