document.addEventListener('DOMContentLoaded', function() {
    const chatModal = document.getElementById('chatModal');
    const openChatBtn = document.getElementById('openChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    console.log('Chat elements:', {
        chatModal,
        openChatBtn,
        closeChatBtn,
        messageInput,
        sendMessageBtn,
        chatMessages
    });

    // Open chat modal
    openChatBtn.addEventListener('click', () => {
        console.log('Opening chat modal');
        chatModal.classList.add('active');
    });

    // Close chat modal
    closeChatBtn.addEventListener('click', () => {
        chatModal.classList.remove('active');
    });

    // Close modal if clicked outside
    document.addEventListener('click', (e) => {
        if (!chatModal.contains(e.target) && !openChatBtn.contains(e.target)) {
            chatModal.classList.remove('active');
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, 'user');
            messageInput.value = '';
            messageInput.style.height = 'auto';

            // Simulate assistant response (replace with actual API call)
            setTimeout(() => {
                addMessage('Thank you for your message. Our team will get back to you soon!', 'assistant');
            }, 1000);
        }
    }

    // Add message to chat
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message on button click
    sendMessageBtn.addEventListener('click', sendMessage);

    // Send message on Enter (but create new line on Shift+Enter)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}); 