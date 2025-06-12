// Clear all previous booking data when starting new booking
window.addEventListener('DOMContentLoaded', () => {
    // Clear all booking related data
    localStorage.removeItem('personalDetails');
    localStorage.removeItem('travelDetails');
    localStorage.removeItem('vehicleSelection');
    localStorage.removeItem('agenda');
    localStorage.removeItem('currentBookingReference');

    // Load saved data if exists
    const savedDetails = JSON.parse(localStorage.getItem('personalDetails') || '{}');
    if (savedDetails.name) document.getElementById('fullName').value = savedDetails.name;
    if (savedDetails.email) document.getElementById('email').value = savedDetails.email;
    if (savedDetails.phone) document.getElementById('phone').value = savedDetails.phone;
    if (savedDetails.phoneCountry) document.getElementById('phoneCountry').value = savedDetails.phoneCountry;
    if (savedDetails.address) document.getElementById('address').value = savedDetails.address;
});

// Real-time validation
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', function() {
        validateField(this);
    });

    input.addEventListener('blur', function() {
        validateField(this, true);
    });
});

function validateField(field, showError = false) {
    const errorElement = document.getElementById(`${field.id}Error`);
    let isValid = true;

    switch(field.id) {
        case 'fullName':
            isValid = field.value.trim().length >= 2;
            if (!isValid && showError) {
                errorElement.textContent = 'Name must be at least 2 characters long';
                errorElement.style.display = 'block';
            }
            break;

        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
            if (!isValid && showError) {
                errorElement.textContent = 'Please enter a valid email address';
                errorElement.style.display = 'block';
            }
            break;

        case 'phone':
            isValid = /^[0-9]{10}$/.test(field.value);
            if (!isValid && showError) {
                errorElement.textContent = 'Please enter a valid 10-digit phone number';
                errorElement.style.display = 'block';
            }
            break;

        case 'address':
            isValid = field.value.trim().length >= 10;
            if (!isValid && showError) {
                errorElement.textContent = 'Please enter your complete address';
                errorElement.style.display = 'block';
            }
            break;
    }

    if (isValid || !showError) {
        errorElement?.style.removeProperty('display');
    }

    return isValid;
}

function validateAndProceed(event) {
    event.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error').forEach(error => error.style.display = 'none');
    
    let isValid = true;
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneCountry = document.getElementById('phoneCountry').value;
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const termsAccept = document.getElementById('termsAccept').checked;

    // Validate all fields
    const fields = ['fullName', 'email', 'phone', 'address'];
    fields.forEach(fieldId => {
        if (!validateField(document.getElementById(fieldId), true)) {
            isValid = false;
        }
    });

    // Validate terms acceptance
    if (!termsAccept) {
        document.getElementById('termsError').style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        // Save to localStorage
        const personalDetails = {
            name: fullName,
            email: email,
            phoneCountry: phoneCountry,
            phone: phone,
            address: address,
            termsAccepted: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('personalDetails', JSON.stringify(personalDetails));
        
        // Show success message
        showSuccessMessage();
        
        // Proceed to next step after a short delay
        setTimeout(() => {
            window.location.href = 'booking-step2.html';
        }, 1000);
    }

    return false;
}

function showSuccessMessage() {
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Personal details saved successfully!</p>
    `;
    
    // Add to page
    document.querySelector('.form-container').appendChild(successMessage);
    
    // Remove after transition
    setTimeout(() => {
        successMessage.remove();
    }, 3000);
}

document.getElementById('personalDetailsForm').addEventListener('submit', validateAndProceed);