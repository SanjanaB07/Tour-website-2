// Store messages in localStorage
let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];

// DOM Elements
const form = document.getElementById('contactForm');
const inputs = document.querySelectorAll('.styled-input input, .styled-input textarea');
const successMessage = document.getElementById('successMessage');

// Add floating label effect
inputs.forEach(input => {
    // Set initial state for pre-filled inputs
    if (input.value) {
        input.classList.add('has-value');
    }

    // Handle input changes
    input.addEventListener('input', function() {
        if (this.value) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
        validateInput(this);
    });

    // Handle focus
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    // Handle blur
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
        validateInput(this);
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

    // Remove notification after delay
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
    const feedback = document.getElementById('feedback');

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        showInputError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Name and feedback length validation
    if (name.value.length < 2) {
        showInputError(name, 'Name must be at least 2 characters long');
        isValid = false;
    }

    if (feedback.value.length < 10) {
        showInputError(feedback, 'Feedback must be at least 10 characters long');
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
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return false;
    }

    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const feedback = document.getElementById('feedback').value;

    // Create new message object
    const newMessage = {
        name,
        email,
        feedback,
        time: new Date().toLocaleString()
    };

    // Add to messages array
    messages.unshift(newMessage);
    if (messages.length > 10) messages.pop();

    // Save to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Save contact info for pre-filling booking form
    localStorage.setItem('contactInfo', JSON.stringify({
        name: name,
        email: email
    }));

    // Show success message
    showNotification('Thank you for your feedback! Redirecting to booking page...');
    
    // Reset form
    form.reset();
    inputs.forEach(input => {
        input.parentElement.classList.remove('has-value', 'focused');
    });

    // Redirect to booking page after a short delay
    setTimeout(() => {
        window.location.href = 'booking.html';
    }, 2000);
    
    return false;
});

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const inputs = contactForm.querySelectorAll('input, textarea, select');

    // Add floating label effect
    inputs.forEach(input => {
        // Set initial state for pre-filled inputs
        if (input.value) {
            input.classList.add('has-value');
        }

        // Handle input changes
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
            validateInput(this);
        });

        // Handle focus
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        // Handle blur
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            validateInput(this);
        });
    });

    // Form validation
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // Validate all inputs
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Hide form and show success message
                contactForm.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Reset form for future use
                contactForm.reset();
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    contactForm.style.display = 'block';
                }, 5000);
            }, 1500);
        }
    });

    function validateInput(input) {
        const errorElement = input.parentElement.querySelector('.error-message');
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        input.classList.remove('invalid');
        errorElement.style.display = 'none';
        errorElement.textContent = '';

        // Skip validation for optional fields if empty
        if (!input.required && !input.value) {
            return true;
        }

        // Validate based on input type
        switch(input.type) {
            case 'email':
                if (!isValidEmail(input.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            
            case 'tel':
                if (input.value && !isValidPhone(input.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            
            case 'text':
                if (input.id === 'name' && !isValidName(input.value)) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;
            
            case 'textarea':
                if (input.value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long';
                }
                break;
            
            case 'select-one':
                if (!input.value) {
                    isValid = false;
                    errorMessage = 'Please select an option';
                }
                break;
        }

        // Show error if validation failed
        if (!isValid) {
            input.classList.add('invalid');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        }

        return isValid;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^[\d\s+-]{10,15}$/.test(phone);
    }

    function isValidName(name) {
        return name.length >= 2 && /^[A-Za-z\s]*$/.test(name);
    }

    // Smooth scroll for the "Send Message" button
    document.querySelector('.scroll-to-form-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('#contact-form').scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 