import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Options for the select dropdown
   */
  options: SelectOption[];
  
  /**
   * Label for the select
   */
  label?: string;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display below the select
   */
  helperText?: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Additional CSS classes for the select element
   */
  className?: string;
  
  /**
   * Whether the field is loading data
   */
  isLoading?: boolean;
}

/**
 * Select component for dropdown selections
 */
const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  helperText,
  required,
  className = '',
  isLoading,
  disabled,
  value,
  onChange,
  ...rest
}) => {
  // Ensure value is properly controlled
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e); // Pass the original event
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={rest.id || rest.name} 
          className="block mb-1 text-sm font-medium text-neutral-700"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          className={`
            bg-white border rounded-md py-2 pl-3 pr-10 w-full text-sm focus:outline-none focus:ring-2
            disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed
            appearance-none
            ${error ? 'border-error-500 focus:ring-error-500' : 'border-neutral-300 focus:ring-primary-500'}
            ${className}
          `}
          disabled={isLoading || disabled}
          value={value || ''}
          onChange={handleChange}
          {...rest}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value.toString()} // Ensure value is a string
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="h-4 w-4 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error-500' : 'text-neutral-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;