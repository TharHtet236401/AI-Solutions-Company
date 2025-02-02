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

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Login response:', data);  // Debug log

            if (data.con === true) {
                // Show success message
                showSuccess("Login successful! Redirecting...");
                
                // No need to manually set cookie as it's already set by the server
                // through generateTokenAndSetCookie function
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 1000);
            } else {
                showError(data.msg || 'Login failed. Please try again.');
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

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        adminLoginForm.insertBefore(successDiv, adminLoginForm.firstChild);
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

    // Add this function to handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                window.location.href = '/admin/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Add click event listener to logout button
    document.querySelector('.logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleLogout();
    });
}); 