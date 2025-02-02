document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginButton = adminLoginForm.querySelector('.login-btn');
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');

    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        loginButton.classList.add('loading');
        loginButton.disabled = true;
        
        try {
            const formData = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message before redirect
                const successDiv = document.createElement('div');
                successDiv.className = 'error-message success';
                successDiv.style.backgroundColor = 'var(--success-color)';
                successDiv.textContent = 'Login successful! Redirecting...';
                
                const existingMessage = document.querySelector('.error-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                adminLoginForm.insertBefore(successDiv, adminLoginForm.firstChild);

                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 1000);
            } else {
                showError(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            // Remove loading state
            loginButton.classList.remove('loading');
            loginButton.disabled = false;
        }
    });

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        adminLoginForm.insertBefore(errorDiv, adminLoginForm.firstChild);
    }

    // Add input validation
    const inputs = adminLoginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorMessage = this.parentElement.querySelector('.field-error');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });
}); 