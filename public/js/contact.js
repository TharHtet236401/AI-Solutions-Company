document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
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

            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.con) {
                // Show success message
                showMessage('Thank you! Your inquiry has been submitted successfully.', 'success');
                contactForm.reset();
            } else {
                // Show error message
                showMessage('Sorry, there was an error submitting your inquiry. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Sorry, there was an error submitting your inquiry. Please try again.', 'error');
        } finally {
            // Reset submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Request <i class="fas fa-paper-plane"></i>';
        }
    });

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