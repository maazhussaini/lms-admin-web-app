import React from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface ExitConfirmationModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Callback when user confirms exit
   */
  onConfirm: () => void;
  
  /**
   * Callback when user cancels
   */
  onCancel: () => void;
}

/**
 * ExitConfirmationModal - Warning modal when exiting quiz
 */
export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="md"
      animationPreset="zoom"
      preventCloseOnOverlayClick
      showCloseButton={false}
    >
      <div className="text-center py-6 px-4">
        {/* Warning Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-6"
        >
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <h3 className="text-xl font-bold text-primary-900 mb-3">
          Exit Quiz?
        </h3>
        <p className="text-neutral-700 mb-8 leading-relaxed">
          Exiting Now Will Be Considered The End Of The Test. All Unanswered Questions 
          Will Be Marked As Skipped And Receive Zero Marks. Do You Want To Proceed?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            size="lg"
            className="w-full sm:w-auto"
          >
            Exit Quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExitConfirmationModal;
