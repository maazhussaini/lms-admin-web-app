import React, { forwardRef, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';
import StateDisplay from '@/components/common/StateDisplay';
import Spinner from '@/components/common/Spinner';

export interface FileUploadProps {
  /**
   * Accept attribute for the file input
   * @example "image/*" | ".pdf,.doc,.docx" | "application/pdf,image/png"
   */
  accept?: string;
  
  /**
   * Label for the file upload button
   */
  label?: string;
  
  /**
   * Helper text displayed below the upload area
   */
  helperText?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Allow selecting multiple files
   * @default false
   */
  multiple?: boolean;
  
  /**
   * Maximum allowed file size in bytes
   * @example 1048576 // 1MB
   */
  maxSize?: number;
  
  /**
   * Current value (URL string) of the file
   */
  value?: string;
  
  /**
   * Function called when files are selected or value changes
   */
  onChange?: (value: string | null) => void;
  
  /**
   * Additional classes for the upload area
   */
  className?: string;
  
  /**
   * Custom text for the drag area
   * @default "Drag & drop files here, or click to browse"
   */
  dragText?: string;
  
  /**
   * Makes the upload button take the full width of its container
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Show preview of uploaded images
   * @default false
   */
  showPreview?: boolean;
  
  /**
   * Whether the component is in loading state
   * @default false
   */
  isLoading?: boolean;
}

/**
 * FileUpload component for handling file uploads with animations
 */
const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      accept,
      label,
      helperText,
      error,
      multiple = false,
      maxSize,
      value,
      onChange,
      className = '',
      dragText = 'Drag & drop files here, or click to browse',
      fullWidth = true,
      disabled = false,
      showPreview = false,
      isLoading = false,
    },
    ref
  ) => {
    // Internal refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Combine external and internal refs
    const combinedRef = (node: HTMLInputElement) => {
      // Apply forwarded ref if available
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      
      // Always update our internal ref
      fileInputRef.current = node;
    };
    
    // State for drag events and selected files
    const [isDragging, setIsDragging] = useState(false);
    const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'error' | 'success'>('idle');
    
    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      
      if (files && files.length > 0) {
        // Validate file sizes
        if (maxSize) {
          for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
              setUploadStatus('error');
              if (onChange) onChange(null);
              return;
            }
          }
        }
        
        // Set success state
        setUploadStatus('success');
        
        // For images, create a data URL and pass it back to the parent
        const file = files[0]; // Use only the first file if multiple
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            if (onChange && reader.result) {
              onChange(reader.result.toString());
            }
          };
          reader.readAsDataURL(file);
        }
      }
      
      // Generate previews if enabled and files are selected
      if (showPreview && files && files.length > 0) {
        const newPreviewUrls: string[] = [];
        
        Array.from(files).forEach(file => {
          // Only create previews for images
          if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            newPreviewUrls.push(url);
          }
        });
        
        // Revoke old object URLs to avoid memory leaks
        filePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setFilePreviewUrls(newPreviewUrls);
      }
    };
    
    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isLoading) return;
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isLoading) return;
      setIsDragging(true);
    };
    
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled || isLoading) return;
      
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Update the file input with the dropped files
        const dt = new DataTransfer();
        const files = e.dataTransfer.files;
        
        // Handle file size validation
        let filesTooLarge = false;
        if (maxSize) {
          for (let i = 0; i < files.length; i++) {
            if (files[i].size > maxSize) {
              filesTooLarge = true;
              break;
            }
          }
        }
        
        if (filesTooLarge) {
          setUploadStatus('error');
          return;
        }
        
        // Add files to the DataTransfer object
        const maxFiles = multiple ? files.length : 1;
        for (let i = 0; i < maxFiles; i++) {
          dt.items.add(files[i]);
        }
        
        // Set the file input's files
        if (fileInputRef.current) {
          fileInputRef.current.files = dt.files;
          // Trigger onChange event
          const event = new Event('change', { bubbles: true });
          fileInputRef.current.dispatchEvent(event);
        }
        
        // Set success state
        setUploadStatus('success');
        
        // For images, create a data URL and pass it back to the parent
        const file = files[0]; // Use only the first file if multiple
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            if (onChange && reader.result) {
              onChange(reader.result.toString());
            }
          };
          reader.readAsDataURL(file);
        }
        
        // Generate previews if enabled
        if (showPreview) {
          const newPreviewUrls: string[] = [];
          
          Array.from(dt.files).forEach(file => {
            // Only create previews for images
            if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              newPreviewUrls.push(url);
            }
          });
          
          // Revoke old object URLs to avoid memory leaks
          filePreviewUrls.forEach(url => URL.revokeObjectURL(url));
          setFilePreviewUrls(newPreviewUrls);
        }
      }
    };
    
    // Format file size for display
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
      else return (bytes / 1073741824).toFixed(1) + ' GB';
    };
    
    // Clear selected files
    const handleClearFiles = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        
        // Reset status
        setUploadStatus('idle');
        
        // Call onChange handler with null
        if (onChange) onChange(null);
        
        // Clear previews
        filePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setFilePreviewUrls([]);
      }
    };
    
    // Animation variants
    const containerVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.3 }
      },
      hover: {
        scale: isDragging ? 1.03 : 1,
        boxShadow: isDragging ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none"
      }
    };
    
    const iconVariants = {
      idle: { y: 0 },
      drag: { 
        y: [0, -10, 0], 
        transition: { 
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut" 
        } 
      }
    };
    
    const fileStatusVariants = {
      hidden: { opacity: 0, height: 0 },
      visible: { 
        opacity: 1, 
        height: 'auto',
        transition: { duration: 0.3 } 
      },
      exit: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3 }
      }
    };
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} h-full flex flex-col`}>
        {label && (
          <motion.label 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-sm font-medium text-neutral-700 mb-1 flex-shrink-0"
          >
            {label}
          </motion.label>
        )}
        
        <motion.div
          className={`
            relative border-2 border-dashed rounded-md p-4 text-center cursor-pointer
            flex flex-col items-center justify-center flex-grow
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300'}
            ${disabled || isLoading ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed' : 'hover:bg-neutral-50'}
            ${error ? 'border-error' : ''}
            ${className}
          `}
          initial="hidden"
          animate="visible"
          whileHover={!disabled && !isLoading ? "hover" : ""}
          variants={containerVariants}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            className="hidden"
            ref={combinedRef}
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            disabled={disabled || isLoading}
          />
          
          <div className="w-full flex flex-col items-center justify-center py-2 gap-2">
            {isLoading ? (
              <div className="py-4">
                <Spinner size="lg" variant="primary" text="Uploading..." />
              </div>
            ) : (
              <>
                <motion.div 
                  className="flex justify-center"
                  variants={iconVariants}
                  animate={isDragging ? "drag" : "idle"}
                >
                  <svg
                    className={`w-10 h-10 ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </motion.div>
                
                <motion.div 
                  className="text-sm text-neutral-600 font-medium px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {dragText}
                </motion.div>
                
                <motion.div 
                  className="flex flex-col space-y-0.5 items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {accept && (
                    <div className="text-xs text-neutral-500">
                      Allowed formats: {accept}
                    </div>
                  )}
                  
                  {maxSize && (
                    <div className="text-xs text-neutral-500">
                      Max size: {formatFileSize(maxSize)}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Helper text or error message */}
        <AnimatePresence>
          {(helperText || error) && (
            <motion.p
              className={`mt-1 text-xs ${error ? 'text-error' : 'text-neutral-500'} flex-shrink-0`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;