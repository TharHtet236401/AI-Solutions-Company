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

    securityForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your security form submission logic here
        // After successful submission
        cancelEdit('security');
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

