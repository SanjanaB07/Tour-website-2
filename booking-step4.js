document.addEventListener('DOMContentLoaded', () => {
    // Clear any previous confirmation data
    localStorage.removeItem('currentBookingReference');
    localStorage.removeItem('agenda');

    // DOM Elements
    const bookingReference = document.getElementById('bookingReference');
    const personalDetails = document.getElementById('personalDetails');
    const travelDetails = document.getElementById('travelDetails');
    const vehicleDetails = document.getElementById('vehicleDetails');
    const totalCost = document.getElementById('totalCost');
    const agendaList = document.getElementById('agendaList');
    const taskInput = document.getElementById('taskInput');
    const timeInput = document.getElementById('timeInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelModal = document.getElementById('cancelModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    // Check if we have all required data
    const personalData = JSON.parse(localStorage.getItem('personalDetails') || '{}');
    const travelData = JSON.parse(localStorage.getItem('travelDetails') || '{}');
    const vehicleData = JSON.parse(localStorage.getItem('vehicleSelection') || '{}');

    if (!personalData.name || !travelData.startDate || !vehicleData.vehicle) {
        // If missing required data, redirect to step 1
        window.location.href = '/booking-step1.html';
        return;
    }

    // Generate and display booking reference
    const reference = generateBookingReference();
    bookingReference.textContent = reference;

    // Load and display booking details
    loadBookingDetails();

    // Event Listeners
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            // Save final booking data
            const bookingData = {
                reference: bookingReference.textContent,
                personal: JSON.parse(localStorage.getItem('personalDetails') || '{}'),
                travel: JSON.parse(localStorage.getItem('travelDetails') || '{}'),
                vehicle: JSON.parse(localStorage.getItem('vehicleSelection') || '{}'),
                status: 'confirmed',
                timestamp: new Date().toISOString()
            };

            // Save to bookings history
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            bookings.push(bookingData);
            localStorage.setItem('bookings', JSON.stringify(bookings));

            // Store current booking reference for success page
            localStorage.setItem('currentBookingReference', bookingData.reference);

            // Show success message
            alert('Booking confirmed! Redirecting to success page...');

            // Redirect to success page
            window.location.replace('/booking-success.html');
            return false;
        };
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addAgendaItem);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => openModal(cancelModal));
    }

    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', cancelBooking);
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => closeModal(cancelModal));
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cancelModal) {
            closeModal(cancelModal);
        }
    });
});

function generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let reference = 'BK';
    for (let i = 0; i < 6; i++) {
        reference += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem('bookingReference', reference);
    return reference;
}

