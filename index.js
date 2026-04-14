// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area="

// Step 1: Fetch Alerts for a State from the API
async function fetchWeatherAlerts(state) {
    const apiUrl = `https://api.weather.gov/alerts/active?area=${state}`;
    
    console.log(`Fetching alerts for ${state} from: ${apiUrl}`);
    
    try {
        // NWS API requires a User-Agent header
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'WeatherAlertsApp/1.0 (your.email@example.com)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Parse the JSON response and log the data to the console for testing
        console.log('API Response Data:', data);
        console.log('Number of alerts found:', data.features?.length || 0);
        
        // Log first alert headline if exists
        if (data.features && data.features.length > 0) {
            console.log('First alert headline:', data.features[0].properties?.headline);
        }
        
        return data;
        
    } catch (error) {
        // Handle network and API errors gracefully
        console.error('Fetch error:', error.message);
        throw error;
    }
}

// Step 2: Display the Alerts on the Page
function displayAlerts(data, stateName) {
    const features = data.features || [];
    const alertCount = features.length;
    const title = data.title || 'Current watches, warnings, and advisories';
    
    // Get the alerts container
    const alertsContainer = document.getElementById('alerts-container');
    const summaryDiv = document.getElementById('summary');
    
    if (!alertsContainer || !summaryDiv) {
        console.error('Required DOM elements not found');
        return;
    }
    
    if (alertCount === 0) {
        summaryDiv.innerHTML = `
            <div class="alert alert-info">
                <strong>${title} for ${stateName}: 0</strong><br>
                No active weather alerts for this state.
            </div>
        `;
        alertsContainer.innerHTML = '';
        return;
    }
    
    // Display summary message using title property and number of alerts
    summaryDiv.innerHTML = `
        <div class="alert alert-info">
            <strong>${title} for ${stateName}: ${alertCount}</strong>
        </div>
    `;
    
    // Display list of alert headlines, each as its own line
    let alertsHtml = '<div class="alerts-list">';
    
    features.forEach((feature, index) => {
        // Get headline from properties.headline
        const headline = feature.properties?.headline || 'Weather Alert';
        const severity = feature.properties?.severity || 'Unknown';
        const eventType = feature.properties?.event || 'Unknown';
        
        // Add severity class for styling
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
                    <div class="alert-meta">Event: ${escapeHtml(eventType)} | Severity: ${severity}</div>
                </div>
            </div>
        `;
    });
    
    alertsHtml += '</div>';
    alertsContainer.innerHTML = alertsHtml;
    
    console.log(`Displayed ${alertCount} alerts for ${stateName}`);
}

// Helper function to escape HTML special characters
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Step 3: Clear and Reset the UI
function resetUI() {
    // Clear the input field
    const stateInput = document.getElementById('state');
    if (stateInput) {
        stateInput.value = '';
    }
    
    // Clear the alerts display
    const alertsContainer = document.getElementById('alerts-container');
    const summaryDiv = document.getElementById('summary');
    
    if (alertsContainer) alertsContainer.innerHTML = '';
    if (summaryDiv) summaryDiv.innerHTML = '';
    
    // Hide and clear error message
    hideError();
    
    console.log('UI reset complete');
}

// Step 4: Implement Error Handling
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.innerHTML = `<strong>⚠️ Error:</strong> ${message}`;
        errorDiv.style.display = 'block';
        console.error('Error displayed to user:', message);
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.innerHTML = '';
    }
}

// Step 5: Input Validation
function isValidStateAbbreviation(input) {
    // List of valid US state abbreviations
    const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    
    const upperInput = input.toUpperCase();
    return validStates.includes(upperInput);
}

// Get full state name from abbreviation
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

// Loading Indicator functions
function showLoadingIndicator() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
}

function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Main function to handle the entire process
async function handleWeatherAlerts() {
    // Reset UI for new request
    resetUI();
    hideError();
    
    // Get the state input value
    const stateInput = document.getElementById('state');
    let stateAbbr = stateInput ? stateInput.value.trim() : '';
    
    if (!stateAbbr) {
        showError('Please enter a state abbreviation.');
        return;
    }
    
    // Convert to uppercase
    stateAbbr = stateAbbr.toUpperCase();
    
    // Step 5: Input Validation
    if (!isValidStateAbbreviation(stateAbbr)) {
        showError(`"${stateAbbr}" is not a valid US state abbreviation. Please enter a valid 2-letter code (e.g., CA, TX, NY).`);
        return;
    }
    
    // Get full state name for display
    const stateName = getStateName(stateAbbr);
    
    // Show loading indicator
    showLoadingIndicator();
    
    try {
        // Step 1: Fetch alerts from the API
        const alertData = await fetchWeatherAlerts(stateAbbr);
        
        // Check if we got valid data
        if (!alertData || !alertData.features) {
            throw new Error('Invalid response from weather service');
        }
        
        // Step 2: Display the alerts on the page
        displayAlerts(alertData, stateName);
        
    } catch (error) {
        // Step 4: Display error message
        const errorMessage = error.message || 'Unable to fetch weather alerts. Please try again.';
        showError(errorMessage);
        console.error('Error in handleWeatherAlerts:', error);
    } finally {
        // Hide loading indicator
        hideLoadingIndicator();
    }
}

// Test function to verify API is working
async function testAPI() {
    console.log('Testing API connection...');
    try {
        const response = await fetch('https://api.weather.gov/alerts/active?area=CA', {
            headers: {
                'User-Agent': 'WeatherAlertsApp/1.0 (test)',
                'Accept': 'application/json'
            }
        });
        console.log('API Test Response Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('API Test - Number of alerts for CA:', data.features?.length || 0);
        }
    } catch (error) {
        console.error('API Test Failed:', error.message);
    }
}

// Event listeners for form submission
document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetch-alerts');
    const stateInput = document.getElementById('state');
    
    console.log('DOM loaded, setting up event listeners');
    
    if (fetchButton) {
        fetchButton.addEventListener('click', handleWeatherAlerts);
        console.log('Button event listener attached');
    } else {
        console.error('Button with id "fetch-alerts" not found');
    }
    
    if (stateInput) {
        stateInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleWeatherAlerts();
            }
        });
        
        // Auto-uppercase as user types
        stateInput.addEventListener('input', (event) => {
            event.target.value = event.target.value.toUpperCase();
        });
    } else {
        console.error('Input with id "state" not found');
    }
    
    // Run API test
    testAPI();
});

console.log('Weather Alerts application loaded');