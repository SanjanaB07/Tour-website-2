// DOM Elements
const agendaModal = document.getElementById('agendaModal');
const cancelModal = document.getElementById('cancelModal');
const agendaBtn = document.getElementById('addAgendaBtn');
const cancelBtn = document.getElementById('cancelBookingBtn');
const closeButtons = document.querySelectorAll('.close-modal');
const agendaForm = document.getElementById('agendaForm');
const cancelForm = document.getElementById('cancelForm');
const addDayBtn = document.getElementById('addDayBtn');
const agendaDays = document.getElementById('agendaDays');
const addActivityBtn = document.getElementById('addActivityBtn');
const activityInput = document.getElementById('activityInput');
const timeInput = document.getElementById('timeInput');
const agendaList = document.getElementById('agendaList');
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');

// Get booking reference from localStorage
const bookingReference = localStorage.getItem('currentBookingReference');
document.getElementById('bookingId').textContent = bookingReference;

// Get booking details
const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
const currentBooking = bookings.find(b => b.bookingReference === bookingReference);

// Enhanced Agenda Functionality
const savedAgendaItems = document.getElementById('savedAgendaItems');
let tasks = JSON.parse(localStorage.getItem('agendaTasks') || '[]');

// Initialize agenda items array
let agendaItems = JSON.parse(localStorage.getItem('agendaItems') || '[]');

// Modal handling
function openModal(modal) {
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Event Listeners
agendaBtn.addEventListener('click', () => {
    initializeAgendaDays();
    openModal(agendaModal);
});

cancelBtn.addEventListener('click', () => openModal(cancelModal));

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(button.closest('.modal'));
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Initialize agenda days based on booking duration
function initializeAgendaDays() {
    if (!currentBooking) return;

    const startDate = new Date(currentBooking.travel.startDate);
    const endDate = new Date(currentBooking.travel.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    agendaDays.innerHTML = '';
    for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dayElement = createDayElement(i + 1, currentDate);
        agendaDays.appendChild(dayElement);
    }
}

// Create a day element for the agenda
function createDayElement(dayNumber, date) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'agenda-day';
    dayDiv.innerHTML = `
        <h3>Day ${dayNumber} - ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
        <div class="activities">
            <div class="activity-input">
                <div class="styled-input">
                    <input type="text" id="activity_${dayNumber}_1" required />
                    <label for="activity_${dayNumber}_1">Activity</label>
                </div>
                <div class="styled-input time-input">
                    <input type="time" id="time_${dayNumber}_1" required />
                    <label for="time_${dayNumber}_1">Time</label>
                </div>
                <button type="button" class="add-activity-btn" onclick="addActivity(${dayNumber})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;
    return dayDiv;
}

// Add new activity to a day
function addActivity(dayNumber) {
    const activitiesDiv = document.querySelector(`#activity_${dayNumber}_1`).closest('.activities');
    const activityCount = activitiesDiv.querySelectorAll('.activity-input').length + 1;
    
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-input';
    newActivity.innerHTML = `
        <div class="styled-input">
            <input type="text" id="activity_${dayNumber}_${activityCount}" required />
            <label for="activity_${dayNumber}_${activityCount}">Activity</label>
        </div>
        <div class="styled-input time-input">
            <input type="time" id="time_${dayNumber}_${activityCount}" required />
            <label for="time_${dayNumber}_${activityCount}">Time</label>
        </div>
        <button type="button" class="remove-activity-btn" onclick="this.closest('.activity-input').remove()">
            <i class="fas fa-minus"></i>
        </button>
    `;
    activitiesDiv.appendChild(newActivity);
}

