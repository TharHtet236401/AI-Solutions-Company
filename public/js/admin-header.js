document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
});

async function loadUserInfo() {
    try {
        const response = await fetch('/api/users/profile');
        const data = await response.json();
        
        if (data.con) {
            const user = data.result;
            const adminName = document.querySelector('.admin-name');
            if (adminName) {
                adminName.textContent = user.username;
            }
            
            // Update header username
            const headerUsername = document.getElementById('headerUsername');
            if (headerUsername) {
                headerUsername.textContent = user.username;
            }
            
            // Update header avatar if you have user avatar in the future
            // const headerAvatar = document.getElementById('headerAvatar');
            // if (headerAvatar && user.avatar) {
            //     headerAvatar.src = user.avatar;
            // }
        } else {
            console.error('Error loading user info:', data.msg);
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
} 