/**
 * SIGNIN PAGE JAVASCRIPT
 * All signin page specific functionality
 */

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeSigninPage();
});

/**
 * Initialize Sign In Page
 */
function initializeSigninPage() {
    setupPasswordToggle();
    setupFormValidation();
    setupFormSubmission();
    setupInputFocusAnimations();
}

/**
 * Password Toggle Functionality
 */
function setupPasswordToggle() {
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePassword);
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');
    
    if (passwordInput && toggleButton) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleButton.textContent = '👁';
        }
    }
}

/**
 * Form Validation
 */
function setupFormValidation() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearEmailError);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', clearPasswordError);
    }
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailInput && emailInput.value.trim() && !emailPattern.test(emailInput.value)) {
        showFieldError(emailInput, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(emailInput);
    return true;
}

function validatePassword() {
    const passwordInput = document.getElementById('password');
    
    if (passwordInput && passwordInput.value.trim() && passwordInput.value.length < 6) {
        showFieldError(passwordInput, 'Password must be at least 6 characters');
        return false;
    }
    
    clearFieldError(passwordInput);
    return true;
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

function clearEmailError() {
    const emailInput = document.getElementById('email');
    clearFieldError(emailInput);
}

function clearPasswordError() {
    const passwordInput = document.getElementById('password');
    clearFieldError(passwordInput);
}

/**
 * Form Submission
 */
function setupFormSubmission() {
    const signinForm = document.querySelector('form');
    if (signinForm) {
        signinForm.addEventListener('submit', handleSigninSubmit);
    }
}

function handleSigninSubmit(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Clear previous errors
    clearFieldError(emailInput);
    clearFieldError(passwordInput);
    
    // Validate inputs
    let isValid = true;
    
    if (!emailInput || !emailInput.value.trim()) {
        showFieldError(emailInput, 'Email is required');
        isValid = false;
    } else if (!validateEmail()) {
        isValid = false;
    }
    
    if (!passwordInput || !passwordInput.value.trim()) {
        showFieldError(passwordInput, 'Password is required');
        isValid = false;
    } else if (!validatePassword()) {
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Process signin
    processSignin({
        email: emailInput.value.trim(),
        password: passwordInput.value
    });
}

function processSignin(credentials) {
    const submitBtn = document.querySelector('.signin-btn, .sign-in-btn');
    
    // Show loading state
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;
    }
    
    // Simulate API call - Replace with actual authentication logic
    setTimeout(() => {
        console.log('Sign in attempt:', credentials);
        
        // Reset button state
        if (submitBtn) {
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
        }
        
        // Handle success/error
        // window.location.href = '/dashboard'; // Redirect on success
        alert('Sign in functionality - Replace with actual authentication');
        
    }, 1000);
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
 * Utility Functions
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Export functions for potential use in other scripts
window.signinUtils = {
    togglePassword,
    validateEmail,
    validatePassword,
    isValidEmail
};