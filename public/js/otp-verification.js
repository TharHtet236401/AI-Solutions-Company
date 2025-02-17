document.addEventListener('DOMContentLoaded', function() {
    const otpForm = document.getElementById('otpForm');
    const inputs = document.querySelectorAll('.otp-inputs input');
    const resendBtn = document.getElementById('resendBtn');
    let countdownInterval;

    // Auto-focus and input handling
    inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value) {
                if (index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });
    });

    // Form submission
    otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const otp = Array.from(inputs).map(input => input.value).join('');
        
        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    otp,
                    email: document.querySelector('.email-display').textContent
                })
            });

            const data = await response.json();

            if (data.con) {
                // Redirect to success page or show success message
                window.location.href = '/verification-success';
            } else {
                showError('Invalid verification code. Please try again.');
            }
        } catch (error) {
            showError('An error occurred. Please try again.');
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
}); 