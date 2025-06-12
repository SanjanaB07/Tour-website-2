window.addEventListener('DOMContentLoaded', () => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;

    // Initialize form
    window.addEventListener('DOMContentLoaded', () => {
        // Clear travel details but keep personal details
        localStorage.removeItem('travelDetails');
        localStorage.removeItem('vehicleSelection');
        localStorage.removeItem('agenda');
        
        // Reset form fields
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('adults').value = '1';
        document.getElementById('children').value = '0';
        document.getElementById('specialRequests').value = '';

        // Load saved data if exists
        const savedDetails = JSON.parse(localStorage.getItem('travelDetails') || '{}');
        if (savedDetails.startDate) document.getElementById('startDate').value = savedDetails.startDate;
        if (savedDetails.endDate) document.getElementById('endDate').value = savedDetails.endDate;
        if (savedDetails.adults) document.getElementById('adults').value = savedDetails.adults;
        if (savedDetails.children) document.getElementById('children').value = savedDetails.children;
        if (savedDetails.specialRequests) document.getElementById('specialRequests').value = savedDetails.specialRequests;
        if (savedDetails.preferences) {
            savedDetails.preferences.forEach(pref => {
                document.querySelector(`input[value="${pref}"]`).checked = true;
            });
        }

        // Setup number input controls
        document.querySelectorAll('.number-input-group').forEach(group => {
            const input = group.querySelector('input[type="number"]');
            const decreaseBtn = group.querySelector('[data-action="decrease"]');
            const increaseBtn = group.querySelector('[data-action="increase"]');

            decreaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value);
                if (currentValue > parseInt(input.min)) {
                    input.value = currentValue - 1;
                    input.dispatchEvent(new Event('change'));
                }
            });

            increaseBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value);
                if (currentValue < parseInt(input.max)) {
                    input.value = currentValue + 1;
                    input.dispatchEvent(new Event('change'));
                }
            });

            input.addEventListener('change', () => {
                const value = parseInt(input.value);
                decreaseBtn.disabled = value <= parseInt(input.min);
                increaseBtn.disabled = value >= parseInt(input.max);
                validateGroupSize();
            });
        });

        function validateGroupSize() {
            const adults = parseInt(document.getElementById('adults').value);
            const children = parseInt(document.getElementById('children').value);
            const totalSize = adults + children;

            const adultsError = document.getElementById('adultsError');
            const childrenError = document.getElementById('childrenError');

            adultsError.style.display = 'none';
            childrenError.style.display = 'none';

            if (totalSize > 12) {
                childrenError.textContent = 'Total group size cannot exceed 12 people';
                childrenError.style.display = 'block';
                return false;
            }

            if (children > 0 && adults < 1) {
                adultsError.textContent = 'At least one adult is required with children';
                adultsError.style.display = 'block';
                return false;
            }

            return true;
        }

        function showSuccessMessage() {
            // Create success message element
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>Travel details saved successfully!</p>
            `;
            document.querySelector('.form-container').appendChild(successMessage);
            setTimeout(() => {
                successMessage.remove();
            }, 1500);
        }

        document.getElementById('travelPlansForm').addEventListener('submit', function(event) {
            event.preventDefault();

            // Reset errors
            document.querySelectorAll('.error').forEach(error => error.style.display = 'none');

            let isValid = true;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const adults = parseInt(document.getElementById('adults').value);
            const children = parseInt(document.getElementById('children').value);
            const specialRequests = document.getElementById('specialRequests').value.trim();

            // Validate dates
            if (!startDate) {
                document.getElementById('startDateError').style.display = 'block';
                isValid = false;
            }
            if (!endDate) {
                document.getElementById('endDateError').style.display = 'block';
                isValid = false;
            }
            if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
                document.getElementById('endDateError').textContent = 'End date must be after start date';
                document.getElementById('endDateError').style.display = 'block';
                isValid = false;
            }

            // Validate group size
            if (!validateGroupSize()) {
                isValid = false;
            }

            if (isValid) {
                // Calculate duration
                const duration = Math.ceil(
                    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
                );

                // Save to localStorage
                const travelDetails = {
                    startDate: startDate,
                    endDate: endDate,
                    duration: duration,
                    adults: adults,
                    children: children,
                    groupSize: adults + children,
                    specialRequests: specialRequests,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('travelDetails', JSON.stringify(travelDetails));

                // Show success message
                showSuccessMessage();

                // Proceed to next step after a short delay
                setTimeout(() => {
                    window.location.href = '/booking-step3.html';
                }, 1000);
            }
        });
    });
});