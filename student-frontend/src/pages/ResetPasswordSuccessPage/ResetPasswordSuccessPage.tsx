import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';

import logo from '@public/orbed_logo.svg';
import sideVector from '@public/reset_password_success_vector.png';
import bgImage from '@public/bg.png';

const ResetPasswordSuccessPage: React.FC = () => {
  const navigate = useNavigate();

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
        {/* Right section with success message */}
        <div className={rightSectionClasses}>
          <div className="max-w-2xl w-full px-6 sm:px-8 md:px-4 lg:px-6 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              className="flex justify-center mb-8 sm:mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <img src={logo} alt="orb-Ed Logo" className="h-24" />
            </motion.div>
            {/* Title & Description */}
            <motion.div
              className="mb-10 sm:mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 sm:mb-1">
                Password Reset
              </h1>
              <p className="text-base sm:text-lg text-neutral-600">
                Hurray! Your password has been successfully reset. Click below to Login magically.
              </p>
            </motion.div>
            {/* Login Button */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth={true}
                className="w-full bg-[#4a2a82] hover:bg-[#3b2168] focus:ring-[#4a2a82] py-4 text-lg"
                onClick={() => navigate('/login')}
                aria-label="Login"
              >
                Login
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPasswordSuccessPage;