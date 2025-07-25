import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaShieldAlt, FaLock } from 'react-icons/fa';

import { PublicLayout } from '@/components/layout/PublicLayout';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';
import { useAuth } from '@/context/AuthContext';

/**
 * UnauthorizedPage - Beautiful, modern unauthorized access page
 * 
 * Features:
 * - Interactive animations with Framer Motion
 * - Responsive design with mobile-first approach
 * - Smart navigation based on authentication status
 * - Purple theme integration
 * - Helpful actions for users to resolve authorization issues
 */
const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for interactive background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? '/courses' : '/login');
    }
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/courses' : '/login');
  };

  const handleLogoutAndRedirect = () => {
    logout();
    navigate('/login');
  };

  return (
    <PublicLayout 
      title="Unauthorized Access - Student LMS Portal"
      description="You don't have permission to access this resource."
    >
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-page-bg via-error/5 to-warning/5">
          {/* Interactive background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated background gradient that follows mouse */}
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #ef444422 0%, transparent 50%)`
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Floating security-themed shapes */}
            <motion.div
              className="absolute top-20 left-10 w-16 h-16 bg-error/20 rounded-full opacity-30"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
            />
            <motion.div
              className="absolute top-40 right-20 w-12 h-12 bg-warning/20 rotate-45 opacity-30"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 1 }}
            />
            <motion.div
              className="absolute bottom-40 left-20 w-20 h-20 bg-error/15 rounded-full opacity-25"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 2 }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-14 h-14 bg-warning/20 rotate-12 opacity-30"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
            />
          </div>

          {/* Main content */}
          <motion.div
            className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            role="main"
            aria-labelledby="error-title"
            aria-describedby="error-description"
          >
            <div className="max-w-lg w-full text-center">
              {/* Lock icon with animation */}
              <motion.div
                variants={itemVariants}
                className="mb-8 flex justify-center"
                aria-hidden="true"
              >
                <motion.div
                  className="relative"
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-error/20 to-warning/20 rounded-full flex items-center justify-center">
                    <FaShieldAlt className="text-6xl text-error" />
                  </div>
                  
                  {/* Animated lock overlay */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <FaLock className="text-2xl text-error" />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Error message */}
              <motion.div
                variants={itemVariants}
                className="mb-8"
              >
                <h1 
                  id="error-title"
                  className="text-3xl sm:text-4xl font-bold text-error mb-4"
                >
                  Access Denied
                </h1>
                <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-4">
                  Unauthorized Access
                </h2>
                <p 
                  id="error-description"
                  className="text-lg text-neutral-600 leading-relaxed"
                >
                  You don't have permission to access this resource. 
                  This could be due to insufficient privileges or an expired session.
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                variants={itemVariants}
                className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-8"
                role="navigation"
                aria-label="Error page navigation"
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoHome}
                  className="w-full sm:w-auto group"
                >
                  <FaHome className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                  {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoBack}
                  className="w-full sm:w-auto group"
                >
                  <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Go Back
                </Button>
              </motion.div>

              {/* Additional actions for authenticated users */}
              {isAuthenticated && (
                <motion.div
                  variants={itemVariants}
                  className="mb-8"
                >
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleLogoutAndRedirect}
                    className="w-full sm:w-auto text-neutral-600 hover:text-error"
                  >
                    Try logging in with a different account
                  </Button>
                </motion.div>
              )}

              {/* Animated decorative elements */}
              <motion.div
                className="mt-8 flex justify-center space-x-2"
                variants={itemVariants}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-error/60 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </PublicLayout>
  );
};

export default UnauthorizedPage;