// Handle agenda form submission
agendaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect agenda data
    const agenda = [];
    const days = agendaDays.querySelectorAll('.agenda-day');
    
    days.forEach((day, index) => {
        const activities = [];
        const activityInputs = day.querySelectorAll('.activity-input');
        
        activityInputs.forEach(input => {
            const activityText = input.querySelector('input[type="text"]').value;
            const activityTime = input.querySelector('input[type="time"]').value;
            
            if (activityText && activityTime) {
                activities.push({ time: activityTime, activity: activityText });
            }
        });

        agenda.push({
            day: index + 1,
            activities: activities
        });
    });

    // Save agenda to booking
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex(b => b.bookingReference === bookingReference);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].agenda = agenda;
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    // Show success message and close modal
    showNotification('Agenda saved successfully!');
    closeModal(agendaModal);
});

// Handle cancellation form submission
cancelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const reason = document.getElementById('cancelReason').value;
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex(b => b.bookingReference === bookingReference);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'cancelled';
        bookings[bookingIndex].cancellationReason = reason;
        bookings[bookingIndex].cancelledAt = new Date().toISOString();
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }

    showNotification('Booking cancelled successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
});

// Show notification
function showNotification(message, type = 'success', duration = 3000) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Show notification with animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

function addTaskInput() {
    const taskInput = document.createElement('div');
    taskInput.className = 'task-input';
    taskInput.innerHTML = `
        <input type="text" placeholder="Enter your task" required>
        <button type="button" class="secondary-btn" onclick="saveTask(this)">
            <i class="fas fa-save"></i> Save
        </button>
    `;
    agendaDays.appendChild(taskInput);
}

function saveTask(button) {
    const input = button.previousElementSibling;
    const taskText = input.value.trim();
    
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(task);
        localStorage.setItem('agendaTasks', JSON.stringify(tasks));
        renderTasks();
        input.value = '';
    }
}

function renderTasks() {
    savedAgendaItems.innerHTML = tasks.map(task => `
        <li data-id="${task.id}" class="${task.completed ? 'completed' : ''}">
            <label>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span>${task.text}</span>
            </label>
            <div class="task-actions">
                <button class="edit-task" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-task" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('agendaTasks', JSON.stringify(tasks));
        renderTasks();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null) {
            task.text = newText.trim();
            localStorage.setItem('agendaTasks', JSON.stringify(tasks));
            renderTasks();
        }
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('agendaTasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// Event Listeners
addTaskBtn.addEventListener('click', addTaskInput);

// Add new activity
function addActivity() {
    const activity = activityInput.value.trim();
    const time = timeInput.value;

    if (!activity || !time) {
        showNotification('Please fill in both activity and time', 'error');
        return;
    }

    const newItem = {
        id: Date.now(),
        activity: activity,
        time: time
    };

    // Add new item to array
    agendaItems.push(newItem);
    
    // Save to localStorage
    localStorage.setItem('agendaItems', JSON.stringify(agendaItems));
    
    // Clear inputs
    activityInput.value = '';
    timeInput.value = '';
    
    // Show success message
    showNotification('Activity added successfully!', 'success');
    
    // Refresh the display
    displayAgendaItems();
}

// Display agenda items
function displayAgendaItems() {
    if (!agendaList) return;
    
    // Clear current list
    agendaList.innerHTML = '';
    
    // Sort items by time
    agendaItems.sort((a, b) => a.time.localeCompare(b.time));
    
    // Display each item
    agendaItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'agenda-item';
        li.innerHTML = `
            <span class="agenda-time">${formatTime(item.time)}</span>
            <span class="agenda-text">${item.activity}</span>
            <div class="agenda-actions">
                <button class="action-btn-small" onclick="editActivity(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn-small delete-btn" onclick="deleteActivity(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        agendaList.appendChild(li);
    });
}

// Format time for display
function formatTime(time) {
    try {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return time;
    }
}

// Edit activity
function editActivity(id) {
    const item = agendaItems.find(item => item.id === id);
    if (!item) return;

    activityInput.value = item.activity;
    timeInput.value = item.time;
    
    // Remove the item from the array
    agendaItems = agendaItems.filter(item => item.id !== id);
    
    // Update storage and display
    localStorage.setItem('agendaItems', JSON.stringify(agendaItems));
    displayAgendaItems();
}

