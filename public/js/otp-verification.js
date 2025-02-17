document.addEventListener('DOMContentLoaded', function() {
    const otpForm = document.getElementById('otpForm');
    const inputs = document.querySelectorAll('.otp-input');
    const resendBtn = document.getElementById('resendBtn');
    let countdownInterval;

    // Auto-focus and input handling
    inputs.forEach((input, index) => {
        // Convert input to uppercase and allow only alphanumeric
        input.addEventListener('input', function(e) {
            // Convert to uppercase
            this.value = this.value.toUpperCase();
            
            if (this.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value) {
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });

        // Prevent non-alphanumeric characters
        input.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.keyCode || e.which);
            const regex = /^[A-Za-z0-9]$/;
            
            if (!regex.test(char)) {
                e.preventDefault();
            }
        });
    });

    // Form submission
    otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Get all input values and join them
            const verificationCode = Array.from(inputs).map(input => input.value).join('').toLowerCase();
            
            // Show loading state
            const submitBtn = this.querySelector('.verify-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

            // Send verification request
            const response = await fetch('http://localhost:3000/api/inquiries/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ verificationCode })
            });

            const data = await response.json();

            if (data.con) {
                // Show success message
                showMessage('Email verified successfully!', 'success');
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/contact'; // or wherever you want to redirect
                }, 1500);
            } else {
                showMessage(data.msg || 'Invalid verification code. Please try again.', 'error');
                // Clear inputs on error
                inputs.forEach(input => input.value = '');
                inputs[0].focus();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            const submitBtn = this.querySelector('.verify-btn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Verify Email</span><i class="fas fa-arrow-right"></i>';
        }
    });

    // Resend OTP functionality
    resendBtn.addEventListener('click', async function() {
        if (resendBtn.disabled) return;

        try {
            const response = await fetch('/api/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: document.querySelector('.email-display').textContent
                })
            });

            const data = await response.json();

            if (data.con) {
                startCountdown();
                showMessage('Verification code resent successfully!');
            } else {
                showError('Failed to resend code. Please try again.');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
        }
    });

    function startCountdown(seconds = 60) {
        resendBtn.disabled = true;
        const countdownDisplay = document.querySelector('.countdown');
        
        clearInterval(countdownInterval);
        
        countdownInterval = setInterval(() => {
            countdownDisplay.textContent = `(${seconds}s)`;
            seconds--;

            if (seconds < 0) {
                clearInterval(countdownInterval);
                countdownDisplay.textContent = '';
                resendBtn.disabled = false;
            }
        }, 1000);
    }

    // Start initial countdown
    startCountdown();

    // Add function to show messages
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert before the form
        const form = document.getElementById('otpForm');
        form.parentNode.insertBefore(messageDiv, form);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}); 