// Handle form submissions and store data in localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Load any existing booking data
    let bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');

    // Personal Details Form
    const personalDetailsForm = document.getElementById('personalDetailsForm');
    if (personalDetailsForm) {
        // Pre-fill form if data exists
        if (bookingData.personal) {
            document.getElementById('fullName').value = bookingData.personal.fullName || '';
            document.getElementById('bookingEmail').value = bookingData.personal.email || '';
            document.getElementById('bookingPhone').value = bookingData.personal.phone || '';
            document.getElementById('address').value = bookingData.personal.address || '';
        }

        // Add click handler for the next button
        const nextBtn = personalDetailsForm.querySelector('.next-btn');
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (validatePersonalDetails()) {
                // Save personal details
                bookingData.personal = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('bookingEmail').value,
                    phone: document.getElementById('bookingPhone').value,
                    address: document.getElementById('address').value
                };
                localStorage.setItem('bookingData', JSON.stringify(bookingData));
                window.location.href = 'booking-step2.html';
            }
        });
    }

    // Travel Plans Form
    const travelPlansForm = document.getElementById('travelPlansForm');
    if (travelPlansForm) {
        // Pre-fill form if data exists
        if (bookingData.travel) {
            document.getElementById('startDate').value = bookingData.travel.startDate || '';
            document.getElementById('endDate').value = bookingData.travel.endDate || '';
            document.getElementById('adults').value = bookingData.travel.adults || '';
            document.getElementById('children').value = bookingData.travel.children || '';
        }

        // Add click handler for the next button
        const nextBtn = travelPlansForm.querySelector('.next-btn');
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (validateTravelDetails()) {
                // Save travel details
                bookingData.travel = {
                    startDate: document.getElementById('startDate').value,
                    endDate: document.getElementById('endDate').value,
                    adults: document.getElementById('adults').value,
                    children: document.getElementById('children').value
                };
                localStorage.setItem('bookingData', JSON.stringify(bookingData));
                window.location.href = 'booking-step3.html';
            }
        });
    }

    // Preferences Form
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        // Pre-fill form if data exists
        if (bookingData.preferences) {
            const vehicleInput = document.querySelector(`input[value="${bookingData.preferences.vehicle}"]`);
            if (vehicleInput) vehicleInput.checked = true;
        }

        // Add click handler for the next button
        const nextBtn = preferencesForm.querySelector('.next-btn');
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (validatePreferences()) {
                // Save preferences
                bookingData.preferences = {
                    vehicle: document.querySelector('input[name="vehicle"]:checked').value
                };
                localStorage.setItem('bookingData', JSON.stringify(bookingData));
                window.location.href = 'booking-step4.html';
            }
        });
    }

    // Confirmation Form
    const confirmationForm = document.getElementById('confirmationForm');
    if (confirmationForm) {
        // Populate booking summary
        const summary = document.querySelector('.booking-summary');
        if (summary && bookingData.personal) {
            const duration = calculateDuration(bookingData.travel.startDate, bookingData.travel.endDate);
            const totalGuests = parseInt(bookingData.travel.adults) + parseInt(bookingData.travel.children || 0);

            summary.innerHTML = `
                <div class="summary-section">
                    <h3>Personal Details</h3>
                    <p><strong>Name:</strong> ${bookingData.personal.fullName}</p>
                    <p><strong>Email:</strong> ${bookingData.personal.email}</p>
                    <p><strong>Phone:</strong> ${bookingData.personal.phone}</p>
                    <p><strong>Address:</strong> ${bookingData.personal.address}</p>
                </div>
                <div class="summary-section">
                    <h3>Travel Details</h3>
                    <p><strong>Duration:</strong> ${duration} days</p>
                    <p><strong>Dates:</strong> ${formatDate(bookingData.travel.startDate)} - ${formatDate(bookingData.travel.endDate)}</p>
                    <p><strong>Total Guests:</strong> ${totalGuests} (${bookingData.travel.adults} adults, ${bookingData.travel.children || 0} children)</p>
                </div>
                <div class="summary-section">
                    <h3>Vehicle Selection</h3>
                    <p><strong>Vehicle Type:</strong> ${capitalizeFirstLetter(bookingData.preferences.vehicle)}</p>
                </div>
            `;
        }

        // Add click handler for the submit button
        const submitBtn = confirmationForm.querySelector('.submit-btn');
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Generate booking reference
            const bookingReference = generateBookingReference();
            
            // Save final booking data
            const finalBookingData = {
                ...bookingData,
                bookingReference,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            bookings.push(finalBookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            localStorage.setItem('currentBookingReference', bookingReference);

            // Clear the booking data in progress
            localStorage.removeItem('bookingData');

            // Redirect to success page
            window.location.href = 'booking-success.html';
        });
    }
});

// Validation Functions
function validatePersonalDetails() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!fullName || !email || !phone || !address) {
        alert('Please fill in all required fields.');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }

    return true;
}

function validateTravelDetails() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;

    if (!startDate || !endDate || !adults) {
        alert('Please fill in all required fields.');
        return false;
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        alert('Start date cannot be in the past.');
        return false;
    }

    if (end <= start) {
        alert('End date must be after start date.');
        return false;
    }

    // Number validation
    if (parseInt(adults) < 1) {
        alert('At least one adult is required.');
        return false;
    }

    if (children && parseInt(children) < 0) {
        alert('Number of children cannot be negative.');
        return false;
    }

    return true;
}

function validatePreferences() {
    const selectedVehicle = document.querySelector('input[name="vehicle"]:checked');
    
    if (!selectedVehicle) {
        alert('Please select a vehicle type.');
        return false;
    }

    return true;
}

// Utility Functions
function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateBookingReference() {
    return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Add completed class to progress steps based on URL
document.addEventListener('DOMContentLoaded', () => {
    const currentStep = window.location.pathname.split('-step')[1]?.split('.')[0];
    if (currentStep) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach(step => {
            if (step.dataset.step < currentStep) {
                step.classList.add('completed');
            }
        });
    }
}); 