// Delete activity
function deleteActivity(id) {
    if (confirm('Are you sure you want to delete this activity?')) {
        agendaItems = agendaItems.filter(item => item.id !== id);
        localStorage.setItem('agendaItems', JSON.stringify(agendaItems));
        displayAgendaItems();
        showNotification('Activity deleted successfully', 'success');
    }
}

// Event Listeners
addActivityBtn.addEventListener('click', addActivity);

// Allow adding activity with Enter key
activityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && timeInput.value) {
        addActivity();
    }
});

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show initial success message
    showNotification('Thank you for booking! We hope you enjoy our service.', 'success', 5000);

    // Display booking details
    displayBookingDetails();

    // Display existing agenda items
    displayAgendaItems();

    // Setup cancel booking functionality
    cancelBookingBtn.addEventListener('click', () => {
        cancelModal.style.display = 'block';
    });

    // Handle booking cancellation
    confirmCancelBtn.addEventListener('click', () => {
        // Show loading state
        confirmCancelBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
        confirmCancelBtn.disabled = true;

        try {
            // Clear all booking data
            localStorage.removeItem('personalDetails');
            localStorage.removeItem('travelDetails');
            localStorage.removeItem('vehicleSelection');
            localStorage.removeItem('agendaItems');

            // Update booking status in storage
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
            if (bookings.length > 0) {
                const lastBooking = bookings[bookings.length - 1];
                lastBooking.status = 'cancelled';
                lastBooking.cancelledAt = new Date().toISOString();
                localStorage.setItem('bookings', JSON.stringify(bookings));
            }

            // Hide modal
            cancelModal.style.display = 'none';

            // Show success message
            showNotification('Booking cancelled successfully', 'success');

            // Redirect to home page after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            // Reset button state
            confirmCancelBtn.innerHTML = '<i class="fas fa-times"></i> Yes, Cancel Booking';
            confirmCancelBtn.disabled = false;

            // Show error message
            showNotification('Error cancelling booking. Please try again.', 'error');
        }
    });

    // Close modal when close button or outside click
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            cancelModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === cancelModal) {
            cancelModal.style.display = 'none';
        }
    });
});

