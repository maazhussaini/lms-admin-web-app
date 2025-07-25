import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaExclamationTriangle, FaGraduationCap, FaBookOpen, FaLightbulb, FaChalkboardTeacher } from 'react-icons/fa';

import { PublicLayout } from '@/components/layout/PublicLayout';
import Button from '@/components/common/Button';
import { PageTransition } from '@/components/common/PageTransition';
import { useAuth } from '@/context/AuthContext';

/**
 * NotFoundPage - Beautiful, modern 404 error page for LMS
 * 
 * Features:
 * - LMS-themed design with educational icons and messaging
 * - Interactive animations with Framer Motion
 * - Responsive design with mobile-first approach
 * - Smart navigation based on authentication status
 * - Course-focused suggestions and help content
 * - Purple theme integration
 * - Accessibility considerations
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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

  return (
    <PublicLayout 
      title="Course Not Found - Student LMS Portal"
      description="The course or learning content you're looking for isn't available at this location."
    >
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-page-bg via-primary-50 to-secondary-50">
          {/* Interactive background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated background gradient that follows mouse */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #8251db22 0%, transparent 50%)`
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
            
            {/* Floating LMS-themed elements */}
            <motion.div
              className="absolute top-20 left-10 w-16 h-16 bg-primary-200 rounded-full opacity-20 flex items-center justify-center"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
            >
              <FaGraduationCap className="text-primary-600 text-xl" />
            </motion.div>
            <motion.div
              className="absolute top-40 right-20 w-12 h-12 bg-secondary-300 rounded-lg opacity-20 flex items-center justify-center rotate-12"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 1 }}
            >
              <FaBookOpen className="text-secondary-700 text-lg" />
            </motion.div>
            <motion.div
              className="absolute bottom-40 left-20 w-20 h-20 bg-primary-300 rounded-full opacity-15 flex items-center justify-center"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 2 }}
            >
              <FaLightbulb className="text-primary-700 text-2xl" />
            </motion.div>
            <motion.div
              className="absolute bottom-20 right-10 w-14 h-14 bg-secondary-200 rounded-lg opacity-20 flex items-center justify-center rotate-45"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
            >
              <FaChalkboardTeacher className="text-secondary-700 text-lg" />
            </motion.div>
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
              {/* 404 Number with animated effects */}
              <motion.div
                variants={itemVariants}
                className="mb-8"
                aria-hidden="true"
              >
                <motion.h1
                  className="text-8xl sm:text-9xl lg:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 leading-none"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  404
                </motion.h1>
                
                {/* Animated warning icon */}
                <motion.div
                  className="flex justify-center mt-4"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FaExclamationTriangle className="text-4xl text-primary-500 opacity-70" />
                </motion.div>
              </motion.div>

              {/* Error message */}
              <motion.div
                variants={itemVariants}
                className="mb-8"
              >
                <h2 
                  id="error-title"
                  className="text-2xl sm:text-3xl font-semibold text-primary-900 mb-4"
                >
                  Learning Path Not Found
                </h2>
                <p 
                  id="error-description"
                  className="text-lg text-neutral-600 leading-relaxed"
                >
                  Looks like this course or page has graduated to a different location! 
                  Don't worry – your learning journey continues here.
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                variants={itemVariants}
                className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-4"
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
                  {isAuthenticated ? 'Back to My Courses' : 'Start Learning'}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoBack}
                  className="w-full sm:w-auto group"
                >
                  <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Continue Learning
                </Button>
              </motion.div>

              {/* Animated decorative elements */}
              <motion.div
                className="mt-8 flex justify-center space-x-2"
                variants={itemVariants}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary-400 rounded-full"
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

export default NotFoundPage;
