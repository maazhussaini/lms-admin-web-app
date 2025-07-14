import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';
import StateDisplay from '@/components/common/StateDisplay';

import logo from '@public/orbed_logo.svg';
import sideVector from '@public/signup_vector.png';
import bgImage from '@public/bg.png';

interface SignUpFormData {
  name: string;
  email: string;
  phone: string; // Added phone field
  password: string;
  confirmPassword: string;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    phone: '', // phone will only be set on submit
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<SignUpFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = useCallback((field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setFormErrors(prev => ({ ...prev, [field]: undefined }));
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  // Add back phone input handler
  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setFormErrors(prev => ({ ...prev, phone: undefined }));
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const validateForm = (): boolean => {
    const errors: Partial<SignUpFormData> = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      // Use formData.phone directly
      const submitData = {
        ...formData,
      };
      // TODO: Replace with actual API call, using submitData
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
      // Optionally reset phone input and form
      setFormData(prev => ({ ...prev, phone: '' }));
      // Optionally navigate to login page after a delay
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setErrorMessage('Failed to create account. Please try again.');
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
        {/* Right section with sign up form */}
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
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 sm:mb-3">Create Your Account</h1>
              <p className="text-base sm:text-lg text-neutral-600">Sign up to start your learning journey!</p>
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
            {/* Sign Up Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6 sm:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-full">
                <Input
                  id="name"
                  label="Full Name"
                  type="text"
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  disabled={isSubmitting}
                  required
                  error={formErrors.name}
                  size="lg"
                  autoComplete="name"
                  animate={true}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
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
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <PhoneInput
                  country={'us'}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{
                    id: 'phone',
                    name: 'phone',
                    required: true,
                    autoComplete: 'tel',
                    disabled: isSubmitting,
                  }}
                  disabled={isSubmitting}
                  specialLabel={''}
                  containerClass="w-full"
                  inputClass={[
                    'w-full',
                    'h-[48px]',
                    'bg-white',
                    'border',
                    'rounded-md',
                    'focus:outline-none',
                    'focus:ring-2',
                    'transition-all',
                    'duration-200',
                    'py-2.5',
                    'px-4',
                    'text-base',
                    'appearance-none',
                    'pl-12',
                    isSubmitting ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : '',
                    formErrors.phone ? 'border-error focus:border-error focus:ring-error' : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
                  ].join(' ')}
                  buttonClass="!border-none !shadow-none !bg-transparent !h-[48px] !flex !items-center !absolute !left-0 !top-0 !z-10 !pl-3"
                  containerStyle={{ position: 'relative', width: '100%' }}
                  dropdownClass="!rounded-md !shadow-lg !border-neutral-200"
                  searchClass="!h-10 !text-base"
                />
                {formErrors.phone && (
                  <div className="mt-1">
                    <StateDisplay label={formErrors.phone} state="error" size="sm" />
                  </div>
                )}
              </div>
              <div className="w-full">
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Create a Password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  disabled={isSubmitting}
                  required
                  error={formErrors.password}
                  size="lg"
                  autoComplete="new-password"
                  animate={true}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  disabled={isSubmitting}
                  required
                  error={formErrors.confirmPassword}
                  size="lg"
                  autoComplete="new-password"
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
                  loadingText="Signing Up..."
                  disabled={isSubmitting}
                  animationVariant="emphatic"
                  className="w-full bg-[#4a2a82] hover:bg-[#3b2168] focus:ring-[#4a2a82] py-4 text-lg"
                >
                  Sign Up
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
                Already have an account?{' '}
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

export default SignUpPage;
