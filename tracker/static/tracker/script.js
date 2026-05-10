document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tracker-form');
    const input = document.getElementById('phone_number');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = document.getElementById('btn-spinner');
    
    const errorMsg = document.getElementById('error-message');
    const resultsCard = document.getElementById('results-card');
    
    const resNumber = document.getElementById('result-number');
    const resLocation = document.getElementById('res-location');
    const resCarrier = document.getElementById('res-carrier');
    const resTimezone = document.getElementById('res-timezone');

    // To handle CSRF Token in Django
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phoneNumber = input.value.trim();
        if(!phoneNumber) return;

        // Reset state
        errorMsg.classList.add('hidden');
        resultsCard.classList.add('hidden');
        btnText.classList.add('loader-hidden');
        spinner.classList.remove('loader-hidden');
        submitBtn.disabled = true;

        try {
            const csrftoken = getCookie('csrftoken');
            
            // To ensure we bypass DRF trailing slash configs if needed
            const response = await fetch('/api/track/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken || ''
                },
                body: JSON.stringify({ phone_number: phoneNumber })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to parse the number.');
            }

            // Populate elements
            resNumber.textContent = result.data.number;
            resLocation.textContent = result.data.location;
            resCarrier.textContent = result.data.carrier;
            resTimezone.textContent = result.data.time_zones;

            // Show results
            resultsCard.classList.remove('hidden');

        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
        } finally {
            // Revert button state
            btnText.classList.remove('loader-hidden');
            spinner.classList.add('loader-hidden');
            submitBtn.disabled = false;
        }
    });
});
