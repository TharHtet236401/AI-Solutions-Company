document.addEventListener('DOMContentLoaded', function() {
    // Load user profile data
    loadUserProfile();

    // Handle file input change
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Setup password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            // Only toggle if the input is not disabled
            if (!input.disabled) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });

    // Form submission handlers
    const profileForm = document.getElementById('profileForm');
    const securityForm = document.getElementById('securityForm');

    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('.save-btn');
        const originalText = submitButton.innerHTML;

        try {
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitButton.disabled = true;

            const formData = {
                username: this.querySelector('input[name="username"]').value
            };

            const response = await fetch('/api/users/personal-info/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
           

            if (data.con) {
                // Update the form with the returned data
                const user = data.result;
                const usernameInput = this.querySelector('input[name="username"]');
                const roleInput = this.querySelector('input[name="role"]');

                // Keep the form value as the new default since username isn't in response
                usernameInput.value = formData.username;
                usernameInput.defaultValue = formData.username;

                // Update role if it's in the response
                if (user.role) {
                    roleInput.value = user.role;
                    roleInput.defaultValue = user.role;
                }

                showSuccess(data.msg || 'Profile updated successfully');
                cancelEdit('profile');
            } else {
                showError(data.msg || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });

    // Handle security form submission
    securityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = securityForm.querySelector('input[name="currentPassword"]').value;
        const newPassword = securityForm.querySelector('input[name="newPassword"]').value;
        const confirmPassword = securityForm.querySelector('input[name="confirmPassword"]').value;
        
        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showError('All password fields are required');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }
        
        const saveBtn = securityForm.querySelector('.save-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Updating...';
        saveBtn.disabled = true;
        
        try {
            const response = await fetch('/api/users/update-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });
            
            const data = await response.json();
            
            if (data.con) {
                showSuccess(data.msg || 'Password updated successfully');
                securityForm.reset();
                toggleEdit('security', false);
            } else {
                showError(data.msg || 'Failed to update password');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            showError('An error occurred while updating password');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });
});

async function loadUserProfile() {
    try {
        const response = await fetch('/api/users/profile');
        const data = await response.json();
        
        if (data.con) {
            const user = data.result;
            
            // Update profile form fields
            const usernameInput = document.querySelector('#profileForm input[name="username"]');
            const roleInput = document.querySelector('#profileForm input[name="role"]');
            
            usernameInput.value = user.username;
            usernameInput.defaultValue = user.username;
            
            roleInput.value = user.role;
            roleInput.defaultValue = user.role;
        } else {
            showError('Error loading profile: ' + data.msg);
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        showError('Error loading profile');
    }
}

function toggleEdit(formId) {
    const form = document.getElementById(`${formId}Form`);
    const inputs = form.querySelectorAll('input:not([type="file"]):not([readonly])');
    const actions = form.querySelector('.form-actions');
    
    inputs.forEach(input => {
        input.disabled = !input.disabled;
    });
    
    actions.style.display = actions.style.display === 'none' ? 'flex' : 'none';
}

function cancelEdit(formId) {
    const form = document.getElementById(`${formId}Form`);
    const inputs = form.querySelectorAll('input:not([type="file"]):not([readonly])');
    const actions = form.querySelector('.form-actions');
    
    inputs.forEach(input => {
        input.disabled = true;
        input.value = input.defaultValue;
    });
    
    actions.style.display = 'none';
}

