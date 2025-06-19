import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineOfficeBuilding,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineBookOpen
} from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import StateDisplay from '@/components/common/StateDisplay';

/**
 * Login page for student authentication
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantContext: ''
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Get return URL from location state
  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl || '/dashboard';

  // Clear errors only on component mount
  useEffect(() => {
    clearError();
    setLoginError(null);
  }, []); // Only run on mount

  // Sync auth error with local error state
  useEffect(() => {
    if (error && !isSubmitting) {
      setLoginError(error);
    }
  }, [error, isSubmitting]);

  // Handle input changes with controlled error clearing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Mark as interacted for better UX
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific validation errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear login errors when user starts correcting their input
    if ((name === 'email' || name === 'password') && (loginError || error)) {
      setLoginError(null);
      clearError();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoginError(null);
    clearError();
    
    try {
      await login(
        formData.email.trim(),
        formData.password,
        formData.tenantContext.trim() || undefined
      );
      
      // Redirect to return URL on successful login
      navigate(returnUrl, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      
      // Extract error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Set local error state to ensure it displays
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Get error message for display - prioritize local error state
  const getErrorMessage = (): string | null => {
    const displayError = loginError || error;
    
    if (displayError) {
      if (displayError.includes('Invalid credentials') || 
          displayError.includes('401') || 
          displayError.includes('authentication') ||
          displayError.includes('email address or password')) {
        return 'Invalid email address or password. Please check your credentials and try again.';
      }
      if (displayError.includes('TENANT_MISMATCH')) {
        return 'Your account does not have access to the specified organization.';
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Branding Section */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <div className="mx-auto w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
            <HiOutlineBookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Student Portal
          </h1>
          <p className="text-neutral-600">
            Sign in to access your courses and materials
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          variants={itemVariants}
        >
          {/* Error Message - Using StateDisplay component as-is */}
          {getErrorMessage() && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <StateDisplay
                label={getErrorMessage()!}
                state="error"
                size="md"
                pill={false}
                showDot={true}
                animation="scale"
              />
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                error={formErrors.email}
                disabled={isSubmitting || isLoading}
                leftIcon={<HiOutlineMail className="w-5 h-5 text-neutral-400" />}
                autoComplete="email"
                required
                className="w-full text-base"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                error={formErrors.password}
                disabled={isSubmitting || isLoading}
                leftIcon={<HiOutlineLockClosed className="w-5 h-5 text-neutral-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-neutral-600 transition-colors rounded"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                }
                interactiveRightIcon={true}
                autoComplete="current-password"
                required
                className="w-full text-base"
              />
            </motion.div>

            {/* Optional Tenant Context Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="tenantContext" className="block text-sm font-medium text-neutral-700 mb-2">
                Organization Code (Optional)
              </label>
              <Input
                id="tenantContext"
                name="tenantContext"
                type="text"
                placeholder="Enter organization code if provided"
                value={formData.tenantContext}
                onChange={handleInputChange}
                disabled={isSubmitting || isLoading}
                leftIcon={<HiOutlineOfficeBuilding className="w-5 h-5 text-neutral-400" />}
                className="w-full text-base"
              />
              <p className="mt-2 text-xs text-neutral-500">
                Leave blank if you don't have an organization code
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting || isLoading}
                loadingText="Signing in..."
                disabled={isSubmitting || isLoading}
                animationVariant="emphatic"
                className="w-full text-base font-semibold"
              >
                Sign In
              </Button>
            </motion.div>
          </form>

          {/* Footer Links */}
          <motion.div
            className="mt-6 text-center space-y-3"
            variants={itemVariants}
          >
            <Link
              to="/forgot-password"
              className="inline-block text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Forgot your password?
            </Link>
            
            <div className="text-xs text-neutral-500">
              <p>Need help? Contact your institution's support team.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 text-sm text-neutral-500"
          variants={itemVariants}
        >
          <p>© 2024 Learning Management System. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
