import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FaEye, FaEyeSlash, FaCheck, FaRegCircle } from 'react-icons/fa';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';
import StateDisplay from '@/components/common/StateDisplay';

import logo from '@public/orbed_logo.svg';
import sideVector from '@public/forgot_password_vector.png';
import bgImage from '@public/bg.png';

interface SetNewPasswordFormData {
  password: string;
  confirmPassword: string;
}

const passwordChecks = [
  {
    label: 'Must be at least 8 characters.',
    check: (pw: string) => pw.length >= 8,
  },
  {
    label: 'At least 1 Number',
    check: (pw: string) => /\d/.test(pw),
  },
  {
    label: 'Both Upper & Lower Case Letters',
    check: (pw: string) => /[A-Z]/.test(pw) && /[a-z]/.test(pw),
  },
];

const validatePassword = (password: string) => {
  return passwordChecks.every(req => req.check(password));
};

const SetNewPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SetNewPasswordFormData>({ password: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState<Partial<SetNewPasswordFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors({});
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<SetNewPasswordFormData> = {};
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password does not meet requirements';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      setSuccessMessage('Your password has been reset successfully.');
      // Navigate to ResetPasswordSuccessPage after short delay
      setTimeout(() => navigate('/reset-password-success', { replace: true }), 1200);
    } catch (err) {
      setErrorMessage('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password visibility toggle handlers
  const togglePasswordVisibility = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return;
      setShowPassword((prev) => !prev);
    },
    []
  );
  const toggleConfirmPasswordVisibility = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return;
      setShowConfirmPassword((prev) => !prev);
    },
    []
  );

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
        {/* Left section with background image and illustration */}
        <div className={leftSectionClasses}>
          <div
            className={backgroundContainerClasses}
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
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
        {/* Right section with set new password form */}
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
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 sm:mb-1">Set New Password</h1>
              <p className="text-base sm:text-lg text-neutral-600">
                Your new password must be different to your previously used password.
              </p>
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
            {/* Set New Password Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 sm:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-full">
                <Input
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  error={formErrors.password}
                  size="lg"
                  autoComplete="new-password"
                  animate={true}
                  className="w-full"
                  rightIcon={
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      onKeyDown={togglePasswordVisibility}
                      onMouseDown={e => {
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
                          "opacity-50 cursor-not-allowed": isSubmitting
                        }
                      )}
                      disabled={isSubmitting}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                      style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  }
                />
              </div>
              <div className="w-full">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Your Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  error={formErrors.confirmPassword}
                  size="lg"
                  autoComplete="new-password"
                  animate={true}
                  className="w-full"
                  rightIcon={
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      onKeyDown={toggleConfirmPasswordVisibility}
                      onMouseDown={e => {
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
                          "opacity-50 cursor-not-allowed": isSubmitting
                        }
                      )}
                      disabled={isSubmitting}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={0}
                      style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  }
                />
              </div>
              {/* Password requirements with dynamic checkmarks */}
              <div className="flex flex-col gap-1 text-neutral-600 text-base mt-2 mb-2">
                {passwordChecks.map((req, idx) => {
                  const met = req.check(formData.password);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {met ? (
                        <FaCheck className="text-primary-600" aria-label="Met" size={18} />
                      ) : (
                        <FaRegCircle className="text-neutral-400" aria-label="Not met" size={18} />
                      )}
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  isLoading={isSubmitting}
                  loadingText="Resetting..."
                  disabled={
                    !formData.password ||
                    !formData.confirmPassword ||
                    isSubmitting
                  }
                  animationVariant="emphatic"
                  className="w-full bg-[#4a2a82] hover:bg-[#3b2168] focus:ring-[#4a2a82] py-4 text-lg"
                >
                  Reset Password
                </Button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SetNewPasswordPage;
