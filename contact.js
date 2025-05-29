// Store messages in localStorage
let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];

// DOM Elements
const form = document.getElementById('contactForm');
const inputs = document.querySelectorAll('.styled-input input, .styled-input textarea');

// Add floating label effect
inputs.forEach(input => {
    // Check if input has value on page load
    if (input.value) {
        input.parentElement.classList.add('has-value');
    }

    // Add events for floating labels
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
        if (input.value) {
            input.parentElement.classList.add('has-value');
        } else {
            input.parentElement.classList.remove('has-value');
        }
    });
});

// Function to delete a specific message
function deleteMessage(index) {
    if (confirm('Are you sure you want to delete this message?')) {
        messages.splice(index, 1);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        displayMessages();
        showNotification('Message deleted successfully');
    }
}

// Function to clear all messages
function clearAllMessages() {
    if (confirm('Are you sure you want to delete all messages?')) {
        messages = [];
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        displayMessages();
        showNotification('All messages cleared successfully');
    }
}

// Function to show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to validate form
function validateForm() {
    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const message = document.getElementById('message');

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showInputError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Phone validation (basic)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone.value)) {
        showInputError(phone, 'Please enter a valid phone number');
        isValid = false;
    }

    // Name and message length validation
    if (name.value.length < 2) {
        showInputError(name, 'Name must be at least 2 characters long');
        isValid = false;
    }

    if (message.value.length < 10) {
        showInputError(message, 'Message must be at least 10 characters long');
        isValid = false;
    }

    return isValid;
}

// Function to show input error
function showInputError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);

    // Remove error message when input is focused
    input.addEventListener('focus', () => {
        errorDiv.remove();
    }, { once: true });
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return false;
    }

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    const isBooking = document.getElementById('isBooking').checked;
    
    // Create new message object
    const newMessage = {
        name,
        email,
        phone,
        message,
        isBooking,
        time: new Date().toLocaleString()
    };

    // Add to messages array
    messages.unshift(newMessage);
    if (messages.length > 10) messages.pop();

    // Save to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Display messages
    displayMessages();

    // Reset form
    form.reset();
    inputs.forEach(input => {
        input.parentElement.classList.remove('has-value', 'focused');
    });
    
    // Show success message
    const messageType = isBooking ? 'booking request' : 'message';
    showNotification(`Thank you for your ${messageType}! We will get back to you soon.`);
    
    return false;
}

// Function to display messages
function displayMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach((msg, index) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-card';
        messageElement.innerHTML = `
            <div class="message-header">
                <h3>${msg.name} ${msg.isBooking ? '<span class="booking-badge">Booking Request</span>' : ''}</h3>
                <div class="message-actions">
                    <span class="message-time">${msg.time}</span>
                    <button onclick="deleteMessage(${index})" class="delete-btn" title="Delete Message">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="message-content">
                <p>${msg.message}</p>
            </div>
            <div class="message-footer">
                <span><i class="fas fa-envelope"></i> ${msg.email}</span>
                <span><i class="fas fa-phone"></i> ${msg.phone}</span>
            </div>
        `;
        container.appendChild(messageElement);
    });

    if (messages.length === 0) {
        container.innerHTML = '<div class="no-messages">No messages yet</div>';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayMessages();
    
    // Add form submit event listener
    form.addEventListener('submit', handleSubmit);
});

// Form submission handler
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback').value;

    // Here you would typically send the data to a server
    // For now, we'll just show a success message
    showNotification('Feedback submitted! Thank you for your response.', 'success');

    // Reset form
    contactForm.reset();
}); 