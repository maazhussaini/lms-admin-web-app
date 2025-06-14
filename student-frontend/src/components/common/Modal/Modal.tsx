import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';

export interface ModalProps {
  /**
   * Controls whether the modal is displayed
   */
  isOpen: boolean;
  
  /**
   * Content to be displayed in the modal
   */
  children: React.ReactNode;
  
  /**
   * Modal title
   */
  title?: React.ReactNode;
  
  /**
   * Modal footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Function called when user attempts to close the modal
   */
  onClose: () => void;
  
  /**
   * Modal size
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Prevents closing the modal when clicking the overlay
   * @default false
   */
  preventCloseOnOverlayClick?: boolean;
  
  /**
   * Additional CSS classes for the modal container
   */
  className?: string;
  
  /**
   * Animation preset for the modal
   * @default "fade"
   */
  animationPreset?: 'fade' | 'zoom' | 'slideUp' | 'slideDown';
  
  /**
   * Whether to show a close button in the title bar
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Text for the default cancel button in footer (if no footer is provided)
   * If null, no default footer will be rendered
   * @default null
   */
  cancelText?: string | null;
  
  /**
   * Text for the default confirm button in footer (if no footer is provided)
   * If null, only cancel button will be shown in default footer
   * @default null
   */
  confirmText?: string | null;
  
  /**
   * Function called when confirm button is clicked
   */
  onConfirm?: () => void;
  
  /**
   * Whether the confirm button is in loading state
   * @default false
   */
  isConfirmLoading?: boolean;
  
  /**
   * Whether the confirm button is disabled
   * @default false
   */
  isConfirmDisabled?: boolean;
}

/**
 * Modal component with animations for displaying content in a dialog overlay
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  children,
  title,
  footer,
  onClose,
  size = 'md',
  preventCloseOnOverlayClick = false,
  className = '',
  animationPreset = 'fade',
  showCloseButton = true,
  cancelText = null,
  confirmText = null,
  onConfirm,
  isConfirmLoading = false,
  isConfirmDisabled = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press to close modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  // Map size to width classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-4rem)]'
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (preventCloseOnOverlayClick) return;
    
    // Close only if the click was directly on the overlay (not its children)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Define animation variants based on the selected preset
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
  };
  
  const modalVariants = {
    fade: {
      hidden: { opacity: 0, y: -10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          type: 'spring', 
          damping: 25, 
          stiffness: 300,
        },
      },
      exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
    },
    zoom: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { 
        opacity: 1, 
        scale: 1, 
        transition: { 
          type: 'spring',
          damping: 25, 
          stiffness: 300,
        },
      },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          type: 'spring',
          damping: 25, 
          stiffness: 300,
        },
      },
      exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
    },
    slideDown: {
      hidden: { opacity: 0, y: -50 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          type: 'spring',
          damping: 25, 
          stiffness: 300,
        },
      },
      exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
    },
  };
  
  // Helper to construct the default footer if needed
  const renderDefaultFooter = () => {
    if (!cancelText && !confirmText) return null;
    
    return (
      <div className="flex justify-end space-x-3">
        {cancelText && (
          <Button
            variant="secondary"
            onClick={onClose}
            animationVariant="subtle"
          >
            {cancelText}
          </Button>
        )}
        {confirmText && (
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isConfirmLoading}
            disabled={isConfirmDisabled}
            animationVariant="emphatic"
          >
            {confirmText}
          </Button>
        )}
      </div>
    );
  };

  // Use createPortal with AnimatePresence for controlled animations
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onClick={handleOverlayClick}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
          
          <motion.div 
            ref={modalRef}
            className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl relative z-10 ${className}`}
            role="dialog"
            aria-modal="true"
            variants={modalVariants[animationPreset]}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && (
              <motion.div 
                className="px-6 py-4 border-b border-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-medium text-neutral-900">
                    {title}
                  </h3>
                  {showCloseButton && (
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">Close</span>
                      <svg 
                        className="h-5 w-5" 
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
            
            <motion.div 
              className="px-6 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
            
            {(footer || cancelText || confirmText) && (
              <motion.div 
                className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 rounded-b-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {footer || renderDefaultFooter()}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;