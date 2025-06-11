import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  className = '',
}) => {
  const getTypeStyles = (): { bgColor: string; textColor: string; icon: React.ReactNode } => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          icon: <CheckCircle className="h-5 w-5 text-success" />,
        };
      case 'error':
        return {
          bgColor: 'bg-error/10',
          textColor: 'text-error',
          icon: <AlertCircle className="h-5 w-5 text-error" />,
        };
      case 'info':
        return {
          bgColor: 'bg-info/10',
          textColor: 'text-info',
          icon: <Info className="h-5 w-5 text-info" />,
        };
      case 'warning':
        return {
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          icon: <AlertTriangle className="h-5 w-5 text-warning" />,
        };
      default:
        return {
          bgColor: 'bg-info/10',
          textColor: 'text-info',
          icon: <Info className="h-5 w-5 text-info" />,
        };
    }
  };

  const { bgColor, textColor, icon } = getTypeStyles();

  return (
    <div
      className={`rounded-lg p-4 ${bgColor} ${className} flex items-start justify-between`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className={`ml-3 ${textColor}`}>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className={`ml-auto -mx-1.5 -my-1.5 ${textColor} rounded-lg focus:ring-2 focus:ring-primary-500 p-1.5 inline-flex h-8 w-8 hover:bg-primary-100`}
          onClick={onClose}
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
