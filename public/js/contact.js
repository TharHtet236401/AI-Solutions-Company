document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.querySelector('.submit-btn');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Disable submit button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phoneNumber: document.getElementById('phone').value,
                companyName: document.getElementById('company').value,
                country: document.getElementById('country').value,
                jobTitle: document.getElementById('jobTitle').value,
                jobDetails: document.getElementById('jobDetails').value,
                status: 'pending'
            };

            // Send API request
            const response = await fetch('http://localhost:3000/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.con) {
                // Show success message
                showMessage('Please verify your email to complete your inquiry submission', 'success');
                
                // Log the email to debug
                console.log("Email being sent:", formData.email);
                
                // Add a small delay before redirect
                setTimeout(() => {
                    const redirectUrl = `/otp-verification?email=${encodeURIComponent(formData.email)}`;
                    console.log("Redirecting to:", redirectUrl); // Debug log
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                // Show error message
                showMessage(data.msg || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again later.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Request <i class="fas fa-paper-plane"></i>';
        }
    });

    // Function to show messages
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert message before the form
        contactForm.parentNode.insertBefore(messageDiv, contactForm);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}); 