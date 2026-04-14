// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area="

// Step 1: Fetch Alerts for a State from the API
async function fetchWeatherAlerts(state) {
    const apiUrl = `https://api.weather.gov/alerts/active?area=${state}`;
    
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        return data;
        
    } catch (error) {
        console.error('Fetch error:', error.message);
        throw error;
    }
}

// Step 2: Display the Alerts on the Page
function displayAlerts(data, stateName) {
    const alertsContainer = document.getElementById('alerts-container');
    const summaryDiv = document.getElementById('summary');
    
    const features = data.features || [];
    const alertCount = features.length;
    const title = data.title || 'Current watches, warnings, and advisories';
    
    if (alertCount === 0) {
        if (summaryDiv) {
            summaryDiv.innerHTML = `
                <div class="alert alert-info">
                    <strong>${title} for ${stateName}: 0</strong><br>
                    No active weather alerts for this state.
                </div>
            `;
        }
        if (alertsContainer) alertsContainer.innerHTML = '';
        return;
    }
    
    // Display summary message
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <div class="alert alert-info">
                <strong>${title} for ${stateName}: ${alertCount}</strong>
            </div>
        `;
    }
    
    // Display list of alert headlines
    let alertsHtml = '<div class="alerts-list">';
    
    features.forEach((feature, index) => {
        const headline = feature.properties?.headline || 'Weather Alert';
        const severity = feature.properties?.severity || 'Unknown';
        
        let severityClass = '';
        if (severity === 'Extreme') severityClass = 'severity-extreme';
        else if (severity === 'Severe') severityClass = 'severity-severe';
        else if (severity === 'Moderate') severityClass = 'severity-moderate';
        else if (severity === 'Minor') severityClass = 'severity-minor';
        
        alertsHtml += `
            <div class="alert-item ${severityClass}">
                <div class="alert-number">${index + 1}.</div>
                <div class="alert-content">
                    <div class="alert-headline">⚠️ ${escapeHtml(headline)}</div>
                    <div class="alert-meta">Severity: ${severity}</div>
                </div>
            </div>
        `;
    });
    
    alertsHtml += '</div>';
    
    if (alertsContainer) {
        alertsContainer.innerHTML = alertsHtml;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Step 3: Clear and Reset the UI
function resetUI() {
    const stateInput = document.getElementById('state');
    if (stateInput) {
        stateInput.value = '';
    }
    
    const alertsContainer = document.getElementById('alerts-container');
    const summaryDiv = document.getElementById('summary');
    
    if (alertsContainer) alertsContainer.innerHTML = '';
    if (summaryDiv) summaryDiv.innerHTML = '';
}

// Step 4: Error Handling with hidden class
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
        errorDiv.classList.remove('hidden');
        errorDiv.style.display = 'block';
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.innerHTML = '';
        errorDiv.classList.add('hidden');
        errorDiv.style.display = 'none';
    }
}

// Get full state name
function getStateName(abbreviation) {
    const stateNames = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    return stateNames[abbreviation.toUpperCase()] || abbreviation.toUpperCase();
}

// Loading indicator
function showLoading() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Main function
async function handleWeatherAlerts() {
    // Hide error message on new request
    hideError();
    showLoading();
    
    const stateInput = document.getElementById('state');
    let stateAbbr = stateInput ? stateInput.value.trim() : '';
    
    if (!stateAbbr) {
        showError('Please enter a state abbreviation.');
        hideLoading();
        return;
    }
    
    stateAbbr = stateAbbr.toUpperCase();
    
    if (!/^[A-Z]{2}$/.test(stateAbbr)) {
        showError('Please enter a valid 2-letter state abbreviation.');
        hideLoading();
        return;
    }
    
    const stateName = getStateName(stateAbbr);
    
    try {
        const alertData = await fetchWeatherAlerts(stateAbbr);
        displayAlerts(alertData, stateName);
        
        // Clear the input field after successful fetch
        if (stateInput) {
            stateInput.value = '';
        }
        
        // Ensure error is hidden with hidden class
        hideError();
        
    } catch (error) {
        showError(error.message || 'Failed to fetch weather alerts');
        const alertsContainer = document.getElementById('alerts-container');
        const summaryDiv = document.getElementById('summary');
        if (alertsContainer) alertsContainer.innerHTML = '';
        if (summaryDiv) summaryDiv.innerHTML = '';
    } finally {
        hideLoading();
    }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetch-alerts');
    const stateInput = document.getElementById('state');
    
    if (fetchButton) {
        fetchButton.addEventListener('click', handleWeatherAlerts);
    }
    
    if (stateInput) {
        stateInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleWeatherAlerts();
            }
        });
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchWeatherAlerts,
        displayAlerts,
        resetUI,
        handleWeatherAlerts,
        showError,
        hideError
    };
}