function displayBookingDetails() {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const currentBooking = bookings[bookings.length - 1];

    if (currentBooking) {
        const bookingSummary = document.getElementById('bookingSummary');
        if (bookingSummary) {
            bookingSummary.innerHTML = `
                <div class="summary-section">
                    <h3>Personal Details</h3>
                    <p><strong>Name:</strong> ${currentBooking.personal?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${currentBooking.personal?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${currentBooking.personal?.phone || 'N/A'}</p>
                </div>
                <div class="summary-section">
                    <h3>Travel Details</h3>
                    <p><strong>Start Date:</strong> ${formatDate(currentBooking.travel?.startDate)}</p>
                    <p><strong>End Date:</strong> ${formatDate(currentBooking.travel?.endDate)}</p>
                    <p><strong>Group Size:</strong> ${currentBooking.travel?.groupSize || 1} people</p>
                </div>
                <div class="summary-section">
                    <h3>Vehicle Details</h3>
                    <p><strong>Vehicle Type:</strong> ${formatVehicleType(currentBooking.vehicle?.vehicle)}</p>
                    <p><strong>Additional Services:</strong> ${formatServices(currentBooking.vehicle?.additionalOptions)}</p>
                    <p><strong>Total Cost:</strong> ₹${currentBooking.vehicle?.totalPrice || 0}</p>
                </div>
            `;
        }
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatVehicleType(type) {
    if (!type) return 'N/A';
    const types = {
        economy: 'Economy Car',
        suv: 'SUV',
        luxury: 'Luxury Car',
        van: 'Passenger Van'
    };
    return types[type] || type;
}

function formatServices(services = []) {
    if (!services || !services.length) return 'None';
    const serviceNames = {
        driver: 'Professional Driver',
        gps: 'GPS Navigation',
        'child-seat': 'Child Seat',
        insurance: 'Extra Insurance'
    };
    return services.map(service => serviceNames[service] || service).join(', ');
}

// Make functions available globally
window.editActivity = editActivity;
window.deleteActivity = deleteActivity;

// Notepad-style Agenda Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const toggleAgendaBtn = document.getElementById('toggleAgendaBtn');
    const agendaContainer = document.getElementById('agendaContainer');
    const newPlanInput = document.getElementById('newPlanInput');
    const addPlanBtn = document.getElementById('addPlanBtn');
    const plansList = document.getElementById('plansList');

    // Initialize plans array from localStorage
    let plans = JSON.parse(localStorage.getItem('tripPlans') || '[]');

    // Toggle agenda visibility
    toggleAgendaBtn.addEventListener('click', function() {
        agendaContainer.classList.toggle('open');
        this.classList.toggle('active');
    });

    // Add new plan
    function addPlan() {
        const text = newPlanInput.value.trim();
        if (!text) {
            showNotification('Please enter a plan', 'error');
            return;
        }

        const plan = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        plans.push(plan);
        savePlans();
        newPlanInput.value = '';
        renderPlans();
        showNotification('Plan added successfully!', 'success');
    }

    // Render plans
    function renderPlans() {
        plansList.innerHTML = plans.map(plan => `
            <div class="plan-item" data-id="${plan.id}">
                <input type="checkbox" class="plan-checkbox" 
                       ${plan.completed ? 'checked' : ''} 
                       onchange="togglePlan(${plan.id})">
                <span class="plan-text ${plan.completed ? 'completed' : ''}">${plan.text}</span>
                <div class="plan-actions">
                    <button onclick="editPlan(${plan.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deletePlan(${plan.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // If there are no plans, show a message
        if (plans.length === 0) {
            plansList.innerHTML = `
                <div class="no-plans">
                    <p>No plans added yet. Start by typing your plan above!</p>
                </div>
            `;
        }
    }

    // Toggle plan completion
    window.togglePlan = function(id) {
        const plan = plans.find(p => p.id === id);
        if (plan) {
            plan.completed = !plan.completed;
            savePlans();
            renderPlans();
        }
    };

    // Edit plan
    window.editPlan = function(id) {
        const plan = plans.find(p => p.id === id);
        if (plan) {
            const newText = prompt('Edit your plan:', plan.text);
            if (newText && newText.trim()) {
                plan.text = newText.trim();
                savePlans();
                renderPlans();
                showNotification('Plan updated successfully!', 'success');
            }
        }
    };

    // Delete plan
    window.deletePlan = function(id) {
        if (confirm('Are you sure you want to delete this plan?')) {
            plans = plans.filter(p => p.id !== id);
            savePlans();
            renderPlans();
            showNotification('Plan deleted successfully', 'success');
        }
    };

    // Save plans to localStorage
    function savePlans() {
        localStorage.setItem('tripPlans', JSON.stringify(plans));
    }

    // Event listeners
    addPlanBtn.addEventListener('click', addPlan);

    newPlanInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addPlan();
        }
    });

    // Show notification
    function showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Initial render
    renderPlans();

    // Auto-open agenda section if there are plans
    if (plans.length > 0) {
        agendaContainer.classList.add('open');
        toggleAgendaBtn.classList.add('active');
    }
});

// Add styles for empty state
const emptyStateStyles = document.createElement('style');
emptyStateStyles.textContent = `
    .no-plans {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
    }

    .no-plans p {
        margin: 0;
        font-size: 16px;
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1100;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        background: #28a745;
        color: white;
    }

    .notification.error {
        background: #dc3545;
        color: white;
    }
`;
document.head.appendChild(emptyStateStyles);