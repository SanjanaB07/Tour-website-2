// DOM Elements
const form = document.getElementById('bookingForm');
const progressSteps = document.querySelectorAll('.progress-step');
const formSteps = document.querySelectorAll('.form-step');
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');

// Current step tracking
let currentStep = 1;

// Booking data storage
let bookingData = {
    personal: {},
    travel: {},
    vehicle: ''
};

// Initialize date inputs with minimum dates
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
});

// Handle date changes
document.getElementById('startDate').addEventListener('change', (e) => {
    document.getElementById('endDate').min = e.target.value;
    if (document.getElementById('endDate').value < e.target.value) {
        document.getElementById('endDate').value = e.target.value;
    }
});

// Next button click handler
nextButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            saveStepData(currentStep);
            currentStep++;
            updateFormSteps();
            if (currentStep === 4) {
                populateBookingSummary();
            }
        }
    });
});

// Previous button click handler
prevButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentStep--;
        updateFormSteps();
    });
});

// Validate each step
function validateStep(step) {
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = currentFormStep.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value) {
            showError(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && !validateEmail(input.value)) {
            showError(input, 'Please enter a valid email address');
            isValid = false;
        } else if (input.type === 'tel' && !validatePhone(input.value)) {
            showError(input, 'Please enter a valid phone number');
            isValid = false;
        }
    });

    if (step === 2) {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        if (endDate < startDate) {
            showError(document.getElementById('endDate'), 'End date must be after start date');
            isValid = false;
        }
    }

    return isValid;
}

// Save data for each step
function saveStepData(step) {
    switch (step) {
        case 1:
            bookingData.personal = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('bookingEmail').value,
                phone: document.getElementById('bookingPhone').value,
                address: document.getElementById('address').value
            };
            break;
        case 2:
            bookingData.travel = {
                startDate: document.getElementById('startDate').value,
                endDate: document.getElementById('endDate').value,
                adults: document.getElementById('adults').value,
                children: document.getElementById('children').value
            };
            break;
        case 3:
            bookingData.vehicle = document.querySelector('input[name="vehicle"]:checked').value;
            break;
    }
}

// Update form steps visibility
function updateFormSteps() {
    formSteps.forEach(step => {
        step.classList.remove('active');
    });
    progressSteps.forEach(step => {
        step.classList.remove('active');
    });

    formSteps[currentStep - 1].classList.add('active');
    for (let i = 0; i < currentStep; i++) {
        progressSteps[i].classList.add('active');
    }
}

// Populate booking summary
function populateBookingSummary() {
    const summary = document.querySelector('.booking-summary');
    const totalGuests = parseInt(bookingData.travel.adults) + parseInt(bookingData.travel.children || 0);
    const duration = calculateDuration(bookingData.travel.startDate, bookingData.travel.endDate);

    summary.innerHTML = `
        <div class="summary-section">
            <h3>Personal Details</h3>
            <p><strong>Name:</strong> ${bookingData.personal.fullName}</p>
            <p><strong>Email:</strong> ${bookingData.personal.email}</p>
            <p><strong>Phone:</strong> ${bookingData.personal.phone}</p>
        </div>
        <div class="summary-section">
            <h3>Travel Details</h3>
            <p><strong>Duration:</strong> ${duration} days</p>
            <p><strong>Dates:</strong> ${formatDate(bookingData.travel.startDate)} - ${formatDate(bookingData.travel.endDate)}</p>
            <p><strong>Total Guests:</strong> ${totalGuests} (${bookingData.travel.adults} adults, ${bookingData.travel.children || 0} children)</p>
        </div>
        <div class="summary-section">
            <h3>Vehicle Selection</h3>
            <p><strong>Vehicle Type:</strong> ${capitalizeFirstLetter(bookingData.vehicle)}</p>
        </div>
    `;
}

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
        // Generate booking reference
        const bookingReference = generateBookingReference();
        
        // Save booking data
        const finalBookingData = {
            ...bookingData,
            bookingReference,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to localStorage (in a real app, this would be saved to a database)
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(finalBookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        // Store current booking reference for the success page
        localStorage.setItem('currentBookingReference', bookingReference);

        // Redirect to success page
        window.location.href = 'booking-success.html';
    }
});

// Utility functions
function showError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);

    input.addEventListener('focus', () => {
        errorDiv.remove();
    }, { once: true });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

function calculateDuration(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateBookingReference() {
    return 'BK' + Date.now().toString(36).toUpperCase() + 
           Math.random().toString(36).substring(2, 5).toUpperCase();
} 