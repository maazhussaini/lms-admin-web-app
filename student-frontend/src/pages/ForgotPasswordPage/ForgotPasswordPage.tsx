import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';
import StateDisplay from '@/components/common/StateDisplay';

import logo from '@/assets/images/orbed_logo.svg';
import sideVector from '@/assets/images/forgot_password_vector.png';
import bgImage from '@/assets/images/bg.png';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [formErrors, setFormErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    setFormErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<ForgotPasswordFormData> = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccessMessage('A reset code has been sent to your email if it exists in our system.');
      // Navigate to check email page if not already there
      if (window.location.pathname !== '/forgot-password/check-email') {
        navigate('/forgot-password/check-email', { replace: true });
      }
    } catch {
      setErrorMessage('Failed to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerClasses = 'flex flex-col md:flex-row min-h-screen overflow-hidden';
  const leftSectionClasses = 'hidden md:flex md:w-[50%] items-center justify-center relative bg-white p-8';
  const rightSectionClasses = 'w-full md:w-[50%] flex items-center justify-center p-6 sm:p-8 md:p-4 bg-white';
  const backgroundContainerClasses = clsx(
    'w-full h-full rounded-3xl flex items-center justify-center relative shadow-lg overflow-hidden',
    'bg-cover bg-center bg-no-repeat'
  );

  return (
    <PageTransition>
      <div className={containerClasses}>
        {/* Left section with background image */}
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
        {/* Right section with forgot password form */}
        <div className={rightSectionClasses}>
          <div className="max-w-2xl w-full px-6 sm:px-8 md:px-4 lg:px-6">
            {/* Logo */}
            <motion.div 
              className="flex justify-center md:justify-start mb-8 sm:mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <img src={logo} alt="orb-Ed Logo" className="h-24" />
            </motion.div>
            {/* Title & Description */}
            <motion.div 
              className="mb-10 sm:mb-8 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 sm:mb-3">Forgot Password?</h1>
              <p className="text-base sm:text-lg text-neutral-600">Don't worry, it happens. Let's help you reset it.</p>
            </motion.div>
            {/* State Display for error/success */}
            {errorMessage && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="alert"
                aria-live="polite"
              >
                <StateDisplay 
                  label={errorMessage} 
                  state="error" 
                  size="md"
                  showDot={true}
                  animation="scale"
                />
              </motion.div>
            )}
            {successMessage && (
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="status"
                aria-live="polite"
              >
                <StateDisplay 
                  label={successMessage} 
                  state="success" 
                  size="md"
                  showDot={true}
                  animation="scale"
                />
              </motion.div>
            )}
            {/* Forgot Password Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 sm:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-full">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  error={formErrors.email}
                  size="lg"
                  autoComplete="email"
                  animate={true}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                  disabled={!formData.email.trim() || isSubmitting}
                  animationVariant="emphatic"
                  className="w-full bg-[#4a2a82] hover:bg-[#3b2168] focus:ring-[#4a2a82] py-4 text-lg"
                >
                  Send Code
                </Button>
              </div>
            </motion.form>
            {/* Link to Login */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-neutral-600 text-base">
                Remember Your Password?{' '}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-[#4a2a82] font-bold hover:text-[#3b2168] p-0 h-auto"
                  onClick={() => navigate('/login')}
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordPage;
