document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicleForm');
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    const additionalOptions = document.querySelectorAll('.option-item input[type="checkbox"]');

    // Load saved data if exists
    loadSavedData();

    // Handle form submission
    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get selected vehicle
        const selectedVehicle = document.querySelector('input[name="vehicle"]:checked');
        if (!selectedVehicle) {
            showNotification('Please select a vehicle to continue.', 'error');
            return;
        }

        // Get selected additional options
        const selectedOptions = Array.from(additionalOptions)
            .filter(option => option.checked)
            .map(option => option.id);

        // Calculate total price
        const totalPrice = calculateTotalPrice(selectedVehicle.value, selectedOptions);

        // Save selection to localStorage
        const bookingData = {
            vehicle: selectedVehicle.value,
            additionalOptions: selectedOptions,
            totalPrice: totalPrice
        };
        localStorage.setItem('vehicleSelection', JSON.stringify(bookingData));

        // Proceed to next step
        window.location.href = 'booking-step4.html';
    });

    // Add hover effect to vehicle cards
    vehicleCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.querySelector('input[type="radio"]').checked) {
                card.style.transform = 'translateY(-5px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!card.querySelector('input[type="radio"]').checked) {
                card.style.transform = 'translateY(0)';
            }
        });
    });

    // Update price when options are changed
    additionalOptions.forEach(option => {
        option.addEventListener('change', updateTotalPrice);
    });

    // Update price when vehicle is changed
    document.querySelectorAll('input[name="vehicle"]').forEach(radio => {
        radio.addEventListener('change', updateTotalPrice);
    });
});

function loadSavedData() {
    const savedData = localStorage.getItem('vehicleSelection');
    if (savedData) {
        const { vehicle, additionalOptions } = JSON.parse(savedData);
        
        // Set selected vehicle
        const vehicleRadio = document.querySelector(`input[value="${vehicle}"]`);
        if (vehicleRadio) {
            vehicleRadio.checked = true;
        }

        // Set selected options
        additionalOptions.forEach(option => {
            const optionCheckbox = document.getElementById(option);
            if (optionCheckbox) {
                optionCheckbox.checked = true;
            }
        });

        updateTotalPrice();
    }
}

function calculateTotalPrice(vehicle, options) {
    // Base prices
    const basePrices = {
        economy: 1500,
        suv: 2500,
        luxury: 4000,
        van: 5500
    };

    // Additional option prices
    const optionPrices = {
        driver: 1000,
        gps: 200,
        'child-seat': 300,
        insurance: 500
    };

    // Calculate base price
    let total = basePrices[vehicle];

    // Add option prices
    options.forEach(option => {
        total += optionPrices[option] || 0;
    });

    return total;
}

function updateTotalPrice() {
    const selectedVehicle = document.querySelector('input[name="vehicle"]:checked');
    if (!selectedVehicle) return;

    const selectedOptions = Array.from(document.querySelectorAll('.option-item input[type="checkbox"]:checked'))
        .map(option => option.id);

    const totalPrice = calculateTotalPrice(selectedVehicle.value, selectedOptions);

    // Update price displays if they exist
    const priceElements = document.querySelectorAll('.total-price');
    priceElements.forEach(element => {
        element.textContent = `₹${totalPrice}`;
    });
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