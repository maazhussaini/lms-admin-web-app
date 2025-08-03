// ===== RESET PASSWORD PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality when the page loads
    initializePasswordToggles();
    initializePasswordStrength();
    initializePasswordMatch();
    initializeFormSubmission();
    initializeBackToLogin();
});

// ===== PASSWORD TOGGLE FUNCTIONALITY =====

function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Update toggle icon
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    });
}

// ===== PASSWORD STRENGTH CHECKER =====

function initializePasswordStrength() {
    const passwordInput = document.getElementById('reset-password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength-fill');
    const strengthText = document.querySelector('.password-strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    const strength = calculatePasswordStrength(password);
    
    // Remove all strength classes
    strengthBar.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
        return;
    }
    
    // Apply appropriate strength class and text
    if (strength.score <= 2) {
        strengthBar.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength.score <= 4) {
        strengthBar.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Medium password';
    } else {
        strengthBar.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    const criteria = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        longLength: password.length >= 12
    };
    
    // Calculate score based on criteria
    Object.values(criteria).forEach(met => {
        if (met) score++;
    });
    
    return {
        score,
        criteria,
        isStrong: score >= 4
    };
}

// ===== PASSWORD MATCH CHECKER =====

function initializePasswordMatch() {
    const passwordInput = document.getElementById('reset-password');
    const confirmInput = document.getElementById('confirm-password');
    
    if (passwordInput && confirmInput) {
        confirmInput.addEventListener('input', function() {
            checkPasswordMatch();
        });
        
        passwordInput.addEventListener('input', function() {
            // Re-check match if confirm field has value
            if (confirmInput.value) {
                checkPasswordMatch();
            }
        });
    }
}

function checkPasswordMatch() {
    const passwordInput = document.getElementById('reset-password');
    const confirmInput = document.getElementById('confirm-password');
    const matchIndicator = document.querySelector('.password-match-indicator');
    
    if (!passwordInput || !confirmInput || !matchIndicator) return;
    
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    
    // Remove existing classes
    matchIndicator.classList.remove('match', 'no-match');
    
    if (confirmPassword.length === 0) {
        matchIndicator.textContent = '';
        return;
    }
    
    if (password === confirmPassword) {
        matchIndicator.classList.add('match');
        matchIndicator.textContent = '✓ Passwords match';
    } else {
        matchIndicator.classList.add('no-match');
        matchIndicator.textContent = '✗ Passwords do not match';
    }
}

// ===== FORM SUBMISSION =====

function initializeFormSubmission() {
    const resetForm = document.querySelector('.reset-password-form');
    
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetSubmit);
    }
}

function handleResetSubmit(event) {
    event.preventDefault();
    
    const passwordInput = document.getElementById('reset-password');
    const confirmInput = document.getElementById('confirm-password');
    
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;
    
    // Validate password
    if (!validatePasswordReset(password, confirmPassword)) {
        return;
    }
    
    // Show loading state
    const resetBtn = document.querySelector('.reset-password-btn');
    const originalText = resetBtn.textContent;
    resetBtn.textContent = 'Resetting Password...';
    resetBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        processPasswordReset(password);
        resetBtn.textContent = originalText;
        resetBtn.disabled = false;
    }, 2000);
}

function validatePasswordReset(password, confirmPassword) {
    // Check if password is provided
    if (!password) {
        showMessage('Please enter a new password.', 'error');
        return false;
    }
    
    // Check password strength
    const strength = calculatePasswordStrength(password);
    if (!strength.isStrong) {
        showMessage('Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.', 'error');
        return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match. Please try again.', 'error');
        return false;
    }
    
    return true;
}

function processPasswordReset(newPassword) {
    // In a real application, this would make an API call to reset the password
    console.log('Resetting password...');
    
    // Simulate successful password reset
    showMessage('Password reset successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
        // Redirect to login page
        console.log('Redirecting to login page...');
        // window.location.href = 'sign-in.html';
    }, 1500);
}

// ===== NAVIGATION =====

function initializeBackToLogin() {
    const backLink = document.querySelector('.back-to-login-link');
    
    if (backLink) {
        backLink.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Navigate back to login
            console.log('Navigating back to login...');
            // window.location.href = 'sign-in.html';
        });
    }
}

// ===== UTILITY FUNCTIONS =====

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        max-width: 350px;
        animation: slideIn 0.3s ease;
        line-height: 1.4;
    `;
    
    // Set color based on type
    if (type === 'success') {
        messageElement.style.backgroundColor = '#10B981';
        messageElement.style.color = 'white';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#EF4444';
        messageElement.style.color = 'white';
    } else {
        messageElement.style.backgroundColor = '#3B82F6';
        messageElement.style.color = 'white';
    }
    
    // Add to page
    document.body.appendChild(messageElement);
    
    // Remove after 6 seconds (longer for password requirements message)
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 6000);
}

// ===== ENHANCED PASSWORD FEATURES =====

function getPasswordRequirements(password) {
    const requirements = [
        { text: 'At least 8 characters', met: password.length >= 8 },
        { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { text: 'Contains number', met: /\d/.test(password) },
        { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
    
    return requirements;
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
