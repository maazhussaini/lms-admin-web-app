/**
 * FORGOT PASSWORD PAGE JAVASCRIPT
 * All forgot password page specific functionality
 */

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeForgotPasswordPage();
});

/**
 * Initialize Forgot Password Page
 */
function initializeForgotPasswordPage() {
    setupFormValidation();
    setupFormSubmission();
    setupInputFocusAnimations();
    setupBackToLogin();
}

/**
 * Form Validation
 */
function setupFormValidation() {
    const emailInput = document.getElementById('reset-email');
    
    if (emailInput) {
        emailInput.addEventListener('blur', validateResetEmail);
        emailInput.addEventListener('input', clearResetEmailError);
    }
}

function validateResetEmail() {
    const emailInput = document.getElementById('reset-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailInput && emailInput.value.trim() && !emailPattern.test(emailInput.value)) {
        showFieldError(emailInput, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(emailInput);
    return true;
}

function clearResetEmailError() {
    const emailInput = document.getElementById('reset-email');
    clearFieldError(emailInput);
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#EF4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#EF4444';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    if (field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
}

/**
 * Form Submission
 */
function setupFormSubmission() {
    const forgotPasswordForm = document.querySelector('.forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPasswordSubmit);
    }
}

function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('reset-email');
    
    // Clear previous errors
    clearFieldError(emailInput);
    
    // Validate input
    let isValid = true;
    
    if (!emailInput || !emailInput.value.trim()) {
        showFieldError(emailInput, 'Email is required');
        isValid = false;
    } else if (!validateResetEmail()) {
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Process password reset
    processPasswordReset({
        email: emailInput.value.trim()
    });
}

function processPasswordReset(data) {
    const submitBtn = document.querySelector('.forgot-password-btn');
    
    // Show loading state
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
    }
    
    // Simulate API call - Replace with actual password reset logic
    setTimeout(() => {
        console.log('Password reset request:', data);
        
        // Reset button state
        if (submitBtn) {
            submitBtn.textContent = 'Send';
            submitBtn.disabled = false;
        }
        
        // Show success message
        showSuccessMessage('Password reset link has been sent to your email');
        
        // Optionally redirect after delay
        // setTimeout(() => {
        //     window.location.href = '/signin';
        // }, 3000);
        
    }, 1500);
}

function showSuccessMessage(message) {
    // Remove existing success message
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #10B981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 20px;
        font-size: 14px;
        text-align: center;
    `;
    successDiv.textContent = message;
    
    const form = document.querySelector('.forgot-password-form');
    if (form) {
        form.appendChild(successDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Input Focus Animations
 */
function setupInputFocusAnimations() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            this.style.transform = 'translateY(-1px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            this.style.transform = '';
        });
    });
}

/**
 * Back to Login Link
 */
function setupBackToLogin() {
    const backToLoginLink = document.querySelector('.back-to-login-link');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add smooth transition effect
            document.body.style.opacity = '0.8';
            
            setTimeout(() => {
                // Replace with actual navigation logic
                // window.location.href = '/signin';
                console.log('Navigate back to login');
                document.body.style.opacity = '1';
            }, 300);
        });
    }
}

/**
 * Utility Functions
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Export functions for potential use in other scripts
window.forgotPasswordUtils = {
    validateResetEmail,
    isValidEmail,
    processPasswordReset
};
