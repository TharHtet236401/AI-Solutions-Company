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
    const forms = {
        profile: document.getElementById('profileForm'),
        security: document.getElementById('securityForm'),
        preferences: document.getElementById('preferencesForm')
    };

    Object.entries(forms).forEach(([formName, form]) => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form submission logic here
            console.log(`${formName} form submitted`);
            // After successful submission
            cancelEdit(formName);
        });
    });
});

async function loadUserProfile() {
    try {
        const response = await fetch('/api/users/profile');
        const data = await response.json();
        
        if (data.con) {
            const user = data.result;
            
            // Update profile form fields
            document.querySelector('#profileForm input[name="username"]').value = user.username;
            document.querySelector('#profileForm input[name="role"]').value = user.role;
            
            // You might want to update other fields if available in the API response
        } else {
            console.error('Error loading profile:', data.msg);
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

function toggleEdit(section) {
    const form = document.getElementById(`${section}Form`);
    const inputs = form.querySelectorAll('input, select');
    const actions = form.querySelector('.form-actions');
    const avatarUpload = document.querySelector('.avatar-upload');

    inputs.forEach(input => input.disabled = false);
    actions.style.display = 'flex';

    if (section === 'profile') {
        avatarUpload.style.display = 'block';
    }
}

function cancelEdit(section) {
    const form = document.getElementById(`${section}Form`);
    const inputs = form.querySelectorAll('input, select');
    const actions = form.querySelector('.form-actions');
    const avatarUpload = document.querySelector('.avatar-upload');

    inputs.forEach(input => {
        input.disabled = true;
        input.value = input.defaultValue; // Reset to original value
    });
    actions.style.display = 'none';

    if (section === 'profile') {
        avatarUpload.style.display = 'none';
    }
} 