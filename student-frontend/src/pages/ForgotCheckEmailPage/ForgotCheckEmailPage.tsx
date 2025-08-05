import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import Button from '@/components/common/Button';
import StateDisplay from '@/components/common/StateDisplay';
import { PageTransition } from '@/components/common/PageTransition';

import logo from '@/assets/images/orbed_logo.svg';
import sideVector from '@/assets/images/forgot_password_vector.png';
import bgImage from '@/assets/images/bg.png';

const CODE_LENGTH = 5;

interface CodeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * CodeInput - 5-digit code input with keyboard navigation and accessibility
 */
const CodeInput: React.FC<CodeInputProps> = ({ value, onChange, disabled, error }) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    const next = [...value];
    next[idx] = val;
    onChange(next);
    if (val && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      onChange(value.map((v, i) => (i === idx - 1 ? '' : v)));
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div className="flex gap-3 justify-center w-full" aria-label="Enter verification code">
      {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={el => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={idx === 0 ? 'one-time-code' : undefined}
          className={clsx(
            'flex-grow min-w-0 max-w-[4.5rem] h-14 sm:h-16 rounded-lg border-2 text-2xl sm:text-3xl text-center font-bold transition-colors outline-none',
            error
              ? 'border-red-500 focus:border-red-600'
              : 'border-neutral-300 focus:border-primary-500',
            disabled && 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          )}
          value={value[idx] || ''}
          onChange={e => handleChange(idx, e)}
          onKeyDown={e => handleKeyDown(idx, e)}
          disabled={disabled}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};

/**
 * ForgotCheckEmailPage - Check your email and enter code page for password reset
 *
 * Security: Public route, no authentication required.
 */
const ForgotCheckEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCodeChange = useCallback((val: string[]) => {
    setCode(val);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (code.some(d => !d)) {
      setErrorMessage('Please enter the complete code.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      // TODO: Replace with actual API call for code verification
      await new Promise(res => setTimeout(res, 1200));
      setSuccessMessage('Code verified! You may now reset your password.');
      // Navigate to reset password page after short delay
      setTimeout(() => navigate('/reset-password', { replace: true }), 1000);
    } catch {
      setErrorMessage('Invalid or expired code. Please try again.');
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
        {/* Left section with background image and illustration */}
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
        {/* Right section with code entry form */}
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
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4 sm:mb-3">
                Check Your Email
              </h1>
              <p className="text-base sm:text-lg text-neutral-600">
                We&apos;ve sent a code to reset your password. If you don&apos;t see it, check your spam folder.
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
            {/* Code Entry Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-8 sm:space-y-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              autoComplete="off"
            >
              <CodeInput
                value={code}
                onChange={handleCodeChange}
                disabled={isSubmitting}
                error={errorMessage || undefined}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth={true}
                isLoading={isSubmitting}
                loadingText="Verifying..."
                disabled={code.some(d => !d) || isSubmitting}
                animationVariant="emphatic"
                className="w-full bg-[#4a2a82] hover:bg-[#3b2168] focus:ring-[#4a2a82] py-4 text-lg"
                aria-label="Verify Code"
              >
                Verify Code
              </Button>
            </motion.form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotCheckEmailPage;