function loadBookingDetails() {
    // Load personal details
    const personalData = JSON.parse(localStorage.getItem('personalDetails') || '{}');
    personalDetails.innerHTML = `
        <p><strong>Name:</strong> ${personalData.name || ''}</p>
        <p><strong>Email:</strong> ${personalData.email || ''}</p>
        <p><strong>Phone:</strong> ${personalData.phone || ''}</p>
    `;

    // Load travel details
    const travelData = JSON.parse(localStorage.getItem('travelDetails') || '{}');
    travelDetails.innerHTML = `
        <p><strong>Start Date:</strong> ${formatDate(travelData.startDate)}</p>
        <p><strong>End Date:</strong> ${formatDate(travelData.endDate)}</p>
        <p><strong>Group Size:</strong> ${travelData.groupSize || ''} people</p>
    `;

    // Load vehicle details
    const vehicleData = JSON.parse(localStorage.getItem('vehicleSelection') || '{}');
    const vehicleTypes = {
        economy: 'Economy Car',
        suv: 'SUV',
        luxury: 'Luxury Car',
        van: 'Passenger Van'
    };

    vehicleDetails.innerHTML = `
        <p><strong>Vehicle Type:</strong> ${vehicleTypes[vehicleData.vehicle] || ''}</p>
        <p><strong>Additional Services:</strong> ${formatServices(vehicleData.additionalOptions)}</p>
    `;

    // Display total cost
    totalCost.textContent = `₹${vehicleData.totalPrice || 0}`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatServices(services = []) {
    if (!services.length) return 'None';
    const serviceNames = {
        driver: 'Professional Driver',
        gps: 'GPS Navigation',
        'child-seat': 'Child Seat',
        insurance: 'Extra Insurance'
    };
    return services.map(service => serviceNames[service]).join(', ');
}

function addAgendaItem() {
    const task = taskInput.value.trim();
    const time = timeInput.value;

    if (!task || !time) {
        showNotification('Please enter both activity and time', 'error');
        return;
    }

    const li = document.createElement('li');
    li.className = 'agenda-item';
    li.innerHTML = `
        <span class="agenda-time">${time}</span>
        <span class="agenda-task">${task}</span>
        <div class="agenda-actions">
            <button class="edit-btn" onclick="editAgendaItem(this)">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" onclick="deleteAgendaItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    agendaList.appendChild(li);
    saveAgenda();
    
    // Clear inputs
    taskInput.value = '';
    timeInput.value = '';
}

function editAgendaItem(button) {
    const li = button.closest('.agenda-item');
    const taskSpan = li.querySelector('.agenda-task');
    const timeSpan = li.querySelector('.agenda-time');
    
    const newTask = prompt('Edit activity:', taskSpan.textContent);
    if (newTask !== null) {
        taskSpan.textContent = newTask;
        saveAgenda();
    }
}

function deleteAgendaItem(button) {
    if (confirm('Are you sure you want to delete this item?')) {
        button.closest('.agenda-item').remove();
        saveAgenda();
    }
}

function saveAgenda() {
    const agenda = Array.from(agendaList.children).map(item => ({
        time: item.querySelector('.agenda-time').textContent,
        task: item.querySelector('.agenda-task').textContent
    }));
    localStorage.setItem('agenda', JSON.stringify(agenda));
}

function loadSavedAgenda() {
    const savedAgenda = JSON.parse(localStorage.getItem('agenda') || '[]');
    savedAgenda.forEach(item => {
        const li = document.createElement('li');
        li.className = 'agenda-item';
        li.innerHTML = `
            <span class="agenda-time">${item.time}</span>
            <span class="agenda-task">${item.task}</span>
            <div class="agenda-actions">
                <button class="edit-btn" onclick="editAgendaItem(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteAgendaItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        agendaList.appendChild(li);
    });
}

function confirmBooking() {
    // Save final booking data
    const bookingData = {
        reference: bookingReference.textContent,
        personal: JSON.parse(localStorage.getItem('personalDetails') || '{}'),
        travel: JSON.parse(localStorage.getItem('travelDetails') || '{}'),
        vehicle: JSON.parse(localStorage.getItem('vehicleSelection') || '{}'),
        status: 'confirmed',
        timestamp: new Date().toISOString()
    };

    // Validate booking data
    if (!bookingData.personal.name || !bookingData.travel.startDate || !bookingData.vehicle.vehicle) {
        showNotification('Missing required booking information', 'error');
        return;
    }

    try {
        // Save to bookings history
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));

        // Store current booking reference for success page
        localStorage.setItem('currentBookingReference', bookingData.reference);

        // Show success message
        showNotification('Booking confirmed! Redirecting to success page...', 'success');

        // Redirect to success page after a short delay to show the notification
        setTimeout(() => {
            window.location.href = '/booking-success.html';
        }, 1000);
    } catch (error) {
        showNotification('Error saving booking. Please try again.', 'error');
    }
}

function cancelBooking() {
    // Clear all booking data
    localStorage.removeItem('personalDetails');
    localStorage.removeItem('travelDetails');
    localStorage.removeItem('vehicleSelection');
    localStorage.removeItem('bookingReference');

    showNotification('Booking cancelled successfully', 'success');

    // Redirect to home page after delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 