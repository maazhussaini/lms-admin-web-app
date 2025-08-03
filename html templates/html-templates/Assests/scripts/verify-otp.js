// ===== VERIFY OTP PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality when the page loads
    initializeOTPInputs();
    initializeTimer();
    initializeFormSubmission();
    initializeResendCode();
    initializeBackToLogin();
});

// ===== OTP INPUT MANAGEMENT =====

function initializeOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        // Handle input events
        input.addEventListener('input', function(e) {
            handleOTPInput(e, index);
        });
        
        // Handle keydown events for navigation
        input.addEventListener('keydown', function(e) {
            handleOTPKeydown(e, index);
        });
        
        // Handle paste events
        input.addEventListener('paste', function(e) {
            handleOTPPaste(e, index);
        });
    });
}

function handleOTPInput(event, currentIndex) {
    const input = event.target;
    const value = input.value;
    const otpInputs = document.querySelectorAll('.otp-input');
    
    // Only allow single digit
    if (value.length > 1) {
        input.value = value.slice(0, 1);
    }
    
    // Only allow numbers
    if (!/^\d*$/.test(input.value)) {
        input.value = '';
        return;
    }
    
    // Add filled class if has value
    if (input.value) {
        input.classList.add('filled');
        // Move to next input
        if (currentIndex < otpInputs.length - 1) {
            otpInputs[currentIndex + 1].focus();
        }
    } else {
        input.classList.remove('filled');
    }
    
    // Check if all inputs are filled
    checkOTPCompletion();
}

function handleOTPKeydown(event, currentIndex) {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    // Handle backspace
    if (event.key === 'Backspace') {
        const input = event.target;
        if (!input.value && currentIndex > 0) {
            // Move to previous input if current is empty
            otpInputs[currentIndex - 1].focus();
            otpInputs[currentIndex - 1].value = '';
            otpInputs[currentIndex - 1].classList.remove('filled');
        } else if (input.value) {
            // Clear current input
            input.value = '';
            input.classList.remove('filled');
        }
    }
    
    // Handle arrow keys
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
        otpInputs[currentIndex - 1].focus();
    }
    if (event.key === 'ArrowRight' && currentIndex < otpInputs.length - 1) {
        otpInputs[currentIndex + 1].focus();
    }
}

function handleOTPPaste(event, currentIndex) {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').slice(0, 6);
    const otpInputs = document.querySelectorAll('.otp-input');
    
    // Only process if pasted data contains only digits
    if (!/^\d+$/.test(pastedData)) {
        return;
    }
    
    // Fill inputs with pasted digits
    for (let i = 0; i < pastedData.length && (currentIndex + i) < otpInputs.length; i++) {
        otpInputs[currentIndex + i].value = pastedData[i];
        otpInputs[currentIndex + i].classList.add('filled');
    }
    
    // Focus on the next empty input or last input
    const nextIndex = Math.min(currentIndex + pastedData.length, otpInputs.length - 1);
    otpInputs[nextIndex].focus();
    
    checkOTPCompletion();
}

function checkOTPCompletion() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const continueBtn = document.querySelector('.verify-otp-btn');
    
    const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
    
    if (allFilled) {
        continueBtn.style.opacity = '1';
        continueBtn.style.cursor = 'pointer';
        continueBtn.disabled = false;
    } else {
        continueBtn.style.opacity = '0.7';
        continueBtn.style.cursor = 'not-allowed';
        continueBtn.disabled = true;
    }
}

function getOTPValue() {
    const otpInputs = document.querySelectorAll('.otp-input');
    return Array.from(otpInputs).map(input => input.value).join('');
}

// ===== TIMER FUNCTIONALITY =====

let timerInterval;
let timeRemaining = 302; // 5 minutes 2 seconds (5:02)

function initializeTimer() {
    startTimer();
}

function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimerExpiry();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerElement = document.querySelector('.otp-timer');
    
    if (timerElement) {
        timerElement.textContent = `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
    }
}

function handleTimerExpiry() {
    const timerElement = document.querySelector('.otp-timer');
    if (timerElement) {
        timerElement.textContent = '00 : 00';
        timerElement.style.color = '#EF4444';
    }
    
    // Disable OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.disabled = true;
        input.style.backgroundColor = '#F3F4F6';
    });
    
    // Show expired message
    showMessage('OTP has expired. Please request a new code.', 'error');
}

function resetTimer() {
    clearInterval(timerInterval);
    timeRemaining = 302; // Reset to 5:02
    
    // Re-enable OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.disabled = false;
        input.style.backgroundColor = 'white';
        input.value = '';
        input.classList.remove('filled');
    });
    
    // Reset timer color
    const timerElement = document.querySelector('.otp-timer');
    if (timerElement) {
        timerElement.style.color = '#374151';
    }
    
    startTimer();
    checkOTPCompletion();
}

// ===== FORM SUBMISSION =====

function initializeFormSubmission() {
    const verifyForm = document.querySelector('.verify-otp-form');
    const continueBtn = document.querySelector('.verify-otp-btn');
    
    if (verifyForm) {
        verifyForm.addEventListener('submit', handleOTPSubmit);
    }
    
    // Initialize button state
    if (continueBtn) {
        continueBtn.style.opacity = '0.7';
        continueBtn.style.cursor = 'not-allowed';
        continueBtn.disabled = true;
    }
}

function handleOTPSubmit(event) {
    event.preventDefault();
    
    const otpValue = getOTPValue();
    
    if (otpValue.length !== 6) {
        showMessage('Please enter all 6 digits of the OTP code.', 'error');
        return;
    }
    
    // Show loading state
    const continueBtn = document.querySelector('.verify-otp-btn');
    const originalText = continueBtn.textContent;
    continueBtn.textContent = 'Verifying...';
    continueBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        processOTPVerification(otpValue);
        continueBtn.textContent = originalText;
        continueBtn.disabled = false;
    }, 2000);
}

function processOTPVerification(otpCode) {
    // In a real application, this would make an API call to verify the OTP
    console.log('Verifying OTP:', otpCode);
    
    // Simulate verification logic
    if (otpCode === '123456') { // Demo: accept 123456 as valid
        showMessage('OTP verified successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            // Redirect to next page (e.g., reset password page)
            console.log('Redirecting to password reset page...');
            // window.location.href = 'reset-password.html';
        }, 1500);
    } else {
        showMessage('Invalid OTP code. Please try again.', 'error');
        
        // Clear OTP inputs
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        
        // Focus first input
        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }
        
        checkOTPCompletion();
    }
}

// ===== RESEND CODE FUNCTIONALITY =====

function initializeResendCode() {
    const resendLink = document.querySelector('.resend-code-link');
    
    if (resendLink) {
        resendLink.addEventListener('click', handleResendCode);
    }
}

function handleResendCode(event) {
    event.preventDefault();
    
    const resendLink = event.target;
    const originalText = resendLink.textContent;
    
    // Show loading state
    resendLink.textContent = 'Sending...';
    resendLink.style.pointerEvents = 'none';
    
    // Simulate API call to resend OTP
    setTimeout(() => {
        // Reset link text
        resendLink.textContent = originalText;
        resendLink.style.pointerEvents = 'auto';
        
        // Reset timer and clear inputs
        resetTimer();
        
        showMessage('New OTP code has been sent to your email.', 'success');
    }, 1500);
}

// ===== NAVIGATION =====

function initializeBackToLogin() {
    const backLink = document.querySelector('.back-to-login-link');
    
    if (backLink) {
        backLink.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Clear any running timers
            clearInterval(timerInterval);
            
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
        max-width: 300px;
        animation: slideIn 0.3s ease;
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
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
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
